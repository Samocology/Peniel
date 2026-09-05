import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Plus, Share2 } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/promotions")({
  head: () => ({
    meta: [
      { title: "Promotions — Vendra business console" },
      { name: "description", content: "Run discounts, bundles and free-delivery offers, then measure exactly what each one earned you." },
      { property: "og:title", content: "Promotions — Vendra business console" },
      { property: "og:description", content: "Create offers that bring customers back." },
    ],
  }),
  component: VendorPromotions,
});

const promos = [
  ["WEEKEND10", "10% off orders above ₦20,000", "Active", 84, 612000],
  ["FREEDROP", "Free delivery within Ikoyi", "Active", 41, 298000],
  ["FIRSTBITE", "₦2,000 off first order", "Active", 128, 486000],
  ["EASTER24", "Bundle: jollof + suya", "Ended", 212, 1240000],
] as const;

function VendorPromotions() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Promotions"
      subtitle="3 offers live on your storefront"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> New promotion
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Revenue from offers" value={naira(1396000)} hint="Last 30 days" tone="primary" />
        <StatCard label="Redemptions" value="253" hint="Across 3 live offers" />
        <StatCard label="New customers won" value="61" hint="First-time buyers" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Your offers">
          <DataTable
            head={["Code", "Offer", "Status", "Uses", "Revenue", ""]}
            rows={promos.map((p) => [
              <span className="font-mono text-xs font-semibold">{p[0]}</span>,
              <span className="text-muted-foreground">{p[1]}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (p[2] === "Active" ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")
                }
              >
                {p[2]}
              </span>,
              p[3],
              naira(p[4]),
              <button className="text-xs font-semibold text-primary">Edit</button>,
            ])}
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Share your store">
            <p className="text-sm text-muted-foreground">
              Post your link anywhere. Customers land straight on your storefront, never on Vendra's homepage.
            </p>
            <div className="mt-3 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs font-semibold">
              vendra.ng/store/abigails-kitchen
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
                ["Bring back quiet customers", "31 customers haven't ordered in 60 days"],
                ["Weekend lunch bundle", "Saturdays are your strongest day"],
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
    </DashShell>
  );
}
