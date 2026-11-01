import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Clock3, Crown, ExternalLink, MapPin, PencilLine, Store } from "lucide-react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNavFor } from "@/components/dash/vendor-nav";
import { vendors } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({
    meta: [
      { title: "Business profile - Peniel business console" },
      { name: "description", content: "Your business account, plan and storefront link on Peniel." },
      { property: "og:title", content: "Business profile - Peniel" },
      { property: "og:description", content: "Manage your Peniel business account." },
    ],
  }),
  component: VendorProfile,
});

function VendorProfile() {
  const { vendor, account } = useCurrentVendor();
  const nav = vendorNavFor(vendor);
  return (
    <DashShell nav={nav} kicker="Business console" title="Business profile" subtitle="Your business identity, public storefront details and account plan.">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative h-36 sm:h-48">
              <img src={vendor.cover} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                <Crown className="size-3.5 text-gold" />
                {account.plan === "starter" ? "Free plan" : `${account.plan} plan`}
              </span>
            </div>

            <div className="px-5 pb-5 sm:px-7 sm:pb-7">
              <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 sm:-mt-12">
                <div className="grid size-20 shrink-0 place-items-center rounded-2xl border-4 border-card bg-primary font-display text-2xl font-bold text-primary-foreground shadow-md sm:size-24">
                  {vendor.monogram}
                </div>
                <div className="flex flex-wrap gap-2 pb-1">
                  <Link
                    to="/store/$slug"
                    params={{ slug: vendor.slug }}
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                  >
                    <ExternalLink className="size-4" /> View storefront
                  </Link>
                  <Link
                    to="/vendor/settings"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:opacity-90"
                  >
                    <PencilLine className="size-4" /> Edit profile
                  </Link>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                <h2 className="font-display text-2xl font-bold tracking-tight">{vendor.name}</h2>
                {vendor.verified && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
                    <BadgeCheck className="size-4" /> Verified
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{vendor.tagline}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Store className="size-3.5" />{vendor.categoryLabel}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{vendor.location}</span>
                <span className="inline-flex items-center gap-1.5"><Clock3 className="size-3.5" />{vendor.hours}</span>
              </div>

              <div className="mt-6 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Storefront</p>
                  <p className="mt-1 truncate text-sm font-semibold">{vendor.slug}</p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Customer rating</p>
                  <p className="mt-1 text-sm font-semibold">{vendor.rating.toFixed(1)} <span className="font-normal text-muted-foreground">· {vendor.reviews} reviews</span></p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs font-medium text-muted-foreground">Account plan</p>
                  <p className="mt-1 text-sm font-semibold capitalize">{account.plan === "starter" ? "Free" : account.plan}</p>
                  <Link to="/vendor/upgrade" className="mt-1 inline-flex text-xs font-semibold text-primary">Manage plan</Link>
                </div>
              </div>
            </div>
          </section>

          <Panel title="About the business">
            <p className="text-sm leading-6 text-muted-foreground">{vendor.about}</p>
            <div className="mt-5 rounded-2xl bg-muted/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Service and delivery</p>
              <p className="mt-2 text-sm leading-6">{vendor.delivery}</p>
            </div>
          </Panel>
        </div>

        <Panel title="Switch business">
          <p className="mb-4 text-xs leading-5 text-muted-foreground">
            Switch between demo business accounts. Each account keeps its own plan, profile and settings.
          </p>
          <ul className="space-y-2">
            {vendors.map((v) => {
              const selected = v.slug === vendor.slug;
              return (
                <li key={v.slug}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      app.switchVendor(v.slug);
                      toast.success(`Switched to ${v.name}`);
                    }}
                    className={
                      "flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition " +
                      (selected
                        ? "border-primary/40 bg-primary-soft"
                        : "border-border hover:border-primary/30 hover:bg-muted/50")
                    }
                  >
                    <span className={"grid size-10 shrink-0 place-items-center rounded-xl font-display text-xs font-bold " + (selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                      {v.monogram}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{v.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{v.categoryLabel}</span>
                    </span>
                    {selected && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Current account" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </DashShell>
  );
}
