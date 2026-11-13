import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  ChartNoAxesCombined,
  CircleAlert,
  Clock3,
  CreditCard,
  Package,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { adminApi, type AdminAnalytics, type AdminOrder, type AdminVendor } from "@/lib/api-client";
import { useAdminAnalytics, useAdminOrders, useAdminVendors } from "@/lib/admin-hooks";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Platform overview - Peniel admin" },
      {
        name: "description",
        content:
          "Monitor vendors, orders, payments, payouts and verification across the whole Peniel platform.",
      },
      { property: "og:title", content: "Platform overview - Peniel admin" },
      {
        property: "og:description",
        content: "One view of the entire marketplace.",
      },
    ],
  }),
  component: AdminOverview,
});

const attentionItems = [
  {
    title: "Verification applications",
    description: "Vendor accounts awaiting review",
    count: "—",
    to: "/admin/verification",
    icon: ShieldCheck,
  },
  {
    title: "Open disputes",
    description: "Orders requiring resolution",
    count: "—",
    to: "/admin/disputes",
    icon: CircleAlert,
  },
  {
    title: "Pending payouts",
    description: "Payouts awaiting release",
    count: "—",
    to: "/admin/payouts",
    icon: Wallet,
  },
  {
    title: "Flagged reviews",
    description: "Reviews reported for moderation",
    count: "—",
    to: "/admin/reviews",
    icon: Clock3,
  },
];

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  accent?: boolean;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 text-[11px] font-medium leading-tight tracking-wide text-muted-foreground sm:text-xs">
          {label}
        </p>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 sm:rounded-xl ${
            accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      <h3 className="mt-2 break-words text-base font-semibold leading-tight tracking-tight tabular-nums sm:mt-3 sm:text-2xl">
        {value}
      </h3>

      <div className="mt-3 flex items-start gap-1.5 border-t border-border/70 pt-2.5 sm:mt-4 sm:pt-3">
        {trend && (
          <span
            className={
              trend === "up"
                ? "flex items-center gap-0.5 text-[11px] font-semibold text-success"
                : "flex items-center gap-0.5 text-[11px] font-semibold text-destructive"
            }
          >
            {trend === "up" ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          </span>
        )}
        <span className="text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
          {hint}
        </span>
      </div>
    </div>
  );
}

function AdminOverview() {
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useAdminAnalytics();
  const { data: orders, loading: ordersLoading } = useAdminOrders();
  const { data: vendors, loading: vendorsLoading } = useAdminVendors();
  const loading = analyticsLoading || ordersLoading || vendorsLoading;
  const error = analyticsError;

  const gmv = analytics?.gmvMinor ?? 0;
  const platformRevenue = Math.round(gmv * 0.02);
  const activeVendors = analytics?.activeVendors ?? 0;
  const totalOrders = analytics?.totalOrders ?? 0;
  const completedOrders = analytics?.completedOrders ?? 0;

  const latestOrders = orders.slice(0, 5);
  const newestVendors = vendors.slice(0, 5);

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Overview"
        subtitle="A clear picture of your marketplace performance."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <ChartNoAxesCombined className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading dashboard…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Overview"
      subtitle="A clear picture of your marketplace performance."
    >
      <div className="space-y-5 sm:space-y-7">
        {/* Welcome / status */}
        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ChartNoAxesCombined size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold">Marketplace overview</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Monitor your platform's activity and operations.
              </p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-medium text-success">Platform operational</span>
          </div>
        </div>

        {/* Main metrics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Platform performance</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Key marketplace metrics</p>
            </div>
            <span className="text-[11px] text-muted-foreground">Today's snapshot</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <MetricCard
              label="Gross volume today"
              value={naira(gmv)}
              hint={analytics ? "Live backend data" : "Demo snapshot"}
              icon={CreditCard}
              trend="up"
              accent
            />
            <MetricCard
              label="Active vendors"
              value={activeVendors.toLocaleString()}
              hint={analytics ? "Live backend data" : "+126 new vendors this week"}
              icon={Store}
              trend="up"
            />
            <MetricCard
              label="Orders today"
              value={totalOrders.toLocaleString()}
              hint="94% fulfilled on time"
              icon={Package}
              trend="up"
            />
            <MetricCard
              label="Platform revenue"
              value={naira(platformRevenue)}
              hint="2% of today's gross volume"
              icon={Wallet}
              trend="up"
              accent
            />
          </div>
        </section>

        {/* Analytics */}
        <section className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Panel title="Transaction volume">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Gross marketplace volume</p>
                <p className="mt-1 text-lg font-semibold tracking-tight">{naira(gmv)}</p>
              </div>
              <span className="flex items-center gap-1 rounded-lg bg-success/10 px-2.5 py-1.5 text-[11px] font-semibold text-success">
                <ArrowUpRight size={13} />
                18% growth
              </span>
            </div>

            <div className="h-48 w-full sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[]} margin={{ top: 8, right: 5, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="platformVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="var(--color-border)"
                    strokeDasharray="4 5"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                    dy={9}
                  />
                  <YAxis hide tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: "var(--color-border)", strokeDasharray: "4 4" }}
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value, name) =>
                      name === "volume" ? [naira(Number(value)), "Volume"] : [value, String(name)]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    fill="url(#platformVolume)"
                    activeDot={{
                      r: 4,
                      strokeWidth: 2,
                      fill: "var(--color-primary)",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          {/* Attention centre */}
          <Panel title="Needs attention">
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">
                Items that require administrative action.
              </p>
            </div>

            <div className="space-y-1">
              {attentionItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.title}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-xl px-2.5 py-3 transition-colors hover:bg-muted/60"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                      <Icon size={16} strokeWidth={1.8} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{item.title}</p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>

                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-muted px-2 text-xs font-semibold tabular-nums">
                      {item.count}
                    </span>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                    />
                  </Link>
                );
              })}
            </div>
          </Panel>
        </section>

        {/* Tables */}
        <section className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-2">
          <Panel title="Latest orders">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Recent marketplace transactions</p>
              <Link
                to="/admin/orders"
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                View all <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-2 sm:hidden">
              {latestOrders.length === 0 ? (
                <p className="text-xs text-muted-foreground">No orders recorded yet.</p>
              ) : (
                latestOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-border/80 bg-background/70 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {order.profiles?.full_name ?? "Customer"}
                        </p>
                        <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                          {order.reference}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold tabular-nums">
                        {naira(order.total_minor)}
                      </span>
                    </div>
                    <div className="mt-2.5 border-t border-border/70 pt-2">
                      <StatusPill status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="hidden max-w-full overflow-x-auto sm:block">
              <DataTable
                head={["Reference", "Customer", "Status", "Total"]}
                rows={
                  latestOrders.length === 0
                    ? [
                        [
                          <span className="text-xs text-muted-foreground">No orders</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                        ],
                      ]
                    : latestOrders.map((o) => [
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {o.reference}
                        </span>,
                        <span className="font-medium">{o.profiles?.full_name ?? "Customer"}</span>,
                        <StatusPill status={o.status} />,
                        <span className="whitespace-nowrap font-semibold">
                          {naira(o.total_minor)}
                        </span>,
                      ])
                }
              />
            </div>
          </Panel>

          <Panel title="Newest vendors">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Recently joined businesses</p>
              <Link
                to="/admin/vendors"
                className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
              >
                View all <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-2 sm:hidden">
              {newestVendors.length === 0 ? (
                <p className="text-xs text-muted-foreground">No vendors recorded yet.</p>
              ) : (
                newestVendors.map((vendor) => (
                  <Link
                    key={vendor.slug}
                    to="/admin/vendors"
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/70 p-3 transition-colors hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{vendor.name}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {vendor.business_type}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-xs font-semibold tabular-nums">—</span>
                      <span
                        className={
                          "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold " +
                          (vendor.status === "active"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {vendor.status === "active" && <BadgeCheck size={11} />}
                        {vendor.status === "active" ? "Active" : "New vendor"}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="hidden max-w-full overflow-x-auto sm:block">
              <DataTable
                head={["Business", "Category", "Rating", "Status"]}
                rows={
                  newestVendors.length === 0
                    ? [
                        [
                          <span className="text-xs text-muted-foreground">No vendors</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                          <span className="text-xs text-muted-foreground">—</span>,
                        ],
                      ]
                    : newestVendors.map((v) => [
                        <Link
                          to="/admin/vendors"
                          className="font-medium transition-colors hover:text-primary"
                        >
                          {v.name}
                        </Link>,
                        <span className="whitespace-nowrap text-muted-foreground">
                          {v.business_type}
                        </span>,
                        <span className="font-medium tabular-nums">—</span>,
                        <span
                          className={
                            "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold " +
                            (v.status === "active"
                              ? "bg-success/10 text-success"
                              : "bg-muted text-muted-foreground")
                          }
                        >
                          {v.status === "active" && <BadgeCheck size={11} />}
                          {v.status === "active" ? "Active" : "New vendor"}
                        </span>,
                      ])
                }
              />
            </div>
          </Panel>
        </section>

        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <ChartNoAxesCombined size={13} />
          Peniel marketplace administration
        </div>
      </div>
    </DashShell>
  );
}
