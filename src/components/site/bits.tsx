import { Link } from "@tanstack/react-router";
import { BadgeCheck, Star } from "lucide-react";
import type { ReactNode } from "react";
import { naira, type Vendor } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", className)}>
      <Star className="size-3.5 fill-gold text-gold" />
      {value.toFixed(1)}
    </span>
  );
}

export function Verified({ label = "Verified" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">
      <BadgeCheck className="size-3.5" /> {label}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function VendorCard({ vendor, compact = false }: { vendor: Vendor; compact?: boolean }) {
  return (
    <Link
      to="/store/$slug"
      params={{ slug: vendor.slug }}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={vendor.cover}
          alt={vendor.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {vendor.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-card/95 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <BadgeCheck className="size-3" /> Verified
            </span>
          )}
          {vendor.featured && (
            <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground">
              Featured
            </span>
          )}
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold">{vendor.name}</h3>
          <Stars value={vendor.rating} className="shrink-0 text-xs" />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {vendor.categoryLabel} · {vendor.location.split(",").slice(-2).join(",").trim()}
        </p>
        {!compact && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-muted-foreground">
            <span className="rounded-md bg-muted px-2 py-1">
              {vendor.fulfilment === "order" ? "Accepts orders" : vendor.fulfilment === "booking" ? "Book appointment" : "Reserve room"}
            </span>
            <span className="rounded-md bg-muted px-2 py-1">{vendor.reviews} reviews</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: "default" | "primary" | "gold";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        tone === "primary" && "border-primary/20 bg-primary-soft",
        tone === "gold" && "border-gold/30 bg-gold/10",
        tone === "default" && "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Money({ value, className }: { value: number; className?: string }) {
  return <span className={className}>{naira(value)}</span>;
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Delivered: "bg-success/12 text-success",
    Completed: "bg-success/12 text-success",
    Confirmed: "bg-success/12 text-success",
    New: "bg-gold/20 text-gold-foreground",
    Approved: "bg-success/12 text-success",
    Paid: "bg-success/12 text-success",
    Preparing: "bg-gold/20 text-gold-foreground",
    Pending: "bg-gold/20 text-gold-foreground",
    "In review": "bg-gold/20 text-gold-foreground",
    "Out for delivery": "bg-info/12 text-info",
    Processing: "bg-info/12 text-info",
    Cancelled: "bg-destructive/10 text-destructive",
    Rejected: "bg-destructive/10 text-destructive",
    Failed: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}
