import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Plus } from "lucide-react";
import { useState } from "react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { categories } from "@/lib/data";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/categories")({
  head: () => ({
    meta: [
      { title: "Categories - Peniel admin" },
      {
        name: "description",
        content:
          "Manage the business categories customers browse, their order on the marketplace and which are live.",
      },
      { property: "og:title", content: "Categories - Peniel admin" },
      { property: "og:description", content: "Shape how the marketplace is organised." },
    ],
  }),
  component: AdminCategories,
});

function AdminCategories() {
  const [items, setItems] = useState([...categories]);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Categories"
      subtitle={`${items.length - drafts.length} live · ${drafts.length} draft categories`}
      actions={
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Plus className="size-4" /> Add category
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Browse order">
          <ul className="space-y-2">
            {items.map((c) => (
              <li
                key={c.slug}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3.5"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{c.blurb}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {c.count.toLocaleString()} vendors
                  </span>
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (drafts.includes(c.slug)
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/12 text-success")
                    }
                  >
                    {drafts.includes(c.slug) ? "Draft" : "Live"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-6">
          <Panel title="Coming later">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {["Automotive", "Fitness & Gyms", "Education & Tutors", "Photography"].map((c) => (
                <li
                  key={c}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3"
                >
                  <span className="min-w-0 truncate">{c}</span>
                  <span className="shrink-0 text-xs font-semibold">Draft</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Policy">
            <p className="text-sm text-muted-foreground">
              Pharmacies and prescription medicine are not allowed on Peniel. Applications in that
              space are declined at review.
            </p>
          </Panel>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a business category</DialogTitle>
              <DialogDescription>
                Create a draft category for marketplace organization.
              </DialogDescription>
            </DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const name = String(form.get("name") ?? "").trim();
                const blurb = String(form.get("blurb") ?? "").trim();
                const slug = name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "");
                if (!name || items.some((item) => item.slug === slug)) {
                  toast.error("Enter a category name that is not already in use.");
                  return;
                }
                setItems((current) => [...current, { slug, name, blurb, count: 0, icon: "Store" }]);
                setDrafts((current) => [...current, slug]);
                setAddOpen(false);
                toast.success(`${name} added to this admin view.`);
              }}
            >
              <label className="block text-sm font-medium">
                Category name
                <input
                  required
                  name="name"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
                />
              </label>
              <label className="block text-sm font-medium">
                Description
                <input
                  required
                  name="blurb"
                  className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                Add category
              </button>
            </form>
            <p className="text-xs text-muted-foreground">
              Categories added here are local to this prototype view and are not published to
              customers.
            </p>
          </DialogContent>
        </Dialog>
      </div>
    </DashShell>
  );
}
