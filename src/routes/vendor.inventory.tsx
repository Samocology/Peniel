import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, PackagePlus } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory - Peniel business console" },
      { name: "description", content: "Review live and hidden listings in your business catalog." },
      { property: "og:title", content: "Inventory - Peniel business console" },
      { property: "og:description", content: "Review listings and their storefront visibility." },
    ],
  }),
  component: VendorInventory,
});

function VendorInventory() {
  const { base, account } = useCurrentVendor();
  const products = [...base.products, ...(account.products ?? [])];
  const hidden = new Set(account.hidden);
  const liveCount = products.filter((product) => !hidden.has(product.id)).length;
  const hiddenCount = products.length - liveCount;

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Inventory"
      subtitle={`${products.length} catalog listings · ${liveCount} live on your storefront`}
      storeLink={{ label: "View storefront", slug: base.slug }}
      actions={
        <Link to="/vendor/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <PackagePlus className="size-4" /> Add listing
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total listings" value={`${products.length}`} tone="primary" />
        <StatCard label="Live" value={`${liveCount}`} hint="Visible on your storefront" />
        <StatCard label="Hidden" value={`${hiddenCount}`} hint="Not currently visible" tone="gold" />
      </div>

      <div className="mt-6">
        <Panel title="Catalog status">
          {products.length === 0 ? (
            <div className="py-10 text-center">
              <Boxes className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No listings yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Add your first item to start building your storefront.</p>
            </div>
          ) : (
            <>
              <DataTable
                head={["Listing", "Category", "Price", "Visibility"]}
                rows={products.map((product) => [
                  <span className="font-medium">{product.name}</span>,
                  <span className="text-muted-foreground">{product.group}</span>,
                  naira(product.price),
                  <span className={"rounded-full px-2.5 py-1 text-xs font-semibold " + (hidden.has(product.id) ? "bg-muted text-muted-foreground" : "bg-success/12 text-success")}>
                    {hidden.has(product.id) ? "Hidden" : "Live"}
                  </span>,
                ])}
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Quantity-level stock tracking isn’t enabled yet. Control storefront visibility from your catalog.
              </p>
            </>
          )}
          <Link to="/vendor/products" className="mt-4 inline-flex text-xs font-semibold text-primary">
            Manage catalog →
          </Link>
        </Panel>
      </div>
    </DashShell>
  );
}
