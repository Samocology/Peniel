import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, MapPin, Search, SlidersHorizontal, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeading, Stars, VendorCard, Verified } from "@/components/site/bits";
import { categories, vendors, vendorsByCategory } from "@/lib/data";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const category = categories.find((c) => c.slug === params.slug);
    if (!category) throw notFound();
    return { category };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Category not found - Peniel" }, { name: "robots", content: "noindex" }] };
    }
    const { category } = loaderData;
    return {
      meta: [
        { title: `${category.name} in Lagos - Peniel` },
        { name: "description", content: `${category.blurb}. Browse ${category.count}+ ${category.name.toLowerCase()} businesses on Peniel and order or book securely.` },
        { property: "og:title", content: `${category.name} on Peniel` },
        { property: "og:description", content: category.blurb },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { category } = Route.useLoaderData();
  const list = vendorsByCategory(category.slug);
  const shown = list.length ? list : vendors.slice(0, 4);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader withSearch />

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="size-3" />
          <Link to="/marketplace" className="hover:text-foreground">Categories</Link>
          <ChevronRight className="size-3" />
          <span className="font-medium text-foreground">{category.name}</span>
        </nav>

        <div className="mt-5 grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="relative h-40 overflow-hidden rounded-2xl">
            <img src={shown[0]?.cover ?? vendors[0]!.cover} alt={category.name} loading="lazy" className="size-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{category.name}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{category.blurb}. Find top-rated businesses in Lagos - from local favourites to premium names.</p>
            <div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                [`${category.count}+`, "Businesses"],
                ["4.8/5", "Average rating"],
                ["120K+", "Happy customers"],
                ["24/7", "Open now"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-xl font-bold text-primary">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
          <Button variant="outline" size="sm" className="gap-2">
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
          {["Type", "Price range", "Rating", "Open now", "More filters"].map((f) => (
            <Button key={f} variant="ghost" size="sm" className="text-muted-foreground">
              {f}
            </Button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">Sort by: <b className="text-foreground">Popular</b></span>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">All {category.name}</h2>
            <p className="text-sm text-muted-foreground">{category.count} results found</p>
          </div>
          <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {shown.map((v) => (
              <Link
                key={v.slug}
                to="/store/$slug"
                params={{ slug: v.slug }}
                className="grid grid-cols-[96px_minmax(0,1fr)] gap-4 p-4 transition-colors hover:bg-muted/50 sm:grid-cols-[140px_minmax(0,1fr)_auto]"
              >
                <img src={v.cover} alt={v.name} loading="lazy" className="h-24 w-full rounded-xl object-cover" />
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate font-semibold">{v.name} {v.verified && <Verified />}</p>
                  <p className="truncate text-xs text-muted-foreground">{v.tagline}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" /> {v.location}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.groups.slice(0, 3).map((g) => (
                      <span key={g} className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                  <Stars value={v.rating} />
                  <span className="text-xs text-success">Open now</span>
                  <span className="text-xs text-muted-foreground">{v.reviews} reviews</span>
                </div>
              </Link>
            ))}
          </div>
          <Button variant="outline" className="mt-5 w-full">Load more {category.name}</Button>
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Search in {category.name}</p>
            <div className="relative mt-3">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={`Search ${category.name.toLowerCase()}…`} className="pl-9" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-semibold">Popular in this category</p>
            <div className="mt-3 space-y-2.5">
              {["Nigerian", "Continental", "Fast service", "Premium", "Budget friendly"].map((t, i) => (
                <div key={t} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t}</span>
                  <span className="text-xs font-medium">{342 - i * 61}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-sidebar p-5 text-sidebar-foreground">
            <Star className="size-5 text-sidebar-primary" />
            <p className="mt-3 font-display font-bold">List your business</p>
            <p className="mt-1 text-sm text-sidebar-foreground/70">
              Get discovered by thousands of customers in this category. Join Peniel today.
            </p>
            <Button asChild size="sm" className="mt-4 bg-gold text-gold-foreground hover:bg-gold/90">
              <Link to="/vendor/onboarding">Get started</Link>
            </Button>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          title="Featured vendors"
          action={
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/marketplace">View all <ArrowRight className="size-4" /></Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.slice(0, 4).map((v) => (
            <VendorCard key={v.slug} vendor={v} compact />
          ))}
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
