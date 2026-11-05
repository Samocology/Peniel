
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
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNavFor } from "@/components/dash/vendor-nav";
import { vendors } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({
    meta: [
      { title: "Business profile - Peniel business console" },
      {
        name: "description",
        content:
          "Your business account, plan and storefront link on Peniel.",
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
  const { vendor, account } = useCurrentVendor();
  const nav = vendorNavFor(vendor);

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
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="relative h-32 overflow-hidden bg-muted sm:h-40">
              <img
                src={vendor.cover}
                alt=""
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

              <div className="absolute right-3 top-3 sm:right-4 sm:top-4">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
                  <Crown className="size-3.5 text-gold" />
                  {account.plan === "starter"
                    ? "Free plan"
                    : `${account.plan} plan`}
                </span>
              </div>
            </div>

            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="-mt-9 grid size-[76px] shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary font-display text-xl font-bold text-primary-foreground shadow-sm sm:-mt-10 sm:size-[84px] sm:text-2xl">
                  {vendor.monogram}
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
                    {vendor.name}
                  </h2>

                  {vendor.verified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                      <BadgeCheck className="size-3.5" />
                      Verified
                    </span>
                  )}
                </div>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-muted-foreground sm:text-sm">
                  {vendor.tagline}
                </p>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Store className="size-3.5" />
                    {vendor.categoryLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    {vendor.location}
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
                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Storefront
                    </p>
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">
                    /{vendor.slug}
                  </p>
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
                    <span className="ml-1 font-normal text-muted-foreground">
                      / 5.0
                    </span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {vendor.reviews.toLocaleString("en-NG")} reviews
                  </p>
                </div>

                <div className="rounded-xl bg-muted/50 p-3.5">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Crown className="size-3.5" />
                    <p className="text-[10px] font-medium uppercase tracking-wide">
                      Current plan
                    </p>
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
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {vendor.about}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <Store className="size-4 text-primary" />
                  <p className="text-xs font-semibold">
                    Service and delivery
                  </p>
                </div>
                <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                  {vendor.delivery}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Public business information
                  </span>
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

        {/* Business switcher */}
        <div className="min-w-0">
          <Panel title="Your businesses">
            <div className="mb-4">
              <p className="text-xs leading-5 text-muted-foreground">
                Switch between demo business accounts. Each account keeps its
                own plan, profile and settings.
              </p>
            </div>

            <ul className="space-y-2">
              {vendors.map((v) => {
                const selected = v.slug === vendor.slug;

                return (
                  <li key={v.slug}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        if (selected) return;
                        app.switchVendor(v.slug);
                        toast.success(`Switched to ${v.name}`);
                      }}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition",
                        selected
                          ? "border-primary/40 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-muted/50",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "grid size-10 shrink-0 place-items-center rounded-xl font-display text-xs font-bold",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground",
                        ].join(" ")}
                      >
                        {v.monogram}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold">
                          {v.name}
                        </span>
                        <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                          {v.categoryLabel}
                        </span>
                      </span>

                      {selected ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold text-primary">
                          <span className="size-1.5 rounded-full bg-primary" />
                          Active
                        </span>
                      ) : (
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 rounded-xl bg-muted/40 p-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-primary" />
                <p className="text-[10px] font-semibold">
                  Business account protection
                </p>
              </div>
              <p className="mt-1.5 text-[10px] leading-5 text-muted-foreground">
                Your selected business determines which storefront and
                dashboard settings you manage.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
