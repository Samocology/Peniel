import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, Share2 } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { useState } from "react";
import { toast } from "sonner";
import { naira } from "@/lib/data";
import { PlanGate } from "@/components/dash/plan-gate";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions - Peniel business console" },
      { name: "description", content: "Run discounts, bundles and free-delivery offers, then measure exactly what each one earned you." },
      { property: "og:title", content: "Promotions - Peniel business console" },
      { property: "og:description", content: "Create offers that bring customers back." },
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
  const redemptions = all.reduce((sum, promo) => sum + promo.uses, 0);
  const offerRevenue = all.reduce((sum, promo) => sum + promo.revenue, 0);
  const activityNoun = vendor.fulfilment === "order" ? "orders" : vendor.fulfilment === "booking" ? "appointments" : "reservations";
  const create = () => {
    if (!code.trim() || !offer.trim()) {
      toast.error("Add a code and describe the offer");
      return;
    }
    if (all.some((p) => p.code === code.trim().toUpperCase())) {
      toast.error("That code already exists");
      return;
    }
    app.addPromo(code.trim(), offer.trim());
    toast.success("Promotion is live on your storefront");
    setCode("");
    setOffer("");
    setOpen(false);
  };
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Promotions"
      subtitle={`${all.filter((p) => p.active).length} offers live on your storefront`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> New promotion
        </button>
      }
    >
      <PlanGate feature="Promotions">
      {open && (
        <Panel title="New promotion" className="mb-6">
          <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto]">
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))} placeholder="CODE" className="rounded-xl border border-input bg-background px-4 py-3 font-mono text-sm outline-none focus:border-primary" />
            <input value={offer} onChange={(e) => setOffer(e.target.value)} placeholder={`e.g. 15% off ${activityNoun}`} className="min-w-0 rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
            <button onClick={create} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Publish</button>
          </div>
        </Panel>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenue from offers" value={naira(offerRevenue)} hint="Recorded by this account" tone="primary" />
        <StatCard label="Redemptions" value={String(redemptions)} hint={`Across ${all.length} offers`} />
        <StatCard label="Active offers" value={String(all.filter((promo) => promo.active).length)} hint="For this storefront" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Your offers">
          {all.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No promotions have been created for this account yet.</p>
          ) : (
            <DataTable
              head={["Code", "Offer", "Status", "Uses", "Revenue", ""]}
              rows={all.map((p) => [
              <span className="font-mono text-xs font-semibold">{p.code}</span>,
              <span className="text-muted-foreground">{p.offer}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (p.active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")
                }
              >
                {p.active ? "Active" : "Paused"}
              </span>,
              p.uses,
              naira(p.revenue),
              account.promos.some((x) => x.code === p.code) ? (
                <button onClick={() => app.togglePromo(p.code)} className="text-xs font-semibold text-primary">{p.active ? "Pause" : "Resume"}</button>
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              ),
              ])}
            />
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Share your store">
            <p className="text-sm text-muted-foreground">
              Post your link anywhere. Customers land straight on your storefront, never on Peniel's homepage.
            </p>
            <div className="mt-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs font-semibold">
              peniel.com.ng/store/{vendor.slug}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["WhatsApp", "Instagram", "TikTok", "Facebook"].map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold">
                  <Share2 className="size-3" /> {s}
                </span>
              ))}
            </div>
          </Panel>

          <Panel title="Suggested for you">
            <ul className="space-y-3 text-sm">
              {[
                [`Promote your ${vendor.groups[0]?.toLowerCase() ?? "catalog"}`, `Create an offer to introduce customers to ${vendor.name}.`],
                [`Encourage repeat ${activityNoun}`, "Share your storefront link with returning customers."],
              ].map(([t, h]) => (
                <li key={t} className="flex gap-3 rounded-xl border border-border p-3.5">
                  <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block font-medium">{t}</span>
                    <span className="block text-xs text-muted-foreground">{h}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      </PlanGate>
    </DashShell>
  );
}
