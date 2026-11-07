
import { createFileRoute } from "@tanstack/react-router";
import {
  GripVertical,
  Plus,
  Store,
  Eye,
  EyeOff,
  Layers3,
  Tag,
  ArrowUpRight,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
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
      {
        property: "og:description",
        content: "Shape how the marketplace is organised.",
      },
    ],
  }),
  component: AdminCategories,
});

const upcomingCategories = [
  "Automotive",
  "Fitness & Gyms",
  "Education & Tutors",
  "Photography",
];

function AdminCategories() {
  const [items, setItems] = useState([...categories]);
  const [drafts, setDrafts] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");

  const visibleItems = useMemo(
    () =>
      items.filter((category) =>
        `${category.name} ${category.blurb}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [items, query],
  );

  const liveCount = items.length - drafts.length;
  const totalVendors = items.reduce((total, item) => total + item.count, 0);

  const togglePublish = (slug: string, name: string) => {
    const isDraft = drafts.includes(slug);

    setDrafts((current) =>
      isDraft
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );

    toast.success(
      isDraft
        ? `${name} published in this admin view.`
        : `${name} moved to drafts.`,
    );
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

    if (!name || !blurb || !slug || items.some((item) => item.slug === slug)) {
      toast.error("Enter a valid category name that is not already in use.");
      return;
    }

    setItems((current) => [
      ...current,
      { slug, name, blurb, count: 0, icon: "Store" },
    ]);

    setDrafts((current) => [...current, slug]);
    setAddOpen(false);
    toast.success(`${name} added as a draft.`);
  };

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
          <Plus className="size-4" />
          Add category
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <CategoryStat
          icon={Layers3}
          label="Total categories"
          value={String(items.length)}
        />
        <CategoryStat
          icon={Eye}
          label="Live categories"
          value={String(liveCount)}
        />
        <CategoryStat
          icon={Tag}
          label="Draft categories"
          value={String(drafts.length)}
        />
        <CategoryStat
          icon={Store}
          label="Listed vendors"
          value={totalVendors.toLocaleString()}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Marketplace categories"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {items.length} categories
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
            {visibleItems.map((category, index) => {
              const isDraft = drafts.includes(category.slug);

              return (
                <li
                  key={category.slug}
                  className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/25 hover:bg-muted/20 sm:p-3.5"
                >
                  <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />

                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                    <Store className="size-4 text-muted-foreground" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {category.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {category.blurb}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground sm:hidden">
                      {category.count.toLocaleString()} vendors
                    </p>
                  </div>

                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs font-semibold tabular-nums">
                      {category.count.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Vendors
                    </p>
                  </div>

                  <span
                    className={
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                      (isDraft
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/10 text-success")
                    }
                  >
                    {isDraft ? "Draft" : "Live"}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      togglePublish(category.slug, category.name)
                    }
                    aria-label={
                      isDraft
                        ? `Publish ${category.name}`
                        : `Move ${category.name} to drafts`
                    }
                    title={isDraft ? "Publish category" : "Move to drafts"}
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    {isDraft ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {visibleItems.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <Search className="size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">
                No categories found
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try another search term.
              </p>
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
              Showing {visibleItems.length} of {items.length} categories
            </p>
            <p className="text-xs text-muted-foreground">
              Drag ordering is not connected yet
            </p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Coming later">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Potential categories being considered for future marketplace
              expansion.
            </p>

            <ul className="space-y-2">
              {upcomingCategories.map((category) => (
                <li
                  key={category}
                  className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-border p-3"
                >
                  <span className="min-w-0 truncate text-xs font-medium">
                    {category}
                  </span>
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
                <ShieldIcon />
              </span>

              <div>
                <p className="text-sm font-semibold">
                  Restricted categories
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Pharmacies and prescription medicine are not allowed on
                  Peniel. Applications in that space must be declined during
                  verification review.
                </p>
              </div>
            </div>
          </Panel>

          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="size-4 text-primary" />
              <p className="text-sm font-semibold">
                Category management
              </p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Keep category names clear and descriptions specific so customers
              can find the right businesses quickly.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a business category</DialogTitle>
            <DialogDescription>
              Create a new category for marketplace organisation. New
              categories start as drafts.
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
                The category will be saved as a draft. You can publish it
                when it is ready for customers.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="size-4" />
              Create category
            </button>
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
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="grid size-8 place-items-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </span>
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

function ShieldIcon() {
  return <Store className="size-4 text-muted-foreground" />;
}
