import { createFileRoute } from "@tanstack/react-router";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
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

const campaigns: Campaign[] = [
  ["PENIEL5K", "₦5,000 off first order platform-wide", "Active", 4128, 20640000],
  ["FREEDELIVERY", "Free delivery weekend, Lagos only", "Scheduled", 0, 0],
  ["INDEPENDENCE", "Independence Day food festival", "Ended", 9840, 41200000],
];

function AdminPromotions() {
  const [campaignList, setCampaignList] = useState<Campaign[]>(campaigns);
  const [featuredSlugs, setFeaturedSlugs] = useState(
    vendors.slice(0, 4).map((vendor) => vendor.slug),
  );
  const [campaignOpen, setCampaignOpen] = useState(false);

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Promotions & featuring"
      subtitle={`${campaignList.filter((campaign) => campaign[2] === "Active").length} campaign${campaignList.filter((campaign) => campaign[2] === "Active").length === 1 ? "" : "s"} live · ${campaignList.filter((campaign) => campaign[2] === "Scheduled").length} scheduled`}
      actions={
        <button
          type="button"
          onClick={() => setCampaignOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <Plus className="size-4" /> New campaign
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Campaign volume" value={naira(61840000)} tone="primary" />
        <StatCard label="Redemptions" value="13,968" />
        <StatCard label="Featured slots used" value={`${featuredSlugs.length} of 8`} tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Platform campaigns">
          <DataTable
            head={["Code", "Campaign", "Status", "Uses", "Volume"]}
            rows={campaignList.map((c) => [
              <span className="font-mono text-xs font-semibold">{c[0]}</span>,
              <span className="text-muted-foreground">{c[1]}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (c[2] === "Active"
                    ? "bg-success/12 text-success"
                    : c[2] === "Scheduled"
                      ? "bg-gold/15 text-gold-foreground"
                      : "bg-muted text-muted-foreground")
                }
              >
                {c[2]}
              </span>,
              c[3].toLocaleString(),
              naira(c[4]),
            ])}
          />
        </Panel>

        <Panel title="Featured businesses">
          <ul className="space-y-3">
            {vendors.slice(0, 6).map((v) => (
              <li
                key={v.slug}
                className="flex items-center gap-3 rounded-xl border border-border p-3"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  {v.monogram}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{v.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {v.categoryLabel}
                  </span>
                </span>
                <button
                  type="button"
                  aria-pressed={featuredSlugs.includes(v.slug)}
                  onClick={() => {
                    setFeaturedSlugs((current) =>
                      current.includes(v.slug)
                        ? current.filter((slug) => slug !== v.slug)
                        : current.length < 8
                          ? [...current, v.slug]
                          : current,
                    );
                    if (!featuredSlugs.includes(v.slug) && featuredSlugs.length >= 8)
                      toast.error("All featured slots are in use.");
                  }}
                  className={
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold " +
                    (featuredSlugs.includes(v.slug)
                      ? "bg-gold/15 text-gold-foreground"
                      : "border border-border text-muted-foreground")
                  }
                >
                  {featuredSlugs.includes(v.slug) ? "Featured" : "Add"}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <Sparkles className="size-4 shrink-0 text-primary" />
            Featuring is editorial placement only. It never grants a verification badge.
          </p>
        </Panel>
      </div>
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan a platform campaign</DialogTitle>
            <DialogDescription>
              Create a scheduled campaign code for this prototype dashboard.
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
              if (!code || !description || campaignList.some((campaign) => campaign[0] === code)) {
                toast.error("Enter a unique campaign code and description.");
                return;
              }
              const campaign: Campaign = [code, description, "Scheduled", 0, 0];
              setCampaignList((current) => [campaign, ...current]);
              setCampaignOpen(false);
              toast.success(`${code} added as a scheduled campaign.`);
            }}
          >
            <label className="block text-sm font-medium">
              Campaign code
              <input
                required
                name="code"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 uppercase"
              />
            </label>
            <label className="block text-sm font-medium">
              Offer description
              <input
                required
                name="description"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Save campaign draft
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Campaigns and featured placements are local to this prototype; no public promotion is
            launched.
          </p>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
