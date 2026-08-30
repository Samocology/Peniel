import { createFileRoute, Link } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import { ArrowRight, Check, LayoutGrid, List, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeading, Stars, VendorCard, Verified } from "@/components/site/bits";
import { categories, vendors } from "@/lib/data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Discover businesses on Vendra" },
      {
        name: "description",
        content:
          "Browse verified restaurants, fashion brands, salons, farms, hotels and more. Discover businesses near you and order or book in minutes.",
      },
      { property: "og:title", content: "Vendra Marketplace — discover businesses near you" },
      { property: "og:description", content: "4,200+ businesses across 24 Nigerian cities. Order, book and pay securely." },
    ],
  }),
  component: Marketplace,
});

const sorts = ["Recommended", "Popular", "Top Rated", "New", "Nearest"];
const quickFilters = ["Free delivery", "Under ₦5,000", "Accepts online booking", "New businesses", "Top Rated"];

function Marketplace() {
  const topRated = [...vendors].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader withSearch />

      {/* category chips */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 hide-scrollbar sm:px-6">
          <span className="shrink-0 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground">
            All
          </span>
          {categories.map((c) => {
            const Icon = (Icons as unknown as Record<string, typeof Store>)[c.icon] ?? Store;
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <Icon className="size-3.5" /> {c.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* featured strip */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {vendors.filter((v) => v.featured).slice(0, 3).map((v) => (
            <Link
              key={v.slug}
              to="/store/$slug"
              params={{ slug: v.slug }}
              className="relative h-40 overflow-hidden rounded-2xl"
            >
              <img src={v.cover} alt={v.name} loading="lazy" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5">
                {v.verified && <Verified />}
                <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
                  Featured
                </span>
              </div>
              <div className="absolute bottom-3 left-3 text-primary-foreground">
                <p className="font-display font-bold">{v.name}</p>
                <p className="text-xs opacity-80">
                  {v.location.split(",").slice(-2).join(",").trim()} · ★ {v.rating} ({v.reviews})
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[240px_1fr]">
        {/* filters */}
        <aside className="space-y-7">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Sort by</p>
            <div className="mt-3 space-y-1">
              {sorts.map((s, i) => (
                <button
                  key={s}
                  className={
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors " +
                    (i === 0 ? "bg-primary-soft font-semibold text-primary" : "hover:bg-muted")
                  }
                >
                  {s} {i === 0 && <Check className="size-4" />}
                </button>
              ))}
            </div>
          </div>

          <FilterGroup
            title="Minimum rating"
            items={[
              ["4.5 & above", "1,240"],
              ["4.0 & above", "2,890"],
              ["3.5 & above", "3,410"],
            ]}
          />
          <FilterGroup
            title="Availability"
            items={[
              ["Open now", "890"],
              ["Available today", "1,190"],
              ["Accepts bookings", "640"],
              ["Delivers today", "530"],
            ]}
          />
          <FilterGroup
            title="Trust level"
            items={[
              ["Verified only", "726"],
              ["Top rated", "312"],
            ]}
          />
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">Distance</p>
            <div className="mt-3 space-y-1.5">
              {["Within 2 km", "Within 5 km", "Within 10 km", "Any distance"].map((d, i) => (
                <label
                  key={d}
                  className={
                    "flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm " +
                    (i === 1 ? "bg-primary-soft font-medium text-primary" : "hover:bg-muted")
                  }
                >
                  <span className={"size-3.5 rounded-full border " + (i === 1 ? "border-primary bg-primary" : "border-border")} />
                  {d}
                </label>
              ))}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-destructive">
            Clear all filters
          </Button>
        </aside>

        {/* results */}
        <div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">All businesses</h1>
              <p className="text-sm text-muted-foreground">Showing 4,200+ businesses in Lagos</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm">Open now</Button>
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">4.5 & above</Button>
              <Button size="sm">Verified</Button>
              <div className="ml-1 hidden items-center rounded-lg border border-border sm:flex">
                <span className="grid size-8 place-items-center rounded-l-lg bg-muted"><LayoutGrid className="size-4" /></span>
                <span className="grid size-8 place-items-center text-muted-foreground"><List className="size-4" /></span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((q) => (
              <span key={q} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                {q}
              </span>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendors.map((v) => (
              <VendorCard key={v.slug} vendor={v} />
            ))}
          </div>

          <div className="mt-12">
            <SectionHeading
              title="Top rated in Lagos"
              subtitle="Businesses with the highest satisfaction scores"
              action={
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <Link to="/search">See all <ArrowRight className="size-4" /></Link>
                </Button>
              }
            />
            <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {topRated.map((v, i) => (
                <Link
                  key={v.slug}
                  to="/store/$slug"
                  params={{ slug: v.slug }}
                  className="flex items-center gap-3 p-3.5 transition-colors hover:bg-muted/60"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold">
                    {i + 1}
                  </span>
                  <img src={v.cover} alt="" loading="lazy" className="size-10 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm font-semibold">
                      {v.name} {v.verified && <Verified />}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {v.categoryLabel} · {v.location.split(",").slice(-2).join(",").trim()}
                    </p>
                  </div>
                  <Stars value={v.rating} className="shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between text-sm text-muted-foreground">
            <p>Showing 1–{vendors.length} of 4,200+ businesses</p>
            <div className="flex gap-1">
              {["1", "2", "3", "…", "25"].map((p, i) => (
                <span
                  key={p + i}
                  className={
                    "grid size-8 place-items-center rounded-lg text-xs font-medium " +
                    (i === 0 ? "bg-primary text-primary-foreground" : "border border-border")
                  }
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{title}</p>
      <div className="mt-3 space-y-2">
        {items.map(([label, count]) => (
          <label key={label} className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox />
            <span className="flex-1 truncate">{label}</span>
            <span className="text-xs text-muted-foreground">({count})</span>
          </label>
        ))}
      </div>
    </div>
  );
}
