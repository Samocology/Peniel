
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Eye, Package, Plus, Store } from "lucide-react";
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
      {
        name: "description",
        content:
          "Create a product with photos, price, options, stock and delivery settings, then publish it to your storefront.",
      },
      { property: "og:title", content: "Add a product - Peniel" },
      {
        property: "og:description",
        content: "Create and publish a new item on your storefront.",
      },
    ],
  }),
  component: NewProduct,
});

const field =
  "w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10";

const label =
  "mb-1.5 block text-xs font-semibold text-foreground";

function NewProduct() {
  const { vendor } = useCurrentVendor();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [details, setDetails] = useState("");
  const [group, setGroup] = useState(vendor.groups[0] ?? "General");
  const [publishing, setPublishing] = useState(false);

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
      ? "Menu item"
      : vendor.type === "beauty"
        ? "Service"
        : vendor.type === "hotel"
          ? "Room"
          : "Product";

  const detailsPlaceholder =
    vendor.type === "beauty"
      ? "e.g. 60 min"
      : vendor.type === "hotel"
        ? "e.g. per night, sleeps 2"
        : vendor.type === "restaurant" || vendor.type === "bakery"
          ? "e.g. serves 10, 48 hours notice"
          : vendor.type === "fresh-food"
            ? "e.g. 1 kg, cleaned and packed"
            : "e.g. size, colour or warranty";

  const numericPrice = Number(price);
  const validPrice =
    price.trim() !== "" &&
    Number.isFinite(numericPrice) &&
    numericPrice >= 0;

  const publish = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (publishing) return;

    const productName = name.trim();

    if (!productName) {
      toast.error(`Enter a name for this ${itemLabel}`);
      return;
    }

    if (!validPrice) {
      toast.error("Enter a valid price");
      return;
    }

    const product: Product = {
      id: `${vendor.slug}-${Date.now().toString(36)}`,
      name: productName,
      desc: description.trim(),
      price: numericPrice,
      group: group.trim() || "General",
      ...(details.trim() ? { meta: details.trim() } : {}),
    };

    setPublishing(true);

    try {
      app.addProduct(product);
      toast.success(
        `${product.name} added to your ${itemLabel} catalogue`,
      );
      void navigate({ to: "/vendor/products" });
    } catch {
      setPublishing(false);
      toast.error("Unable to publish this item. Please try again.");
    }
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={`Add ${itemLabel}`}
      subtitle={`Create a new listing for ${vendor.name}.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <>
          <Link
            to="/vendor/products"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span>Back</span>
          </Link>
          <button
            type="submit"
            form="new-product"
            disabled={publishing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-4" />
            {publishing ? "Publishing..." : "Publish item"}
          </button>
        </>
      }
    >
      <form
        id="new-product"
        onSubmit={publish}
        className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        {/* Main form */}
        <div className="min-w-0 space-y-5">
          <Panel title="Item information">
            <div className="space-y-5">
              <div>
                <label htmlFor="product-name" className={label}>
                  {catalogLabel} name <span className="text-destructive">*</span>
                </label>
                <input
                  id="product-name"
                  name="name"
                  required
                  maxLength={100}
                  className={field}
                  placeholder={`Enter ${itemLabel} name`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Give customers a clear idea of what you're offering.
                </p>
              </div>

              <div>
                <label htmlFor="product-description" className={label}>
                  Description
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={4}
                  maxLength={500}
                  className={`${field} min-h-24 resize-y`}
                  placeholder={`Describe this ${itemLabel}, including what makes it special...`}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
                <div className="mt-1.5 flex justify-end">
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {description.length}/500
                  </span>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Pricing and classification">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="product-price" className={label}>
                  Price (₦) <span className="text-destructive">*</span>
                </label>
                <div className="flex h-11 items-center rounded-xl border border-border bg-background px-3.5 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <span className="mr-2 text-sm font-semibold text-muted-foreground">
                    ₦
                  </span>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    required
                    placeholder="15,000"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="product-group" className={label}>
                  Category
                </label>
                <select
                  id="product-group"
                  name="group"
                  className={field}
                  value={group}
                  onChange={(event) => setGroup(event.target.value)}
                >
                  <option value="General">General</option>
                  {vendor.groups
                    .filter((item) => item !== "General")
                    .map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                </select>
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Choose where this item belongs in your catalogue.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="product-details" className={label}>
                  Additional details
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </label>
                <input
                  id="product-details"
                  name="details"
                  className={field}
                  placeholder={detailsPlaceholder}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground">
                  Add useful information such as size, duration, quantity or
                  other specifications.
                </p>
              </div>
            </div>
          </Panel>

          {/* Mobile publishing action */}
          <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ready to publish?
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your item will be added to your storefront.
              </p>
            </div>
            <button
              type="submit"
              disabled={publishing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <CheckCircle2 className="size-4" />
              {publishing ? "Publishing..." : "Publish item"}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="min-w-0 space-y-5">
          <Panel title="Live preview">
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="relative grid h-36 place-items-center bg-muted/50">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="size-8 opacity-50" />
                  <span className="text-[11px]">
                    Product image not available
                  </span>
                </div>
                <span className="absolute left-3 top-3 rounded-full border border-border bg-card/90 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground backdrop-blur">
                  {group || "General"}
                </span>
              </div>

              <div className="p-3.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {vendor.name}
                </p>
                <h3 className="mt-1.5 break-words text-sm font-semibold text-foreground">
                  {name.trim() || `Your ${itemLabel} name`}
                </h3>
                <p className="mt-1.5 line-clamp-3 min-h-10 whitespace-pre-wrap text-xs leading-5 text-muted-foreground">
                  {description.trim() || "Your description will appear here."}
                </p>
                {details.trim() && (
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {details}
                  </p>
                )}
                <div className="mt-3 border-t border-border pt-3">
                  <p className="text-base font-bold text-primary">
                    {price.trim() && validPrice
                      ? `₦${numericPrice.toLocaleString("en-NG")}`
                      : "Set a price"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-xl bg-muted/50 p-3">
              <Eye className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-[11px] leading-5 text-muted-foreground">
                This is a preview of your listing. Your actual storefront
                appearance may vary depending on its layout.
              </p>
            </div>
          </Panel>

          <Panel title="Publishing details">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Store className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    Storefront
                  </p>
                  <p className="mt-0.5 break-words text-xs text-muted-foreground">
                    {vendor.name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Package className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    Listing status
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    New items are added to your catalogue when published.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <p className="text-xs font-semibold text-foreground">
              Before publishing
            </p>
            <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                Use a clear, recognisable name.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                Provide an accurate description.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
                Double-check your selling price.
              </li>
            </ul>
          </div>
        </aside>
      </form>
    </DashShell>
  );
}
