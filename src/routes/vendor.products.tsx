import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Pencil, Plus, Search } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { getVendor, naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({
    meta: [
      { title: "Products — Vendra business console" },
      { name: "description", content: "Manage your menu and products: prices, stock, categories and visibility on your storefront." },
      { property: "og:title", content: "Products — Vendra business console" },
      { property: "og:description", content: "Add, edit and organise everything you sell." },
    ],
  }),
  component: VendorProducts,
});

function VendorProducts() {
  const vendor = getVendor("abigails-kitchen")!;

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Products"
      subtitle={`${vendor.products.length} items on your storefront`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <Link to="/vendor/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> Add product
        </Link>
      }
    >
      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold">
            <Filter className="size-4" /> Filter
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {["All", ...vendor.groups].map((g, i) => (
            <span
              key={g}
              className={
                "rounded-full border px-3.5 py-1.5 " +
                (i === 0 ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted-foreground")
              }
            >
              {g}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <DataTable
            head={["Product", "Category", "Price", "Stock", "Status", ""]}
            rows={vendor.products.map((p, i) => [
              <span className="flex min-w-0 items-center gap-3">
                <span className="size-9 shrink-0 rounded-lg bg-primary-soft" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.desc}</span>
                </span>
              </span>,
              <span className="text-muted-foreground">{p.group}</span>,
              naira(p.price),
              <span className={i === 2 ? "font-semibold text-gold-foreground" : ""}>{i === 2 ? "3 left" : "In stock"}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (i === 4 ? "bg-muted text-muted-foreground" : "bg-success/12 text-success")
                }
              >
                {i === 4 ? "Hidden" : "Live"}
              </span>,
              <Link to="/vendor/products/new" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Pencil className="size-3.5" /> Edit
              </Link>,
            ])}
          />
        </div>
      </Panel>
    </DashShell>
  );
}
