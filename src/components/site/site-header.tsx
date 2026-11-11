import { Link, useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Menu,
  Receipt,
  Search,
  ShoppingCart,
  MapPin,
  LayoutGrid,
  MessageCircle,
  User,
  LogOut,
} from "lucide-react";
import { useApp, app as storeApi } from "@/lib/peniel-store";
import { MARKETPLACE_LOCATIONS, normalizeLocationLabel } from "@/lib/location";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "./logo";

const nav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/for-businesses", label: "For Businesses" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
];

const customerNav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/account", label: "Account" },
  { to: "/orders", label: "Orders" },
];

export function SiteHeader({ withSearch = false }: { withSearch?: boolean }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const appState = useApp();
  const navigate = useNavigate();

  const user = appState.user;
  const selectedLocation = normalizeLocationLabel(appState.customer.city ?? "Lagos State");

  const saveLocation = (city: string) => {
    storeApi.saveCustomer({
      ...appState.customer,
      city,
    });
  };

  const cartCount = appState.cart.reduce((total, line) => total + line.qty, 0);
  const userEmail = user?.email;
  const unreadChats = (appState.threads ?? []).filter(
    (thread) => thread.customer === userEmail && thread.readC < thread.messages.length,
  ).length;
  const [accountOpen, setAccountOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await storeApi.signOut();
    } catch {
      // ignore logout errors; clear local state regardless
    }
    setAccountOpen(false);
    void navigate({ to: "/" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountOpen &&
        !(event.target as HTMLElement | null)?.closest(
          "[aria-label='Account menu'], [aria-label^='Account menu']",
        )
      ) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground lg:flex">
          {!user ? (
            <>
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
            </>
          ) : user.role === "customer" ? (
            <>
              {customerNav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  activeProps={{ className: "text-primary font-semibold" }}
                  className="transition-colors hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              {user.role === "vendor" && (
                <Button asChild size="sm">
                  <Link to="/vendor">Business dashboard</Link>
                </Button>
              )}

              <Button asChild size="sm" className="relative" aria-label={`Cart (${cartCount})`}>
                <Link to="/cart">
                  <ShoppingCart className="size-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid size-3 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </Button>

              <Button asChild size="sm" className="relative" aria-label={`Chats (${unreadChats})`}>
                <Link to="/messages">
                  <MessageCircle className="size-4" />
                  {unreadChats > 0 && (
                    <span className="absolute -top-1 -right-1 grid size-3 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                      {unreadChats}
                    </span>
                  )}
                </Link>
              </Button>

              <div className="relative group">
                <Button
                  size="sm"
                  onClick={() => setAccountOpen((open) => !open)}
                  aria-label="Account menu"
                  className="flex items-center gap-2"
                >
                  <User className="size-4" />
                  <span className="hidden sm:inline ml-1.5 text-xs font-medium">
                    {user?.name?.split(" ")[0] ?? "Account"}
                  </span>
                </Button>
                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card shadow-xl p-1 z-50 animate-in fade-in zoom-in duration-100">
                    <Link
                      to="/account"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      <User className="size-4" /> Account
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      <Receipt className="size-4" /> Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
                    >
                      <LogOut className="size-4" /> Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <Menu className="size-5" />
        </button>
      </div>

      {withSearch && (
        <form
          role="search"
          aria-label="Search the marketplace"
          onSubmit={(event) => {
            event.preventDefault();
            void navigate({
              to: "/search",
              search: {
                q: searchQuery.trim() || undefined,
                location: selectedLocation,
              },
            });
          }}
          className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] gap-2 px-3 pb-3 sm:flex sm:px-6"
        >
          <div className="relative col-span-2 min-w-0 sm:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 text-primary" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search businesses, products, and services"
              className="h-12 rounded-xl border-border/70 bg-card pl-11 pr-3 text-sm shadow-sm placeholder:text-muted-foreground/75 focus-visible:border-primary/40 focus-visible:ring-primary/20 sm:h-12"
            />
          </div>

          <label className="flex h-12 min-w-0 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 text-sm text-muted-foreground shadow-sm sm:w-auto sm:min-w-[180px]">
            <MapPin className="size-4 shrink-0 text-primary" />
            <select
              aria-label="Select marketplace location"
              value={selectedLocation}
              onChange={(event) => saveLocation(event.target.value)}
              className="w-full min-w-0 truncate bg-transparent pr-1 text-sm font-medium text-foreground outline-none"
            >
              {MARKETPLACE_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <Button
            type="submit"
            className="h-12 gap-2 rounded-xl px-4 text-sm font-semibold shadow-sm sm:px-6"
          >
            <Search className="size-4" />
            <span>Search</span>
          </Button>
        </form>
      )}

      {open && (
        <div className="border-t border-border bg-card px-4 py-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {!user && (
              <>
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {n.label}
                  </Link>
                ))}
              </>
            )}

            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Search className="size-4" />
              Search
            </Link>

            <Link
              to="/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <MessageCircle className="size-4" />
              Chats
            </Link>

            <Link
              to="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Receipt className="size-4" />
              My orders
            </Link>

            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <User className="size-4" />
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
                {user.role === "vendor" && (
                  <Button asChild className="mt-2">
                    <Link to="/vendor">Business dashboard</Link>
                  </Button>
                )}
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Sign in / Sign up
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function CustomerBar() {
  const appState = useApp();
  const cart = appState.cart.reduce((total, line) => total + line.qty, 0);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:px-6">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <Logo />
        </Link>

        <div className="hidden flex-1 items-center gap-3 sm:flex">
          <label className="flex min-w-[170px] items-center gap-2 rounded-xl border border-border bg-card/80 px-2.5 py-2 text-sm text-muted-foreground shadow-sm">
            <MapPin className="size-4" />

            <select
              aria-label="Select marketplace state"
              value={normalizeLocationLabel(appState.customer.city ?? "Lagos State")}
              onChange={(event) =>
                storeApi.saveCustomer({
                  ...appState.customer,
                  city: event.target.value,
                })
              }
              className="w-full bg-transparent text-sm font-medium text-foreground outline-none"
            >
              {MARKETPLACE_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <div className="relative max-w-xl flex-1">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search businesses, products, services…" className="h-10 pl-9" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/marketplace">
              <LayoutGrid className="size-4" />
              <span className="hidden md:inline">Categories</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/account">
              <Heart className="size-4" />
              <span className="hidden md:inline">Favorites</span>
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
