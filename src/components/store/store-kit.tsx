import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  ChevronLeft,
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { app, useApp } from "@/lib/peniel-store";
import type { CSSProperties, ReactNode } from "react";
import { naira, type Product, type Vendor } from "@/lib/data";
import restaurantItem1 from "@/assets/items/restaurant-1.jpg";
import restaurantItem2 from "@/assets/items/restaurant-2.jpg";
import freshFoodItem1 from "@/assets/items/fresh-food-1.jpg";
import freshFoodItem2 from "@/assets/items/fresh-food-2.jpg";
import beautyItem1 from "@/assets/items/beauty-1.jpg";
import beautyItem2 from "@/assets/items/beauty-2.jpg";
import fashionItem1 from "@/assets/items/fashion-1.jpg";
import fashionItem2 from "@/assets/items/fashion-2.jpg";
import bakeryItem1 from "@/assets/items/bakery-1.jpg";
import bakeryItem2 from "@/assets/items/bakery-2.jpg";
import hotelItem from "@/assets/items/hotel-1.jpg";
import coverTech from "@/assets/cover-tech.jpg";



/* ───────────────────────── Store Top Bar ───────────────────────── */

export function StoreTopBar({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const s = useApp();
  const saved = s.favorites.includes(vendor.slug);
  const count = s.cart.reduce((a, l) => a + l.qty, 0);

  const share = async () => {
    const url = window.location.origin + "/store/" + vendor.slug;

    try {
      if (navigator.share) {
        await navigator.share({
          title: vendor.name,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Store link copied");
      }
    } catch {
      // Sharing was cancelled or unavailable.
    }
  };

  const navItems = [
    { label: "Shop", target: "catalogue", active: true },
    { label: "Reviews", target: "reviews", active: false },
    { label: "About", target: "about", active: false },
    { label: "Visit", target: "visit", active: false },
  ];

  const handleJump = (target: string) => {
    const el = document.getElementById(target);

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    window.location.hash = `#${target}`;
  };

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: `${t.bg}f5`,
        borderColor: t.line,
        color: t.ink,
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-3 sm:gap-4 sm:px-6">
        {/* Marketplace back link */}
        <Link
          to="/marketplace"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] transition-opacity hover:opacity-65 sm:text-[11px]"
          style={{
            borderColor: t.line,
            background: t.soft,
          }}
        >
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Market</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex"
          aria-label="Store navigation"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleJump(item.target)}
              className="rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all duration-200 hover:opacity-100"
              style={
                item.active
                  ? {
                      background: t.accent,
                      color: t.accentInk,
                    }
                  : {
                      color: t.ink,
                      opacity: 0.55,
                    }
              }
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            to="/messages"
            search={{ v: vendor.slug }}
            aria-label="Chat with store"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 text-[10px] font-medium transition-all hover:-translate-y-0.5 sm:px-3 sm:text-[11px]"
            style={{
              borderColor: t.line,
              background: t.soft,
            }}
          >
            <MessageCircle className="size-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Chat</span>
          </Link>

          <button
            type="button"
            onClick={share}
            aria-label="Share store"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 text-[10px] font-medium transition-all hover:-translate-y-0.5 sm:px-3 sm:text-[11px]"
            style={{
              borderColor: t.line,
              background: t.soft,
            }}
          >
            <Share2 className="size-3.5" strokeWidth={1.8} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            type="button"
            onClick={() => {
              app.toggleFavorite(vendor.slug);

              toast.success(saved ? "Removed from favourites" : "Saved to favourites");
            }}
            aria-label={saved ? "Remove from favourites" : "Save store"}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 text-[10px] font-medium transition-all hover:-translate-y-0.5 sm:px-3 sm:text-[11px]"
            style={{
              borderColor: saved ? t.accent : t.line,
              background: saved ? `${t.accent}18` : t.soft,
              color: saved ? t.accent : t.ink,
            }}
          >
            <Heart className={`size-3.5 ${saved ? "fill-current" : ""}`} strokeWidth={1.8} />
            <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>

          <Link
            to="/cart"
            aria-label={`Shopping bag, ${count} items`}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-semibold transition-all hover:-translate-y-0.5 sm:px-3.5 sm:text-[11px]"
            style={{
              background: t.accent,
              color: t.accentInk,
            }}
          >
            <ShoppingBag className="size-3.5" strokeWidth={2} />
            <span className="tabular-nums">{count}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/* ───────────────────────── Store Footer ───────────────────────── */

export function StoreFooter({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const { user } = useApp();
  if (user) return null;

  return (
    <footer
      id="visit"
      className="mt-16 scroll-mt-28 border-t"
      style={{
        borderColor: t.line,
        color: t.ink,
        background: t.bg,
      }}
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12 md:py-16">
        {/* Brand */}
        <div className="md:col-span-5">
          <div className="flex items-center gap-3">
            <span
              className="grid size-10 shrink-0 place-items-center rounded-full text-xs font-semibold"
              style={{
                background: t.soft,
                color: t.accent,
                border: `1px solid ${t.line}`,
                fontFamily: t.heading,
              }}
            >
              {vendor.monogram}
            </span>

            <div>
              <p className="text-lg font-semibold tracking-tight" style={{ fontFamily: t.heading }}>
                {vendor.name}
              </p>

              <p className="mt-0.5 text-[9px] uppercase tracking-[0.17em] opacity-45">
                Official Peniel store
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-sm text-sm leading-7 opacity-60">{vendor.about}</p>

          <div className="mt-5">
            <StoreBadges vendor={vendor} />
          </div>
        </div>

        {/* Location */}
        <div className="md:col-span-3">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-45">
            Find us
          </p>

          <div className="flex items-start gap-2.5 text-sm leading-7 opacity-75">
            <span
              className="mt-1 grid size-7 shrink-0 place-items-center rounded-full"
              style={{
                background: t.soft,
                color: t.accent,
              }}
            >
              <span className="text-xs">⌖</span>
            </span>

            <span>{vendor.location}</span>
          </div>

          <p className="mt-3 pl-9 text-xs leading-6 opacity-55">{vendor.hours}</p>
        </div>

        {/* Contact */}
        <div className="md:col-span-4">
          <p className="mb-4 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-45">
            Get in touch
          </p>

          <Link
            to="/messages"
            search={{ v: vendor.slug }}
            className="inline-flex items-center gap-2.5 text-sm font-semibold transition-opacity hover:opacity-60"
          >
            <MessageCircle className="size-4" style={{ color: t.accent }} />
            Chat with {vendor.name}
          </Link>

          <p className="mt-3 max-w-xs text-xs leading-6 opacity-50">
            Your contact details stay private on Peniel. All conversations are protected.
          </p>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: t.line }}>
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 text-[10px] opacity-50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 {vendor.name}. All rights reserved.</p>

          <Link to="/" className="transition-opacity hover:opacity-100">
            Powered by Peniel · Payments secured by Peniel Pay
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ───────────────────────── Store Badges ───────────────────────── */

export function StoreBadges({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {vendor.verified && (
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-semibold"
          style={{
            background: `${t.accent}14`,
            color: t.accent,
          }}
        >
          <BadgeCheck className="size-3.5" strokeWidth={2.2} />
          Verified
        </span>
      )}

      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
        <Star
          className="size-3.5"
          style={{
            color: t.accent,
            fill: t.accent,
          }}
        />

        <span className="tabular-nums">{vendor.rating}</span>

        <span className="font-normal opacity-50">({vendor.reviews} reviews)</span>
      </span>

      <span className="hidden text-xs opacity-25 sm:inline">·</span>

      <span className="text-[11px] opacity-55">{vendor.orders}</span>
    </div>
  );
}

/* ───────────────────────── Group Tabs ───────────────────────── */

export function GroupTabs({ vendor, active = 0 }: { vendor: Vendor; active?: number }) {
  const t = vendor.theme;

  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-2">
      {vendor.groups.map((g, i) => (
        <span
          key={g}
          className="shrink-0 cursor-pointer rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] whitespace-nowrap transition-all duration-200"
          style={
            i === active
              ? {
                  background: t.accent,
                  color: t.accentInk,
                  borderColor: t.accent,
                }
              : {
                  borderColor: t.line,
                  background: t.soft,
                  color: t.ink,
                  opacity: 0.7,
                }
          }
        >
          {g}
        </span>
      ))}
    </div>
  );
}

/* ───────────────────────── Item Link ───────────────────────── */

export function ItemLink({
  vendor,
  product,
  children,
  className,
  style,
}: {
  vendor: Vendor;
  product: Product;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Link
      to="/store/$slug/product/$id"
      params={{
        slug: vendor.slug,
        id: product.id,
      }}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}

/* ───────────────────────── Item Art ───────────────────────── */

export function ItemArt({
  vendor,
  seed,
  className,
  label,
}: {
  vendor: Vendor;
  seed: number;
  className?: string;
  label?: string;
}) {
  const images: Record<Vendor["type"], string[]> = {
    restaurant: [restaurantItem1, restaurantItem2],
    "fresh-food": [freshFoodItem1, freshFoodItem2],
    beauty: [beautyItem1, beautyItem2],
    fashion: [fashionItem1, fashionItem2],
    bakery: [bakeryItem1, bakeryItem2],
    hotel: [hotelItem],
    electronics: [coverTech],
  };
  const gallery = images[vendor.type];
  const image = gallery[Math.abs(seed) % gallery.length] ?? vendor.cover;

  return (
    <img
      src={image}
      alt={label ?? `${vendor.name} product`}
      loading="lazy"
      className={"block size-full object-cover " + (className ?? "")}
      style={{ borderRadius: vendor.theme.radius }}
    />
  );
}

/* ───────────────────────── Price ───────────────────────── */

export function Price({ value, vendor }: { value: number; vendor: Vendor }) {
  return (
    <span className="text-[15px] font-semibold tabular-nums" style={{ color: vendor.theme.accent }}>
      {naira(value)}
    </span>
  );
}
