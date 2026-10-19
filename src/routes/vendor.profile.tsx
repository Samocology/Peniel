import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Crown, Store } from "lucide-react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { vendors } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/vendra-store";

export const Route = createFileRoute("/vendor/profile")({
  head: () => ({
    meta: [
      { title: "Business profile — Vendra business console" },
      { name: "description", content: "Your business account, plan and storefront link on Vendra." },
      { property: "og:title", content: "Business profile — Vendra" },
      { property: "og:description", content: "Manage your Vendra business account." },
    ],
  }),
  component: VendorProfile,
});

function VendorProfile() {
  const { vendor, account } = useCurrentVendor();
  return (
    <DashShell nav={vendorNav} kicker="Business console" title="Profile">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary font-display text-xl font-bold text-primary-foreground">{vendor.monogram}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-xl font-bold">{vendor.name}</p>
                <p className="truncate text-sm text-muted-foreground">{vendor.tagline}</p>
                <p className="mt-1 text-xs text-muted-foreground">{vendor.categoryLabel} · {vendor.location}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-bold capitalize">
                <Crown className="size-3.5" /> {account.plan === "starter" ? "Free" : account.plan}
              </span>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Link to="/store/$slug" params={{ slug: vendor.slug }} className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold">View storefront</Link>
              <Link to="/vendor/settings" className="rounded-xl border border-border px-4 py-3 text-center text-sm font-semibold">Edit store</Link>
              <Link to="/vendor/upgrade" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground">Manage plan</Link>
            </div>
          </Panel>
          <Panel title="Quick links">
            <ul className="divide-y divide-border">
              {vendorNav.filter((n) => !n.primary).map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="flex items-center gap-3 py-3 text-sm font-medium">
                    {n.icon} <span className="flex-1">{n.label}</span> <ChevronRight className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <Panel title="Switch business account">
          <p className="mb-3 text-xs text-muted-foreground">Demo sign-in: each business keeps its own plan, design and settings.</p>
          <ul className="space-y-2">
            {vendors.map((v) => (
              <li key={v.slug}>
                <button
                  onClick={() => {
                    app.switchVendor(v.slug);
                    toast.success(`Signed in as ${v.name}`);
                  }}
                  className={"flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm " + (v.slug === vendor.slug ? "border-primary bg-primary-soft font-semibold" : "border-border")}
                >
                  <Store className="size-4 shrink-0 text-primary" /> <span className="truncate">{v.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashShell>
  );
}
