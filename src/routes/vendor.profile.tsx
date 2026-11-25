import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  Clock3,
  Crown,
  ExternalLink,
  MapPin,
  PencilLine,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNavFor } from "@/components/dash/vendor-nav";
import { useCurrentVendor } from "@/lib/peniel-store";
import { vendorsApi, type VendorRecord } from "@/lib/api-client";

const R2_PUBLIC_URL =
  import.meta.env["VITE_R2_PUBLIC_MEDIA_URL"] ?? "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev";

function buildR2Url(objectKey: string | undefined): string | undefined {
  if (!objectKey || typeof objectKey !== "string") return undefined;
  return `${R2_PUBLIC_URL}/${objectKey}`;
}

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({
    meta: [
      { title: "Business profile - Peniel business console" },
      {
        name: "description",
        content: "Your business account, plan and storefront link on Peniel.",
      },
      { property: "og:title", content: "Business profile - Peniel" },
      {
        property: "og:description",
        content: "Manage your Peniel business account.",
      },
    ],
  }),
  component: VendorProfile,
});

function VendorProfile() {
  const { vendor, account, base } = useCurrentVendor();
  const nav = vendorNavFor(vendor);
  const [liveVendor, setLiveVendor] = useState<VendorRecord | null>(null);
  const [liveLoading, setLiveLoading] = useState(true);

  useEffect(() => {
    let active = true;
    vendorsApi.mine().then((result) => {
      if (!active) return;
      if (result.ok) {
        setLiveVendor(result.data.find((v) => v.slug === base.slug) ?? null);
      }
      setLiveLoading(false);
    });
    return () => {
      active = false;
    };
  }, [base.slug]);

  const live = liveVendor
    ? {
        ...vendor,
        name: liveVendor.name,
        tagline: liveVendor.description,
        about: liveVendor.description,
        location: liveVendor.location,
        status: liveVendor.status,
        logoUrl: buildR2Url(liveVendor.storefronts?.[0]?.logo_object_key),
        coverUrl: buildR2Url(liveVendor.storefronts?.[0]?.cover_object_key),
      }
    : { ...vendor, logoUrl: undefined, coverUrl: undefined, status: vendor.status };

  const logoUrl = live.logoUrl ?? (vendor.logo ? vendor.logo : undefined);
  const coverUrl = live.coverUrl ?? (vendor.cover ? vendor.cover : undefined);

  return (
    <DashShell
      nav={nav}
      kicker="Business console"
      title="Business profile"
      subtitle="Manage your business identity and public storefront."
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-5">
          {/* Business identity */}
          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative h-32 overflow-hidden bg-muted sm:h-40">
              {coverUrl ? (
                <img src={coverUrl} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full bg-gradient-to-br from-primary/10 to-muted" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <Crown className="size-3.5 text-gold" />
                  {account.plan === "starter" ? "Free plan" : `${account.plan} plan`}
                </span>
              </div>
            </div>

            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="relative z-10 flex flex-wrap items-end justify-between gap-3">
                <div className="-mt-9 grid size-[76px] shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-card bg-primary shadow-sm sm:-mt-10 sm:size-[84px]">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${vendor.name} logo`} className="size-full object-contain" />
                  ) : (
                    <span className="font-display text-xl font-bold text-primary-foreground sm:text-2xl">
                      {vendor.monogram}
                    </span>
                  )}
                </div>

                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:pb-1">
                  <Link
                    to="/store/$slug"
                    params={{ slug: vendor.slug }}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold transition hover:bg-muted sm:flex-none"
                  >
                    <ExternalLink className="size-3.5" />
                    View storefront
                  </Link>

                  <Link
                    to="/vendor/settings"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 sm:flex-none"
                  >
                    <PencilLine className="size-3.5" />
                    Edit profile
                  </Link>
                </div>
              </div>

              <div className="mt-4 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                    {live.name}
                  </h2>

                  {vendor.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      <BadgeCheck className="size-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
                  {live.tagline}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Store className="size-3.5" />
                    {vendor.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {live.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" />
                    {vendor.hours}
                  </span>
                </div>
              </div>

              {/* Profile overview */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 border-t border-border pt-5 sm:grid-cols-3">
                <div className="min-w-0 rounded-xl bg-muted/50 p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Store className="size-3.5" />
                    <p className="text-[10px] font-medium uppercase tracking-wide">Storefront</p>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">/{vendor.slug}</p>
                  <Link
                    to="/store/$slug"
                    params={{ slug: vendor.slug }}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    Open page <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BadgeCheck className="size-3.5" />
                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Customer rating
                    </p>
                  </div>
                  <p className="mt-2 text-sm font-semibold tabular-nums">
                    {vendor.rating.toFixed(1)}
                    <span className="ml-1 font-normal text-muted-foreground">/ 5.0</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {vendor.reviews.toLocaleString("en-NG")} reviews
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Crown className="size-3.5" />
                    <p className="text-[10px] font-medium uppercase tracking-wide">Current plan</p>
                  </div>
                  <p className="mt-2 text-sm font-semibold capitalize">
                    {account.plan === "starter" ? "Free" : account.plan}
                  </p>
                  <Link
                    to="/vendor/upgrade"
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    Manage plan <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* About business */}
          <Panel title="About your business">
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Business description
                </p>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">{live.about}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-primary" />
                  <p className="text-xs font-semibold">Service and delivery</p>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {vendor.delivery}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Public business information</span>
                </div>
                <Link
                  to="/vendor/settings"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Update details <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </Panel>
        </div>

        {/* Business summary card */}
        <div className="min-w-0">
          <Panel title="Your business">
            <div className="flex flex-col items-center text-center">
              <div className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-primary shadow-sm">
                {logoUrl ? (
                  <img src={logoUrl} alt={`${vendor.name} logo`} className="size-full object-contain" />
                ) : (
                  <span className="font-display text-lg font-bold text-primary-foreground">
                    {vendor.monogram}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-sm font-bold">{live.name}</h3>
              <p className="mt-1 text-[11px] text-muted-foreground">{vendor.categoryLabel}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{live.location}</p>
            </div>

            <div className="mt-5 space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Storefront</span>
                <span className="font-semibold">/{vendor.slug}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Plan</span>
                <span className="font-semibold capitalize">
                  {account.plan === "starter" ? "Free" : account.plan}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  {live.status === "suspended" ? "Suspended" : "Active"}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-primary/[0.04] p-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-primary" />
                <p className="text-[10px] font-semibold">Business account protected</p>
              </div>
              <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">
                Your storefront, orders, and customer data are securely managed on Peniel.
              </p>
            </div>

            <Link
              to="/vendor/settings"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <PencilLine className="size-3.5" />
              Edit business details
            </Link>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
