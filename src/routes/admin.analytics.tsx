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
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Store,
  ShoppingBag,
  CreditCard,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, platformSeries } from "@/lib/data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics - Peniel admin" },
      {
        name: "description",
        content:
          "Platform growth: volume, vendor signups, category mix, city performance and retention.",
      },
      { property: "og:title", content: "Analytics - Peniel admin" },
      { property: "og:description", content: "How the marketplace is growing." },
    ],
  }),
  component: AdminAnalytics,
});

const cityData = [
  ["Lagos", 62],
  ["Abuja", 16],
  ["Port Harcourt", 8],
  ["Ibadan", 7],
  ["Kano", 4],
  ["Others", 3],
] as const;

const healthSignals = [
  {
    label: "Orders fulfilled on time",
    value: "94%",
    note: "Delivery performance",
    icon: ShoppingBag,
    positive: true,
  },
  {
    label: "Dispute rate",
    value: "0.4%",
    note: "Customer disputes",
    icon: ShieldCheck,
    positive: true,
  },
  {
    label: "Failed payment rate",
    value: "0.8%",
    note: "Payment reliability",
    icon: CreditCard,
    positive: true,
  },
  {
    label: "Vendors verified",
    value: "21%",
    note: "Verification coverage",
    icon: Store,
    positive: false,
  },
  {
    label: "Average vendor rating",
    value: "4.6",
    note: "Customer satisfaction",
    icon: Activity,
    positive: true,
  },
];

function ChartTooltip({
  active,
  payload,
  label,
  money = false,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
  money?: boolean;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-lg">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((item) => (
        <p key={item.name} className="text-sm font-semibold">
          {money ? naira(Number(item.value)) : Number(item.value).toLocaleString()}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            {money ? "volume" : "vendors"}
          </span>
        </p>
      ))}
    </div>
  );
}

function AdminAnalytics() {
  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Analytics"
      subtitle="A closer look at Peniel's marketplace performance over the last six months."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-success" />
          Platform overview
        </div>
        <span className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
          Last 6 months
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Volume this month" value={naira(1284000000)} hint="+24%" tone="primary" />
        <StatCard label="New vendors" value="612" hint="+9%" />
        <StatCard label="Customer retention" value="46%" hint="90-day repeat" tone="gold" />
        <StatCard label="Take rate" value="2.0%" hint="Platform fee" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="size-4" />
                </div>
                <h2 className="text-sm font-semibold">Gross transaction volume</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Monthly marketplace transaction value
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <ArrowUpRight className="size-3.5" />
              24%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformSeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  tickMargin={10}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip money />} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  name="Volume"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: "var(--color-primary)",
                    stroke: "var(--color-card)",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="text-muted-foreground">Gross volume trend</span>
            <span className="font-semibold text-success">Growing</span>
          </div>
        </Panel>

        <Panel>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-gold/10 text-gold-foreground">
                  <Store className="size-4" />
                </div>
                <h2 className="text-sm font-semibold">Vendor acquisition</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                New vendor registrations by month
              </p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <ArrowUpRight className="size-3.5" />
              9%
            </span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformSeries} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid
                  stroke="var(--color-border)"
                  vertical={false}
                  strokeDasharray="3 3"
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  stroke="var(--color-muted-foreground)"
                  tickMargin={10}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Bar
                  dataKey="vendors"
                  name="Vendors"
                  fill="var(--color-gold)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={34}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="text-muted-foreground">Vendor growth</span>
            <span className="font-semibold">612 this month</span>
          </div>
        </Panel>

        <Panel>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Volume by city</h2>
                <p className="text-xs text-muted-foreground">Share of marketplace activity</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">Top locations</span>
          </div>

          <div className="space-y-4">
            {cityData.map(([city, percentage]) => (
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
            ))}
          </div>
          <div className="mt-5 flex items-start gap-2 border-t border-border pt-3">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="text-xs leading-5 text-muted-foreground">
              Lagos accounts for the largest share of recorded marketplace volume.
            </p>
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
            {healthSignals.map((signal, index) => {
              const Icon = signal.icon;

              return (
                <div
                  key={signal.label}
                  className={`flex items-center justify-between gap-3 py-3 ${
                    index !== healthSignals.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium">{signal.label}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{signal.note}</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-sm font-semibold tabular-nums">
                    {signal.value}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <div className="mt-5 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Activity className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Reading your platform metrics</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Track transaction volume alongside vendor acquisition and customer retention. Strong
              growth is most meaningful when supported by reliable fulfilment, successful payments
              and consistently good customer experiences.
            </p>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
