import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import * as Icons from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Clock,
  LayoutGrid,
  List,
  MapPin,
  SlidersHorizontal,
  Star,
  Store,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeading, Stars, VendorCard, Verified } from "@/components/site/bits";
import { categories, vendors } from "@/lib/data";
import { useApp } from "@/lib/peniel-store";
import { locationMatches, normalizeLocationLabel } from "@/lib/location";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace - Discover businesses on Peniel" },
      {
        name: "description",
        content:
          "Browse verified restaurants, fashion brands, salons, farms, hotels and more. Discover businesses near you and order or book in minutes.",
      },
      { property: "og:title", content: "Peniel Marketplace - discover businesses near you" },
      { property: "og:description", content: "4,200+ businesses across 24 Nigerian cities. Order, book and pay securely." },
    ],
  }),
  component: Marketplace,
});

const sorts = ["Recommended", "Popular", "Top Rated", "New", "Nearest"];
const quickFilters = ["Free delivery", "Under ₦5,000", "Accepts online booking", "New businesses", "Top Rated"];
const ratingFilters: [string, string][] = [
  ["4.5 & above", "1,240"],
  ["4.0 & above", "2,890"],
  ["3.5 & above", "3,410"],
];
const availabilityFilters: [string, string][] = [
  ["Open now", "890"],
  ["Available today", "1,190"],
  ["Accepts bookings", "640"],
  ["Delivers today", "530"],
];
const trustFilters: [string, string][] = [
  ["Verified only", "726"],
  ["Top rated", "312"],
];
const distances = [
  { label: "Within 2 km", radius: 2 },
  { label: "Within 5 km", radius: 5 },
  { label: "Within 10 km", radius: 10 },
  { label: "Any distance", radius: null },
] as const;

const vendorCoordinates: Record<string, { latitude: number; longitude: number }> = {
  "abigails-kitchen": { latitude: 6.432, longitude: 3.47 },
  "fresh-from-the-farm": { latitude: 6.615, longitude: 3.507 },
  "glamour-beauty-lounge": { latitude: 6.432, longitude: 3.47 },
  "kemis-couture": { latitude: 6.428, longitude: 3.421 },
  "mama-cee-confectionery": { latitude: 4.815, longitude: 7.006 },
  "eko-heights-hotel": { latitude: 6.423, longitude: 3.431 },
  "lagos-tech-hub": { latitude: 6.601, longitude: 3.342 },
};

type Position = { latitude: number; longitude: number };
type DistanceOption = (typeof distances)[number]["label"];
type ViewMode = "grid" | "list";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function vendorIsOpen(vendor: (typeof vendors)[number], now = new Date()) {
  const hours = vendor.hours;
  if (/24\s*\/\s*7/i.test(hours)) return true;

  const schedule = hours.match(/^\s*((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b.*?):\s*/i)?.[1];
  if (schedule) {
    const dayRange = schedule.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b(?:\s*-\s*\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)?/i);
    if (dayRange) {
      const currentDay = new Intl.DateTimeFormat("en-US", {
        timeZone: "Africa/Lagos",
        weekday: "short",
      }).format(now);
      const firstDay = weekDays.indexOf(dayRange[1]![0]!.toUpperCase() + dayRange[1]!.slice(1, 3).toLowerCase());
      const lastDay = dayRange[2]
        ? weekDays.indexOf(dayRange[2]![0]!.toUpperCase() + dayRange[2]!.slice(1, 3).toLowerCase())
        : firstDay;
      const today = weekDays.indexOf(currentDay);
      const operatesToday =
        firstDay <= lastDay
          ? today >= firstDay && today <= lastDay
          : today >= firstDay || today <= lastDay;
      if (!operatesToday) return false;
    }
  }

  const timeRange = hours.match(
    /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)\s*-\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i,
  );
  if (!timeRange) return false;

  const toMinutes = (hour: string, minute: string | undefined, meridiem: string) => {
    const hourNumber = Number(hour) % 12 + (meridiem.toUpperCase() === "PM" ? 12 : 0);
    return hourNumber * 60 + Number(minute ?? 0);
  };
  const start = toMinutes(timeRange[1]!, timeRange[2], timeRange[3]!);
  const end = toMinutes(timeRange[4]!, timeRange[5], timeRange[6]!);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const currentTime =
    Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 +
    Number(parts.find((part) => part.type === "minute")?.value ?? 0);

  return start <= end
    ? currentTime >= start && currentTime < end
    : currentTime >= start || currentTime < end;
}

function vendorIsOpenToday(vendor: (typeof vendors)[number], now = new Date()) {
  if (/24\s*\/\s*7/i.test(vendor.hours)) return true;
  const schedule = vendor.hours.match(/^\s*((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b.*?):\s*/i)?.[1];
  if (!schedule) return false;
  const dayRange = schedule.match(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b(?:\s*-\s*\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b)?/i);
  if (!dayRange) return false;
  const currentDay = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Lagos",
    weekday: "short",
  }).format(now);
  const firstDay = weekDays.indexOf(dayRange[1]![0]!.toUpperCase() + dayRange[1]!.slice(1, 3).toLowerCase());
  const lastDay = dayRange[2]
    ? weekDays.indexOf(dayRange[2]![0]!.toUpperCase() + dayRange[2]!.slice(1, 3).toLowerCase())
    : firstDay;
  const today = weekDays.indexOf(currentDay);
  return firstDay <= lastDay
    ? today >= firstDay && today <= lastDay
    : today >= firstDay || today <= lastDay;
}

function distanceInKm(from: Position, to: Position) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function orderCount(orders: string) {
  const match = orders.match(/([\d,.]+)\s*(K)?/i);
  if (!match) return 0;
  const value = Number(match[1]!.replaceAll(",", ""));
  return value * (match[2] ? 1000 : 1);
}

function Marketplace() {
  const app = useApp();
  const [sortBy, setSortBy] = useState<(typeof sorts)[number]>("Recommended");
  const [distance, setDistance] = useState<DistanceOption>("Any distance");
  const [customerPosition, setCustomerPosition] = useState<Position | null>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "loading" | "error">("idle");
  const [locationError, setLocationError] = useState("");
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [selectedTrust, setSelectedTrust] = useState<string[]>([]);
  const [selectedQuickFilters, setSelectedQuickFilters] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const selectedLocation = normalizeLocationLabel(app.customer.city ?? "Lagos, NG");
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationError("Location is unavailable in this browser.");
      setDistance("Any distance");
      return;
    }

    setLocationStatus("loading");
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCustomerPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus("idle");
      },
      () => {
        setLocationStatus("error");
        setLocationError("Allow location access to use distance and nearest sorting.");
        setDistance("Any distance");
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 10_000 },
    );
  };
  const handleDistanceChange = (nextDistance: DistanceOption) => {
    setDistance(nextDistance);
    if (nextDistance === "Any distance") {
      setLocationError("");
      setLocationStatus("idle");
      return;
    }
    if (!customerPosition) requestLocation();
  };
  const handleSortChange = (nextSort: (typeof sorts)[number]) => {
    setSortBy(nextSort);
    if (nextSort === "Nearest" && !customerPosition) requestLocation();
  };
  const clearFilters = () => {
    setSortBy("Recommended");
    setDistance("Any distance");
    setSelectedRatings([]);
    setSelectedAvailability([]);
    setSelectedTrust([]);
    setSelectedQuickFilters([]);
    setLocationError("");
    setLocationStatus("idle");
  };
  const toggleSelection = (
    current: string[],
    setCurrent: (next: string[] | ((previous: string[]) => string[])) => void,
    value: string,
  ) => {
    setCurrent((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  const distanceRadius = distances.find((option) => option.label === distance)?.radius ?? null;
  const visibleVendors = vendors
    .filter((vendor) => locationMatches(vendor.location, selectedLocation))
    .filter((vendor) => {
      const minRating = Math.max(
        0,
        ...selectedRatings.map((label) => Number.parseFloat(label)),
        ...(selectedQuickFilters.includes("Top Rated") ? [4.5] : []),
      );
      if (vendor.rating < minRating) return false;
      if (
        selectedAvailability.includes("Open now") &&
        !vendorIsOpen(vendor)
      ) return false;
      if (
        selectedAvailability.includes("Available today") &&
        !vendorIsOpenToday(vendor)
      ) return false;
      if (
        selectedAvailability.includes("Accepts bookings") &&
        vendor.fulfilment !== "booking" &&
        vendor.fulfilment !== "reservation"
      ) return false;
      if (
        selectedAvailability.includes("Delivers today") &&
        (vendor.fulfilment !== "order" || !/deliver/i.test(vendor.delivery))
      ) return false;
      if (
        (selectedTrust.includes("Verified only") ||
          selectedQuickFilters.includes("Verified only")) &&
        !vendor.verified
      ) return false;
      if (selectedTrust.includes("Top rated") && vendor.rating < 4.5) return false;
      if (
        selectedQuickFilters.includes("Free delivery") &&
        !/free/i.test(vendor.delivery)
      ) return false;
      if (
        selectedQuickFilters.includes("Under ₦5,000") &&
        !vendor.products.some((product) => product.price < 5000)
      ) return false;
      if (
        selectedQuickFilters.includes("Accepts online booking") &&
        vendor.fulfilment !== "booking" &&
        vendor.fulfilment !== "reservation"
      ) return false;
      if (
        selectedQuickFilters.includes("New businesses") &&
        vendors.indexOf(vendor) < vendors.length - 3
      ) return false;
      return true;
    })
    .filter((vendor) => {
      if (distanceRadius === null || !customerPosition) return true;
      const position = vendorCoordinates[vendor.slug];
      return position !== undefined && distanceInKm(customerPosition, position) <= distanceRadius;
    })
    .sort((a, b) => {
      if (sortBy === "Popular") return orderCount(b.orders) - orderCount(a.orders);
      if (sortBy === "Top Rated") return b.rating - a.rating || b.reviews - a.reviews;
      // The seed vendors have no creation timestamps, so use catalog order as the newest-first fallback.
      if (sortBy === "New") return vendors.indexOf(b) - vendors.indexOf(a);
      if (sortBy === "Nearest" && customerPosition) {
        const aPosition = vendorCoordinates[a.slug];
        const bPosition = vendorCoordinates[b.slug];
        if (!aPosition) return 1;
        if (!bPosition) return -1;
        return distanceInKm(customerPosition, aPosition) - distanceInKm(customerPosition, bPosition);
      }
      if (sortBy === "Recommended") {
        return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
      }
      return 0;
    });
  const topRated = [...visibleVendors].sort((a, b) => b.rating - a.rating).slice(0, 4);

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
          {visibleVendors.filter((v) => v.featured).slice(0, 3).map((v) => (
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
        <aside className="hidden self-start lg:block">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <MarketplaceFilters
              idPrefix="desktop"
              sortBy={sortBy}
              distance={distance}
              selectedRatings={selectedRatings}
              selectedAvailability={selectedAvailability}
              selectedTrust={selectedTrust}
              onSortChange={handleSortChange}
              onDistanceChange={handleDistanceChange}
              onToggleRating={(value) => toggleSelection(selectedRatings, setSelectedRatings, value)}
              onToggleAvailability={(value) =>
                toggleSelection(selectedAvailability, setSelectedAvailability, value)
              }
              onToggleTrust={(value) => toggleSelection(selectedTrust, setSelectedTrust, value)}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* results */}
        <div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold">All businesses</h1>
              <p className="text-sm text-muted-foreground">
                Showing {visibleVendors.length} businesses in {selectedLocation}
                {locationStatus === "loading" && " · Finding your location…"}
                {locationError && ` · ${locationError}`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                variant={selectedAvailability.includes("Open now") ? "default" : "outline"}
                size="sm"
                aria-pressed={selectedAvailability.includes("Open now")}
                onClick={() =>
                  toggleSelection(selectedAvailability, setSelectedAvailability, "Open now")
                }
                className="gap-1.5"
              >
                <Clock className="size-3.5" /> Open now
              </Button>
              <Button
                type="button"
                variant={selectedRatings.includes("4.5 & above") ? "default" : "outline"}
                size="sm"
                aria-pressed={selectedRatings.includes("4.5 & above")}
                onClick={() =>
                  toggleSelection(selectedRatings, setSelectedRatings, "4.5 & above")
                }
                className="hidden gap-1.5 sm:inline-flex"
              >
                <Star className="size-3.5" /> 4.5 & above
              </Button>
              <Button
                type="button"
                variant={selectedTrust.includes("Verified only") ? "default" : "outline"}
                size="sm"
                aria-pressed={selectedTrust.includes("Verified only")}
                onClick={() =>
                  toggleSelection(selectedTrust, setSelectedTrust, "Verified only")
                }
                className="hidden gap-1.5 sm:inline-flex"
              >
                <BadgeCheck className="size-3.5" /> Verified
              </Button>
              <div className="ml-1 hidden items-center rounded-lg border border-border sm:flex">
                <button
                  type="button"
                  aria-label="Show businesses in a grid"
                  aria-pressed={viewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                  className={`grid size-8 place-items-center rounded-l-lg transition-colors ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
                >
                  <LayoutGrid className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="Show businesses in a list"
                  aria-pressed={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                  className={`grid size-8 place-items-center rounded-r-lg transition-colors ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"}`}
                >
                  <List className="size-4" />
                </button>
              </div>
              <MobileFiltersDrawer
                sortBy={sortBy}
                distance={distance}
                selectedRatings={selectedRatings}
                selectedAvailability={selectedAvailability}
                selectedTrust={selectedTrust}
                onSortChange={handleSortChange}
                onDistanceChange={handleDistanceChange}
                onToggleRating={(value) => toggleSelection(selectedRatings, setSelectedRatings, value)}
                onToggleAvailability={(value) => toggleSelection(selectedAvailability, setSelectedAvailability, value)}
                onToggleTrust={(value) => toggleSelection(selectedTrust, setSelectedTrust, value)}
                onClear={clearFilters}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quickFilters.map((q) => (
              <button
                key={q}
                type="button"
                aria-pressed={selectedQuickFilters.includes(q)}
                onClick={() => toggleSelection(selectedQuickFilters, setSelectedQuickFilters, q)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  selectedQuickFilters.includes(q)
                    ? "border-primary bg-primary-soft font-semibold text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {q}
              </button>
            ))}
          </div>

          <div className={`mt-6 grid gap-4 ${viewMode === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
            {visibleVendors.map((v) => (
              viewMode === "grid" ? (
                <VendorCard key={v.slug} vendor={v} />
              ) : (
                <Link
                  key={v.slug}
                  to="/store/$slug"
                  params={{ slug: v.slug }}
                  className="group flex min-w-0 overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-colors hover:bg-muted/40"
                >
                  <img
                    src={v.cover}
                    alt={v.name}
                    loading="lazy"
                    className="h-32 w-32 shrink-0 object-cover sm:h-36 sm:w-44"
                  />
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-semibold">
                        {v.name} {v.verified && <Verified />}
                      </p>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{v.tagline}</p>
                      <p className="mt-2 truncate text-xs text-muted-foreground">
                        {v.categoryLabel} · {v.location}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <Stars value={v.rating} />
                      <p className="mt-1 text-xs text-muted-foreground">{v.reviews} reviews</p>
                    </div>
                  </div>
                </Link>
              )
            ))}
          </div>
          {visibleVendors.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
              <MapPin className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 font-semibold">No businesses in this distance</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a wider distance or choose Any distance.</p>
            </div>
          )}

          <div className="mt-12">
            <SectionHeading
              title={`Top rated in ${selectedLocation.replace(", NG", "")}`}
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
            <p>Showing 1-{visibleVendors.length} of {visibleVendors.length}+ businesses</p>
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

function FilterGroup({
  title,
  items,
  icon: Icon,
  idPrefix,
  selectedItems,
  onToggle,
}: {
  title: string;
  items: [string, string][];
  icon: typeof Star;
  idPrefix: string;
  selectedItems: string[];
  onToggle: (label: string) => void;
}) {
  return (
    <section className="border-t border-border pt-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        {title}
      </h3>
      <div className="mt-3 space-y-1">
        {items.map(([label, count], index) => {
          const id = `${idPrefix}-${title.toLowerCase().replaceAll(" ", "-")}-${index}`;
          return (
            <div
              key={label}
              className="flex min-h-10 items-center gap-3 rounded-xl px-2.5 transition-colors hover:bg-muted/70"
            >
              <Checkbox
                id={id}
                checked={selectedItems.includes(label)}
                onCheckedChange={() => onToggle(label)}
              />
              <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-2 py-2 text-[13px]">
                <span className="truncate">{label}</span>
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] tabular-nums text-muted-foreground">
                  {count}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MarketplaceFilters({
  idPrefix,
  sortBy,
  distance,
  selectedRatings,
  selectedAvailability,
  selectedTrust,
  onSortChange,
  onDistanceChange,
  onToggleRating,
  onToggleAvailability,
  onToggleTrust,
  onClear,
}: {
  idPrefix: string;
  sortBy: (typeof sorts)[number];
  distance: DistanceOption;
  selectedRatings: string[];
  selectedAvailability: string[];
  selectedTrust: string[];
  onSortChange: (sort: (typeof sorts)[number]) => void;
  onDistanceChange: (distance: DistanceOption) => void;
  onToggleRating: (label: string) => void;
  onToggleAvailability: (label: string) => void;
  onToggleTrust: (label: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Sort by</h3>
          <span className="text-[11px] text-muted-foreground">5 options</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {sorts.map((sort) => (
            <button
              key={sort}
              type="button"
              aria-pressed={sortBy === sort}
              onClick={() => onSortChange(sort)}
              className={
                "flex min-h-10 min-w-0 items-center justify-between gap-1 rounded-xl border px-3 text-left text-xs font-medium transition-all " +
                (sortBy === sort
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-foreground")
              }
            >
              <span className="truncate">{sort}</span>
              {sortBy === sort && <Check className="size-3.5 shrink-0" />}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Radius uses your device location and approximate storefront pins.
        </p>
      </section>

      <FilterGroup
        title="Minimum rating"
        icon={Star}
        items={ratingFilters}
        idPrefix={idPrefix}
        selectedItems={selectedRatings}
        onToggle={onToggleRating}
      />
      <FilterGroup
        title="Availability"
        icon={CalendarDays}
        items={availabilityFilters}
        idPrefix={idPrefix}
        selectedItems={selectedAvailability}
        onToggle={onToggleAvailability}
      />
      <FilterGroup
        title="Trust level"
        icon={BadgeCheck}
        items={trustFilters}
        idPrefix={idPrefix}
        selectedItems={selectedTrust}
        onToggle={onToggleTrust}
      />

      <section className="border-t border-border pt-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <MapPin className="size-4" />
          </span>
          Distance
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {distances.map((option) => (
            <label
              key={option.label}
              className="has-[:checked]:border-primary/40 has-[:checked]:bg-primary/5 has-[:checked]:font-medium has-[:checked]:text-primary flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-border px-2.5 text-xs transition-colors hover:border-primary/30 hover:bg-muted/60"
            >
              <input
                type="radio"
                name={`${idPrefix}-marketplace-distance`}
                value={option.label}
                checked={distance === option.label}
                onChange={() => onDistanceChange(option.label)}
                className="size-3.5 accent-primary"
              />
              <span className="leading-tight">{option.label}</span>
            </label>
          ))}
        </div>
      </section>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClear}
        className="w-full justify-center rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
      >
        Clear all filters
      </Button>
    </div>
  );
}

function MobileFiltersDrawer({
  sortBy,
  distance,
  selectedRatings,
  selectedAvailability,
  selectedTrust,
  onSortChange,
  onDistanceChange,
  onToggleRating,
  onToggleAvailability,
  onToggleTrust,
  onClear,
}: Omit<Parameters<typeof MarketplaceFilters>[0], "idPrefix">) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[92dvh] rounded-t-3xl">
        <DrawerHeader className="shrink-0 border-b border-border px-5 pb-4 pt-2 text-left">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl">Filters & sort</DrawerTitle>
              <DrawerDescription className="mt-1">Fine-tune the businesses you see</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="size-9 rounded-full bg-muted">
                <X className="size-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <MarketplaceFilters
            idPrefix="mobile"
            sortBy={sortBy}
            distance={distance}
            selectedRatings={selectedRatings}
            selectedAvailability={selectedAvailability}
            selectedTrust={selectedTrust}
            onSortChange={onSortChange}
            onDistanceChange={onDistanceChange}
            onToggleRating={onToggleRating}
            onToggleAvailability={onToggleAvailability}
            onToggleTrust={onToggleTrust}
            onClear={onClear}
          />
        </div>
        <DrawerFooter className="grid shrink-0 grid-cols-2 gap-3 border-t border-border bg-background px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
          <DrawerClose asChild>
            <Button variant="outline" className="h-11 rounded-xl">Done</Button>
          </DrawerClose>
          <Button type="button" className="h-11 rounded-xl" onClick={onClear}>
            Reset filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
