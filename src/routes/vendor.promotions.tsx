import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Check,
  Copy,
  Gift,
  Loader2,
  Megaphone,
  Pause,
  Play,
  Plus,
  RefreshCcw,
  Share2,
  Sparkles,
  Tag,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { PlanGate } from "@/components/dash/plan-gate";
import { naira } from "@/lib/data";
import { useCurrentVendor } from "@/lib/peniel-store";
import { useVendorId, useVendorPromos, minorToNaira } from "@/lib/vendor-hooks";
import { promosApi, type PromoRecord } from "@/lib/api-client";

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

function describePromo(p: PromoRecord): string {
  if (p.discount_type === "percentage") return `${p.discount_value}% off`;
  return `₦${(p.discount_value / 100).toFixed(2)} off`;
}

function VendorPromotions() {
  const { vendor } = useCurrentVendor();
  const vendorId = useVendorId(vendor.slug);
  const { data: promos, loading, error, reload } = useVendorPromos(vendorId);

  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [creating, setCreating] = useState(false);

  const all: PromoRecord[] = promos ?? [];
  const activeOffers = all.filter((promo) => promo.active).length;
  const redemptions = all.reduce((sum, promo) => sum + Number(promo.current_uses ?? 0), 0);

  const activityNoun =
    vendor.fulfilment === "order"
      ? "orders"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "reservations";

  const storeUrl = `https://peniel.com.ng/store/${vendor.slug}`;

  const create = async () => {
    if (!vendorId) {
      toast.error("Vendor not found.");
      return;
    }

    const normalizedCode = code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const value = Number(discountValue);
    const uses = maxUses.trim() ? Math.round(Number(maxUses)) : undefined;
    const minOrderMinor = minOrder.trim() ? Math.round(Number(minOrder) * 100) : undefined;

    if (!normalizedCode || !discountValue.trim() || value <= 0) {
      toast.error("Add a code and a valid discount value");
      return;
    }

    if (discountType === "percentage" && (value <= 0 || value > 100)) {
      toast.error("Percentage discount must be 1-100.");
      return;
    }
    if (discountType === "fixed" && value <= 0) {
      toast.error("Fixed discount must be greater than zero.");
      return;
    }

    if (all.some((promo) => promo.code === normalizedCode)) {
      toast.error("That code already exists");
      return;
    }

    setCreating(true);
    const result = await promosApi.create({
      vendorId,
      code: normalizedCode,
      discountType,
      discountValue: value,
      ...(uses !== undefined ? { maxUses: uses } : {}),
      ...(expiresAt.trim() ? { expiresAt: expiresAt.trim() } : {}),
      ...(minOrderMinor !== undefined ? { minOrderMinor } : {}),
    });
    setCreating(false);

    if (result.ok) {
      toast.success("Promotion is live on your storefront");
      setCode("");
      setDiscountValue("");
      setMaxUses("");
      setExpiresAt("");
      setMinOrder("");
      setOpen(false);
      reload();
    } else {
      toast.error(result.error || "Could not create promotion.");
    }
  };

  const toggle = async (promo: PromoRecord) => {
    const result = await promosApi.update(promo.id, { active: !promo.active });
    if (result.ok) {
      reload();
    } else {
      toast.error(result.error || "Could not update promotion.");
    }
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
        return;
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          toast.error("Unable to share storefront");
        }
      }
    }
    await copyStoreLink();
  };

  if (loading) {
    return (
      <DashShell
        nav={vendorNav}
        kicker="Business console"
        title="Promotions"
        subtitle="Create offers, bring customers back and track performance."
        storeLink={{ label: "View storefront", slug: vendor.slug }}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Gift className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading promotions…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={vendorNav}
        kicker="Business console"
        title="Promotions"
        subtitle="Create offers, bring customers back and track performance."
        storeLink={{ label: "View storefront", slug: vendor.slug }}
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <RefreshCcw className="size-3.5" /> Retry
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Promotions"
      subtitle="Create offers, bring customers back and track performance."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
        >
          {open ? <X className="size-4" /> : <Plus className="size-4" />}
          {open ? "Close" : "New promotion"}
        </button>
      }
    >
      <PlanGate feature="Promotions">
        <div className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
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
            <StatCard
              label="Total offers"
              value={String(all.length)}
              hint="Created on this store"
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
                    Set a memorable code and the discount customers will receive.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
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
                        setCode(event.target.value.toUpperCase().replace(/\s/g, ""))
                      }
                      placeholder="WELCOME15"
                      maxLength={24}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 font-mono text-sm font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="promotion-type"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Discount type
                    </label>
                    <select
                      id="promotion-type"
                      value={discountType}
                      onChange={(event) =>
                        setDiscountType(event.target.value as "percentage" | "fixed")
                      }
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="percentage">Percentage off</option>
                      <option value="fixed">Fixed amount off</option>
                    </select>
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="promotion-value"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Discount value
                    </label>
                    <input
                      id="promotion-value"
                      type="number"
                      value={discountValue}
                      onChange={(event) => setDiscountValue(event.target.value)}
                      placeholder={discountType === "percentage" ? "15" : "2500"}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)_auto]">
                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="promotion-max-uses"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Max uses (optional)
                    </label>
                    <input
                      id="promotion-max-uses"
                      type="number"
                      value={maxUses}
                      onChange={(event) => setMaxUses(event.target.value)}
                      placeholder="Unlimited"
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="promotion-expires"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Expires at (optional)
                    </label>
                    <input
                      id="promotion-expires"
                      type="datetime-local"
                      value={expiresAt}
                      onChange={(event) => setExpiresAt(event.target.value)}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>

                  <div className="min-w-0 space-y-1.5">
                    <label
                      htmlFor="promotion-min-order"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Min order (₦)
                    </label>
                    <input
                      id="promotion-min-order"
                      type="number"
                      value={minOrder}
                      onChange={(event) => setMinOrder(event.target.value)}
                      placeholder="0"
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={create}
                    disabled={creating}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60 lg:w-auto"
                  >
                    {creating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        Publish offer
                      </>
                    )}
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
                    <p className="mt-4 text-sm font-semibold">No promotions yet</p>
                    <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                      Create your first offer to encourage customers to shop with you.
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
                        <div key={promo.code} className="rounded-xl border border-border p-3.5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="inline-flex rounded-lg border border-dashed border-border bg-muted/60 px-2.5 py-1.5 font-mono text-xs font-bold tracking-wide">
                                {promo.code}
                              </span>
                              <p className="mt-2 break-words text-sm font-medium">
                                {describePromo(promo)}
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
                              <p className="text-[11px] text-muted-foreground">Redemptions</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums">
                                {promo.current_uses}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] text-muted-foreground">Expires</p>
                              <p className="mt-1 text-sm font-semibold tabular-nums">
                                {promo.expires_at
                                  ? new Date(promo.expires_at).toLocaleDateString("en-NG")
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggle(promo)}
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
                        head={["Promotion", "Offer", "Status", "Uses", "Expires", ""]}
                        rows={all.map((promo) => [
                          <span className="inline-flex rounded-md bg-muted px-2 py-1 font-mono text-xs font-semibold">
                            {promo.code}
                          </span>,
                          <span className="text-sm text-muted-foreground">
                            {describePromo(promo)}
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
                          <span className="text-sm tabular-nums">{promo.current_uses}</span>,
                          <span className="text-sm tabular-nums">
                            {promo.expires_at
                              ? new Date(promo.expires_at).toLocaleDateString("en-NG")
                              : "—"}
                          </span>,
                          <button
                            type="button"
                            onClick={() => toggle(promo)}
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
                    Track redemptions to understand which offers are performing best.
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
                    <p className="truncate text-sm font-semibold">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">Your Peniel storefront</p>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  Share your store link with customers and let them browse your products or services
                  directly.
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
                        Create an offer that helps new customers discover {vendor.name}.
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  <div className="flex gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">Encourage repeat {activityNoun}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        Share your storefront with returning customers and keep your business top of
                        mind.
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
                  Keep promotion codes short and easy to remember. A clear offer makes it easier for
                  customers to understand the value.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </PlanGate>
    </DashShell>
  );
}
