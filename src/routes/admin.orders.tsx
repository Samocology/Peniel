
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock3,
  Receipt,
  Activity,
} from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatusPill } from "@/components/site/bits";
import { naira, orders } from "@/lib/data";

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
  "Orders",
  "Bookings",
  "Preparing",
  "Delivered",
  "Cancelled",
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
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
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
  const all = useMemo(() => [...orders, ...orders], []);

  const [filter, setFilter] = useState("All");

  const visibleOrders = useMemo(
    () =>
      all.filter((order) => {
        if (filter === "Orders") return order.kind === "order";
        if (filter === "Bookings") return order.kind !== "order";
        if (filter === "Cancelled") return order.status === "Cancelled";

        return filter === "All" || order.status === filter;
      }),
    [all, filter],
  );

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
              <span className="size-1.5 rounded-full bg-success" />
              Operational
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <OrderMetric
              label="Orders today"
              value="9,431"
              description="Customer purchases placed today"
              icon={ShoppingBag}
              accent
            />

            <OrderMetric
              label="Bookings today"
              value="1,286"
              description="Appointments and reservations"
              icon={CalendarDays}
            />

            <OrderMetric
              label="Fulfilled on time"
              value="94%"
              description="Orders completed within schedule"
              icon={CheckCircle2}
            />

            <OrderMetric
              label="Cancellation rate"
              value="1.2%"
              description="Share of cancelled transactions"
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
                <Activity size={13} />
                Marketplace activity
              </div>
            </div>

            {/* Horizontally scrollable filter tabs */}
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

            {/* Results information */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Receipt size={14} />
                Transaction records
              </div>

              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {visibleOrders.length}
                </span>{" "}
                records found
              </p>
            </div>

            {/* Orders table */}
            {visibleOrders.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={[
                    "Reference",
                    "Vendor",
                    "Type",
                    "Placed",
                    "Status",
                    "Total",
                    "Payment",
                  ]}
                  rows={visibleOrders.map((o, i) => [
                    <span className="whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {o.id}
                    </span>,

                    <span className="whitespace-nowrap text-xs font-semibold">
                      {o.vendor}
                    </span>,

                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs capitalize text-muted-foreground">
                      {o.kind === "order" ? (
                        <ShoppingBag size={12} />
                      ) : (
                        <CalendarDays size={12} />
                      )}
                      {o.kind}
                    </span>,

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {o.placed}
                    </span>,

                    <StatusPill status={o.status} />,

                    <span className="whitespace-nowrap text-xs font-semibold">
                      {naira(o.total)}
                    </span>,

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        i % 4 === 0
                          ? "bg-primary/10 text-primary"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          i % 4 === 0 ? "bg-primary" : "bg-success"
                        }`}
                      />
                      {i % 4 === 0 ? "Held in escrow" : "Settled"}
                    </span>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Receipt size={20} />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  No activity found
                </p>

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

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Clock3 size={13} />
          Peniel order & booking management
        </div>
      </div>
    </DashShell>
  );
}
