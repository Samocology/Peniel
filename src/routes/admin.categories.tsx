import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  GripVertical,
  Plus,
  Store,
  Eye,
  EyeOff,
  Layers3,
  Tag,
  Search,
  X,
  ArrowUpRight,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { adminApi, type AdminCategory } from "@/lib/api-client";
import { useAdminCategories } from "@/lib/admin-hooks";
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

const upcomingCategories = ["Automotive", "Fitness & Gyms", "Education & Tutors", "Photography"];

function AdminCategories() {
  const [query, setQuery] = useState("");
  const { data: categories = [], loading, error } = useAdminCategories();
  const [addOpen, setAddOpen] = useState(false);

  const visibleCategories = useMemo(
    () =>
      categories.filter((category) =>
        `${category.name} ${category.slug}`.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [categories, query],
  );

  const liveCount = categories.filter((c) => c.active).length;
  const draftCount = categories.filter((c) => !c.active).length;

  const handleToggle = async (category: AdminCategory) => {
    const result = await adminApi.updateSetting(category.id, !category.active);
    if (!result.ok) {
      toast.error(result.error || "Failed to update category status.");
      return;
    }
    setCategories((current) =>
      current.map((c) => (c.id === category.id ? { ...c, active: !c.active } : c)),
    );
    toast.success(!category.active ? "Category published." : "Category moved to drafts.");
  };

  const addCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const blurb = String(form.get("blurb") ?? "").trim();
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (!name || !blurb || !slug) {
      toast.error("Enter a valid category name.");
      return;
    }
    toast.success(`${name} added as a draft (prototype only).`);
    setAddOpen(false);
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Categories"
        subtitle="Organise the businesses and services customers discover on Peniel."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Store className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading categories…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Categories"
        subtitle="Organise the businesses and services customers discover on Peniel."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Categories"
      subtitle="Organise the businesses and services customers discover on Peniel."
      actions={
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="size-4" /> Add category
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CategoryStat
          icon={Layers3}
          label="Total categories"
          value={categories.length.toLocaleString()}
        />
        <CategoryStat icon={Eye} label="Live categories" value={liveCount.toLocaleString()} />
        <CategoryStat icon={Tag} label="Draft categories" value={draftCount.toLocaleString()} />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Marketplace categories"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {categories.length} categories
            </span>
          }
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Manage category visibility and marketplace organisation.
            </p>
            <div className="relative w-full sm:max-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories"
                aria-label="Search categories"
                className="h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none transition placeholder:text-muted-foreground focus:border-primary/50"
              />
            </div>
          </div>

          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Category details</span>
            <span className="pr-1">Status</span>
          </div>

          <ul className="space-y-2">
            {visibleCategories.map((category) => (
              <li
                key={category.id}
                className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/25 hover:bg-muted/20 sm:p-3.5"
              >
                <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <Store className="size-4 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{category.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{category.slug}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${category.active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}
                >
                  {category.active ? "Live" : "Draft"}
                </span>
                <button
                  type="button"
                  onClick={() => handleToggle(category)}
                  aria-label={
                    category.active ? `Move ${category.name} to drafts` : `Publish ${category.name}`
                  }
                  title={category.active ? "Move to drafts" : "Publish category"}
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {category.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </li>
            ))}
          </ul>

          {visibleCategories.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Search className="size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No categories found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try another search term.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Showing {visibleCategories.length} of {categories.length} categories
            </p>
            <p className="text-xs text-muted-foreground">Sort order managed by platform.</p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Coming later">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Potential categories being considered for future marketplace expansion.
            </p>
            <ul className="space-y-2">
              {upcomingCategories.map((category) => (
                <li
                  key={category}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3"
                >
                  <span className="min-w-0 truncate text-xs font-medium">{category}</span>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
                    Planned
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Marketplace policy">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                <Store className="size-4 text-muted-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold">Restricted categories</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pharmacies and prescription medicine are not allowed on Peniel. Applications in
                  that space must be declined during verification review.
                </p>
              </div>
            </div>
          </Panel>
          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="size-4 text-primary" />
              <p className="text-sm font-semibold">Category management</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Keep category names clear and descriptions specific so customers can find the right
              businesses quickly.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a business category</DialogTitle>
            <DialogDescription>
              Create a new category for marketplace organisation.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={addCategory}>
            <label className="block text-sm font-medium">
              Category name
              <input
                required
                name="name"
                maxLength={60}
                placeholder="e.g. Home Services"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block text-sm font-medium">
              Description
              <input
                required
                name="blurb"
                maxLength={120}
                placeholder="A short description of this category"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <div className="rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                New categories start as drafts.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setAddOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" /> Create category
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}

function CategoryStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}
