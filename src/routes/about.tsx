import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, Globe2, HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Vendra — commerce infrastructure for African businesses" },
      { name: "description", content: "Vendra builds the storefront, payment and trust infrastructure that connects African businesses to their customers. Built in Lagos." },
      { property: "og:title", content: "About Vendra" },
      { property: "og:description", content: "Commerce infrastructure for African businesses, built in Lagos." },
    ],
  }),
  component: About,
});

const values = [
  { icon: ShieldCheck, t: "Trust is earned", d: "Badges follow real service, never subscriptions." },
  { icon: Building2, t: "Business first", d: "Vendors own their brand; we stay in the background." },
  { icon: HeartHandshake, t: "Fair by design", d: "Transparent fees, clear payouts, honest disputes." },
  { icon: Globe2, t: "Africa, then the world", d: "Built for Lagos realities, designed to scale." },
];

function About() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-4xl font-bold">
          We build the infrastructure between businesses and their customers.
        </h1>
        <p className="mt-5 text-muted-foreground">
          Thousands of African businesses sell through WhatsApp screenshots, DMs and voice notes. They don't
          need another marketplace to be lost inside — they need their own storefront, a way to be paid
          safely, and a system that keeps track of everything. That's Vendra.
        </p>
        <p className="mt-4 text-muted-foreground">
          A vendor should feel: <i>this is my online business</i>. A customer should feel: <i>I can easily
          find and buy from businesses here</i>. And the platform quietly provides the rails connecting both
          sides — storefronts, payments, payouts, verification and growth tools.
        </p>
      </section>

      <section className="border-y border-border bg-surface py-14">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.t} className="rounded-2xl border border-border bg-card p-5">
              <v.icon className="size-5 text-primary" />
              <p className="mt-3 font-semibold">{v.t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold">Product roadmap</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ["MVP — live now", ["Vendor registration & business type", "Storefronts + products/services", "Orders & bookings", "Vendra Pay + payouts", "Vendor dashboard & basic analytics", "Reviews, verification, admin console"]],
            ["Phase 2", ["Promotions engine & loyalty points", "Advanced inventory & suppliers", "Delivery partner network", "Customer segments & campaigns", "Multi-location & staff roles"]],
            ["Future", ["AI product & menu assistants", "Voice ordering", "Custom domains", "Marketing automation", "New countries and currencies"]],
          ].map(([title, items]) => (
            <div key={title as string} className="rounded-2xl border border-border bg-card p-5">
              <p className="font-semibold">{title as string}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {(items as string[]).map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild><Link to="/vendor/onboarding">Create your store</Link></Button>
          <Button asChild variant="outline"><Link to="/marketplace">Explore the marketplace</Link></Button>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
