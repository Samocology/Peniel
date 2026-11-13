import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Sparkles,
  Megaphone,
  TicketPercent,
  Store,
  CalendarDays,
  ArrowUpRight,
  Check,
  Search,
  X,
  Info,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { adminApi, type AdminPromotion } from "@/lib/api-client";
import { useAdminPromotions } from "@/lib/admin-hooks";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions & featuring - Peniel admin" },
      {
        name: "description",
        content:
          "Run platform-wide campaigns and choose which businesses are featured on the marketplace.",
      },
      { property: "og:title", content: "Promotions & featuring - Peniel admin" },
      { property: "og:description", content: "Campaigns and featured placements." },
    ],
  }),
  component: AdminPromotions,
});

type FeaturedSlot = { id: string; name: string; slug: string };

function AdminPromotions() {
  const [featuredSlugs, setFeaturedSlugs] = useState<string[]>([]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");
  const { data: promotions = [], loading, error } = useAdminPromotions();

  const activeCount = promotions.filter((c) => c.active).length;
  const scheduledCount = promotions.filter((c) => !c.active).length;
  const totalUses = promotions.reduce((sum, c) => sum + (c.current_uses ?? 0), 0);
  const totalVolume = promotions.reduce(
    (sum, c) => sum + (c.discount_value ?? 0) * (c.current_uses ?? 0),
    0,
  );

  const visiblePromotions = useMemo(
    () =>
      promotions.filter((campaign) =>
        `${campaign.code} ${campaign.id}`.toLowerCase().includes(campaignSearch.toLowerCase()),
      ),
    [promotions, campaignSearch],
  );

  const toggleFeatured = (slug: string) => {
    const isFeatured = featuredSlugs.includes(slug);
    if (isFeatured) {
      setFeaturedSlugs((current) => current.filter((item) => item !== slug));
      toast.success("Business removed from featured placements.");
      return;
    }
    if (featuredSlugs.length >= 8) {
      toast.error("All 8 featured slots are currently in use.");
      return;
    }
    setFeaturedSlugs((current) => [...current, slug]);
    toast.success("Business added to featured placements.");
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform admin"
        title="Promotions & featuring"
        subtitle={`${activeCount} live campaign${activeCount === 1 ? "" : "s"} · ${scheduledCount} scheduled`}
        actions={
          <button
            type="button"
            onClick={() => setCampaignOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="size-4" /> New campaign
          </button>
        }
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Megaphone className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading campaigns…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform admin"
        title="Promotions & featuring"
        subtitle={`${activeCount} live campaign${activeCount === 1 ? "" : "s"} · ${scheduledCount} scheduled`}
        actions={
          <button
            type="button"
            onClick={() => setCampaignOpen(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
          >
            <Plus className="size-4" /> New campaign
          </button>
        }
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Promotions & featuring"
      subtitle={`${activeCount} live campaign${activeCount === 1 ? "" : "s"} · ${scheduledCount} scheduled`}
      actions={
        <button
          type="button"
          onClick={() => setCampaignOpen(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
        >
          <Plus className="size-4" /> New campaign
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Campaign volume" value={naira(totalVolume)} tone="primary" />
        <StatCard label="Total redemptions" value={totalUses.toLocaleString()} />
        <StatCard label="Active campaigns" value={String(activeCount)} tone="gold" />
        <StatCard label="Featured placements" value={`${featuredSlugs.length} / 8`} />
      </div>

      <div className="mt-6 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Panel>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Megaphone className="size-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Platform campaigns</h2>
                    <p className="text-xs text-muted-foreground">
                      Manage promotional codes and campaign performance.
                    </p>
                  </div>
                </div>
              </div>
              <span className="w-fit rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                {promotions.length} campaigns
              </span>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={campaignSearch}
                onChange={(event) => setCampaignSearch(event.target.value)}
                placeholder="Search campaign or code..."
                className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </Panel>

          <div className="space-y-3">
            {visiblePromotions.length > 0 ? (
              visiblePromotions.map((campaign) => (
                <Panel key={campaign.id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <TicketPercent className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-mono text-sm font-semibold tracking-wide">
                            {campaign.code}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${campaign.active ? "bg-success/10 text-success" : "bg-gold/10 text-gold-foreground"}`}
                          >
                            {campaign.active ? "Active" : "Scheduled"}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{campaign.id}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 sm:min-w-[210px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Redemptions</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {campaign.current_uses?.toLocaleString() ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Order volume</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {naira(
                            ((campaign.discount_value ?? 0) * (campaign.current_uses ?? 0)) / 100,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Panel>
              ))
            ) : (
              <Panel>
                <div className="py-10 text-center">
                  <Search className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-semibold">No campaigns found</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try searching with another campaign name or code.
                  </p>
                </div>
              </Panel>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Panel>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-xl bg-gold/10 text-gold-foreground">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Featured businesses</h2>
                  <p className="text-xs text-muted-foreground">Editorial placements</p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
                {featuredSlugs.length}/8
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Slots occupied</span>
                <span className="font-medium">{Math.round((featuredSlugs.length / 8) * 100)}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(featuredSlugs.length / 8) * 100}%` }}
                />
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={vendorSearch}
                onChange={(event) => setVendorSearch(event.target.value)}
                placeholder="Find a business..."
                className="h-9 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary/50"
              />
            </div>
            <ul className="mt-3 space-y-2">
              {featuredSlugs.map((slug) => {
                const match = promotions.find((p) => p.vendors?.slug === slug);
                return (
                  <li
                    key={slug}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {slug.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">
                        {match?.vendors?.name ?? "Vendor"}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {match?.vendors?.slug ?? slug}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-pressed={true}
                      onClick={() => toggleFeatured(slug)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      aria-label={`Remove ${match?.vendors?.name ?? slug} from featured`}
                    >
                      <Check className="size-4" />
                    </button>
                  </li>
                );
              })}
              {featuredSlugs.length === 0 && (
                <li className="py-6 text-center text-xs text-muted-foreground">
                  No featured businesses.
                </li>
              )}
            </ul>
            <div className="mt-4 flex items-start gap-2 border-t border-border pt-3">
              <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-5 text-muted-foreground">
                Featured placement is editorial only. It does not grant a verification badge or
                imply platform endorsement.
              </p>
            </div>
          </Panel>

          <Panel title="Campaign snapshot">
            <div className="mt-3 space-y-3">
              {[
                { label: "Live campaigns", value: activeCount },
                { label: "Scheduled campaigns", value: scheduledCount },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </Panel>
        </aside>
      </div>

      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <DialogTitle className="text-base">Create a campaign</DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Set up a promotional campaign draft for the Peniel marketplace.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const code = String(form.get("code") ?? "")
                .trim()
                .toUpperCase();
              const description = String(form.get("description") ?? "").trim();
              if (!code || !description || promotions.some((campaign) => campaign.code === code)) {
                toast.error("Enter a unique campaign code and description.");
                return;
              }
              toast.success(`${code} added as a scheduled campaign.`);
              setCampaignOpen(false);
            }}
          >
            <label className="block text-xs font-semibold">
              Campaign code
              <input
                required
                name="code"
                maxLength={30}
                placeholder="e.g. WELCOME10"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <label className="block text-xs font-semibold">
              Offer description
              <input
                required
                name="description"
                maxLength={120}
                placeholder="Describe what customers will receive"
                className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </label>
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setCampaignOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" /> Save campaign draft
              </button>
            </div>
          </form>
          <p className="text-[11px] leading-5 text-muted-foreground">
            Campaigns and featured placements are currently local to this prototype. Saving a draft
            does not launch a public promotion.
          </p>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
