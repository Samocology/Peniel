import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Download,
  MessageSquare,
  Search,
  ShieldCheck,
  Users,
  UserRoundCheck,
  Wallet,
  ShoppingBag,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor } from "@/lib/peniel-store";
import { customersApi, type VendorCustomerRecord } from "@/lib/api-client";
import { useVendorId } from "@/lib/vendor-hooks";

export const Route = createFileRoute("/vendor/customers")({
  head: () => ({
    meta: [
      { title: "Customers - Peniel business console" },
      {
        name: "description",
        content: "Review customer activity recorded for your business.",
      },
      { property: "og:title", content: "Customers - Peniel business console" },
      {
        property: "og:description",
        content: "Understand customer activity for your business.",
      },
    ],
  }),
  component: VendorCustomers,
});

function VendorCustomers() {
  const { vendor } = useCurrentVendor();
  const state = useApp();
  const vendorId = useVendorId(vendor.slug);
  const [query, setQuery] = useState("");
  const [liveCustomers, setLiveCustomers] = useState<VendorCustomerRecord[]>([]);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) {
      setLiveLoading(false);
      return;
    }
    let active = true;
    customersApi.vendorCustomers(vendorId).then((result) => {
      if (!active) return;
      if (result.ok) setLiveCustomers(result.data);
      setLiveLoading(false);
    });
    return () => {
      active = false;
    };
  }, [vendorId]);

  const customers = useMemo(() => {
    const byCustomer = new Map<string, { name: string; count: number; spent: number }>();

    const source = liveLoading ? [] : liveCustomers;
    const demoOrders = state.orders.filter(
      (order) => order.vendorSlug === vendor.slug && order.status !== "Cancelled",
    );

    if (liveCustomers.length > 0 && !liveLoading) {
      for (const record of source) {
        const customerName =
          record.orders.customer_snapshot["fullName"] ??
          record.orders.customer_snapshot["email"] ??
          "Customer";
        const entry = byCustomer.get(customerName) ?? {
          name: customerName,
          count: 0,
          spent: 0,
        };
        entry.count += 1;
        byCustomer.set(customerName, entry);
      }
    } else {
      for (const order of demoOrders) {
        const customer = byCustomer.get(order.customer) ?? {
          name: order.customer,
          count: 0,
          spent: 0,
        };
        customer.count += 1;
        customer.spent += order.total;
        byCustomer.set(order.customer, customer);
      }
    }

    return [...byCustomer.values()].sort((a, b) => b.spent - a.spent);
  }, [liveCustomers, liveLoading, state.orders, vendor.slug]);

  const filtered = customers.filter((customer) =>
    customer.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const totalSpent = customers.reduce((sum, customer) => sum + customer.spent, 0);
  const orderCount = customers.reduce((sum, customer) => sum + customer.count, 0);
  const repeatCount = customers.filter((customer) => customer.count > 1).length;

  const activity =
    vendor.fulfilment === "order"
      ? "orders"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "reservations";

  const averageValue = orderCount ? naira(Math.round(totalSpent / orderCount)) : naira(0);

  const exportList = () => {
    const rows = [
      ["Customer", "Recorded activity", "Total spent", "Segment"],
      ...filtered.map((customer) => [
        customer.name,
        String(customer.count),
        String(customer.spent),
        customer.count > 1 ? "Repeat" : "New",
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${vendor.slug}-customers.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Customers"
      subtitle="Understand your customer relationships and recorded activity."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button
          type="button"
          onClick={exportList}
          disabled={filtered.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <Download className="size-3.5" />
          Export CSV
        </button>
      }
    >
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Customers" value={String(customers.length)} tone="primary" />
        <StatCard
          label="Repeat customers"
          value={String(repeatCount)}
          hint={
            customers.length
              ? `${Math.round((repeatCount / customers.length) * 100)}% of customers`
              : "No activity yet"
          }
        />
        <StatCard
          label={`Average ${vendor.fulfilment === "order" ? "order" : "booking"}`}
          value={averageValue}
        />
        <StatCard
          label="Recorded activity"
          value={String(orderCount)}
          hint={activity}
          tone="gold"
        />
      </div>

      {/* Insights and follow-up */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(250px,0.65fr)]">
        <Panel title="Customer insights">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Users className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">Build stronger customer relationships.</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Peniel combines this store's non-cancelled orders, bookings and reservations by
                customer name. You can identify returning customers and understand their recorded
                spending.
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <UserRoundCheck className="size-3.5" />
                <span className="text-[10px] font-medium">Returning customers</span>
              </div>
              <p className="mt-2 text-lg font-semibold tabular-nums">{repeatCount}</p>
            </div>

            <div className="rounded-xl bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="size-3.5" />
                <span className="text-[10px] font-medium">Total recorded spend</span>
              </div>
              <p className="mt-2 truncate text-lg font-semibold tabular-nums">
                {naira(totalSpent)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-5 text-muted-foreground">
              Customer phone numbers and email addresses stay private. Customer names come from
              verified order records when live data is available.
            </p>
          </div>
        </Panel>

        <Panel title="Customer follow-up">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="size-[18px]" />
          </div>

          <p className="mt-3 text-[13px] font-semibold">Keep the conversation going.</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Confirm order details, answer questions and coordinate repeat purchases through Peniel's
            private messaging.
          </p>

          <Link
            to="/vendor/messages"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Open customer chats
            <ArrowRight className="size-3.5" />
          </Link>
        </Panel>
      </div>

      {/* Customer directory */}
      <div className="mt-5">
        <Panel title="Customer directory">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                Customers with recorded {activity} for this business.
              </p>
            </div>

            <div className="relative w-full sm:max-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Search customers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers..."
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>

          {liveLoading ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
              <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                <Users className="size-5" />
              </span>
              <p className="mt-3 text-sm font-semibold">Loading customers…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
              <span className="grid size-11 place-items-center rounded-xl bg-muted text-muted-foreground">
                {customers.length === 0 ? (
                  <ShoppingBag className="size-5" />
                ) : (
                  <Search className="size-5" />
                )}
              </span>
              <p className="mt-3 text-sm font-semibold">
                {customers.length ? "No matching customers" : "No customers yet"}
              </p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                {customers.length
                  ? "Try searching with another customer name."
                  : `Customer records will appear here as ${activity} are recorded for this business.`}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile customer cards */}
              <div className="space-y-2 md:hidden">
                {filtered.map((customer) => (
                  <div
                    key={customer.name}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                      {customer.name.slice(0, 2).toUpperCase()}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{customer.name}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {customer.count} {customer.count === 1 ? "activity" : "activities"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs font-semibold tabular-nums">{naira(customer.spent)}</p>
                      <span
                        className={[
                          "mt-1 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          customer.count > 1
                            ? "bg-success/12 text-success"
                            : "bg-muted text-muted-foreground",
                        ].join(" ")}
                      >
                        {customer.count > 1 ? "Repeat" : "New"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop customer table */}
              <div className="hidden md:block">
                <DataTable
                  head={["Customer", "Contact", "Activity", "Total spent", "Segment"]}
                  rows={filtered.map((customer) => [
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                        {customer.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="truncate text-xs font-medium">{customer.name}</span>
                    </span>,
                    <span className="text-xs text-muted-foreground">Private</span>,
                    <span className="text-xs tabular-nums">{customer.count}</span>,
                    <span className="text-xs font-semibold tabular-nums">
                      {naira(customer.spent)}
                    </span>,
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        customer.count > 1
                          ? "bg-success/12 text-success"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {customer.count > 1 ? "Repeat" : "New"}
                    </span>,
                  ])}
                />
              </div>
            </>
          )}

          {filtered.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <p className="text-[10px] text-muted-foreground">
                Showing {filtered.length} of {customers.length} customers
              </p>
              <button
                type="button"
                onClick={exportList}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
              >
                <Download className="size-3.5" />
                Export filtered list
              </button>
            </div>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
