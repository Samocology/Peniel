import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira, orders, platformSeries, vendors } from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Platform overview — Vendra admin" },
      { name: "description", content: "Monitor vendors, orders, payments, payouts and verification across the whole Vendra platform." },
      { property: "og:title", content: "Platform overview — Vendra admin" },
      { property: "og:description", content: "One view of the entire marketplace." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Overview" subtitle="Everything happening on Vendra today">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Gross volume today" value={naira(48920000)} hint="+18% vs yesterday" tone="primary" />
        <StatCard label="Active vendors" value="5,842" hint="+126 this week" />
        <StatCard label="Orders today" value="9,431" hint="94% fulfilled on time" />
        <StatCard label="Platform revenue" value={naira(978400)} hint="2% of volume" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Volume & vendor growth">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={platformSeries}>
                <defs>
                  <linearGradient id="vol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                <YAxis hide />
                <Tooltip formatter={(v, n) => (n === "volume" ? naira(Number(v)) : v)} />
                <Area type="monotone" dataKey="volume" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#vol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Needs your attention">
            <ul className="space-y-3 text-sm">
              {[
                ["12 verification applications", "/admin/verification"],
                ["4 open disputes", "/admin/disputes"],
                ["8 payouts awaiting release", "/admin/payouts"],
                ["6 reviews flagged", "/admin/reviews"],
              ].map(([t, to]) => (
                <li key={t}>
                  <Link to={to as string} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3.5 py-3 transition hover:border-primary/40">
                    <span className="min-w-0 truncate font-medium">{t}</span>
                    <span className="shrink-0 text-xs font-semibold text-primary">Review</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Top categories">
            <ul className="space-y-3 text-sm">
              {[
                ["Restaurants", "32%"],
                ["Fashion", "21%"],
                ["Salons & Barbers", "14%"],
                ["Grocery", "11%"],
                ["Cakes & Bakeries", "8%"],
              ].map(([c, p]) => (
                <li key={c} className="flex items-center justify-between gap-3">
                  <span className="truncate text-muted-foreground">{c}</span>
                  <span className="shrink-0 font-semibold">{p}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Latest orders">
          <DataTable
            head={["Reference", "Vendor", "Status", "Total"]}
            rows={orders.map((o) => [
              <span className="font-mono text-xs">{o.id}</span>,
              <span className="font-medium">{o.vendor}</span>,
              <StatusPill status={o.status} />,
              naira(o.total),
            ])}
          />
        </Panel>

        <Panel title="Newest vendors">
          <DataTable
            head={["Business", "Category", "Rating", "Status"]}
            rows={vendors.slice(0, 5).map((v) => [
              <Link to="/admin/vendors" className="font-medium">
                {v.name}
              </Link>,
              <span className="text-muted-foreground">{v.categoryLabel}</span>,
              v.rating.toFixed(1),
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (v.verified ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")
                }
              >
                {v.verified ? "Verified" : "New vendor"}
              </span>,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
