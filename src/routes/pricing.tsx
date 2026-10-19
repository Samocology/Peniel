import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Vendra plans for growing businesses" },
      { name: "description", content: "Start free and only pay a small platform fee per transaction. Upgrade for promotions, advanced analytics and priority support." },
      { property: "og:title", content: "Vendra pricing" },
      { property: "og:description", content: "Free to start. Transparent platform fees. Better tools as you grow." },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "2.5% platform fee per transaction",
    features: ["Branded storefront (choose 1 of 28 designs, once)", "Unlimited products or services", "Orders & bookings", "Vendra Pay checkout", "Basic dashboard", "Verification eligibility"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₦9,500",
    note: "per month + 2% platform fee",
    features: ["Everything in Starter", "Switch storefront designs any time", "Promotions & promo codes", "Inventory alerts", "Customer segments", "Advanced analytics", "Priority support"],
    cta: "Choose Growth",
    highlight: true,
  },
  {
    name: "Business",
    price: "₦24,000",
    note: "per month + 1.5% platform fee",
    features: ["Everything in Growth", "Multiple locations", "Staff roles & permissions", "Bulk import & export", "Faster payout cycle", "Account manager"],
    cta: "Talk to sales",
    highlight: false,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6">
        <h1 className="font-display text-4xl font-bold">Simple pricing that grows with you</h1>
        <p className="mt-3 text-muted-foreground">
          Payments are collected centrally by Vendra Pay. You never configure a gateway or hold API keys.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pb-6 sm:px-6 lg:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={
              "rounded-3xl border p-6 " +
              (p.highlight ? "border-primary bg-primary text-primary-foreground shadow-lift" : "border-border bg-card")
            }
          >
            {p.highlight && (
              <span className="rounded-full bg-gold px-2.5 py-1 text-[11px] font-bold text-gold-foreground">
                Most popular
              </span>
            )}
            <p className="mt-3 font-display text-lg font-bold">{p.name}</p>
            <p className="mt-3 font-display text-3xl font-bold">{p.price}</p>
            <p className={"mt-1 text-xs " + (p.highlight ? "opacity-80" : "text-muted-foreground")}>{p.note}</p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <Check className={"size-4 shrink-0 " + (p.highlight ? "" : "text-primary")} /> {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={"mt-7 w-full " + (p.highlight ? "bg-gold text-gold-foreground hover:bg-gold/90" : "")}
              variant={p.highlight ? "default" : "outline"}
            >
              {p.name === "Starter" ? <Link to="/vendor/onboarding">{p.cta}</Link> : <Link to="/vendor/upgrade">{p.cta}</Link>}
            </Button>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex gap-3 rounded-2xl border border-border bg-surface p-5">
          <Info className="size-5 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            <b className="text-foreground">Plans never affect verification.</b> A paid plan gives you better
            tools; the verified badge is only granted after real customer service and a platform review.
          </p>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
