import { createFileRoute, Link } from "@tanstack/react-router";
import { Filter, Plus, Search } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { useState } from "react";
import { toast } from "sonner";
import { naira } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({
    meta: [
      { title: "Products - Peniel business console" },
      { name: "description", content: "Manage your menu and products: prices, stock, categories and visibility on your storefront." },
      { property: "og:title", content: "Products - Peniel business console" },
      { property: "og:description", content: "Add, edit and organise everything you sell." },
    ],
  }),
  component: VendorProducts,
});

function VendorProducts() {
  const { base, account } = useCurrentVendor();
  const vendor = { ...base, products: [...base.products, ...(account.products ?? [])] };
  const catalogLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "Menu"
      : vendor.type === "beauty"
        ? "Services"
        : vendor.type === "hotel"
          ? "Rooms"
          : "Products";
  const itemLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "menu items"
      : vendor.type === "beauty"
        ? "services"
        : vendor.type === "hotel"
          ? "rooms"
          : "products";
  const itemTypeLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "Menu item"
      : vendor.type === "beauty"
        ? "Service"
        : vendor.type === "hotel"
          ? "Room"
          : "Product";
  const [q, setQ] = useState("");
  const [g, setG] = useState("All");
  const list = vendor.products.filter((p) => (g === "All" || p.group === g) && p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={catalogLabel}
      subtitle={`${vendor.products.length} ${itemLabel} on your storefront`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <Link to="/vendor/products/new" className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> Add {itemTypeLabel.toLowerCase()}
        </Link>
      }
    >
      <Panel>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button onClick={() => { setQ(""); setG("All"); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-4 text-sm font-semibold">
            <Filter className="size-4" /> Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {["All", ...vendor.groups].map((x) => (
            <button
              key={x}
              onClick={() => setG(x)}
              className={
                "rounded-full border px-3.5 py-1.5 " +
                (x === g ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted-foreground")
              }
            >
              {x}
            </button>
          ))}
        </div>

        <div className="mt-5">
          <DataTable
            head={[itemTypeLabel, "Category", "Price", "Details", "Status"]}
            rows={list.map((p) => [
              <span className="flex min-w-0 items-center gap-3">
                <span className="size-9 shrink-0 rounded-lg bg-primary-soft" />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{p.desc}</span>
                </span>
              </span>,
              <span className="text-muted-foreground">{p.group}</span>,
              naira(p.price),
              <span className="text-muted-foreground">{p.meta ?? "Details not set"}</span>,
              <button
                onClick={() => {
                  const hidden = account.hidden.includes(p.id);
                  app.toggleHidden(p.id);
                  toast.success(hidden ? `${p.name} is live on your store` : `${p.name} hidden from your store`);
                }}
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (account.hidden.includes(p.id) ? "bg-muted text-muted-foreground" : "bg-success/12 text-success")
                }
              >
                {account.hidden.includes(p.id) ? "Hidden" : "Live"}
              </button>,
            ])}
          />
        </div>
      </Panel>
    </DashShell>
  );
}
