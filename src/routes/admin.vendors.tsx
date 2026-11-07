
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Store,
  BadgeCheck,
  Clock3,
  ShieldAlert,
  ArrowUpRight,
  ArrowRight,
  SlidersHorizontal,
  X,
  MapPin,
  Star,
  Building2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { naira, vendors } from "@/lib/data";

export const Route = createFileRoute("/admin/vendors")({
  head: () => ({
    meta: [
      { title: "Vendors - Peniel admin" },
      {
        name: "description",
        content:
          "Search, review and manage every business selling on Peniel, with status, ratings and volume.",
      },
      { property: "og:title", content: "Vendors - Peniel admin" },
      {
        property: "og:description",
        content: "Manage every business on the platform.",
      },
    ],
  }),
  component: AdminVendors,
});

const filters = ["All", "Verified", "New vendor", "Top rated"];

function VendorMetric({
  label,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function AdminVendors() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const visibleVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const search = query.trim().toLowerCase();

      const matchesQuery = [
        vendor.name,
        vendor.categoryLabel,
        vendor.location,
      ].some((value) => value.toLowerCase().includes(search));

      const matchesFilter =
        filter === "All" ||
        (filter === "Verified" && vendor.verified) ||
        (filter === "New vendor" && !vendor.verified) ||
        (filter === "Top rated" && vendor.rating >= 4.8);

      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Vendors"
      subtitle="Manage businesses, monitor performance and review vendor accounts."
    >
      <div className="space-y-6">
        {/* Overview metrics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Vendor overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Marketplace business accounts
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Platform-wide
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <VendorMetric
              label="Total active vendors"
              value="5,842"
              description="Businesses on Peniel"
              icon={Store}
              accent
            />
            <VendorMetric
              label="Verified businesses"
              value="1,204"
              description="Successfully verified accounts"
              icon={BadgeCheck}
            />
            <VendorMetric
              label="Awaiting review"
              value="12"
              description="Applications requiring attention"
              icon={Clock3}
            />
            <VendorMetric
              label="Suspended accounts"
              value="7"
              description="Currently restricted businesses"
              icon={ShieldAlert}
            />
          </div>
        </section>

        {/* Vendor management */}
        <Panel title="All businesses">
          <div className="space-y-4">
            {/* Search and count */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Browse and manage every business on the platform.
                </p>
              </div>

              <div className="relative w-full sm:max-w-[280px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  aria-label="Search vendors"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, category or location..."
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-9 text-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <SlidersHorizontal
                  size={15}
                  className="mr-1 shrink-0 text-muted-foreground"
                />
                {filters.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={`shrink-0 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${
                      filter === item
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <p className="shrink-0 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {visibleVendors.length}
                </span>{" "}
                businesses found
              </p>
            </div>

            {/* Vendor table */}
            {visibleVendors.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={[
                    "Business",
                    "Category",
                    "Location",
                    "Rating",
                    "Volume",
                    "Status",
                    "",
                  ]}
                  rows={visibleVendors.map((v) => [
                    <div className="flex min-w-[145px] items-center gap-2.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-muted/70 text-xs font-bold text-foreground">
                        {v.monogram}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {v.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Business account
                        </p>
                      </div>
                    </div>,

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {v.categoryLabel}
                    </span>,

                    <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                      <MapPin size={12} />
                      {v.location}
                    </span>,

                    <span className="flex items-center gap-1.5 text-xs font-semibold">
                      <Star
                        size={13}
                        className="fill-amber-400 text-amber-400"
                      />
                      {v.rating.toFixed(1)}
                    </span>,

                    <span className="whitespace-nowrap text-xs font-medium">
                      {naira(v.reviews * 24000)}
                    </span>,

                    <span
                      className={`inline-flex w-fit items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        v.verified
                          ? "bg-success/10 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {v.verified && <BadgeCheck size={11} />}
                      {v.verified ? "Verified" : "New vendor"}
                    </span>,

                    <Link
                      to="/store/$slug"
                      params={{ slug: v.slug }}
                      className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-primary transition hover:gap-1.5 hover:underline"
                    >
                      View store
                      <ArrowUpRight size={13} />
                    </Link>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Building2 size={20} />
                </div>
                <p className="mt-3 text-sm font-semibold">
                  No businesses found
                </p>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  No vendors match your current search or selected filter.
                  Try adjusting your search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                  <ArrowRight size={13} />
                </button>
              </div>
            )}
          </div>
        </Panel>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Store size={13} />
          Peniel vendor management
        </div>
      </div>
    </DashShell>
  );
}
