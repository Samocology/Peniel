import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, vendors } from "@/lib/data";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions & featuring — Vendra admin" },
      { name: "description", content: "Run platform-wide campaigns and choose which businesses are featured on the marketplace." },
      { property: "og:title", content: "Promotions & featuring — Vendra admin" },
      { property: "og:description", content: "Campaigns and featured placements." },
    ],
  }),
  component: AdminPromotions,
});

const campaigns = [
  ["VENDRA5K", "₦5,000 off first order platform-wide", "Active", 4128, 20640000],
  ["FREEDELIVERY", "Free delivery weekend, Lagos only", "Scheduled", 0, 0],
  ["INDEPENDENCE", "Independence Day food festival", "Ended", 9840, 41200000],
] as const;

function AdminPromotions() {
  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Promotions & featuring"
      subtitle="1 campaign live, 1 scheduled"
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> New campaign
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Campaign volume" value={naira(61840000)} tone="primary" />
        <StatCard label="Redemptions" value="13,968" />
        <StatCard label="Featured slots used" value="6 of 8" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Platform campaigns">
          <DataTable
            head={["Code", "Campaign", "Status", "Uses", "Volume"]}
            rows={campaigns.map((c) => [
              <span className="font-mono text-xs font-semibold">{c[0]}</span>,
              <span className="text-muted-foreground">{c[1]}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (c[2] === "Active"
                    ? "bg-success/12 text-success"
                    : c[2] === "Scheduled"
                      ? "bg-gold/15 text-gold-foreground"
                      : "bg-muted text-muted-foreground")
                }
              >
                {c[2]}
              </span>,
              c[3].toLocaleString(),
              naira(c[4]),
            ])}
          />
        </Panel>

        <Panel title="Featured businesses">
          <ul className="space-y-3">
            {vendors.slice(0, 6).map((v, i) => (
              <li key={v.slug} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  {v.monogram}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{v.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{v.categoryLabel}</span>
                </span>
                <span
                  className={
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                    (i < 4 ? "bg-gold/15 text-gold-foreground" : "border border-border text-muted-foreground")
                  }
                >
                  {i < 4 ? "Featured" : "Add"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-primary" />
            Featuring is editorial placement only. It never grants a verification badge.
          </p>
        </Panel>
      </div>
    </DashShell>
  );
}
