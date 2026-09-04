import { createFileRoute, Link } from "@tanstack/react-router";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { getVendor } from "@/lib/data";

export const Route = createFileRoute("/vendor/products/new")({
  head: () => ({
    meta: [
      { title: "Add a product — Vendra business console" },
      { name: "description", content: "Create a product with photos, price, options, stock and delivery settings, then publish it to your storefront." },
      { property: "og:title", content: "Add a product — Vendra" },
      { property: "og:description", content: "Create and publish a new item on your storefront." },
    ],
  }),
  component: NewProduct,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function NewProduct() {
  const vendor = getVendor("abigails-kitchen")!;

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Add a product"
      subtitle="Customers see this on your storefront as soon as you publish."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <>
          <Link to="/vendor/products" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            Cancel
          </Link>
          <Link to="/vendor/products" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Publish product
          </Link>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Basics">
            <div className="space-y-4">
              <div>
                <span className={label}>Product name</span>
                <input className={field} placeholder="Jollof Rice (Party Size)" />
              </div>
              <div>
                <span className={label}>Description</span>
                <textarea rows={3} className={field} placeholder="Smoky party jollof cooked over firewood, served with your choice of protein." />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={label}>Category</span>
                  <select className={field}>
                    {vendor.groups.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className={label}>Price (₦)</span>
                  <input className={field} placeholder="15000" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Photos">
            <div className="grid gap-3 sm:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="grid h-28 place-items-center rounded-xl border border-dashed border-border bg-muted/40">
                  <ImagePlus className="size-5 text-muted-foreground" />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">First photo becomes the cover. Square images work best.</p>
          </Panel>

          <Panel title="Options & modifiers" action={<button className="inline-flex items-center gap-1 text-xs font-semibold text-primary"><Plus className="size-3.5" /> Add group</button>}>
            {[
              ["Size", "Regular (₦0), Large (₦6,000)"],
              ["Add protein", "Chicken (₦2,500), Beef (₦3,000), Goat meat (₦4,000)"],
            ].map(([n, v]) => (
              <div key={n} className="mb-3 grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-[160px_minmax(0,1fr)_auto] sm:items-center">
                <input className={field} defaultValue={n} />
                <input className={field} defaultValue={v} />
                <button aria-label="Remove option group" className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Availability">
            <div className="space-y-4">
              <div>
                <span className={label}>Stock</span>
                <input className={field} placeholder="25" />
              </div>
              <div>
                <span className={label}>Preparation time</span>
                <select className={field}>
                  <option>Under 30 mins</option>
                  <option>30–60 mins</option>
                  <option>Same day</option>
                  <option>48 hours notice</option>
                </select>
              </div>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" defaultChecked className="accent-primary" /> Available for delivery
              </label>
              <label className="flex items-center gap-3 text-sm">
                <input type="checkbox" defaultChecked className="accent-primary" /> Available for pickup
              </label>
            </div>
          </Panel>

          <Panel title="Live preview">
            <div className="rounded-xl border border-border p-3">
              <div className="h-28 rounded-lg bg-primary-soft" />
              <p className="mt-3 font-semibold">Jollof Rice (Party Size)</p>
              <p className="text-xs text-muted-foreground">Smoky party jollof cooked over firewood</p>
              <p className="mt-2 font-display font-bold text-primary">₦15,000</p>
            </div>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
