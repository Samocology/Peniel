import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Plus } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { naira } from "@/lib/data";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/services")({
  head: () => ({
    meta: [
      { title: "Services - Peniel business console" },
      { name: "description", content: "Manage the services listed on your storefront." },
      { property: "og:title", content: "Services - Peniel business console" },
      { property: "og:description", content: "Manage the services listed on your storefront." },
    ],
  }),
  component: VendorServices,
});

function VendorServices() {
  const { vendor } = useCurrentVendor();
  const isServiceBusiness = vendor.fulfilment === "booking";

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={isServiceBusiness ? "Services" : "Catalog"}
      subtitle={
        isServiceBusiness
          ? `Services offered by ${vendor.name}`
          : `${vendor.categoryLabel} businesses manage their listings in the catalog.`
      }
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        isServiceBusiness ? (
          <Link to="/vendor/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            <Plus className="size-4" /> Add service
          </Link>
        ) : undefined
      }
    >
      {isServiceBusiness ? (
        <Panel title="Service catalog">
          {vendor.products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No services have been added yet.</p>
          ) : (
            <DataTable
              head={["Service", "Category", "Price", "Duration", ""]}
              rows={vendor.products.map((product) => [
                <span className="font-medium">{product.name}</span>,
                <span className="text-muted-foreground">{product.group}</span>,
                naira(product.price),
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-3.5" /> {product.meta ?? "Not specified"}
                </span>,
                <Link to="/vendor/products" className="text-xs font-semibold text-primary">Manage</Link>,
              ])}
            />
          )}
        </Panel>
      ) : (
        <Panel title="Manage your catalog">
          <p className="text-sm text-muted-foreground">
            Services aren’t enabled for this fulfilment type. Manage your {vendor.type === "hotel" ? "rooms" : "products"} instead.
          </p>
          <Link to="/vendor/products" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Open catalog
          </Link>
        </Panel>
      )}
    </DashShell>
  );
}
