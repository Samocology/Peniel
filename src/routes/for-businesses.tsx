
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CreditCard,
  Eye,
  MapPin,
  PackagePlus,
  Palette,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Store,
  UserRoundPlus,
  Users,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useApp } from "@/lib/peniel-store";

export const Route = createFileRoute("/for-businesses")({
  head: () => ({
    meta: [
      { title: "For businesses - Sell online with Peniel" },
      {
        name: "description",
        content:
          "Get your own storefront, accept orders and bookings, take secure payments and run your business from one dashboard. Free to start.",
      },
      { property: "og:title", content: "Sell online with Peniel" },
      {
        property: "og:description",
        content:
          "Storefront, orders, payments, payouts and analytics - no developer needed.",
      },
    ],
  }),
  component: ForBusinesses,
});

const journey = [
  {
    title: "Create an account",
    description: "Get started with your email or phone number.",
    icon: UserRoundPlus,
  },
  {
    title: "Choose your business type",
    description: "Your workspace adapts to the way you operate.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Set up your business",
    description: "Add your location, opening hours and business details.",
    icon: MapPin,
  },
  {
    title: "Make it yours",
    description: "Add your logo, cover image and brand colours.",
    icon: Palette,
  },
  {
    title: "Add your offerings",
    description: "List products, services, variants and pricing.",
    icon: PackagePlus,
  },
  {
    title: "Preview and publish",
    description: "Review your storefront before making it live.",
    icon: Eye,
  },
  {
    title: "Share your storefront",
    description: "Give customers a direct link to your business.",
    icon: Share2,
  },
  {
    title: "Start growing",
    description: "Receive orders, bookings and payments.",
    icon: ShoppingBag,
  },
];

const modules = [
  {
    icon: Store,
    title: "Storefront builder",
    description:
      "Create a branded, mobile-friendly storefront without writing code.",
    tag: "Your online presence",
  },
  {
    icon: CreditCard,
    title: "Peniel Pay",
    description:
      "Accept payments through integrated payment infrastructure. No gateway keys to configure.",
    tag: "Payments",
  },
  {
    icon: BarChart3,
    title: "Business dashboard",
    description:
      "Keep track of revenue, orders, performance and popular products.",
    tag: "Insights",
  },
  {
    icon: Boxes,
    title: "Inventory management",
    description:
      "Manage stock levels, product variants and low-stock notifications.",
    tag: "Operations",
  },
  {
    icon: CalendarClock,
    title: "Bookings and scheduling",
    description:
      "Manage reservations, available slots, staff schedules and appointments.",
    tag: "Appointments",
  },
  {
    icon: Users,
    title: "Customer management",
    description:
      "Understand your customers with order histories and customer records.",
    tag: "Relationships",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-xl">
      <span className="text-[11px] font-semibold uppercase tracking-[0.17em] text-primary">
        {eyebrow}
      </span>

      <h2 className="mt-2.5 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-[30px]">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-[15px]">
        {description}
      </p>
    </div>
  );
}

function BusinessPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[480px]">
      <div className="absolute -inset-5 rounded-[32px] bg-primary/[0.06] blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xl shadow-black/[0.06]">
        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Store className="size-4" />
            </div>
            <div>
              <p className="text-xs font-semibold">Business overview</p>
              <p className="text-[10px] text-muted-foreground">
                Your Peniel workspace
              </p>
            </div>
          </div>

          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Online
          </span>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div>
            <p className="text-xs text-muted-foreground">
              Welcome to your business
            </p>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">
              Everything in one place.
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Orders
                </span>
                <ShoppingBag className="size-3.5 text-primary" />
              </div>
              <p className="mt-2 text-xl font-semibold">Manage</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                All your customer orders
              </p>
            </div>

            <div className="rounded-xl border border-border/70 bg-background p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  Payments
                </span>
                <CreditCard className="size-3.5 text-primary" />
              </div>
              <p className="mt-2 text-xl font-semibold">Integrated</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Secure payment processing
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold">Your storefront</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  A place customers can find you
                </p>
              </div>
              <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                <Store className="size-4" />
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
              <span className="truncate text-[11px] text-muted-foreground">
                peniel.ng/store/your-business
              </span>
              <ArrowUpRight className="ml-auto size-3.5 shrink-0 text-primary" />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-primary/[0.06] p-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Zap className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold">
                Your business, better organised.
              </p>
              <p className="mt-0.5 text-[10px] leading-4 text-muted-foreground">
                Manage your operations from one workspace.
              </p>
            </div>
            <Check className="ml-auto size-4 shrink-0 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ForBusinesses() {
  const { user } = useApp();

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/70">
          <div className="pointer-events-none absolute -right-40 -top-40 size-[450px] rounded-full bg-primary/[0.045] blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.95fr] lg:gap-14 lg:py-24">
            <div className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.045] px-3 py-1.5">
                <span className="size-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-primary">
                  The business platform
                </span>
              </div>

              <h1 className="mt-5 font-display text-[32px] font-semibold leading-[1.2] tracking-tight text-foreground sm:text-[40px] lg:text-[46px]">
                Everything your business needs.
                <span className="text-primary"> All in one place.</span>
              </h1>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base lg:mx-0">
                Build your online storefront, manage customers, receive
                payments and run your operations without juggling multiple
                platforms.
              </p>

              <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  asChild
                  className="group h-11 w-full rounded-xl px-6 text-sm shadow-md shadow-primary/15 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
                >
                  <Link to="/vendor/onboarding">
                    Create your store
                    <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <Link
                  to="/auth"
                  search={{
                    mode: "login",
                    role: "vendor",
                    returnTo: "/vendor",
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Already have a store?
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground lg:justify-start">
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  Free to get started
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  No coding required
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="size-3.5 text-primary" />
                  Your own brand
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[480px] lg:mx-0 lg:ml-auto">
              <BusinessPreview />

              <div className="absolute -bottom-5 -left-2 hidden items-center gap-2.5 rounded-xl border border-border/70 bg-card p-3 shadow-lg sm:flex lg:-left-8">
                <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Built for businesses</p>
                  <p className="text-[10px] text-muted-foreground">
                    One connected platform
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section className="border-b border-border/70 bg-surface/40">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="Getting started"
                title="From setup to your first sale."
                description="Getting your business online shouldn't be complicated. Follow a simple process and start serving customers."
              />

              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                {journey.length} simple steps
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
              {journey.map(({ title, description, icon: Icon }, index) => (
                <article
                  key={title}
                  className="group relative rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                      STEP {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="grid size-9 place-items-center rounded-lg bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-[17px]" strokeWidth={1.8} />
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold tracking-tight">
                    {title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Platform modules */}
        <section className="border-b border-border/70">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <SectionHeading
                eyebrow="One connected workspace"
                title="The tools to run your business."
                description="Everything works together, so you can spend less time managing different tools and more time growing your business."
              />

              <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-[11px] font-medium text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                {modules.length} core tools
              </span>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
              {modules.map(({ icon: Icon, title, description, tag }) => (
                <article
                  key={title}
                  className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/[0.08] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-[19px]" strokeWidth={1.8} />
                    </span>

                    <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-medium text-muted-foreground">
                      {tag}
                    </span>
                  </div>

                  <h3 className="mt-5 text-sm font-semibold tracking-tight">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {description}
                  </p>

                  <div className="mt-4 flex items-center gap-1.5 text-[11px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Part of your workspace
                    <ArrowUpRight className="size-3" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Verification */}
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:py-20">
          <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-primary/[0.045] p-5 sm:p-8 lg:p-10">
            <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border border-primary/[0.07]" />
            <div className="pointer-events-none absolute -right-10 -top-14 size-44 rounded-full border border-primary/[0.07]" />

            <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <BadgeCheck className="size-5" />
                </div>

                <span className="mt-5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Trust and credibility
                </span>

                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                  Verification is earned, not bought.
                </h2>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Premium plans give you better tools, but they never buy you
                  a verification badge. Successfully serve at least five
                  different customers, maintain a healthy satisfaction score
                  and resolve complaints. Once eligible, you can apply for
                  verification. Our team reviews your business before
                  approval.
                </p>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
                  {[
                    "Five different customers",
                    "Healthy satisfaction score",
                    "Resolved complaints",
                  ].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground"
                    >
                      <Check className="size-3.5 text-primary" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full rounded-xl border-primary/20 bg-card px-5 text-xs font-semibold hover:bg-primary hover:text-primary-foreground sm:w-auto"
                >
                  {user?.role === "vendor" ? (
                    <Link to="/vendor/verification">
                      See verification progress
                      <ArrowRight className="ml-2 size-3.5" />
                    </Link>
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
                      <ArrowRight className="ml-2 size-3.5" />
                    </Link>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/70 bg-surface/40">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 sm:py-16">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              Your business starts here
            </span>

            <h2 className="mx-auto mt-3 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              Ready to bring your business online?
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
              Create your storefront, connect with customers and manage your
              business with Peniel.
            </p>

            <Button
              asChild
              className="group mt-7 h-11 rounded-xl px-6 text-sm shadow-md shadow-primary/15"
            >
              <Link to="/vendor/onboarding">
                Get started for free
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <p className="mt-3 text-[10px] text-muted-foreground">
              No coding required. Your business, your brand.
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
