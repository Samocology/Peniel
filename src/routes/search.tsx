import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Stars, VendorCard, Verified } from "@/components/site/bits";
import { naira, vendors } from "@/lib/data";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search results — Vendra" },
      { name: "description", content: "Search across businesses, products and services on Vendra. Filter by category, rating, location and availability." },
      { property: "og:title", content: "Search on Vendra" },
      { property: "og:description", content: "Find the business, product or service you need in seconds." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const products = vendors.flatMap((v) => v.products.slice(0, 2).map((p) => ({ ...p, vendor: v })));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-surface py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input defaultValue="jollof" className="h-12 bg-card pl-9" placeholder="Search businesses, products, services…" />
          </div>
          <Button className="h-12 px-8">Search</Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">Results for "jollof"</h1>
            <p className="text-sm text-muted-foreground">28 businesses · 164 products & services</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 sm:hidden">
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {["Lagos, NG", "Restaurants", "Verified only"].map((t) => (
            <span key={t} className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary">
              {t} <X className="size-3" />
            </span>
          ))}
          <button className="text-xs font-medium text-muted-foreground underline">Clear all</button>
        </div>

        <h2 className="mt-10 mb-4 text-lg font-bold">Businesses</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {vendors.slice(0, 4).map((v) => (
            <VendorCard key={v.slug} vendor={v} compact />
          ))}
        </div>

        <h2 className="mt-12 mb-4 text-lg font-bold">Products & services</h2>
        <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {products.map((p) => (
            <Link
              key={p.id}
              to="/store/$slug/product/$id"
              params={{ slug: p.vendor.slug, id: p.id }}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
            >
              <span className="brand-gradient size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.name}</p>
                <p className="truncate text-xs text-muted-foreground">{p.desc}</p>
                <p className="mt-1 flex items-center gap-1.5 truncate text-xs">
                  <span className="text-muted-foreground">{p.vendor.name}</span>
                  {p.vendor.verified && <Verified />}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold">{naira(p.price)}</p>
                <Stars value={p.vendor.rating} className="text-xs" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-semibold">Can't find what you're looking for?</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tell us what you need and we'll match you with a verified business.
          </p>
          <Button className="mt-4">Request a recommendation</Button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
