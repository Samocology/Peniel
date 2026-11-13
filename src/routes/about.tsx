import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Globe2, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Peniel - commerce infrastructure for African businesses" },
      {
        name: "description",
        content:
          "Peniel builds the storefront, payment and trust infrastructure that connects African businesses to their customers. Built in Lagos.",
      },
      { property: "og:title", content: "About Peniel" },
      {
        property: "og:description",
        content: "Commerce infrastructure for African businesses, built in Lagos.",
      },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Trust is earned",
    description: "Verification follows real service and platform review, never a subscription.",
  },
  {
    icon: Building2,
    title: "Business first",
    description: "Every vendor gets a space for their brand, products and customers.",
  },
  {
    icon: HeartHandshake,
    title: "Fair by design",
    description: "Clear fees, transparent processes and a fair approach to resolving issues.",
  },
  {
    icon: Globe2,
    title: "Africa, then the world",
    description: "Designed around the realities of African commerce, with room to grow.",
  },
];

function About() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />

      <main>
        {/* Intro */}
        <section className="relative isolate overflow-hidden border-b border-border/70 bg-surface/50">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-40 -z-10 size-[26rem] rounded-full bg-primary/[0.07] blur-3xl sm:size-[32rem]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-40 -z-10 size-[22rem] rounded-full bg-primary/[0.04] blur-3xl"
          />

          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14 lg:py-20">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-primary shadow-sm">
                <span className="size-1.5 rounded-full bg-primary" />
                About Peniel
              </span>

              <h1 className="mt-5 max-w-[38rem] font-display text-[1.85rem] font-semibold leading-[1.18] tracking-tight sm:text-3xl lg:text-[2.65rem]">
                The infrastructure that helps businesses grow with confidence.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">
                We are building a better way for African businesses to show up, get paid and build
                lasting relationships with their customers.
              </p>
            </div>

            <div className="min-w-0 space-y-4 rounded-2xl border border-border/70 bg-card/75 p-5 shadow-sm sm:p-6 lg:border-l-2 lg:border-l-primary/30 lg:rounded-l-none lg:border-y-0 lg:border-r-0 lg:bg-transparent lg:py-2 lg:pl-8 lg:pr-0 lg:shadow-none">
              <p className="text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">
                Thousands of African businesses still manage sales through messages, screenshots and
                scattered conversations. They need more than another marketplace. They need a
                professional storefront, a reliable way to receive payments and simple tools to
                manage their operations.
              </p>
              <p className="text-sm leading-6 text-muted-foreground sm:text-[15px] sm:leading-7">
                That is where Peniel comes in. We provide the tools that help vendors run their
                online business while making it easier for customers to discover and buy from them.
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/70 pt-4 text-xs font-medium text-foreground/80">
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Independent storefronts
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Payments and trust tools
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-18">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
                What guides us
              </span>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
                The principles behind Peniel
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              We believe commerce works better when businesses have the tools to operate
              independently and customers have reasons to trust.
            </p>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
            {values.map((value, index) => (
              <article
                key={value.title}
                className="group relative min-w-0 overflow-hidden rounded-xl border border-border/80 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5 sm:p-5"
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-primary/[0.035] transition-transform duration-300 group-hover:scale-125"
                />
                <div className="relative flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <value.icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/60">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="relative mt-4 text-sm font-semibold tracking-tight">
                  {value.title}
                </h3>
                <p className="relative mt-1.5 text-[13px] leading-5 text-muted-foreground">
                  {value.description}
                </p>
              </article>
            ))}
          </div>

          {/* Closing CTA */}
          <div className="mt-8 flex flex-col gap-4 rounded-xl border border-primary/15 bg-primary-soft/40 p-4 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold tracking-tight sm:text-base">
                Ready to take your business online?
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                Set up your storefront and start reaching more customers.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button asChild size="sm" className="group w-full rounded-lg sm:w-auto">
                <Link to="/vendor/onboarding">
                  Create your store
                  <ArrowRight className="ml-1.5 size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="w-full rounded-lg bg-card sm:w-auto"
              >
                <Link to="/marketplace">Explore marketplace</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
