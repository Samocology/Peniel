import { createFileRoute } from "@tanstack/react-router";
import { Copy, ImagePlus, ShieldCheck } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { toast } from "sonner";
import { app, useCurrentVendor } from "@/lib/peniel-store";
import { TemplatePicker } from "@/components/store/template-picker";

export const Route = createFileRoute("/vendor/settings")({
  head: () => ({
    meta: [
      { title: "Store settings - Peniel business console" },
      { name: "description", content: "Update your business details, branding, opening hours, delivery zones and storefront link." },
      { property: "og:title", content: "Store settings - Peniel business console" },
      { property: "og:description", content: "Control how your storefront looks and works." },
    ],
  }),
  component: VendorSettings,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function VendorSettings() {
  const { vendor, base, account } = useCurrentVendor();
  const p = account.profile;
  const save = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    app.saveProfile({
      name: g("name"),
      tagline: g("tagline"),
      about: g("about"),
      location: g("location"),
      hours: g("hours"),
      delivery: g("delivery"),
      deliveryFee: Number(g("deliveryFee")) || 0,
      freeAbove: Number(g("freeAbove")) || 0,
      published: f.get("published") === "on",
      ...(vendor.fulfilment === "order"
        ? { acceptingOrders: f.get("acceptingOrders") === "on" }
        : { acceptingBookings: f.get("acceptingBookings") === "on" }),
      paused: f.get("paused") === "on",
    });
    toast.success("Store settings saved - your storefront is updated");
  };
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Store settings"
      subtitle="Everything customers see about your business"
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button type="submit" form="store-settings" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Save changes</button>
      }
    >
      <form id="store-settings" key={base.slug} onSubmit={save} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Business details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <span className={label}>Business name</span>
                <input name="name" required className={field} defaultValue={vendor.name} />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Tagline</span>
                <input name="tagline" className={field} defaultValue={vendor.tagline} />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>About</span>
                <textarea name="about" rows={4} className={field} defaultValue={vendor.about} />
              </div>
              <div>
                <span className={label}>Phone</span>
                <input className={field} defaultValue={base.phone} readOnly />
                <span className="mt-1 block text-[11px] text-muted-foreground">Private - never shown to customers.</span>
              </div>
              <div>
                <span className={label}>Email</span>
                <input className={field} defaultValue={base.email} readOnly />
              </div>
              <div className="sm:col-span-2">
                <span className={label}>Address</span>
                <input name="location" className={field} defaultValue={vendor.location} />
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

          <Panel title="Storefront design">
            <TemplatePicker vendor={base} />
          </Panel>

          <Panel title="Opening hours">
            <label htmlFor="business-hours" className={label}>Hours shown to customers</label>
            <textarea id="business-hours" name="hours" rows={2} className={field} defaultValue={vendor.hours} />
          </Panel>

          {vendor.fulfilment === "order" ? (
            <Panel title="Delivery">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={label}>Delivery fee (₦)</span>
                  <input name="deliveryFee" type="number" min="0" inputMode="numeric" className={field} defaultValue={p.deliveryFee ?? 2500} />
                </div>
                <div>
                  <span className={label}>Free delivery above (₦)</span>
                  <input name="freeAbove" type="number" min="0" inputMode="numeric" className={field} defaultValue={p.freeAbove ?? 50000} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="delivery-details" className={label}>Delivery details</label>
                  <textarea id="delivery-details" name="delivery" rows={2} className={field} defaultValue={vendor.delivery} />
                </div>
              </div>
            </Panel>
          ) : (
            <Panel title={vendor.fulfilment === "reservation" ? "Guest information" : "Service area"}>
              <label htmlFor="delivery-details" className={label}>
                {vendor.fulfilment === "reservation" ? "Reservation details" : "In-person and home service details"}
              </label>
              <textarea id="delivery-details" name="delivery" rows={3} className={field} defaultValue={vendor.delivery} />
            </Panel>
          )}
        </div>

        <div className="space-y-6">
          <Panel title="Storefront link">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs">
              <span className="min-w-0 flex-1 truncate font-semibold">peniel.com.ng/store/{base.slug}</span>
              <button type="button" onClick={() => navigator.clipboard.writeText(window.location.origin + "/store/" + base.slug).then(() => toast.success("Link copied"))} className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary">
                <Copy className="size-3.5" /> Copy
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Custom domains are coming in a later release. For now your Peniel link is permanent and shareable.
            </p>
          </Panel>

          <Panel title="Payments">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Handled by Peniel Pay
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              There are no gateway keys to configure. Your payout estimates and bank details are managed under Finance.
            </p>
          </Panel>

          <Panel title="Store status">
            <div className="space-y-3 text-sm">
              {([
                ["published", "Storefront published", p.published ?? true],
                ...(vendor.fulfilment === "order"
                  ? [["acceptingOrders", "Accepting orders", p.acceptingOrders ?? true] as const]
                  : [["acceptingBookings", vendor.fulfilment === "reservation" ? "Accepting reservations" : "Accepting appointments", p.acceptingBookings ?? true] as const]),
                ["paused", "Pause store temporarily", p.paused ?? false],
              ] as const).map(([k, t, on]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{t}</span>
                  <input type="checkbox" name={k} defaultChecked={on} className="peer sr-only" />
                  <span className="relative h-6 w-11 shrink-0 rounded-full bg-muted transition peer-checked:bg-primary peer-checked:[&>span]:left-6 peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                    <span className="absolute top-1 left-1 size-4 rounded-full bg-card transition-all" />
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </div>
      </form>
    </DashShell>
  );
}
