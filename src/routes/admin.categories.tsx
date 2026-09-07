import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { categories } from "@/lib/data";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Vendra admin" },
      { name: "description", content: "Manage the business categories customers browse, their order on the marketplace and which are live." },
      { property: "og:title", content: "Categories — Vendra admin" },
      { property: "og:description", content: "Shape how the marketplace is organised." },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Categories"
      subtitle="13 categories live on the marketplace"
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> Add category
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Browse order">
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3.5">
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.blurb}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">{c.count.toLocaleString()} vendors</span>
                  <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">Live</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Coming later">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Automotive", "Fitness & Gyms", "Education & Tutors", "Photography"].map((c) => (
                <li key={c} className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3">
                  <span className="min-w-0 truncate">{c}</span>
                  <span className="shrink-0 text-xs font-semibold">Draft</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Policy">
            <p className="text-sm text-muted-foreground">
              Pharmacies and prescription medicine are not allowed on Vendra. Applications in that space are declined at review.
            </p>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
