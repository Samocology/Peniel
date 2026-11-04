import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, MessageSquare, Search, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/customers")({
  head: () => ({
    meta: [
      { title: "Customers - Peniel business console" },
      { name: "description", content: "Review customer activity recorded for your business." },
      { property: "og:title", content: "Customers - Peniel business console" },
      { property: "og:description", content: "Understand customer activity for your business." },
    ],
  }),
  component: VendorCustomers,
});

function VendorCustomers() {
  const { vendor } = useCurrentVendor();
  const state = useApp();
  const [query, setQuery] = useState("");
  const customers = useMemo(() => {
    const byCustomer = new Map<string, { name: string; count: number; spent: number }>();
    for (const order of state.orders) {
      if (order.vendorSlug !== vendor.slug || order.status === "Cancelled") continue;
      const customer = byCustomer.get(order.customer) ?? {
        name: order.customer,
        count: 0,
        spent: 0,
      };
      customer.count += 1;
      customer.spent += order.total;
      byCustomer.set(order.customer, customer);
    }
    return [...byCustomer.values()];
  }, [state.orders, vendor.slug]);
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

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Customers"
      subtitle={`${customers.length} customers with recorded ${activity}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold"
        >
          <Download className="size-4" /> Print list
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          value={orderCount ? naira(Math.round(totalSpent / orderCount)) : naira(0)}
        />
        <StatCard
          label="Recorded activity"
          value={String(orderCount)}
          hint={activity}
          tone="gold"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        <Panel title="How your customer list works">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Users className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                Your customer list grows with each recorded sale.
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Peniel groups this store’s non-cancelled orders, bookings and reservations by
                customer name. Repeat activity is combined so you can spot returning customers and
                see their spend with your business.
              </p>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/60 p-3 text-xs leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            Customer phone numbers and email addresses stay private. Use in-app chat to follow up;
            this prototype uses saved browser activity rather than a live CRM.
          </p>
        </Panel>
        <Panel title="Follow up safely">
          <p className="text-sm leading-6 text-muted-foreground">
            Open a customer conversation to confirm details, answer questions or coordinate a repeat
            order without exchanging private contact information.
          </p>
          <Link
            to="/vendor/messages"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
          >
            <MessageSquare className="size-4" /> Open customer chats
          </Link>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Customer list">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              aria-label="Search customers"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by customer name"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {customers.length
                ? "No customers match your search."
                : `No customer ${activity} have been recorded for this account yet.`}
            </p>
          ) : (
            <DataTable
              head={["Customer", "Contact", "Activity", "Total spent", "Segment"]}
              rows={filtered.map((customer) => [
                <span className="flex min-w-0 items-center gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate font-medium">{customer.name}</span>
                </span>,
                <span className="text-muted-foreground">Private</span>,
                customer.count,
                naira(customer.spent),
                <span
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-semibold " +
                    (customer.count > 1
                      ? "bg-success/12 text-success"
                      : "bg-muted text-muted-foreground")
                  }
                >
                  {customer.count > 1 ? "Repeat" : "New"}
                </span>,
              ])}
            />
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
