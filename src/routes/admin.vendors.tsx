import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, vendors } from "@/lib/data";

export const Route = createFileRoute("/admin/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors — Vendra admin" },
      { name: "description", content: "Search, review and manage every business selling on Vendra, with status, ratings and volume." },
      { property: "og:title", content: "Vendors — Vendra admin" },
      { property: "og:description", content: "Manage every business on the platform." },
    ],
  }),
  component: AdminVendors,
});

function AdminVendors() {
  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Vendors" subtitle="5,842 businesses across 13 categories">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Active" value="5,842" tone="primary" />
        <StatCard label="Verified" value="1,204" tone="gold" />
        <StatCard label="Awaiting review" value="12" />
        <StatCard label="Suspended" value="7" />
      </div>

      <div className="mt-6">
        <Panel
          title="All vendors"
          action={
            <span className="flex items-center gap-2 rounded-xl border border-input px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input placeholder="Search vendors" className="w-40 bg-transparent text-sm outline-none" />
            </span>
          }
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {["All", "Verified", "New", "Top rated", "Flagged", "Suspended"].map((f, i) => (
              <button
                key={f}
                className={
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold " +
                  (i === 0 ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
          <DataTable
            head={["Business", "Category", "Location", "Rating", "Volume", "Status", ""]}
            rows={vendors.map((v) => [
              <span className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  {v.monogram}
                </span>
                <span className="min-w-0 truncate font-medium">{v.name}</span>
              </span>,
              <span className="text-muted-foreground">{v.categoryLabel}</span>,
              <span className="text-muted-foreground">{v.location}</span>,
              v.rating.toFixed(1),
              naira(v.reviews * 24000),
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (v.verified ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")
                }
              >
                {v.verified ? "Verified" : "New vendor"}
              </span>,
              <Link to="/store/$slug" params={{ slug: v.slug }} className="text-xs font-semibold text-primary">
                View store
              </Link>,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
