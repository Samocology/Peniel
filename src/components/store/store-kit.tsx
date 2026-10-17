import { Link } from "@tanstack/react-router";
import { BadgeCheck, ChevronLeft, Heart, MessageCircle, Share2, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { app, useApp } from "@/lib/vendra-store";
import type { ReactNode } from "react";
import { naira, type Product, type Vendor } from "@/lib/data";

/** Subtle platform bar — vendor brand stays the visual priority. */
export function StoreTopBar({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const s = useApp();
  const saved = s.favorites.includes(vendor.slug);
  const count = s.cart.reduce((a, l) => a + l.qty, 0);
  const share = async () => {
    const url = window.location.origin + "/store/" + vendor.slug;
    try {
      if (navigator.share) await navigator.share({ title: vendor.name, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Store link copied");
      }
    } catch {
      /* cancelled */
    }
  };
  return (
    <div
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{ background: t.bg + "e6", borderColor: t.line, color: t.ink }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link to="/marketplace" className="inline-flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
          <ChevronLeft className="size-3.5" /> Marketplace
        </Link>
        <span className="mx-1 h-4 w-px" style={{ background: t.line }} />
        <span className="truncate text-xs font-semibold tracking-wide">{vendor.name}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link to="/messages" search={{ v: vendor.slug }} aria-label="Chat" className="rounded-full border px-2.5 py-1 text-xs sm:px-3" style={{ borderColor: t.line }}>
            <MessageCircle className="inline size-3 sm:mr-1" /> <span className="hidden sm:inline">Chat</span>
          </Link>
          <button onClick={share} aria-label="Share" className="rounded-full border px-2.5 py-1 text-xs sm:px-3" style={{ borderColor: t.line }}>
            <Share2 className="inline size-3 sm:mr-1" /> <span className="hidden sm:inline">Share</span>
          </button>
          <button
            onClick={() => {
              app.toggleFavorite(vendor.slug);
              toast.success(saved ? "Removed from favourites" : "Saved to favourites");
            }}
            aria-label="Save"
            className="rounded-full border px-2.5 py-1 text-xs sm:px-3"
            style={{ borderColor: t.line, background: saved ? t.soft : undefined }}
          >
            <Heart className={"inline size-3 sm:mr-1 " + (saved ? "fill-current" : "")} /> <span className="hidden sm:inline">{saved ? "Saved" : "Save"}</span>
          </button>
          <Link
            to="/cart"
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: t.accent, color: t.accentInk }}
          >
            <ShoppingBag className="mr-1 inline size-3" /> {count}
          </Link>
        </span>
      </div>
    </div>
  );
}

export function StoreFooter({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <footer className="mt-16 border-t py-10" style={{ borderColor: t.line, color: t.ink }}>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-lg font-bold" style={{ fontFamily: t.heading }}>
            {vendor.name}
          </p>
          <p className="mt-2 max-w-sm text-sm opacity-70">{vendor.about}</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="mb-2 text-xs tracking-[0.14em] uppercase opacity-60">Visit</p>
          <p>{vendor.location}</p>
          <p className="mt-2">{vendor.hours}</p>
        </div>
        <div className="text-sm opacity-80">
          <p className="mb-2 text-xs tracking-[0.14em] uppercase opacity-60">Contact</p>
          <Link to="/messages" search={{ v: vendor.slug }} className="inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
            <MessageCircle className="size-3.5" /> Chat with {vendor.name}
          </Link>
          <p className="mt-1 text-xs opacity-60">Contact details stay private on Vendra.</p>
        </div>
      </div>
      <div
        className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-between gap-2 border-t px-4 pt-6 text-xs opacity-60 sm:px-6"
        style={{ borderColor: t.line }}
      >
        <p>© 2026 {vendor.name}. All rights reserved.</p>
        <Link to="/" className="hover:opacity-100">
          Powered by Vendra · Payments secured by Vendra Pay
        </Link>
      </div>
    </footer>
  );
}

export function StoreBadges({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      {vendor.verified && (
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ background: t.accent, color: t.accentInk }}
        >
          <BadgeCheck className="size-3.5" /> Verified business
        </span>
      )}
      <span className="inline-flex items-center gap-1 font-semibold">
        <Star className="size-4" style={{ color: t.accent, fill: t.accent }} /> {vendor.rating}
        <span className="font-normal opacity-60">({vendor.reviews} reviews)</span>
      </span>
      <span className="opacity-60">·</span>
      <span className="opacity-70">{vendor.orders}</span>
    </div>
  );
}

export function GroupTabs({ vendor, active = 0 }: { vendor: Vendor; active?: number }) {
  const t = vendor.theme;
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
      {vendor.groups.map((g, i) => (
        <span
          key={g}
          className="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium"
          style={
            i === active
              ? { background: t.accent, color: t.accentInk, borderColor: t.accent }
              : { borderColor: t.line, opacity: 0.75 }
          }
        >
          {g}
        </span>
      ))}
    </div>
  );
}

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
  style?: React.CSSProperties;
}) {
  return (
    <Link
      to="/store/$slug/product/$id"
      params={{ slug: vendor.slug, id: product.id }}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}

/** Brand-tinted image stand-in for catalogue items. */
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
  const t = vendor.theme;
  const angle = 120 + seed * 37;
  return (
    <div
      className={className}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, ${t.accent}33, ${t.soft})`,
        borderRadius: t.radius,
      }}
    >
      {label && (
        <span className="grid size-full place-items-center px-3 text-center text-xs font-semibold opacity-45">
          {label}
        </span>
      )}
    </div>
  );
}

export function Price({ value, vendor }: { value: number; vendor: Vendor }) {
  return (
    <span className="font-semibold" style={{ color: vendor.theme.accent }}>
      {naira(value)}
    </span>
  );
}
