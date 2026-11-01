import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  CreditCard,
  Eye,
  MapPin,
  PackagePlus,
  Palette,
  Share2,
  ShoppingBag,
  Store,
  UserRoundPlus,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useApp } from "@/lib/peniel-store";

export const Route = createFileRoute("/for-businesses")({
  head: () => ({
    meta: [
      { title: "For businesses - Sell online with Peniel" },
      { name: "description", content: "Get your own storefront, accept orders and bookings, take secure payments and run your business from one dashboard. Free to start." },
      { property: "og:title", content: "Sell online with Peniel" },
      { property: "og:description", content: "Storefront, orders, payments, payouts and analytics - no developer needed." },
    ],
  }),
  component: ForBusinesses,
});

const journey = [
  { title: "Create account", description: "Email or phone, 30 seconds.", icon: UserRoundPlus },
  { title: "Choose business type", description: "Your dashboard adapts to how you operate.", icon: BriefcaseBusiness },
  { title: "Set up your business", description: "Location, hours, delivery or booking rules.", icon: MapPin },
  { title: "Add branding", description: "Logo, cover image, brand colour.", icon: Palette },
  { title: "Add products or services", description: "Variants, modifiers, durations, staff.", icon: PackagePlus },
  { title: "Preview & publish", description: "See your store, then go live.", icon: Eye },
  { title: "Share your link", description: "peniel.ng/store/your-business.", icon: Share2 },
  { title: "Start selling", description: "Orders, bookings and payments come in.", icon: ShoppingBag },
];

const modules = [
  { icon: Store, t: "Storefront builder", d: "A branded, mobile-first store you don't have to code." },
  { icon: CreditCard, t: "Peniel Pay", d: "Central payment infrastructure. No gateway keys to configure." },
  { icon: BarChart3, t: "Business dashboard", d: "Revenue, orders, conversion and popular items at a glance." },
  { icon: Boxes, t: "Inventory", d: "Stock counts, variants and low-stock alerts." },
  { icon: CalendarClock, t: "Bookings", d: "Slots, staff schedules and reservations." },
  { icon: Users, t: "Customers", d: "Repeat customers, order history and notes." },
];

function ForBusinesses() {
  const { user } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">For businesses</span>
          <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
            Sell and manage everything from one place.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Peniel is a storefront builder, a business operating system and a marketplace - in one product.
            You keep your brand, we handle the infrastructure.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-xl px-7 shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20"
            >
              <Link to="/vendor/onboarding">
                Create your store
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <span className="text-xs text-muted-foreground">Free to get started · No coding required</span>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Simple from the start
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                The vendor journey
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                From your first sign-in to your first sale, every step is designed to keep you moving.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="size-2 rounded-full bg-primary" />
              {journey.length} easy steps
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
            {journey.map(({ title, description, icon: Icon }, i) => (
              <article
                key={title}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-5 font-display text-7xl font-bold leading-none text-primary/[0.045] transition-colors group-hover:text-primary/[0.08]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="relative flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-[0.14em] text-primary uppercase">
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="relative mt-5 font-display text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
                Built for your business
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
                Everything included
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                The tools to run your storefront, serve customers and grow-all working together.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/15 bg-card px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="size-2 rounded-full bg-primary" />
              {modules.length} tools, one platform
            </span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
            {modules.map((m, i) => (
              <article
                key={m.t}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-5 -top-5 size-28 rounded-full bg-primary/[0.035] transition-transform duration-300 group-hover:scale-125"
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <m.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span className="pt-1 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/60 uppercase">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="relative mt-5 font-display text-base font-semibold tracking-tight">
                  {m.t}
                </h3>
                <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {m.d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-primary/20 bg-primary-soft p-8">
          <BadgeCheck className="size-7 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">Verification is earned, not bought</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium plans give you better tools - they never give you a badge. Serve at least five different
            customers successfully, keep your satisfaction score healthy and resolve complaints. That unlocks
            the option to apply. Our team then reviews your business before verification is granted.
          </p>
          <Button asChild variant="outline" className="mt-6 bg-card">
            {user?.role === "vendor" ? (
              <Link to="/vendor/verification">See verification progress</Link>
            ) : (
              <Link
                to="/auth"
                search={{
                  mode: "login",
                  role: "vendor",
                  returnTo: "/vendor/verification",
                }}
              >
                See verification progress
              </Link>
            )}
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
