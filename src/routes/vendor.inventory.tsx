import { createFileRoute, Link } from "@tanstack/react-router";
import { Boxes, Eye, EyeOff, Minus, PackagePlus, Plus, Search } from "lucide-react";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const stock = account.stock ?? {};
  const liveCount = products.filter((product) => !hidden.has(product.id)).length;
  const hiddenCount = products.length - liveCount;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Live" | "Hidden">("All");
  const [stockProduct, setStockProduct] = useState<(typeof products)[number] | null>(null);
  const [stockValue, setStockValue] = useState("");
  const lowStock = products.filter((product) => {
    const quantity = stock[product.id];
    return quantity !== undefined && quantity <= 5;
  }).length;
  const filtered = products.filter((product) => {
    const visible = !hidden.has(product.id);
    return (
      product.name.toLowerCase().includes(query.trim().toLowerCase()) &&
      (filter === "All" || (filter === "Live" ? visible : !visible))
    );
  });
  const setQuantity = (productId: string, quantity: number) => {
    if (app.setStock(productId, quantity)) toast.success("Stock updated");
    else toast.error("Enter a whole number of zero or more");
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Inventory"
      subtitle={`${products.length} catalog listings · ${liveCount} live on your storefront`}
      storeLink={{ label: "View storefront", slug: base.slug }}
      actions={
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          <PackagePlus className="size-4" /> Add listing
        </Link>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total listings" value={`${products.length}`} tone="primary" />
        <StatCard label="Live" value={`${liveCount}`} hint="Visible on your storefront" />
        <StatCard
          label="Hidden"
          value={`${hiddenCount}`}
          hint="Not currently visible"
          tone="gold"
        />
        <StatCard label="Low stock" value={`${lowStock}`} hint="Five or fewer units" />
      </div>

      <div className="mt-6">
        <Panel title="Inventory and catalog">
          {products.length === 0 ? (
            <div className="py-10 text-center">
              <Boxes className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-semibold">No listings yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add your first item to start building your storefront.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(["All", "Live", "Hidden"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      aria-pressed={filter === value}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition " +
                        (filter === value
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <label className="flex min-w-0 items-center gap-2 rounded-xl border border-input px-3 py-2 sm:w-64">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find a listing"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </label>
              </div>
              <DataTable
                head={["Listing", "Category", "Price", "On hand", "Visibility"]}
                rows={filtered.map((product) => [
                  <span className="font-medium">{product.name}</span>,
                  <span className="text-muted-foreground">{product.group}</span>,
                  naira(product.price),
                  stock[product.id] === undefined ? (
                    <button
                      type="button"
                      onClick={() => {
                        setStockProduct(product);
                        setStockValue("");
                      }}
                      className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-primary"
                    >
                      Track stock
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-lg border border-border px-1.5 py-1">
                      <button
                        type="button"
                        aria-label={`Decrease ${product.name} stock`}
                        disabled={stock[product.id] === 0}
                        onClick={() => setQuantity(product.id, stock[product.id]! - 1)}
                        className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-40"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="min-w-5 text-center text-xs font-semibold tabular-nums">
                        {stock[product.id]}
                      </span>
                      <button
                        type="button"
                        aria-label={`Increase ${product.name} stock`}
                        onClick={() => setQuantity(product.id, stock[product.id]! + 1)}
                        className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted"
                      >
                        <Plus className="size-3" />
                      </button>
                    </span>
                  ),
                  <button
                    type="button"
                    aria-label={`${hidden.has(product.id) ? "Show" : "Hide"} ${product.name}`}
                    onClick={() => {
                      app.toggleHidden(product.id);
                      toast.success(
                        hidden.has(product.id)
                          ? `${product.name} is live on your storefront`
                          : `${product.name} hidden from your storefront`,
                      );
                    }}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (hidden.has(product.id)
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/12 text-success")
                    }
                  >
                    {hidden.has(product.id) ? (
                      <>
                        <Eye className="size-3" /> Hidden
                      </>
                    ) : (
                      <>
                        <EyeOff className="size-3" /> Live
                      </>
                    )}
                  </button>,
                ])}
              />
              <p className="mt-4 text-xs text-muted-foreground">
                Stock counts are saved in this browser. Set a quantity to start tracking an item;
                zero marks it out of stock.
              </p>
            </>
          )}
          <Link
            to="/vendor/products"
            className="mt-4 inline-flex text-xs font-semibold text-primary"
          >
            Manage catalog →
          </Link>
        </Panel>
      </div>
      <Dialog open={stockProduct !== null} onOpenChange={(open) => !open && setStockProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Track inventory</DialogTitle>
            <DialogDescription>
              Set the current quantity for {stockProduct?.name}. You can adjust it at any time.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const quantity = Number(stockValue);
              if (
                !stockValue.trim() ||
                !Number.isInteger(quantity) ||
                quantity < 0 ||
                !stockProduct
              ) {
                toast.error("Enter a whole number of zero or more");
                return;
              }
              setQuantity(stockProduct.id, quantity);
              setStockProduct(null);
            }}
          >
            <label className="block text-sm font-medium">
              Units on hand
              <input
                autoFocus
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={stockValue}
                onChange={(event) => setStockValue(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Save quantity
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
