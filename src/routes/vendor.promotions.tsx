import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Copy,
  Gift,
  Megaphone,
  Pause,
  Play,
  Plus,
  Share2,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  DashShell,
  DataTable,
  Panel,
} from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { PlanGate } from "@/components/dash/plan-gate";
import { naira } from "@/lib/data";
import { app, isPaid, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions - Peniel business console" },
      {
        name: "description",
        content:
          "Run discounts, bundles and free-delivery offers, then measure exactly what each one earned you.",
      },
      { property: "og:title", content: "Promotions - Peniel business console" },
      {
        property: "og:description",
        content: "Create offers that bring customers back.",
      },
    ],
  }),
  component: VendorPromotions,
});

function VendorPromotions() {
  const { vendor, account } = useCurrentVendor();

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [offer, setOffer] = useState("");

  const all = account.promos;
  const activeOffers = all.filter((promo) => promo.active).length;
  const redemptions = all.reduce((sum, promo) => sum + promo.uses, 0);
  const offerRevenue = all.reduce((sum, promo) => sum + promo.revenue, 0);

  const activityNoun =
    vendor.fulfilment === "order"
      ? "orders"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "reservations";

  const storeUrl = `https://peniel.com.ng/store/${vendor.slug}`;

  const create = () => {
    const normalizedCode = code.trim().toUpperCase();
    const normalizedOffer = offer.trim();

    if (!normalizedCode || !normalizedOffer) {
      toast.error("Add a code and describe the offer");
      return;
    }

    if (all.some((promo) => promo.code === normalizedCode)) {
      toast.error("That code already exists");
      return;
    }

    if (!app.addPromo(normalizedCode, normalizedOffer)) {
      toast.error("Upgrade to a paid plan to create promotions");
      return;
    }

    toast.success("Promotion is live on your storefront");
    setCode("");
    setOffer("");
    setOpen(false);
  };

  const copyStoreLink = async () => {
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success("Storefront link copied");
    } catch {
      toast.error("Could not copy the link. Please copy it manually.");
    }
  };

  const shareStore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: vendor.name,
          text: `Visit ${vendor.name} on Peniel.`,
          url: storeUrl,
        });
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Unable to share storefront");
        }
      }
      return;
    }

    await copyStoreLink();
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Promotions"
      subtitle="Create offers, bring customers back and track performance."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        isPaid(account.plan) ? (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            {open ? <X className="size-4" /> : <Plus className="size-4" />}
            {open ? "Close" : "New promotion"}
          </button>
        ) : (
          <Link
            to="/vendor/upgrade"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="size-4" />
            Upgrade to create
          </Link>
        )
      }
    >
      <PlanGate feature="Promotions">
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            <StatCard
              label="Revenue from offers"
              value={naira(offerRevenue)}
              hint="Recorded by this account"
              tone="primary"
            />
            <StatCard
              label="Redemptions"
              value={String(redemptions)}
              hint={`Across ${all.length} offers`}
            />
            <StatCard
              label="Active promotions"
              value={String(activeOffers)}
              hint="Currently available on your store"
              tone="gold"
            />
          </div>

          {/* Create promotion */}
          {open && (
            <Panel title="Create a promotion">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Gift className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Give customers a reason to choose your store.
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Set a memorable code and describe the offer customers will
                    receive.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)_auto]">
                <div className="space-y-1.5">
                  <label
                    htmlFor="promotion-code"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Promotion code
                  </label>
                  <input
                    id="promotion-code"
                    value={code}
                    onChange={(event) =>
                      setCode(
                        event.target.value.toUpperCase().replace(/\s/g, ""),
                      )
                    }
                    placeholder="WELCOME15"
                    maxLength={24}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 font-mono text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="min-w-0 space-y-1.5">
                  <label
                    htmlFor="promotion-offer"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Offer description
                  </label>
                  <input
                    id="promotion-offer"
                    value={offer}
                    onChange={(event) => setOffer(event.target.value)}
                    placeholder={`e.g. 15% off ${activityNoun}`}
                    maxLength={120}
                    className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={create}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 lg:w-auto"
                  >
                    <Check className="size-4" />
                    Publish offer
                  </button>
                </div>
              </div>
            </Panel>
          )}

          {/* Main content */}
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
            <div className="min-w-0 space-y-5">
              <Panel title="Your promotions">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Manage the offers available on your storefront.
                  </p>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {all.length} total
                  </span>
                </div>

                {all.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Tag className="size-5" />
                    </div>
                    <p className="mt-4 text-sm font-semibold">
                      No promotions yet
                    </p>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Create your first offer to encourage customers to shop
                      with you.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpen(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Plus className="size-3.5" />
                      Create promotion
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Mobile promotion cards */}
                    <div className="space-y-3 md:hidden">
                      {all.map((promo) => (
                        <div
                          key={promo.code}
                          className="rounded-xl border border-border p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-lg border border-dashed border-border bg-muted/60 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wide">
                                {promo.code}
                              </span>
                              <p className="mt-2 break-words text-sm font-medium">
                                {promo.offer}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                promo.active
                                  ? "bg-success/10 text-success"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {promo.active ? "Active" : "Paused"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                            <div>
                              <p className="text-[11px] text-muted-foreground">
                                Redemptions
                              </p>
                              <p className="mt-1 text-sm font-semibold tabular-nums">
                                {promo.uses}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground">
                                Revenue
                              </p>
                              <p className="mt-1 text-sm font-semibold tabular-nums">
                                {naira(promo.revenue)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => app.togglePromo(promo.code)}
                            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                          >
                            {promo.active ? (
                              <>
                                <Pause className="size-3.5" />
                                Pause promotion
                              </>
                            ) : (
                              <>
                                <Play className="size-3.5" />
                                Resume promotion
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden md:block">
                      <DataTable
                        head={[
                          "Promotion",
                          "Offer",
                          "Status",
                          "Uses",
                          "Revenue",
                          "",
                        ]}
                        rows={all.map((promo) => [
                          <span className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold">
                            {promo.code}
                          </span>,
                          <span className="text-sm text-muted-foreground">
                            {promo.offer}
                          </span>,
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              promo.active
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {promo.active ? "Active" : "Paused"}
                          </span>,
                          <span className="text-sm tabular-nums">
                            {promo.uses}
                          </span>,
                          <span className="text-sm font-medium tabular-nums">
                            {naira(promo.revenue)}
                          </span>,
                          <button
                            type="button"
                            onClick={() => app.togglePromo(promo.code)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:opacity-70"
                          >
                            {promo.active ? (
                              <>
                                <Pause className="size-3.5" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="size-3.5" />
                                Resume
                              </>
                            )}
                          </button>,
                        ])}
                      />
                    </div>
                  </>
                )}
              </Panel>

              {/* Performance note */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Keep an eye on results</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Track redemptions and recorded revenue to understand which
                    offers are performing best.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <Panel title="Share your storefront">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Share2 className="size-4.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {vendor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your Peniel storefront
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Share your store link with customers and let them browse
                  your products or services directly.
                </p>

                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-2.5">
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">
                    peniel.com.ng/store/{vendor.slug}
                  </span>
                  <button
                    type="button"
                    onClick={copyStoreLink}
                    aria-label="Copy storefront link"
                    className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background transition hover:bg-muted"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={shareStore}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  <Share2 className="size-3.5" />
                  Share storefront
                  <ArrowUpRight className="size-3.5" />
                </button>
              </Panel>

              <Panel title="Ideas for your store">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Sparkles className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        Introduce your {vendor.groups[0]?.toLowerCase() ?? "catalog"}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Create an offer that helps new customers discover{" "}
                        {vendor.name}.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        Encourage repeat {activityNoun}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Share your storefront with returning customers and
                        keep your business top of mind.
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2">
                  <Megaphone className="size-4 text-primary" />
                  <p className="text-sm font-semibold">Promotion tip</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Keep promotion codes short and easy to remember. A clear
                  offer makes it easier for customers to understand the value.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </PlanGate>
    </DashShell>
  );
}
