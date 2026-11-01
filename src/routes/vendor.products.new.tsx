import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import type { Product } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/products/new")({
  head: () => ({
    meta: [
      { title: "Add a product - Peniel business console" },
      { name: "description", content: "Create a product with photos, price, options, stock and delivery settings, then publish it to your storefront." },
      { property: "og:title", content: "Add a product - Peniel" },
      { property: "og:description", content: "Create and publish a new item on your storefront." },
    ],
  }),
  component: NewProduct,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function NewProduct() {
  const { vendor } = useCurrentVendor();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const itemLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "menu item"
      : vendor.type === "beauty"
        ? "service"
        : vendor.type === "hotel"
          ? "room"
          : "product";
  const catalogLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "menu item"
      : vendor.type === "beauty"
        ? "service"
        : vendor.type === "hotel"
          ? "room"
          : "product";

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const numericPrice = Number(form.get("price"));
    const productName = String(form.get("name") ?? "").trim();
    if (!productName) {
      toast.error(`Enter a name for this ${itemLabel}`);
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    const details = String(form.get("details") ?? "").trim();
    const product: Product = {
      id: `${vendor.slug}-${Date.now().toString(36)}`,
      name: productName,
      desc: String(form.get("description") ?? "").trim(),
      price: numericPrice,
      group: String(form.get("group") ?? vendor.groups[0] ?? "General"),
      ...(details ? { meta: details } : {}),
    };
    app.addProduct(product);
    toast.success(`${product.name} added to your ${catalogLabel} and storefront`);
    void navigate({ to: "/vendor/products" });
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={`Add ${itemLabel}`}
      subtitle={`Add a ${catalogLabel} to ${vendor.name}'s storefront.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <>
          <Link to="/vendor/products" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            Cancel
          </Link>
          <button type="submit" form="new-product" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Publish {itemLabel}
          </button>
        </>
      }
    >
      <form id="new-product" onSubmit={publish} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Basics">
            <div className="space-y-4">
              <div>
                <label htmlFor="product-name" className={label}>{catalogLabel} name</label>
                <input id="product-name" name="name" required maxLength={100} className={field} placeholder={vendor.products[0]?.name ?? `Name your ${itemLabel}`} value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <label htmlFor="product-description" className={label}>Description</label>
                <textarea id="product-description" name="description" rows={3} maxLength={500} className={field} placeholder={`Describe this ${itemLabel} for customers`} value={description} onChange={(event) => setDescription(event.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="product-group" className={label}>Category</label>
                  <select id="product-group" name="group" className={field} required defaultValue={vendor.groups[0]}>
                    {vendor.groups.map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="product-price" className={label}>Price (₦)</label>
                  <input id="product-price" name="price" className={field} type="number" min="0" step="1" required placeholder="15000" value={price} onChange={(event) => setPrice(event.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="product-details" className={label}>Additional details</label>
                  <input
                    id="product-details"
                    name="details"
                    className={field}
                    placeholder={
                      vendor.type === "beauty"
                        ? "e.g. 60 min"
                        : vendor.type === "hotel"
                          ? "e.g. per night, sleeps 2"
                          : vendor.type === "restaurant" || vendor.type === "bakery"
                            ? "e.g. serves 10, 48 hours notice"
                            : vendor.type === "fresh-food"
                              ? "e.g. 1 kg, cleaned and packed"
                              : "e.g. size, colour or warranty"
                    }
                  />
                </div>
              </div>
            </div>
          </Panel>

        </div>

        <div className="space-y-6">
          <Panel title="Publishing">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your listing will be added to {vendor.name} and appear in the selected category after publishing.
            </p>
          </Panel>

          <Panel title="Live preview">
            <div className="rounded-xl border border-border p-3">
              <div className="grid h-28 place-items-center rounded-lg bg-primary-soft text-xs text-muted-foreground">{vendor.categoryLabel}</div>
              <p className="mt-3 font-semibold">{name || `Your ${itemLabel} name`}</p>
              <p className="text-xs text-muted-foreground">{description || "Your description will appear here."}</p>
              <p className="mt-2 font-display font-bold text-primary">{price ? `₦${Number(price).toLocaleString("en-NG")}` : "Set a price"}</p>
            </div>
          </Panel>
        </div>
      </form>
    </DashShell>
  );
}
