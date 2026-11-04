import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  Check,
  CreditCard,
  ImagePlus,
  ListPlus,
  MessagesSquare,
  Play,
  Search,
  Star,
  Store,
  Truck,
} from "lucide-react";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { SectionHeading, VendorCard } from "@/components/site/bits";
import { categories, vendors } from "@/lib/data";
import { searchVendors } from "@/lib/discovery";
import { getMarketplaceLocationLabel } from "@/lib/location";
import { app, useApp } from "@/lib/peniel-store";
import { LocationPicker } from "@/components/site/location-picker";
import { ItemArt } from "@/components/store/store-kit";
import bizRestaurant from "@/assets/biz-restaurant.jpg";
import bizSalon from "@/assets/biz-salon.jpg";
import bizFashion from "@/assets/biz-fashion.jpg";
import coverAbigails from "@/assets/cover-abigails.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Peniel - Your business. Your storefront. Your customers." },
      {
        name: "description",
        content:
          "Peniel gives Nigerian businesses their own online storefront, orders and bookings, secure central payments and a full business dashboard - in one platform.",
      },
      { property: "og:title", content: "Peniel - Your business. Your storefront. One platform." },
      {
        property: "og:description",
        content:
          "Create your store, sell products or services, accept payments and grow. Built in Lagos.",
      },
    ],
  }),
  component: Landing,
});

const setupSteps = [
  {
    icon: Store,
    title: "Choose your business type",
    text: "Restaurant, fashion, salon, hotel, farm - tools adapt to you.",
  },
  {
    icon: ListPlus,
    title: "Add products or services",
    text: "Variants, sizes, modifiers, service durations and staff.",
  },
  {
    icon: ImagePlus,
    title: "Brand your storefront",
    text: "Logo, cover, colours and your own shareable store link.",
  },
  {
    icon: CreditCard,
    title: "Payments handled for you",
    text: "No API keys. Peniel Pay collects and settles to your balance.",
  },
];

const platformCards = [
  {
    icon: Store,
    title: "Your own storefront",
    text: "A branded store link you can drop in WhatsApp, Instagram or TikTok bio.",
    tone: "plain",
  },
  {
    icon: CreditCard,
    title: "Payments handled",
    text: "Customers pay securely through Peniel Pay. Track balance and payouts.",
    tone: "accent",
  },
  {
    icon: BarChart3,
    title: "Business dashboard",
    text: "Sales, orders, customers and analytics in one command centre.",
    tone: "plain",
  },
  {
    icon: BadgeCheck,
    title: "Earn verification",
    text: "Serve 5 different customers well, then apply. Trust is earned, never bought.",
    tone: "plain",
  },
  {
    icon: Boxes,
    title: "Inventory & orders",
    text: "Stock levels, low-stock alerts, order and booking pipelines.",
    tone: "plain",
  },
  {
    icon: Truck,
    title: "Delivery & bookings",
    text: "Zones, fees, pickup, appointment slots and reservations.",
    tone: "plain",
  },
];

const bizTypes = [
  {
    img: bizRestaurant,
    title: "Restaurants & Food",
    points: ["Menu management", "Order management", "Preparation status", "Delivery tracking"],
    to: "/category/restaurants",
  },
  {
    img: bizSalon,
    title: "Salons & Barbers",
    points: ["Appointment booking", "Staff schedules", "Service catalogue", "Customer history"],
    to: "/category/salons",
  },
  {
    img: bizFashion,
    title: "Fashion & Clothing",
    points: ["Product variants", "Size & colour stock", "Inventory tracking", "Order fulfilment"],
    to: "/category/fashion",
  },
];

const testimonials = [
  {
    name: "Adaeze Okafor",
    biz: "Founder, FF Collective",
    text: "I set my store up in under an hour. Now I share one link and orders just come in - no more counting DMs.",
  },
  {
    name: "Tunde Bakare",
    biz: "Owner, TB Autocare",
    text: "My clients booked fully and paid without me chasing. The dashboard shows me exactly what each week earned.",
  },
  {
    name: "Ngozi Eze",
    biz: "Mama Cee Confectionery",
    text: "The verification badge changed everything. Customers trust us faster and bookings increased significantly.",
  },
];

function Landing() {
  const featured = vendors.filter((v) => v.featured);
  const appState = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  if (appState.user?.role === "customer") return <CustomerHome />;
  if (appState.user?.role === "vendor") return <VendorWorkspaceHome />;
  const selectedLocation = getMarketplaceLocationLabel(appState.customer.city);
  const matchingVendors = searchVendors(searchQuery, selectedLocation);
  const showLiveResults = Boolean(searchQuery.trim()) || selectedLocation !== "Lagos State";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="surface-grid absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-semibold text-gold-foreground">
              <span className="size-1.5 rounded-full bg-primary" /> Now live - Lagos, Nigeria
            </span>
            <h1 className="mt-6 font-display text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your business.
              <br />
              <span className="text-primary">Your storefront.</span>
              <br />
              Your customers.
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
              Create your own online store, accept orders and bookings, manage customers and get
              paid - all from one platform built for African businesses.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/vendor/onboarding">
                  Create your store - it's free <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 gap-2 px-6">
                <Link to="/for-businesses">
                  <Play className="size-4" /> How it works
                </Link>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {["No developer needed", "Free to start", "Secure central payments"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <Check className="size-4 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>

          {/* storefront preview mock */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-lift">
              <div className="flex items-center gap-2 border-b border-border bg-muted px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/60" />
                <span className="size-2.5 rounded-full bg-gold" />
                <span className="size-2.5 rounded-full bg-success" />
                <span className="ml-2 truncate rounded-md bg-card px-2 py-1 text-[11px] text-muted-foreground">
                  peniel.ng/store/abigails-kitchen
                </span>
              </div>
              <div className="relative">
                <img
                  src={coverAbigails}
                  alt="Abigail's Kitchen storefront preview"
                  width={1600}
                  height={900}
                  className="h-56 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-primary-foreground">
                  <p className="text-script text-2xl">Bringing Africa</p>
                  <p className="text-script text-2xl">to your table</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 p-3">
                {vendors[0]!.products.slice(0, 3).map((p, index) => (
                  <div key={p.id} className="rounded-xl border border-border p-2">
                    <ItemArt
                      vendor={vendors[0]!}
                      seed={index}
                      label={p.name}
                      className="mb-2 h-14 w-full rounded-lg"
                    />
                    <p className="truncate text-[11px] font-semibold">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">₦{p.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-lift sm:flex">
              <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-primary">
                <BadgeCheck className="size-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">Verified business</p>
                <p className="text-[11px] text-muted-foreground">Earned after 5 served customers</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {[
            ["4,200+", "Active vendors"],
            ["180K+", "Products & services"],
            ["290K+", "Happy customers"],
            ["24", "Cities covered"],
          ].map(([v, l]) => (
            <div
              key={l}
              className="border-border sm:border-l sm:pl-6 sm:first:border-l-0 sm:first:pl-0"
            >
              <p className="font-display text-3xl font-bold text-primary">{v}</p>
              <p className="mt-1 text-sm text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DISCOVERY */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            What are you looking for today?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Find businesses, products and services near you.
          </p>
        </div>
        <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-card sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Restaurants, fashion, groceries, salons…"
              className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
            />
          </div>
          <LocationPicker
            value={selectedLocation}
            onChange={(city) => app.saveCustomer({ ...appState.customer, city })}
            className="h-11"
          />
          <Button asChild className="h-11 px-7">
            <Link
              to="/search"
              search={{ q: searchQuery.trim() || undefined, location: selectedLocation }}
            >
              Search
            </Link>
          </Button>
        </div>

        {showLiveResults && (
          <div
            className="mx-auto mt-3 max-w-3xl rounded-xl border border-border bg-card p-4"
            aria-live="polite"
          >
            <p className="text-sm font-semibold">
              {matchingVendors.length
                ? `${matchingVendors.length} ${matchingVendors.length === 1 ? "business" : "businesses"} near ${selectedLocation.replace(/ State$/, "")}`
                : `No businesses found near ${selectedLocation.replace(/ State$/, "")}`}
            </p>
            {matchingVendors.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {matchingVendors.slice(0, 4).map((vendor) => (
                  <Link
                    key={vendor.slug}
                    to="/store/$slug"
                    params={{ slug: vendor.slug }}
                    className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium hover:bg-primary-soft hover:text-primary"
                  >
                    {vendor.name}
                  </Link>
                ))}
                <Link
                  to="/search"
                  search={{ q: searchQuery.trim() || undefined, location: selectedLocation }}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  See all results
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.slice(0, 7).map((c) => {
            const Icon = (Icons as unknown as Record<string, typeof Store>)[c.icon] ?? Store;
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group rounded-2xl border border-border bg-card p-4 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card"
              >
                <span className="mx-auto grid size-11 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-sm font-semibold">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.count} businesses</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED */}
      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            title="Featured businesses"
            subtitle="Hand-picked vendors with exceptional service records"
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/marketplace">
                  View all <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((v) => (
              <VendorCard key={v.slug} vendor={v} />
            ))}
          </div>
        </div>
      </section>

      {/* SETUP */}
      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              For businesses
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Set up your store.
              <br />
              Start selling today.
            </h2>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              No developer, no domain, no complicated setup. Choose your business type, add your
              products or services, and get your own shareable storefront link.
            </p>
            <ul className="mt-7 space-y-4">
              {setupSteps.map((s, i) => (
                <li key={s.title} className="flex gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft font-display text-sm font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{s.title}</p>
                    <p className="text-sm text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8 h-11 px-6">
              <Link to="/vendor/onboarding">Create your free store</Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {platformCards.map((c) => (
              <div
                key={c.title}
                className={
                  "rounded-2xl border p-5 " +
                  (c.tone === "accent"
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card")
                }
              >
                <c.icon className={"size-5 " + (c.tone === "accent" ? "" : "text-primary")} />
                <p className="mt-3 text-sm font-semibold">{c.title}</p>
                <p
                  className={
                    "mt-1 text-sm " + (c.tone === "accent" ? "opacity-80" : "text-muted-foreground")
                  }
                >
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS TYPES */}
      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Built for every type of business
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              The platform adapts to how your business actually runs.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {bizTypes.map((b) => (
              <Link
                key={b.title}
                to={b.to}
                className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
              >
                <img
                  src={b.img}
                  alt={b.title}
                  loading="lazy"
                  width={1200}
                  height={800}
                  className="h-40 w-full object-cover"
                />
                <div className="p-5">
                  <p className="font-semibold">{b.title}</p>
                  <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    {b.points.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <Check className="size-3.5 text-primary" /> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/marketplace">See all 13 business types</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="brand-gradient py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Vendors who changed their business
            </h2>
            <p className="mt-2 text-sm opacity-75">Real stories from businesses on the platform.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-primary-foreground/8 p-5 backdrop-blur-sm"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-gold text-gold" />
                  ))}
                </div>
                <p className="mt-3 text-sm opacity-90">"{t.text}"</p>
                <div className="mt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs opacity-70">{t.biz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-6 rounded-3xl bg-sidebar px-6 py-10 text-sidebar-foreground sm:px-10 lg:grid-cols-[1.4fr_auto]">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Ready to take your business online?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-sidebar-foreground/70">
              Join thousands of Nigerian businesses already selling on Peniel. Create your
              storefront for free and start receiving orders today.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2">
            <Button
              asChild
              size="lg"
              className="h-12 bg-gold px-7 text-gold-foreground hover:bg-gold/90"
            >
              <Link to="/vendor/onboarding">
                Create your store - it's free <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-xs text-sidebar-foreground/60">
              No card required. Setup takes minutes.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function CustomerHome() {
  const state = useApp();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const name = state.user?.name.split(" ")[0] || state.customer.name.split(" ")[0];
  const featured = vendors.filter((vendor) => vendor.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-[2rem] bg-sidebar px-5 py-8 text-sidebar-foreground shadow-lift sm:px-10 sm:py-12">
          <div
            aria-hidden="true"
            className="surface-grid pointer-events-none absolute inset-0 opacity-20"
          />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                <span className="size-1.5 rounded-full bg-gold" /> Your Peniel home
              </span>
              <h1 className="mt-4 max-w-xl font-display text-3xl leading-tight font-bold sm:text-5xl">
                Welcome back, {name}.
                <span className="mt-1 block text-gold">What are you looking for today?</span>
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/70 sm:text-base">
                Discover independent businesses, keep your orders close, and find something worth
                coming back for.
              </p>
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void navigate({ to: "/search", search: { q: query.trim() || undefined } });
                }}
                className="mt-6 flex max-w-xl flex-col gap-2 rounded-2xl bg-card p-2 text-foreground sm:flex-row"
              >
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search shops, food, fashion…"
                    className="h-11 border-0 pl-9 shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button type="submit" className="h-11 px-6">
                  Explore <ArrowRight className="size-4" />
                </Button>
              </form>
            </div>
            <div className="hidden grid-cols-2 gap-3 lg:grid">
              {featured.slice(0, 2).map((vendor, index) => (
                <Link
                  key={vendor.slug}
                  to="/store/$slug"
                  params={{ slug: vendor.slug }}
                  className={
                    "group relative overflow-hidden rounded-2xl " +
                    (index === 0 ? "mt-8 h-64" : "h-52")
                  }
                >
                  <img
                    src={vendor.cover}
                    alt={vendor.name}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute right-3 bottom-3 left-3">
                    <span className="block truncate font-display font-bold text-white">
                      {vendor.name}
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-white/80">
                      <Star className="size-3 fill-gold text-gold" /> {vendor.rating.toFixed(1)} ·{" "}
                      {vendor.categoryLabel}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            {
              label: "Explore businesses",
              detail: "Browse the marketplace",
              to: "/marketplace",
              icon: Store,
            },
            {
              label: "Your orders",
              detail: `${state.orders.length} recent activities`,
              to: "/orders",
              icon: Truck,
            },
            {
              label: "Messages",
              detail: "Chat with businesses",
              to: "/messages",
              icon: MessagesSquare,
            },
          ].map(({ label, detail, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-primary/30 sm:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display font-bold">{label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </section>

        <section>
          <SectionHeading
            title="Picked for you"
            subtitle="Local favourites with great products and service."
            action={
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link to="/marketplace">
                  See all <ArrowRight className="size-4" />
                </Link>
              </Button>
            }
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((vendor) => (
              <Link
                key={vendor.slug}
                to="/store/$slug"
                params={{ slug: vendor.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={vendor.cover}
                    alt={vendor.name}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {vendor.verified && (
                    <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/95 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <BadgeCheck className="size-3.5" /> Verified
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-display font-bold">{vendor.name}</span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {vendor.categoryLabel} ·{" "}
                        {vendor.location.split(",").slice(-2).join(",").trim()}
                      </span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
                      <Star className="size-3.5 fill-gold text-gold" />
                      {vendor.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function VendorWorkspaceHome() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto grid min-h-[70vh] max-w-4xl place-items-center px-4 py-12">
        <section className="w-full rounded-3xl border border-border bg-card p-6 text-center shadow-card sm:p-10">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Store className="size-7" />
          </span>
          <p className="mt-5 text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Business workspace
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold">
            Your storefront, all in one place.
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
            Manage orders, products, customers and your store settings from your business dashboard.
          </p>
          <Button asChild className="mt-6 h-11 px-6">
            <Link to="/vendor">
              Open business dashboard <ArrowRight className="size-4" />
            </Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
