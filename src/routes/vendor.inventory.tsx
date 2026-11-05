import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Boxes,
  Check,
  Eye,
  EyeOff,
  Minus,
  PackagePlus,
  Plus,
  Search,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
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
      {
        name: "description",
        content: "Review live and hidden listings in your business catalog.",
      },
      { property: "og:title", content: "Inventory - Peniel business console" },
      {
        property: "og:description",
        content: "Review listings and their storefront visibility.",
      },
    ],
  }),
  component: VendorInventory,
});

function VendorInventory() {
  const { base, account } = useCurrentVendor();

  const products = useMemo(
    () => [...base.products, ...(account.products ?? [])],
    [base.products, account.products],
  );

  const hidden = new Set(account.hidden);
  const stock = account.stock ?? {};

  const liveCount = products.filter((product) => !hidden.has(product.id)).length;
  const hiddenCount = products.length - liveCount;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | "Live" | "Hidden">("All");
  const [stockProduct, setStockProduct] = useState<
    (typeof products)[number] | null
  >(null);
  const [stockValue, setStockValue] = useState("");

  const lowStock = products.filter((product) => {
    const quantity = stock[product.id];
    return quantity !== undefined && quantity <= 5;
  }).length;

  const outOfStock = products.filter(
    (product) => stock[product.id] === 0,
  ).length;

  const filtered = products.filter((product) => {
    const visible = !hidden.has(product.id);
    const matchesQuery = product.name
      .toLowerCase()
      .includes(query.trim().toLowerCase());

    return (
      matchesQuery &&
      (filter === "All" || (filter === "Live" ? visible : !visible))
    );
  });

  const setQuantity = (productId: string, quantity: number) => {
    if (app.setStock(productId, quantity)) {
      toast.success("Stock updated");
    } else {
      toast.error("Enter a whole number of zero or more");
    }
  };

  const toggleVisibility = (product: (typeof products)[number]) => {
    const wasHidden = hidden.has(product.id);

    app.toggleHidden(product.id);

    toast.success(
      wasHidden
        ? `${product.name} is live on your storefront`
        : `${product.name} hidden from your storefront`,
    );
  };

  const openStockDialog = (product: (typeof products)[number]) => {
    setStockProduct(product);
    setStockValue(
      stock[product.id] !== undefined ? String(stock[product.id]) : "",
    );
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Inventory"
      subtitle="Keep track of your listings, stock levels and storefront visibility."
      storeLink={{ label: "View storefront", slug: base.slug }}
      actions={
        <Link
          to="/vendor/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <PackagePlus className="size-4" />
          Add listing
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total listings"
          value={String(products.length)}
          tone="primary"
        />
        <StatCard
          label="Live listings"
          value={String(liveCount)}
          hint="Visible on your storefront"
        />
        <StatCard
          label="Hidden listings"
          value={String(hiddenCount)}
          hint="Not currently visible"
          tone="gold"
        />
        <StatCard
          label="Low stock"
          value={String(lowStock)}
          hint="Five or fewer units"
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel title="Inventory overview">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Stock at a glance</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Monitor products that need attention.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                <Warehouse className="size-3.5" />
                {products.length - products.filter((p) => stock[p.id] === undefined).length}{" "}
                tracked
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive">
                {outOfStock} out of stock
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Low stock items
                </span>
                <Boxes className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {lowStock}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Items with five units or fewer
              </p>
            </div>

            <div className="rounded-xl border border-border bg-muted/30 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Not tracked
                </span>
                <PackagePlus className="size-4 text-muted-foreground" />
              </div>
              <p className="mt-2 text-xl font-semibold tabular-nums">
                {products.filter((product) => stock[product.id] === undefined).length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Listings without a stock quantity
              </p>
            </div>
          </div>
        </Panel>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Warehouse className="size-4" />
          </div>
          <h3 className="mt-3 text-sm font-semibold">Stock management</h3>
          <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
            Set quantities for your products and update them as stock changes.
            A quantity of zero marks an item as out of stock.
          </p>
          <Link
            to="/vendor/products"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            Manage catalog
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <Panel title="All listings">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Boxes className="size-5 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-semibold">No listings yet</p>
              <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                Add your first item to start building your storefront.
              </p>
              <Link
                to="/vendor/products/new"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground"
              >
                <Plus className="size-3.5" />
                Add your first listing
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {(["All", "Live", "Hidden"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value)}
                      aria-pressed={filter === value}
                      className={
                        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition " +
                        (filter === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
                      }
                    >
                      {value}
                      <span className="ml-1.5 opacity-65">
                        {value === "All"
                          ? products.length
                          : value === "Live"
                            ? liveCount
                            : hiddenCount}
                      </span>
                    </button>
                  ))}
                </div>

                <label className="flex min-w-0 items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5 sm:max-w-sm">
                  <Search className="size-4 shrink-0 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search listings..."
                    aria-label="Search listings"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                </label>
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
                  <Search className="mx-auto size-5 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    No matching listings
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try another search or change the visibility filter.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2 md:hidden">
                    {filtered.map((product) => {
                      const isHidden = hidden.has(product.id);
                      const quantity = stock[product.id];

                      return (
                        <div
                          key={product.id}
                          className="rounded-xl border border-border p-3.5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold">
                                {product.name}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {product.group}
                              </p>
                              <p className="mt-2 text-sm font-semibold">
                                {naira(product.price)}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleVisibility(product)}
                              aria-label={`${isHidden ? "Show" : "Hide"} ${product.name}`}
                              className={
                                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold " +
                                (isHidden
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-success/10 text-success")
                              }
                            >
                              {isHidden ? (
                                <>
                                  <Eye className="size-3" />
                                  Hidden
                                </>
                              ) : (
                                <>
                                  <EyeOff className="size-3" />
                                  Live
                                </>
                              )}
                            </button>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                            <div>
                              <p className="text-[11px] text-muted-foreground">
                                Units on hand
                              </p>
                              {quantity === undefined ? (
                                <span className="text-xs font-medium text-muted-foreground">
                                  Not tracked
                                </span>
                              ) : (
                                <span
                                  className={
                                    "text-sm font-semibold tabular-nums " +
                                    (quantity === 0
                                      ? "text-destructive"
                                      : quantity <= 5
                                        ? "text-amber-600"
                                        : "text-foreground")
                                  }
                                >
                                  {quantity} units
                                  {quantity === 0
                                    ? " · Out of stock"
                                    : quantity <= 5
                                      ? " · Low stock"
                                      : ""}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {quantity !== undefined && (
                                <div className="flex items-center rounded-lg border border-border p-0.5">
                                  <button
                                    type="button"
                                    aria-label={`Decrease ${product.name} stock`}
                                    disabled={quantity === 0}
                                    onClick={() =>
                                      setQuantity(product.id, quantity - 1)
                                    }
                                    className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-40"
                                  >
                                    <Minus className="size-3" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Increase ${product.name} stock`}
                                    onClick={() =>
                                      setQuantity(product.id, quantity + 1)
                                    }
                                    className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted"
                                  >
                                    <Plus className="size-3" />
                                  </button>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={() => openStockDialog(product)}
                                className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                              >
                                {quantity === undefined ? "Track stock" : "Edit"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="hidden md:block">
                    <DataTable
                      head={[
                        "Listing",
                        "Category",
                        "Price",
                        "On hand",
                        "Visibility",
                      ]}
                      rows={filtered.map((product) => {
                        const isHidden = hidden.has(product.id);
                        const quantity = stock[product.id];

                        return [
                          <span className="font-medium">{product.name}</span>,
                          <span className="text-muted-foreground">
                            {product.group}
                          </span>,
                          naira(product.price),
                          quantity === undefined ? (
                            <button
                              type="button"
                              onClick={() => openStockDialog(product)}
                              className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/5"
                            >
                              Track stock
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="inline-flex items-center gap-1 rounded-lg border border-border p-0.5">
                                <button
                                  type="button"
                                  aria-label={`Decrease ${product.name} stock`}
                                  disabled={quantity === 0}
                                  onClick={() =>
                                    setQuantity(product.id, quantity - 1)
                                  }
                                  className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted disabled:opacity-40"
                                >
                                  <Minus className="size-3" />
                                </button>
                                <span className="min-w-6 text-center text-xs font-semibold tabular-nums">
                                  {quantity}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Increase ${product.name} stock`}
                                  onClick={() =>
                                    setQuantity(product.id, quantity + 1)
                                  }
                                  className="grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>
                              {quantity <= 5 && (
                                <span className="text-[10px] font-medium text-amber-600">
                                  {quantity === 0 ? "Out" : "Low"}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => openStockDialog(product)}
                                className="text-[11px] font-medium text-primary hover:underline"
                              >
                                Edit
                              </button>
                            </div>
                          ),
                          <button
                            type="button"
                            aria-label={`${isHidden ? "Show" : "Hide"} ${product.name}`}
                            onClick={() => toggleVisibility(product)}
                            className={
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition " +
                              (isHidden
                                ? "bg-muted text-muted-foreground"
                                : "bg-success/10 text-success")
                            }
                          >
                            {isHidden ? (
                              <>
                                <Eye className="size-3" />
                                Hidden
                              </>
                            ) : (
                              <>
                                <EyeOff className="size-3" />
                                Live
                              </>
                            )}
                          </button>,
                        ];
                      })}
                    />
                  </div>
                </>
              )}

              <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                Stock counts are saved in this browser. Set a quantity to start
                tracking an item; zero marks it out of stock.
              </p>
            </>
          )}
        </Panel>
      </div>

      <Dialog
        open={stockProduct !== null}
        onOpenChange={(open) => !open && setStockProduct(null)}
      >
        <DialogContent className="w-[calc(100%-2rem)] rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Update stock quantity</DialogTitle>
            <DialogDescription>
              Set the current quantity for {stockProduct?.name}. You can adjust
              it at any time.
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
                required
                value={stockValue}
                onChange={(event) => setStockValue(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
              />
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setStockProduct(null)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Check className="size-4" />
                Save quantity
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
