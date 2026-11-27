import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  MapPin,
  ShoppingBag,
  Store,
  TrendingUp,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useAdminAnalytics } from "@/lib/admin-hooks";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Peniel admin" },
      {
        name: "description",
        content: "Platform performance overview.",
      },
      { property: "og:title", content: "Analytics - Peniel admin" },
      {
        property: "og:description",
        content: "How the marketplace is growing.",
      },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const { data: analytics, loading } = useAdminAnalytics();

  if (loading) {
    return (
      <DashShell nav={adminNav} kicker="Platform admin" title="Analytics" subtitle="Platform performance overview.">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading analytics…</p>
        </div>
      </DashShell>
    );
  }

  const cityData = analytics?.cityData ?? [];
  const health = analytics?.health;

  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Analytics" subtitle="Platform performance overview.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Gross transaction volume" value={naira(analytics?.gmvMinor ?? 0)} hint="All time" tone="primary" />
        <StatCard label="Total vendors" value={String(analytics?.totalVendors ?? 0)} hint="Registered" />
        <StatCard label="Active vendors" value={String(analytics?.activeVendors ?? 0)} hint="Active" tone="gold" />
        <StatCard label="Total customers" value={String(analytics?.totalCustomers ?? 0)} hint="Registered" />
        <StatCard label="Total orders" value={String(analytics?.totalOrders ?? 0)} hint="All time" />
        <StatCard label="Completed orders" value={String(analytics?.completedOrders ?? 0)} hint="Delivered/completed" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Volume by city</h2>
                <p className="text-xs text-muted-foreground">Share of marketplace activity by vendor location</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {cityData.length === 0 ? (
              <p className="text-xs text-muted-foreground">No vendor location data available.</p>
            ) : (
              cityData.map(({ city, percentage }) => (
                <div key={city}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium">{city}</span>
                    <span className="font-semibold tabular-nums text-muted-foreground">
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel>
          <div className="mb-5 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success">
              <Activity className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Platform health</h2>
              <p className="text-xs text-muted-foreground">Operational performance indicators</p>
            </div>
          </div>
          <div className="space-y-0">
            {[
              { label: "Orders fulfilled on time", value: `${health?.fulfillmentRate ?? 0}%`, note: "Delivery performance" },
              { label: "Dispute rate", value: `${health?.disputeRate ?? 0}%`, note: "Customer disputes" },
              { label: "Failed payment rate", value: `${health?.failedPaymentRate ?? 0}%`, note: "Payment reliability" },
              { label: "Vendors verified", value: `${health?.verifiedVendors ?? 0}`, note: "Verification coverage" },
              { label: "Average vendor rating", value: String(health?.averageRating ?? 0), note: "Customer satisfaction" },
            ].map((signal, index, arr) => (
              <div
                key={signal.label}
                className={`flex items-center justify-between gap-3 py-3 ${
                  index !== arr.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{signal.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{signal.note}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {signal.value}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashShell>
  );
}
