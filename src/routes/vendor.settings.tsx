import { createFileRoute } from "@tanstack/react-router";
import { Copy, ImagePlus, ShieldCheck } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";

export const Route = createFileRoute("/vendor/settings")({
  head: () => ({
    meta: [
      { title: "Store settings — Vendra business console" },
      { name: "description", content: "Update your business details, branding, opening hours, delivery zones and storefront link." },
      { property: "og:title", content: "Store settings — Vendra business console" },
      { property: "og:description", content: "Control how your storefront looks and works." },
    ],
  }),
  component: VendorSettings,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function VendorSettings() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Store settings"
      subtitle="Everything customers see about your business"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Save changes</button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Business details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>Business name</span>
                <input className={field} defaultValue="Abigail's Kitchen" />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Tagline</span>
                <input className={field} defaultValue="Home-style Nigerian cooking, made fresh daily" />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>About</span>
                <textarea rows={4} className={field} defaultValue="We cook the food you grew up on, with produce bought fresh every morning at Obalende market." />
              </div>
              <div>
                <span className={label}>Phone</span>
                <input className={field} defaultValue="+234 803 000 0000" />
              </div>
              <div>
                <span className={label}>Email</span>
                <input className={field} defaultValue="hello@abigailskitchen.ng" />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Address</span>
                <input className={field} defaultValue="14 Awolowo Road, Ikoyi, Lagos" />
              </div>
            </div>
          </Panel>

          <Panel title="Branding">
            <div className="grid gap-4 sm:grid-cols-2">
              {["Logo", "Cover image"].map((t) => (
                <div key={t}>
                  <span className={label}>{t}</span>
                  <div className="grid h-32 place-items-center rounded-xl border border-dashed border-border bg-muted/40">
                    <ImagePlus className="size-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <span className={label}>Brand colour</span>
              <div className="flex gap-2">
                {["#14532d", "#7c2d12", "#1e3a5f", "#c2410c", "#4c1d95"].map((c, i) => (
                  <span key={c} className={"size-9 rounded-full " + (i === 0 ? "ring-2 ring-primary ring-offset-2" : "")} style={{ background: c }} />
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Opening hours">
            <ul className="space-y-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <li key={d} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <span className="truncate text-sm font-medium">{d}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <input className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue="10:00" />
                    <span className="text-muted-foreground">–</span>
                    <input className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-sm" defaultValue="21:00" />
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Delivery">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>Delivery fee</span>
                <input className={field} defaultValue="2500" />
              </div>
              <div>
                <span className={label}>Free delivery above</span>
                <input className={field} defaultValue="50000" />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Delivery zones</span>
                <div className="flex flex-wrap gap-2">
                  {["Ikoyi", "Victoria Island", "Lekki Phase 1", "Yaba", "Surulere"].map((z) => (
                    <span key={z} className="rounded-full border border-primary bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
                      {z}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Storefront link">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs">
              <span className="min-w-0 flex-1 truncate font-semibold">vendra.ng/store/abigails-kitchen</span>
              <button className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary">
                <Copy className="size-3.5" /> Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Custom domains are coming in a later release. For now your Vendra link is permanent and shareable.
            </p>
          </Panel>

          <Panel title="Payments">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Handled by Vendra Pay
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no gateway keys to configure. Your payout account is managed under Payouts.
            </p>
          </Panel>

          <Panel title="Store status">
            <div className="space-y-3 text-sm">
              {[
                ["Storefront published", true],
                ["Accepting orders", true],
                ["Accepting bookings", true],
                ["Pause store temporarily", false],
              ].map(([t, on]) => (
                <label key={t as string} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{t as string}</span>
                  <span
                    className={
                      "relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-primary" : "bg-muted")
                    }
                  >
                    <span className={"absolute top-1 size-4 rounded-full bg-card transition " + (on ? "left-6" : "left-1")} />
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
