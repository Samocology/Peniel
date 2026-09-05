import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, salesSeries } from "@/lib/data";

export const Route = createFileRoute("/vendor/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Vendra business console" },
      { name: "description", content: "Understand your sales trend, best sellers, busiest hours and where your customers come from." },
      { property: "og:title", content: "Analytics — Vendra business console" },
      { property: "og:description", content: "Decisions backed by your own numbers." },
    ],
  }),
  component: VendorAnalytics,
});

const best = [
  ["Jollof Rice (Party Size)", 118, 1770000],
  ["Suya Platter", 96, 768000],
  ["Native Soup & Pounded Yam", 74, 592000],
  ["Small Chops Tray", 41, 902000],
] as const;

function VendorAnalytics() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Analytics"
      subtitle="Last 7 days compared with the previous week"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={naira(1216000)} hint="+22%" tone="primary" />
        <StatCard label="Orders" value="175" hint="+14%" />
        <StatCard label="Storefront visits" value="4,318" hint="+31%" />
        <StatCard label="Conversion rate" value="4.1%" hint="Visits that became orders" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Revenue trend">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesSeries}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis hide />
                <Tooltip formatter={(v) => naira(Number(v))} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Orders per day">
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesSeries}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="orders" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Best sellers">
          <ul className="space-y-4">
            {best.map(([n, qty, rev]) => (
              <li key={n as string} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{n as string}</span>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full rounded-full bg-primary" style={{ width: `${(Number(qty) / 118) * 100}%` }} />
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs">
                  <span className="block font-semibold">{naira(Number(rev))}</span>
                  <span className="block text-muted-foreground">{qty} sold</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Where customers come from">
          <ul className="space-y-3 text-sm">
            {[
              ["WhatsApp link", "41%"],
              ["Vendra marketplace", "28%"],
              ["Instagram bio", "19%"],
              ["Google search", "8%"],
              ["Direct / repeat", "4%"],
            ].map(([s, p]) => (
              <li key={s} className="flex items-center justify-between gap-3">
                <span className="truncate text-muted-foreground">{s}</span>
                <span className="shrink-0 font-semibold">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Busiest hours: 12–2 PM and 7–9 PM. Saturday is your strongest day.
          </p>
        </Panel>
      </div>
    </DashShell>
  );
}
