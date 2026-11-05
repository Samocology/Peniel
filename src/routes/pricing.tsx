import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Info,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing - Peniel plans for growing businesses" },
      {
        name: "description",
        content:
          "Start free and only pay a small platform fee per transaction. Upgrade for promotions, advanced analytics and priority support.",
      },
      { property: "og:title", content: "Peniel pricing" },
      {
        property: "og:description",
        content: "Free to start. Transparent platform fees. Better tools as you grow.",
      },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Starter",
    eyebrow: "For getting started",
    price: "Free",
    note: "2.5% platform fee per transaction",
    description: "Everything you need to launch your online storefront and start serving customers.",
    features: [
      "Branded storefront (choose 1 of 28 designs, once)",
      "Unlimited products or services",
      "Orders & bookings",
      "Peniel Pay checkout",
      "Basic dashboard",
      "Verification eligibility",
    ],
    cta: "Start free",
    highlight: false,
    icon: Building2,
  },
  {
    name: "Growth",
    eyebrow: "For growing businesses",
    price: "₦9,500",
    period: "/ month",
    note: "+ 2% platform fee per transaction",
    description: "More ways to promote your business, understand customers and grow consistently.",
    features: [
      "Everything in Starter",
      "Switch storefront designs any time",
      "Promotions & promo codes",
      "Inventory alerts",
      "Customer segments",
      "Advanced analytics",
      "Priority support",
    ],
    cta: "Choose Growth",
    highlight: true,
    icon: Zap,
  },
  {
    name: "Business",
    eyebrow: "For established teams",
    price: "₦24,000",
    period: "/ month",
    note: "+ 1.5% platform fee per transaction",
    description: "Advanced operations and support for businesses managing more people and locations.",
    features: [
      "Everything in Growth",
      "Multiple locations",
      "Staff roles & permissions",
      "Bulk import & export",
      "Faster payout cycle",
      "Account manager",
    ],
    cta: "Talk to sales",
    highlight: false,
    icon: Building2,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SiteHeader />

      <main>
        {/* INTRO */}
        <section className="relative isolate overflow-hidden border-b border-border bg-surface">
          <div
            aria-hidden="true"
            className="surface-grid pointer-events-none absolute inset-0 opacity-50"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 left-1/2 -z-10 size-[22rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:size-[30rem]"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-10 text-center sm:px-6 sm:py-14 lg:py-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
              <Sparkles className="size-3.5" />
              Straightforward plans. No surprises.
            </span>
            <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-[1.12] font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              The right tools for
              <span className="block text-primary">every stage of growth.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              Start with the essentials, then unlock more powerful tools as your business grows.
              Peniel keeps your storefront, orders and payments in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-primary" />
                Free to get started
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-primary" />
                No gateway setup
              </span>
              <span className="inline-flex items-center gap-2">
                <Check className="size-4 text-primary" />
                Clear transaction fees
              </span>
            </div>
          </div>
        </section>

        {/* PLANS */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:py-14">
          <div className="mx-auto mb-6 max-w-2xl text-left sm:mb-8 sm:text-center">
            <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase sm:text-xs sm:tracking-[0.18em]">
              Choose your plan
            </p>
            <h2 className="mt-2 font-display text-[1.35rem] leading-tight font-bold tracking-tight sm:text-2xl">
              Simple pricing that scales with you
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-muted-foreground sm:mx-auto sm:text-sm sm:leading-6">
              Every plan gives you the tools to run your business. Choose the level of support and
              control that fits your next step.
            </p>
          </div>

          <div className="grid items-stretch gap-4 sm:gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const PlanIcon = plan.icon;

              return (
                <article
                  key={plan.name}
                  className={
                    "relative flex min-w-0 flex-col overflow-hidden rounded-2xl border p-4 shadow-card transition-all duration-200 sm:p-5 lg:p-6 " +
                    (plan.highlight
                      ? "border-primary bg-primary text-primary-foreground shadow-lift ring-1 ring-primary/20 lg:-my-2 lg:py-7"
                      : "border-border bg-card hover:-translate-y-1 hover:border-primary/25 hover:shadow-lift")
                  }
                >
                  {plan.highlight && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
                  )}

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p
                          className={
                            "text-[10px] font-bold tracking-[0.12em] uppercase sm:text-[11px] sm:tracking-[0.16em] " +
                            (plan.highlight ? "text-primary-foreground/65" : "text-muted-foreground")
                          }
                        >
                          {plan.eyebrow}
                        </p>
                        {plan.highlight && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold text-gold-foreground sm:text-[10px]">
                            <Sparkles className="size-2.5" />
                            Most popular
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 font-display text-lg font-bold sm:text-xl">
                        {plan.name}
                      </h3>
                    </div>
                    <span
                      className={
                        "grid size-10 shrink-0 place-items-center rounded-xl " +
                        (plan.highlight
                          ? "bg-primary-foreground/10 text-gold"
                          : "bg-primary-soft text-primary")
                      }
                    >
                      <PlanIcon className="size-[18px]" />
                    </span>
                  </div>

                  <div className="mt-4 border-b border-current/10 pb-4 sm:mt-5">
                    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                      <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span
                          className={
                            "text-sm " +
                            (plan.highlight
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground")
                          }
                        >
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p
                      className={
                        "mt-2 text-xs font-semibold sm:text-sm " +
                        (plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground")
                      }
                    >
                      {plan.note}
                    </p>
                    <p
                      className={
                        "mt-2.5 min-h-0 text-[13px] leading-5 sm:text-sm " +
                        (plan.highlight
                          ? "text-primary-foreground/75"
                          : "text-muted-foreground")
                      }
                    >
                      {plan.description}
                    </p>
                  </div>

                  <div className="mt-4 flex-1">
                    <p
                      className={
                        "mb-3 text-xs font-bold tracking-[0.12em] uppercase " +
                        (plan.highlight
                          ? "text-primary-foreground/65"
                          : "text-muted-foreground")
                      }
                    >
                      What's included
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex min-w-0 items-start gap-2.5 text-sm">
                          <span
                            className={
                              "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full " +
                              (plan.highlight
                                ? "bg-primary-foreground/15 text-gold"
                                : "bg-primary-soft text-primary")
                            }
                          >
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          <span className="min-w-0 leading-5">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    asChild
                    size="default"
                    className={
                      "mt-6 h-11 w-full gap-2 rounded-xl text-sm font-semibold " +
                      (plan.highlight
                        ? "bg-gold text-gold-foreground shadow-sm hover:bg-gold/90"
                        : "")
                    }
                    variant={plan.highlight ? "default" : "outline"}
                  >
                    {plan.name === "Starter" ? (
                      <Link to="/vendor/onboarding">
                        {plan.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    ) : (
                      <Link to="/vendor/upgrade">
                        {plan.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </Button>
                </article>
              );
            })}
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-border bg-surface p-4 sm:mt-7">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
              <Info className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Understand your platform fees
              </p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                The monthly plan price is separate from the platform fee charged per transaction.
                Your fee rate depends on the plan you choose.
              </p>
            </div>
          </div>
        </section>

        {/* TRUST NOTE */}
        <section className="border-y border-border bg-surface">
          <div className="mx-auto grid max-w-5xl gap-4 px-4 py-7 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-5 sm:px-6 sm:py-8">
            <span className="mx-auto grid size-11 place-items-center rounded-xl border border-primary/15 bg-card text-primary shadow-sm sm:mx-0">
              <ShieldCheck className="size-5" />
            </span>
            <div className="text-center sm:text-left">
              <h2 className="font-display text-base font-bold sm:text-lg">
                Verification is earned, never purchased.
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Plans never affect verification. A paid plan gives you better tools; the verified
                badge is only granted after real customer service and a platform review.
              </p>
            </div>
          </div>
        </section>

        {/* PAYMENT NOTE */}
        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                <BadgeCheck className="size-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-base font-bold sm:text-lg">
                  Payments, without the technical setup
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Payments are collected centrally by Peniel Pay. You never need to configure a
                  payment gateway or manage API keys.
                </p>
              </div>
              <Button asChild variant="outline" className="h-10 w-full shrink-0 gap-2 sm:w-auto">
                <Link to="/for-businesses">
                  Explore Peniel
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
