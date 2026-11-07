
import { createFileRoute } from "@tanstack/react-router";
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
import { useMemo, useState } from "react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, vendors } from "@/lib/data";
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

type Campaign = [string, string, "Active" | "Scheduled" | "Ended", number, number];

const initialCampaigns: Campaign[] = [
  ["PENIEL5K", "₦5,000 off first order platform-wide", "Active", 4128, 20640000],
  ["FREEDELIVERY", "Free delivery weekend, Lagos only", "Scheduled", 0, 0],
  ["INDEPENDENCE", "Independence Day food festival", "Ended", 9840, 41200000],
];

function AdminPromotions() {
  const [campaignList, setCampaignList] = useState<Campaign[]>(initialCampaigns);
  const [featuredSlugs, setFeaturedSlugs] = useState(
    vendors.slice(0, 4).map((vendor) => vendor.slug),
  );
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [campaignSearch, setCampaignSearch] = useState("");

  const activeCount = campaignList.filter((c) => c[2] === "Active").length;
  const scheduledCount = campaignList.filter((c) => c[2] === "Scheduled").length;
  const totalUses = campaignList.reduce((sum, c) => sum + c[3], 0);
  const totalVolume = campaignList.reduce((sum, c) => sum + c[4], 0);

  const visibleCampaigns = useMemo(
    () =>
      campaignList.filter((campaign) =>
        `${campaign[0]} ${campaign[1]} ${campaign[2]}`
          .toLowerCase()
          .includes(campaignSearch.toLowerCase()),
      ),
    [campaignList, campaignSearch],
  );

  const visibleVendors = useMemo(
    () =>
      vendors
        .slice(0, 6)
        .filter((vendor) =>
          `${vendor.name} ${vendor.categoryLabel}`
            .toLowerCase()
            .includes(vendorSearch.toLowerCase()),
        ),
    [vendorSearch],
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

  const statusStyle = (status: Campaign[2]) => {
    if (status === "Active") {
      return "bg-success/10 text-success";
    }
    if (status === "Scheduled") {
      return "bg-gold/10 text-gold-foreground";
    }
    return "bg-muted text-muted-foreground";
  };

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
          <Plus className="size-4" />
          New campaign
        </button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Campaign volume"
          value={naira(totalVolume)}
          tone="primary"
        />
        <StatCard label="Total redemptions" value={totalUses.toLocaleString()} />
        <StatCard
          label="Active campaigns"
          value={String(activeCount)}
          tone="gold"
        />
        <StatCard
          label="Featured placements"
          value={`${featuredSlugs.length} / 8`}
        />
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
                {campaignList.length} campaigns
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
            {visibleCampaigns.length > 0 ? (
              visibleCampaigns.map((campaign) => (
                <Panel key={campaign[0]}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                        <TicketPercent className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-mono text-sm font-semibold tracking-wide">
                            {campaign[0]}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(campaign[2])}`}
                          >
                            {campaign[2]}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign[1]}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-3 sm:min-w-[210px] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Redemptions</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {campaign[3].toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-foreground">Order volume</p>
                        <p className="mt-1 text-sm font-semibold tabular-nums">
                          {naira(campaign[4])}
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
                  <p className="text-xs text-muted-foreground">
                    Editorial placements
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold tabular-nums">
                {featuredSlugs.length}/8
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Slots occupied</span>
                <span className="font-medium">
                  {Math.round((featuredSlugs.length / 8) * 100)}%
                </span>
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
              {visibleVendors.map((vendor) => {
                const isFeatured = featuredSlugs.includes(vendor.slug);

                return (
                  <li
                    key={vendor.slug}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {vendor.monogram}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold">
                        {vendor.name}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {vendor.categoryLabel}
                      </span>
                    </span>
                    <button
                      type="button"
                      aria-pressed={isFeatured}
                      onClick={() => toggleFeatured(vendor.slug)}
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition ${
                        isFeatured
                          ? "bg-primary/10 text-primary"
                          : "border border-border text-muted-foreground hover:bg-muted"
                      }`}
                      aria-label={
                        isFeatured
                          ? `Remove ${vendor.name} from featured`
                          : `Feature ${vendor.name}`
                      }
                    >
                      {isFeatured ? (
                        <Check className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </button>
                  </li>
                );
              })}
              {visibleVendors.length === 0 && (
                <li className="py-6 text-center text-xs text-muted-foreground">
                  No matching businesses.
                </li>
              )}
            </ul>

            <div className="mt-4 flex items-start gap-2 border-t border-border pt-3">
              <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <p className="text-[11px] leading-5 text-muted-foreground">
                Featured placement is editorial only. It does not grant a
                verification badge or imply platform endorsement.
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">Campaign snapshot</h3>
            </div>
            <div className="mt-3 space-y-3">
              {[
                { label: "Live campaigns", value: activeCount },
                { label: "Scheduled campaigns", value: scheduledCount },
                {
                  label: "Ended campaigns",
                  value: campaignList.filter((c) => c[2] === "Ended").length,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
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

              if (
                !code ||
                !description ||
                campaignList.some((campaign) => campaign[0] === code)
              ) {
                toast.error("Enter a unique campaign code and description.");
                return;
              }

              const campaign: Campaign = [code, description, "Scheduled", 0, 0];
              setCampaignList((current) => [campaign, ...current]);
              setCampaignOpen(false);
              toast.success(`${code} added as a scheduled campaign.`);
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
                <Plus className="size-4" />
                Save campaign draft
              </button>
            </div>
          </form>

          <p className="text-[11px] leading-5 text-muted-foreground">
            Campaigns and featured placements are currently local to this
            prototype. Saving a draft does not launch a public promotion.
          </p>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
