import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, ShieldCheck, Twitter } from "lucide-react";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Marketplace", to: "/marketplace" },
      { label: "For Businesses", to: "/for-businesses" },
      { label: "Pricing", to: "/pricing" },
      { label: "About us", to: "/about" },
    ],
  },
  {
    title: "Business types",
    links: [
      { label: "Restaurants", to: "/category/restaurants" },
      { label: "Fashion", to: "/category/fashion" },
      { label: "Salons", to: "/category/salons" },
      { label: "Fresh Food", to: "/category/fresh-food" },
      { label: "Hotels", to: "/category/hotels" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Centre", to: "/about" },
      { label: "Contact us", to: "/about" },
      { label: "Community", to: "/about" },
      { label: "Status", to: "/about" },
    ],
  },
  {
    title: "Sell on Vendra",
    links: [
      { label: "Start selling", to: "/vendor/onboarding" },
      { label: "Plans & pricing", to: "/pricing" },
      { label: "My orders", to: "/orders" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <span className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-sidebar-primary font-display text-sm font-bold text-sidebar-primary-foreground">
                V
              </span>
              <span className="font-display text-lg font-bold">Vendra</span>
            </span>
            <p className="mt-4 max-w-xs text-sm text-sidebar-foreground/70">
              Your business. Your storefront. Your customers. One platform — built in Lagos for African
              commerce.
            </p>
            <div className="mt-5 flex gap-2">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <span
                  key={i}
                  className="grid size-9 place-items-center rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <Icon className="size-4" />
                </span>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold tracking-[0.14em] text-sidebar-foreground/50 uppercase">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sidebar-foreground/80 transition-colors hover:text-sidebar-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-sidebar-border pt-6 text-xs text-sidebar-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Vendra Technologies. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-sidebar-primary" /> Payments secured by Vendra Pay
          </p>
        </div>
      </div>
    </footer>
  );
}
