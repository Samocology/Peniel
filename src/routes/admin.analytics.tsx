import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, platformSeries } from "@/lib/data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Vendra admin" },
      { name: "description", content: "Platform growth: volume, vendor signups, category mix, city performance and retention." },
      { property: "og:title", content: "Analytics — Vendra admin" },
      { property: "og:description", content: "How the marketplace is growing." },
    ],
  }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Analytics" subtitle="Trailing six months">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Volume this month" value={naira(1284000000)} hint="+24%" tone="primary" />
        <StatCard label="New vendors" value="612" hint="+9%" />
        <StatCard label="Customer retention" value="46%" hint="90-day repeat" tone="gold" />
        <StatCard label="Take rate" value="2.0%" hint="Platform fee" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Gross volume">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={platformSeries}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis hide />
                <Tooltip formatter={(v) => naira(Number(v))} />
                <Line type="monotone" dataKey="volume" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Vendor signups">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformSeries}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="vendors" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Volume by city">
          <ul className="space-y-4 text-sm">
            {[
              ["Lagos", 62],
              ["Abuja", 16],
              ["Port Harcourt", 8],
              ["Ibadan", 7],
              ["Kano", 4],
              ["Others", 3],
            ].map(([c, p]) => (
              <li key={c as string} className="grid grid-cols-[110px_minmax(0,1fr)_40px] items-center gap-3">
                <span className="truncate text-muted-foreground">{c as string}</span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${p as number}%` }} />
                </span>
                <span className="text-right text-xs font-semibold">{p as number}%</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Health signals">
          <ul className="space-y-3 text-sm">
            {[
              ["Orders fulfilled on time", "94%"],
              ["Dispute rate", "0.4%"],
              ["Failed payment rate", "0.8%"],
              ["Vendors verified", "21%"],
              ["Average vendor rating", "4.6"],
            ].map(([l, v]) => (
              <li key={l} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                <span className="truncate text-muted-foreground">{l}</span>
                <span className="shrink-0 font-display font-bold">{v}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashShell>
  );
}
