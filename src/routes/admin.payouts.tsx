import { createFileRoute } from "@tanstack/react-router";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, vendors } from "@/lib/data";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts - Peniel admin" },
      { name: "description", content: "Review and release vendor payouts, check bank destinations and see the settlement schedule." },
      { property: "og:title", content: "Payouts - Peniel admin" },
      { property: "og:description", content: "Release vendor earnings safely." },
    ],
  }),
  component: AdminPayouts,
});

function AdminPayouts() {
  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Payouts"
      subtitle="8 payouts awaiting release"
      actions={
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Release all approved</button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Awaiting release" value={naira(6412000)} tone="primary" />
        <StatCard label="Released today" value={naira(21840000)} />
        <StatCard label="Next batch" value="6:00 PM WAT" tone="gold" />
        <StatCard label="Failed transfers" value="2" />
      </div>

      <div className="mt-6">
        <Panel title="Payout queue">
          <DataTable
            head={["Vendor", "Bank", "Amount", "Requested", "Bank check", ""]}
            rows={vendors.map((v, i) => [
              <span className="font-medium">{v.name}</span>,
              <span className="text-muted-foreground">
                {["GTBank", "Access", "Zenith", "Kuda", "UBA", "First Bank", "Moniepoint"][i]} ····{1000 + i * 137}
              </span>,
              naira(180000 + i * 94000),
              <span className="text-muted-foreground">Today, {8 + i}:0{i} AM</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (i === 4 ? "bg-gold/15 text-gold-foreground" : "bg-success/12 text-success")
                }
              >
                {i === 4 ? "Name mismatch" : "Verified"}
              </span>,
              <span className="flex gap-2">
                <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Release</button>
                <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Hold</button>
              </span>,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
