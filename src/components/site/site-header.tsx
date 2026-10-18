import { Link } from "@tanstack/react-router";
import { Heart, Menu, Receipt, Search, ShoppingCart, MapPin, LayoutGrid } from "lucide-react";
import { useApp } from "@/lib/vendra-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";

const nav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/for-businesses", label: "For Businesses" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

export function SiteHeader({ withSearch = false }: { withSearch?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeProps={{ className: "text-primary font-semibold" }}
              className="transition-colors hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Button asChild variant="ghost" size="sm">
            <Link to="/account">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/vendor/onboarding">Start selling</Link>
          </Button>
        </div>

        <button
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {withSearch && (
        <div className="mx-auto hidden max-w-7xl gap-3 px-4 pb-3 sm:flex sm:px-6">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search businesses, products, services…" className="h-11 pl-9" />
          </div>
          <Button variant="outline" className="h-11 gap-2">
            <MapPin className="size-4" /> Lagos, NG
          </Button>
          <Button className="h-11 px-6">Search</Button>
        </div>
      )}

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">
                {n.label}
              </Link>
            ))}
            <Link to="/search" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">
              <Search className="size-4" /> Search
            </Link>
            <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted">
              <Receipt className="size-4" /> My orders
            </Link>
            <Button asChild className="mt-2">
              <Link to="/vendor/onboarding">Start selling</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function CustomerBar() {
  const cart = useApp().cart.reduce((a, l) => a + l.qty, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Logo />
        </Link>
        <div className="hidden flex-1 items-center gap-3 sm:flex">
          <Button variant="outline" size="sm" className="gap-2">
            <MapPin className="size-4" /> Lagos, NG
          </Button>
          <div className="relative max-w-xl flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search businesses, products, services…" className="h-10 pl-9" />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/marketplace">
              <LayoutGrid className="size-4" /> <span className="hidden md:inline">Categories</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/account">
              <Heart className="size-4" /> <span className="hidden md:inline">Favorites</span>
            </Link>
          </Button>
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link to="/cart" aria-label="Cart">
              <ShoppingCart className="size-4" />
              <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cart}
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
