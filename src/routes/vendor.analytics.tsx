import { createFileRoute } from "@tanstack/react-router";
import { Activity, ArrowUpRight, BarChart3, Package } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor, type OrderStatus } from "@/lib/peniel-store";
import { useVendorId, useVendorAnalytics, useVendorLedger, minorToNaira } from "@/lib/vendor-hooks";

export const Route = createFileRoute("/vendor/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Peniel business console" },
      {
        name: "description",
        content: "Review sales, fulfilment and catalog activity recorded for your account.",
      },
      { property: "og:title", content: "Analytics - Peniel business console" },
      {
        property: "og:description",
        content: "Review activity recorded for your account.",
      },
    ],
  }),
  component: VendorAnalytics,
});

const statusStyles: Record<OrderStatus, string> = {
  New: "bg-blue-500",
  Confirmed: "bg-indigo-500",
  Preparing: "bg-amber-500",
  "Out for delivery": "bg-orange-500",
  Delivered: "bg-emerald-500",
  Cancelled: "bg-rose-500",
};

function VendorAnalytics() {
  const { vendor } = useCurrentVendor();
  const state = useApp();
  const vendorId = useVendorId(vendor.slug);
  const liveAnalytics = useVendorAnalytics(vendorId);
  const liveLedger = useVendorLedger(vendorId);

  const useLive = liveAnalytics.data !== null;

  const demoOrders = state.orders.filter((o) => o.vendorSlug === vendor.slug);
  const demoCompleted = demoOrders.filter((o) => o.status === "Delivered");
  const demoRevenue = demoOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);
  const demoAverage = demoCompleted.length
    ? Math.round(demoCompleted.reduce((s, o) => s + o.total, 0) / demoCompleted.length)
    : 0;

  const orders = demoOrders;
  const completed = demoCompleted;

  const revenue = useLive ? liveAnalytics.data!.totalRevenue / 100 : demoRevenue;
  const completedRevenue = useLive
    ? liveAnalytics.data!.netRevenue / 100
    : demoCompleted.reduce((s, o) => s + o.total, 0);
  const average = useLive
    ? liveAnalytics.data!.completedOrders > 0
      ? Math.round(liveAnalytics.data!.netRevenue / 100 / liveAnalytics.data!.completedOrders)
      : 0
    : demoAverage;

  const statusCounts: OrderStatus[] = [
    "New",
    "Confirmed",
    "Preparing",
    "Out for delivery",
    "Delivered",
    "Cancelled",
  ];

  const modeCounts = new Map<string, number>();

  for (const order of orders) {
    modeCounts.set(order.mode, (modeCounts.get(order.mode) ?? 0) + 1);
  }

  const activity =
    vendor.fulfilment === "order"
      ? "orders"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "reservations";

  const chartRows = orders.map((order) => ({
    reference: order.id.replace("#ORD-", ""),
    amount: order.total,
  }));

  const maxOrderValue = Math.max(...chartRows.map((item) => item.amount), 0);

  const deliveredPercentage =
    orders.length > 0 ? Math.round((completed.length / orders.length) * 100) : 0;

  const cancelledCount = useLive
    ? liveAnalytics.data
      ? liveAnalytics.data.totalOrders -
        liveAnalytics.data.completedOrders -
        liveAnalytics.data.pendingOrders
      : 0
    : orders.filter((o) => o.status === "Cancelled").length;

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Analytics"
      subtitle={`Business performance and activity for ${vendor.name}.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="space-y-6">
        {/* Performance overview */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Performance overview</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Based on activity recorded in your account
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              <Activity className="size-3" />
              Account data
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label={useLive ? "Net revenue" : "Recorded revenue"}
              value={naira(revenue)}
              hint={useLive ? "After platform commission" : "Excludes cancelled orders"}
              tone="primary"
            />
            <StatCard
              label={useLive ? "Total orders" : "Recorded activity"}
              value={String(useLive ? liveAnalytics.data!.totalOrders : orders.length)}
              hint={activity}
              icon={<BarChart3 className="size-4" />}
            />
            <StatCard
              label="Completed average"
              value={naira(average)}
              hint="Average completed order"
              icon={<ArrowUpRight className="size-4" />}
            />
            <StatCard
              label="Catalog listings"
              value={String(vendor.products.length)}
              hint={vendor.categoryLabel}
              tone="gold"
              icon={<Package className="size-4" />}
            />
            {liveAnalytics.error && (
              <div className="col-span-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                Live analytics unavailable: {liveAnalytics.error}. Showing demo data.
              </div>
            )}
          </div>
        </section>

        {/* Revenue chart and status summary */}
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
          <Panel title="Recorded order values">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Individual recorded order totals</p>
              </div>
              {chartRows.length > 0 && (
                <span className="rounded-lg bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {chartRows.length} records
                </span>
              )}
            </div>

            {chartRows.length === 0 ? (
              <div className="flex min-h-60 flex-col items-center justify-center text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BarChart3 className="size-5" />
                </div>
                <p className="mt-3 text-sm font-semibold">No order data yet</p>
                <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                  Order-value analytics will appear when this account has recorded activity.
                </p>
              </div>
            ) : (
              <div className="h-64 min-w-0 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartRows} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid
                      stroke="var(--color-border)"
                      vertical={false}
                      strokeDasharray="3 3"
                    />
                    <XAxis
                      dataKey="reference"
                      tickLine={false}
                      axisLine={false}
                      fontSize={10}
                      stroke="var(--color-muted-foreground)"
                      interval="preserveStartEnd"
                      minTickGap={24}
                    />
                    <YAxis hide domain={[0, maxOrderValue * 1.15 || 100]} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)", opacity: 0.35 }}
                      formatter={(value) => [naira(Number(value)), "Order value"]}
                      labelFormatter={(label) => `Order #${label}`}
                      contentStyle={{
                        background: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar
                      dataKey="amount"
                      name="Order value"
                      fill="var(--color-primary)"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          <Panel title="Order fulfilment">
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
              <div>
                <p className="text-xs text-muted-foreground">Delivery completion</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{deliveredPercentage}%</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <ArrowUpRight className="size-5" />
              </div>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${deliveredPercentage}%` }}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{completed.length} completed</span>
              <span>{orders.length} total</span>
            </div>

            <div className="mt-5 space-y-3">
              {statusCounts.map((status) => {
                const count = orders.filter((order) => order.status === status).length;

                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;

                return (
                  <div key={status}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                        <span className={`size-2 shrink-0 rounded-full ${statusStyles[status]}`} />
                        <span className="truncate">{status}</span>
                      </span>
                      <span className="text-xs font-semibold tabular-nums">{count}</span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${statusStyles[status]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 border-t border-border pt-3 text-[11px] leading-relaxed text-muted-foreground">
              Counts reflect the current saved status of each order.
            </p>
          </Panel>
        </div>

        {/* Catalog and fulfilment */}
        <div className="grid gap-5 xl:grid-cols-2">
          <Panel title="Top catalog listings">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                Products currently listed on your storefront
              </p>
              <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {vendor.products.length} listings
              </span>
            </div>

            {vendor.products.length ? (
              <div className="divide-y divide-border">
                {vendor.products.slice(0, 5).map((product, index) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {product.group}
                      </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {naira(product.price)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Package className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No listings yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your catalog will appear here once products are added.
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Fulfilment methods">
            <p className="mb-4 text-xs text-muted-foreground">
              How customers receive their orders or services.
            </p>

            {modeCounts.size ? (
              <div className="space-y-4">
                {[...modeCounts.entries()]
                  .sort((a, b) => b[1] - a[1])
                  .map(([mode, count]) => {
                    const percentage =
                      orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;

                    return (
                      <div key={mode}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium">{mode}</span>
                          <span className="shrink-0 text-xs font-semibold tabular-nums">
                            {count}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <p className="mt-1 text-right text-[10px] text-muted-foreground">
                          {percentage}% of recorded activity
                        </p>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="size-7 text-muted-foreground" />
                <p className="mt-2 text-sm font-medium">No fulfilment activity</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Fulfilment breakdowns will appear when orders are recorded.
                </p>
              </div>
            )}
          </Panel>
        </div>

        {/* Data context */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Activity className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Your account activity at a glance</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                These figures are calculated from saved account records. They are not external
                payment settlements or live visitor analytics.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">{cancelledCount}</span> cancelled
            </span>
            <span>
              <span className="font-semibold text-foreground">{completed.length}</span> delivered
            </span>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
