import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor, type OrderStatus } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Peniel business console" },
      { name: "description", content: "Review sales, fulfilment and catalog activity recorded for your account." },
      { property: "og:title", content: "Analytics - Peniel business console" },
      { property: "og:description", content: "Review activity recorded for your account." },
    ],
  }),
  component: VendorAnalytics,
});

function VendorAnalytics() {
  const { vendor } = useCurrentVendor();
  const state = useApp();
  const orders = state.orders.filter((order) => order.vendorSlug === vendor.slug);
  const completed = orders.filter((order) => order.status === "Delivered");
  const revenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((sum, order) => sum + order.total, 0);
  const average = completed.length
    ? Math.round(completed.reduce((sum, order) => sum + order.total, 0) / completed.length)
    : 0;
  const statusCounts: OrderStatus[] = ["New", "Confirmed", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
  const modeCounts = new Map<string, number>();
  for (const order of orders) {
    modeCounts.set(order.mode, (modeCounts.get(order.mode) ?? 0) + 1);
  }
  const activity = vendor.fulfilment === "order" ? "orders" : vendor.fulfilment === "booking" ? "appointments" : "reservations";
  const chartRows = orders.map((order) => ({
    reference: order.id.replace("#ORD-", ""),
    amount: order.total,
  }));

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Analytics"
      subtitle={`Activity recorded for ${vendor.name}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recorded revenue" value={naira(revenue)} hint="Excludes cancelled orders" tone="primary" />
        <StatCard label="Recorded activity" value={String(orders.length)} hint={activity} />
        <StatCard label="Completed average" value={naira(average)} hint="Based on completed orders" />
        <StatCard label="Catalog listings" value={String(vendor.products.length)} hint={vendor.categoryLabel} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Recorded order values">
          {chartRows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Order-value analytics will appear when this account has recorded activity.</p>
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows}>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="reference" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                  <YAxis hide />
                  <Tooltip formatter={(value) => naira(Number(value))} />
                  <Bar dataKey="amount" name="Order value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Activity by status">
          <ul className="space-y-3">
            {statusCounts.map((status) => (
              <li key={status} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">{status}</span>
                <span className="font-semibold">{orders.filter((order) => order.status === status).length}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Status counts are based on this vendor account’s saved activity.
          </p>
        </Panel>

        <Panel title="Catalog">
          {vendor.products.length ? (
            <ul className="space-y-3">
              {vendor.products.slice(0, 5).map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{product.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{product.group}</span>
                  </span>
                  <span className="shrink-0 font-semibold">{naira(product.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No listings yet.</p>
          )}
        </Panel>

        <Panel title="Fulfilment methods">
          {modeCounts.size ? (
            <ul className="space-y-3 text-sm">
              {[...modeCounts].map(([mode, count]) => (
                <li key={mode} className="flex items-center justify-between gap-3">
                  <span className="truncate text-muted-foreground">{mode}</span>
                  <span className="shrink-0 font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No fulfilment activity recorded yet.</p>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
