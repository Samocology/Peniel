import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingBag,
  CalendarDays,
  Clock3,
  XCircle,
  ArrowUpRight,
  Activity,
  Receipt,
} from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { adminApi, type AdminOrder } from "@/lib/api-client";
import { useAdminOrders } from "@/lib/admin-hooks";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders & bookings - Peniel admin" },
      {
        name: "description",
        content:
          "Track every order and booking placed on Peniel, including fulfilment status and payment state.",
      },
      { property: "og:title", content: "Orders & bookings - Peniel admin" },
      { property: "og:description", content: "Platform-wide order monitoring." },
    ],
  }),
  component: AdminOrders,
});

const filters = [
  "All",
  "Pending payment",
  "Paid",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Refunded",
  "Failed",
];

function OrderMetric({
  label,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function AdminOrders() {
  const [filter, setFilter] = useState("All");
  const { data: orders = [], loading, error } = useAdminOrders();

  const visibleOrders = useMemo(
    () => orders.filter((o) => filter === "All" || o.status.toLowerCase() === filter.toLowerCase()),
    [orders, filter],
  );

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Orders & bookings"
        subtitle="Monitor transactions, bookings and fulfilment across the marketplace."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ShoppingBag className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading orders…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Orders & bookings"
        subtitle="Monitor transactions, bookings and fulfilment across the marketplace."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Clock3 className="size-3.5" /> Reload
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Orders & bookings"
      subtitle="Monitor transactions, bookings and fulfilment across the marketplace."
    >
      <div className="space-y-6">
        {/* Overview */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Activity overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Today's marketplace performance
              </p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-success/20 bg-success/5 px-2.5 py-1.5 text-[10px] font-medium text-success">
              <span className="size-1.5 rounded-full bg-success" /> Operational
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <OrderMetric
              label="Total orders"
              value={orders.length.toLocaleString()}
              description="Customer purchases placed"
              icon={ShoppingBag}
              accent
            />
            <OrderMetric
              label="Delivered"
              value={orders.filter((o) => o.status === "delivered").length.toLocaleString()}
              description="Orders completed successfully"
              icon={Clock3}
            />
            <OrderMetric
              label="Pending"
              value={orders
                .filter((o) => o.status === "paid" || o.status === "confirmed")
                .length.toLocaleString()}
              description="Awaiting fulfilment"
              icon={CalendarDays}
            />
            <OrderMetric
              label="Cancelled"
              value={orders.filter((o) => o.status === "cancelled").length.toLocaleString()}
              description="Cancelled transactions"
              icon={XCircle}
            />
          </div>
        </section>

        {/* Activity table */}
        <Panel title="Recent activity">
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Review orders and bookings across all vendors.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Activity size={13} /> Marketplace activity
              </div>
            </div>
            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full items-center gap-2">
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                      filter === item
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Receipt size={14} /> Transaction records
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{visibleOrders.length}</span>{" "}
                records found
              </p>
            </div>
            {visibleOrders.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={["Reference", "Customer", "Status", "Total", ""]}
                  rows={visibleOrders.map((o) => [
                    <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {o.reference}
                    </span>,
                    <span className="whitespace-nowrap text-xs font-semibold">
                      {o.profiles?.full_name ?? "Customer"}
                    </span>,
                    <StatusPill status={o.status} />,
                    <span className="whitespace-nowrap text-xs font-semibold">
                      {naira(o.total_minor)}
                    </span>,
                    <button
                      type="button"
                      onClick={() => toast.info("Order detail view not yet connected.")}
                      className="text-xs font-semibold text-primary transition hover:underline"
                    >
                      View order <ArrowUpRight size={12} />
                    </button>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Receipt size={20} />
                </div>
                <p className="mt-3 text-sm font-semibold">No activity found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  There are no records matching this filter.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter("All")}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  View all activity
                </button>
              </div>
            )}
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Clock3 size={13} /> Peniel order & booking management
        </div>
      </div>
    </DashShell>
  );
}
