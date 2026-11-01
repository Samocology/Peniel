import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Stars, VendorCard, Verified } from "@/components/site/bits";
import { getMarketplaceLocationLabel } from "@/lib/location";
import { searchProducts, searchVendors } from "@/lib/discovery";
import { naira } from "@/lib/data";
import { app, useApp } from "@/lib/peniel-store";
import { LocationPicker } from "@/components/site/location-picker";

export const Route = createFileRoute("/search")({
  validateSearch: z.object({
    q: z.string().optional(),
    location: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Search results - Peniel" },
      {
        name: "description",
        content:
          "Search across businesses, products and services on Peniel. Filter by category, rating, location and availability.",
      },
      { property: "og:title", content: "Search on Peniel" },
      {
        property: "og:description",
        content: "Find the business, product or service you need in seconds.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q = "", location: routeLocation } = Route.useSearch();
  const appState = useApp();
  const navigate = useNavigate({ from: "/search" });
  const [query, setQuery] = useState(q);
  const [selectedLocation, setSelectedLocation] = useState(
    getMarketplaceLocationLabel(routeLocation ?? appState.customer.city),
  );
  const businesses = searchVendors(query, selectedLocation);
  const products = searchProducts(query, selectedLocation);

  useEffect(() => {
    setQuery(q);
    if (routeLocation) setSelectedLocation(getMarketplaceLocationLabel(routeLocation));
  }, [q, routeLocation]);

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void navigate({
      search: { q: query.trim() || undefined, location: selectedLocation },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="border-b border-border bg-surface py-6">
        <form
          onSubmit={submitSearch}
          className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:flex-row sm:px-6"
        >
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-12 bg-card pl-9"
              placeholder="Search businesses, products, services…"
              aria-label="Search businesses, products, and services"
            />
          </div>
          <LocationPicker
            value={selectedLocation}
            onChange={(city) => {
              setSelectedLocation(city);
              app.saveCustomer({ ...appState.customer, city });
            }}
            className="h-12"
          />
          <Button type="submit" className="h-12 px-8">
            Search
          </Button>
        </form>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">
              {query.trim() ? `Results for "${query.trim()}"` : "Discover businesses"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {businesses.length} {businesses.length === 1 ? "business" : "businesses"} ·{" "}
              {products.length} products & services
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 sm:hidden">
            <SlidersHorizontal className="size-4" /> Filters
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary">
            {selectedLocation === "Federal Capital Territory"
              ? "Abuja, NG"
              : `${selectedLocation.replace(/ State$/, "")}, NG`}
          </span>
          {query.trim() && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary"
            >
              {query.trim()} <X className="size-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedLocation("Lagos State");
              app.saveCustomer({ ...appState.customer, city: "Lagos State" });
              void navigate({ search: { q: undefined, location: "Lagos State" } });
            }}
            className="text-xs font-medium text-muted-foreground underline"
          >
            Clear all
          </button>
        </div>

        <h2 className="mt-10 mb-4 text-lg font-bold">Businesses</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {businesses.map((v) => (
            <VendorCard key={v.slug} vendor={v} compact />
          ))}
          {businesses.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No businesses match your search in this location.
            </p>
          )}
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
          {products.length === 0 && (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No products or services match your search in this location.
            </p>
          )}
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
