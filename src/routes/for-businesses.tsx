import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, BarChart3, Boxes, CalendarClock, CreditCard, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/for-businesses")({
  head: () => ({
    meta: [
      { title: "For businesses — Sell online with Vendra" },
      { name: "description", content: "Get your own storefront, accept orders and bookings, take secure payments and run your business from one dashboard. Free to start." },
      { property: "og:title", content: "Sell online with Vendra" },
      { property: "og:description", content: "Storefront, orders, payments, payouts and analytics — no developer needed." },
    ],
  }),
  component: ForBusinesses,
});

const journey = [
  ["Create account", "Email or phone, 30 seconds."],
  ["Choose business type", "Your dashboard adapts to how you operate."],
  ["Set up your business", "Location, hours, delivery or booking rules."],
  ["Add branding", "Logo, cover image, brand colour."],
  ["Add products or services", "Variants, modifiers, durations, staff."],
  ["Preview & publish", "See your store, then go live."],
  ["Share your link", "vendra.ng/store/your-business."],
  ["Start selling", "Orders, bookings and payments come in."],
];

const modules = [
  { icon: Store, t: "Storefront builder", d: "A branded, mobile-first store you don't have to code." },
  { icon: CreditCard, t: "Vendra Pay", d: "Central payment infrastructure. No gateway keys to configure." },
  { icon: BarChart3, t: "Business dashboard", d: "Revenue, orders, conversion and popular items at a glance." },
  { icon: Boxes, t: "Inventory", d: "Stock counts, variants and low-stock alerts." },
  { icon: CalendarClock, t: "Bookings", d: "Slots, staff schedules and reservations." },
  { icon: Users, t: "Customers", d: "Repeat customers, order history and notes." },
];

function ForBusinesses() {
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
            Vendra is a storefront builder, a business operating system and a marketplace — in one product.
            You keep your brand, we handle the infrastructure.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/vendor/onboarding">Create your store <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/vendor">See the dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold">The vendor journey</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {journey.map(([t, d], i) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-5">
              <span className="text-xs font-bold text-primary">STEP {i + 1}</span>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold">Everything included</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div key={m.t} className="rounded-2xl border border-border bg-card p-5">
                <m.icon className="size-5 text-primary" />
                <p className="mt-3 font-semibold">{m.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-primary/20 bg-primary-soft p-8">
          <BadgeCheck className="size-7 text-primary" />
          <h2 className="mt-4 font-display text-2xl font-bold">Verification is earned, not bought</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Premium plans give you better tools — they never give you a badge. Serve at least five different
            customers successfully, keep your satisfaction score healthy and resolve complaints. That unlocks
            the option to apply. Our team then reviews your business before verification is granted.
          </p>
          <Button asChild variant="outline" className="mt-6 bg-card">
            <Link to="/vendor/verification">See verification progress</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
