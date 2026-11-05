
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownToLine,
  Check,
  ChevronRight,
  Clock3,
  Package,
  Printer,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { app, useApp, type OrderStatus } from "@/lib/peniel-store";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({
    meta: [
      { title: "Orders - Peniel business console" },
      {
        name: "description",
        content:
          "Accept, prepare and dispatch every order with live status, delivery details and customer notes.",
      },
      { property: "og:title", content: "Orders - Peniel business console" },
      {
        property: "og:description",
        content: "Every order from new to delivered in one queue.",
      },
    ],
  }),
  component: VendorOrders,
});

const filters = [
  "All",
  "New",
  "Confirmed",
  "Preparing",
  "Out for delivery",
  "Delivered",
  "Cancelled",
] as const;

const next: Partial<Record<OrderStatus, OrderStatus>> = {
  Preparing: "Out for delivery",
  "Out for delivery": "Delivered",
};

function VendorOrders() {
  const s = useApp();
  const { vendor } = useCurrentVendor();
  const [f, setF] = useState<(typeof filters)[number]>("All");

  const orders = useMemo(
    () => s.orders.filter((o) => o.vendorSlug === vendor.slug),
    [s.orders, vendor.slug],
  );

  const count = (status: OrderStatus) =>
    orders.filter((o) => o.status === status).length;

  const rows = orders.filter((o) => f === "All" || o.status === f);

  const openCount =
    count("New") +
    count("Confirmed") +
    count("Preparing") +
    count("Out for delivery");

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((total, order) => total + order.total, 0);

  const set = (id: string, status: OrderStatus, message: string) => {
    app.setOrderStatus(id, status);
    toast.success(message);
  };

  const pageTitle =
    vendor.fulfilment === "reservation"
      ? "Reservations"
      : vendor.fulfilment === "booking"
        ? "Appointments"
        : "Orders";

  const activityLabel =
    vendor.fulfilment === "reservation"
      ? "reservations"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "orders";

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={pageTitle}
      subtitle={`${openCount} open ${activityLabel} requiring attention`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        vendor.fulfilment === "order" ? (
          <button
            onClick={() => window.print()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <Printer className="size-4" />
            <span>Print queue</span>
          </button>
        ) : undefined
      }
    >
      {vendor.fulfilment !== "order" ? (
        <Panel title={`${activityLabel.charAt(0).toUpperCase()}${activityLabel.slice(1)} management`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                Your {activityLabel} are managed in the dedicated bookings
                workspace for this business type.
              </p>
            </div>
            <Link
              to="/vendor/bookings"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Open {activityLabel}
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </Panel>
      ) : (
        <>
          {/* Overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OverviewCard
              label="New orders"
              value={count("New")}
              description="Awaiting confirmation"
              icon={ShoppingBag}
              tone="gold"
            />
            <OverviewCard
              label="Preparing"
              value={count("Preparing")}
              description="Currently in progress"
              icon={Package}
            />
            <OverviewCard
              label="In fulfilment"
              value={count("Out for delivery")}
              description="On the way to customers"
              icon={Truck}
            />
            <OverviewCard
              label="Completed"
              value={count("Delivered")}
              description="Successfully delivered"
              icon={Check}
              tone="primary"
            />
          </div>

          {/* Revenue summary */}
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ArrowDownToLine className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tracked order value
                </p>
                <p className="mt-0.5 text-lg font-bold tracking-tight text-foreground">
                  {naira(totalRevenue)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on saved orders, excluding cancelled orders
            </p>
          </div>

          {/* Order queue */}
          <div className="mt-6">
            <Panel title="Order queue">
              <div className="mb-5 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      All activity
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                      Review and update your customer orders
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground tabular-nums">
                    <ShoppingBag className="size-3.5 text-muted-foreground" />
                    {rows.length} {rows.length === 1 ? "order" : "orders"}
                  </span>
                </div>

                <div
                  role="group"
                  aria-label="Filter orders by status"
                  className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar"
                >
                  {filters.map((filter) => {
                    const active = filter === f;
                    const filterCount =
                      filter === "All"
                        ? orders.length
                        : count(filter as OrderStatus);

                    return (
                      <button
                        key={filter}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setF(filter)}
                        className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          active
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {filter}
                        <span
                          className={`text-[10px] tabular-nums ${
                            active
                              ? "text-primary-foreground/75"
                              : "text-muted-foreground"
                          }`}
                        >
                          {filterCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <ShoppingBag className="size-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No {f === "All" ? "" : f.toLowerCase() + " "}orders yet
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    Orders that match this filter will appear here when
                    customers place them.
                  </p>
                  {f !== "All" && (
                    <button
                      onClick={() => setF("All")}
                      className="mt-4 text-xs font-semibold text-primary hover:underline"
                    >
                      View all orders
                    </button>
                  )}
                </div>
              ) : (
                <ul className="space-y-3">
                  {rows.map((order) => (
                    <li
                      key={order.id}
                      className={`min-w-0 rounded-2xl border border-border border-l-4 bg-background p-3.5 shadow-sm transition-colors sm:p-4 ${
                        order.status === "New"
                          ? "border-l-gold"
                          : order.status === "Out for delivery"
                            ? "border-l-info"
                            : order.status === "Cancelled"
                              ? "border-l-destructive/50"
                              : order.status === "Delivered"
                                ? "border-l-success/60"
                                : "border-l-primary/40"
                      }`}
                    >
                      <div className="flex min-w-0 flex-col gap-3.5">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                              order.status === "New"
                                ? "bg-gold/15 text-gold-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              <ShoppingBag className="size-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-foreground sm:text-[15px]">
                                {order.customer}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-muted-foreground sm:text-[11px]">
                                {order.id}
                              </p>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tracking-tight text-foreground tabular-nums sm:text-base">
                              {naira(order.total)}
                            </p>
                            <div className="mt-1.5">
                              <StatusPill status={order.status} />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pl-0.5 text-[11px] text-muted-foreground sm:pl-1">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5">
                            <Package className="size-3.5" />
                            {order.items}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/70 px-2.5 py-1.5">
                            {order.mode.startsWith("Delivery") ? (
                              <Truck className="size-3.5" />
                            ) : (
                              <ShoppingBag className="size-3.5" />
                            )}
                            {order.mode}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
                          {order.status === "New" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  set(order.id, "Preparing", "Order accepted")
                                }
                                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"
                              >
                                <Check className="size-3.5" />
                                Accept order
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    order.id,
                                    "Cancelled",
                                    "Order declined - customer refunded",
                                  )
                                }
                                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none"
                              >
                                <X className="size-3.5" />
                                Decline
                              </button>
                            </>
                          )}

                          {next[order.status] && (
                            <button
                              type="button"
                              onClick={() =>
                                set(
                                  order.id,
                                  next[order.status]!,
                                  `Marked ${next[order.status]!.toLowerCase()}`,
                                )
                              }
                              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                            >
                              <Check className="size-3.5" />
                              Mark {next[order.status]!.toLowerCase()}
                            </button>
                          )}

                          {order.status === "Confirmed" && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock3 className="size-3.5" />
                              Awaiting preparation
                            </span>
                          )}

                          {order.status === "Delivered" && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Check className="size-3.5" />
                              Order completed
                            </span>
                          )}

                          {order.status === "Cancelled" && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <X className="size-3.5" />
                              Order cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </DashShell>
  );
}

function OverviewCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
  tone?: "default" | "gold" | "primary";
}) {
  const iconStyle =
    tone === "gold"
      ? "bg-amber-500/10 text-amber-600"
      : tone === "primary"
        ? "bg-primary/10 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <div className="min-w-0 rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${iconStyle}`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-[11px] leading-4 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
