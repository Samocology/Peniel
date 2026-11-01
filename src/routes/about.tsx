import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Globe2, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Peniel - commerce infrastructure for African businesses" },
      { name: "description", content: "Peniel builds the storefront, payment and trust infrastructure that connects African businesses to their customers. Built in Lagos." },
      { property: "og:title", content: "About Peniel" },
      { property: "og:description", content: "Commerce infrastructure for African businesses, built in Lagos." },
    ],
  }),
  component: About,
});

const values = [
  { icon: ShieldCheck, t: "Trust is earned", d: "Badges follow real service, never subscriptions." },
  { icon: Building2, t: "Business first", d: "Vendors own their brand; we stay in the background." },
  { icon: HeartHandshake, t: "Fair by design", d: "Transparent fees, clear payouts, honest disputes." },
  { icon: Globe2, t: "Africa, then the world", d: "Built for African realities, designed to scale." },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="relative isolate overflow-hidden border-b border-border bg-surface/60">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-44 -z-10 size-[34rem] rounded-full bg-primary/[0.07] blur-3xl"
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase shadow-sm">
              <span className="size-1.5 rounded-full bg-primary" />
              Our purpose
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-4xl leading-[1.12] font-bold tracking-tight sm:text-5xl lg:text-[3.4rem]">
              We build the infrastructure between businesses and their customers.
            </h1>
          </div>
          <div className="space-y-5 lg:border-l lg:border-border lg:pl-10">
            <p className="text-base leading-7 text-muted-foreground">
              Thousands of African businesses sell through WhatsApp screenshots, DMs and voice notes. They don't
              need another marketplace to be lost inside-they need their own storefront, a way to be paid
              safely, and a system that keeps track of everything. That's Peniel.
            </p>
            <p className="text-base leading-7 text-muted-foreground">
              A vendor should feel: <i className="font-medium text-foreground">this is my online business</i>. A
              customer should feel: <i className="font-medium text-foreground">I can easily find and buy from
              businesses here</i>. And the platform quietly provides the rails connecting both sides-storefronts,
              payments, payouts, verification and growth tools.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
              What guides us
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built on the right principles
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            The platform should make commerce more trustworthy, more independent and more accessible.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-4">
          {values.map((v, i) => (
            <article
              key={v.t}
              className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:p-6"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-5 -top-5 size-28 rounded-full bg-primary/[0.035] transition-transform duration-300 group-hover:scale-125"
              />
              <div className="relative flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <v.icon className="size-5" strokeWidth={1.8} />
                </span>
                <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/60">
                  0{i + 1}
                </span>
              </div>
              <h3 className="relative mt-5 font-display text-base font-semibold tracking-tight">{v.t}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-muted-foreground">{v.d}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-primary/15 bg-primary-soft/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="font-display text-lg font-semibold tracking-tight">
            Ready to build your business online?
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="group rounded-xl">
              <Link to="/vendor/onboarding">
                Create your store <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl bg-card">
              <Link to="/marketplace">Explore the marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
