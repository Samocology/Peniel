
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Eye,
  EyeOff,
  Filter,
  LayoutGrid,
  List,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { ItemArt } from "@/components/store/store-kit";
import { naira } from "@/lib/data";
import { app, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({
    meta: [
      { title: "Products - Peniel business console" },
      {
        name: "description",
        content:
          "Manage your menu and products: prices, stock, categories and visibility on your storefront.",
      },
      { property: "og:title", content: "Products - Peniel business console" },
      {
        property: "og:description",
        content: "Add, edit and organise everything you sell.",
      },
    ],
  }),
  component: VendorProducts,
});

type ViewMode = "grid" | "list";
type VisibilityFilter = "All" | "Live" | "Hidden";

function VendorProducts() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { base, account } = useCurrentVendor();

  const vendor = {
    ...base,
    products: [...base.products, ...(account.products ?? [])],
  };

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

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [visibility, setVisibility] = useState<VisibilityFilter>("All");
  const [view, setView] = useState<ViewMode>("grid");

  const hiddenIds = account.hidden ?? [];

  const liveCount = vendor.products.filter(
    (product) => !hiddenIds.includes(product.id),
  ).length;

  const hiddenCount = vendor.products.length - liveCount;

  const filteredProducts = useMemo(
    () =>
      vendor.products.filter((product) => {
        const matchesCategory =
          category === "All" || product.group === category;

        const matchesSearch = [
          product.name,
          product.desc,
          product.group,
          product.meta ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query.trim().toLowerCase());

        const isHidden = hiddenIds.includes(product.id);

        const matchesVisibility =
          visibility === "All" ||
          (visibility === "Live" && !isHidden) ||
          (visibility === "Hidden" && isHidden);

        return matchesCategory && matchesSearch && matchesVisibility;
      }),
    [vendor.products, category, query, visibility, hiddenIds],
  );

  const hasActiveFilters =
    query.trim().length > 0 ||
    category !== "All" ||
    visibility !== "All";

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setVisibility("All");
  };

  const toggleVisibility = (productId: string, productName: string) => {
    const isHidden = hiddenIds.includes(productId);

    app.toggleHidden(productId);

    toast.success(
      isHidden
        ? `${productName} is now live on your storefront`
        : `${productName} has been hidden from your storefront`,
    );
  };

  if (pathname === "/vendor/products/new") return <Outlet />;

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={catalogLabel}
      subtitle={`Manage and organise the ${itemLabel} displayed on your storefront.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <Link
          to="/vendor/products/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="size-4" />
          <span>Add {itemTypeLabel.toLowerCase()}</span>
        </Link>
      }
    >
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard
          label={`Total ${itemLabel}`}
          value={vendor.products.length}
          icon={Package}
          active
        />
        <SummaryCard
          label="Live on storefront"
          value={liveCount}
          icon={Eye}
        />
        <div className="col-span-2 sm:col-span-1">
          <SummaryCard
            label="Hidden"
            value={hiddenCount}
            icon={EyeOff}
          />
        </div>
      </div>

      {/* Main catalogue */}
      <div className="mt-6">
        <Panel title={`${catalogLabel} catalogue`}>
          <div className="space-y-4">
            {/* Search and controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 transition focus-within:border-primary">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`Search ${itemLabel}...`}
                  aria-label={`Search ${itemLabel}`}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Filter className="size-3.5" />
                  Reset filters
                </button>

                <div className="flex h-10 items-center rounded-xl border border-border bg-background p-1">
                  <button
                    type="button"
                    onClick={() => setView("grid")}
                    aria-label="Grid view"
                    aria-pressed={view === "grid"}
                    className={`flex size-8 items-center justify-center rounded-lg transition ${
                      view === "grid"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <LayoutGrid className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    aria-label="List view"
                    aria-pressed={view === "list"}
                    className={`flex size-8 items-center justify-center rounded-lg transition ${
                      view === "list"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <List className="size-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category filters */}
            {vendor.groups.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Categories
                  </span>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 hide-scrollbar">
                  {["All", ...vendor.groups].map((group) => {
                    const active = group === category;

                    return (
                      <button
                        key={group}
                        type="button"
                        onClick={() => setCategory(group)}
                        aria-pressed={active}
                        className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-medium transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {group}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Visibility filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <div className="flex items-center gap-1.5">
                {(["All", "Live", "Hidden"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setVisibility(option)}
                    aria-pressed={visibility === option}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      visibility === option
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                of {vendor.products.length}
              </p>
            </div>
          </div>

          {/* Product results */}
          <div className="mt-5">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
                <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  {vendor.products.length === 0
                    ? `No ${itemLabel} yet`
                    : "No matching items"}
                </h3>
                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  {vendor.products.length === 0
                    ? `Start building your catalogue by adding your first ${itemTypeLabel.toLowerCase()}.`
                    : "Try changing your search or filters to find what you are looking for."}
                </p>

                {vendor.products.length === 0 ? (
                  <Link
                    to="/vendor/products/new"
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    <Plus className="size-3.5" />
                    Add {itemTypeLabel.toLowerCase()}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="mt-4 text-xs font-semibold text-primary hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : view === "grid" ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const isHidden = hiddenIds.includes(product.id);
                  const originalIndex = vendor.products.findIndex(
                    (item) => item.id === product.id,
                  );

                  return (
                    <article
                      key={product.id}
                      className="group min-w-0 overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/30"
                    >
                      <div className="flex items-start gap-3 p-3.5">
                        <ItemArt
                          vendor={vendor}
                          seed={originalIndex}
                          label={product.name}
                          className="size-14 shrink-0 rounded-xl"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="line-clamp-2 text-sm font-semibold leading-5 text-foreground">
                              {product.name}
                            </p>
                            <span
                              className={`mt-0.5 size-2 shrink-0 rounded-full ${
                                isHidden ? "bg-muted-foreground/40" : "bg-success"
                              }`}
                              title={isHidden ? "Hidden" : "Live"}
                            />
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {product.group}
                          </p>
                          <p className="mt-2 text-sm font-bold text-foreground">
                            {naira(product.price)}
                          </p>
                        </div>
                      </div>

                      <div className="flex min-w-0 items-center justify-between gap-2 border-t border-border bg-muted/20 px-3.5 py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            isHidden
                              ? "bg-muted text-muted-foreground"
                              : "bg-success/10 text-success"
                          }`}
                        >
                          {isHidden ? "Hidden" : "Live"}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            toggleVisibility(product.id, product.name)
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          {isHidden ? (
                            <>
                              <Eye className="size-3.5" />
                              Make live
                            </>
                          ) : (
                            <>
                              <EyeOff className="size-3.5" />
                              Hide item
                            </>
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs text-muted-foreground">
                      <th className="px-3 py-3 font-medium">{itemTypeLabel}</th>
                      <th className="px-3 py-3 font-medium">Category</th>
                      <th className="px-3 py-3 font-medium">Price</th>
                      <th className="px-3 py-3 font-medium">Details</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                      <th className="px-3 py-3 text-right font-medium">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((product) => {
                      const isHidden = hiddenIds.includes(product.id);
                      const originalIndex = vendor.products.findIndex(
                        (item) => item.id === product.id,
                      );

                      return (
                        <tr
                          key={product.id}
                          className="transition hover:bg-muted/30"
                        >
                          <td className="px-3 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <ItemArt
                                vendor={vendor}
                                seed={originalIndex}
                                label={product.name}
                                className="size-10 shrink-0 rounded-lg"
                              />
                              <span className="min-w-0">
                                <span className="block max-w-48 truncate text-xs font-semibold text-foreground">
                                  {product.name}
                                </span>
                                <span className="mt-0.5 block max-w-48 truncate text-[11px] text-muted-foreground">
                                  {product.desc}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {product.group}
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold text-foreground">
                            {naira(product.price)}
                          </td>
                          <td className="max-w-40 truncate px-3 py-3 text-xs text-muted-foreground">
                            {product.meta ?? "Not set"}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                isHidden
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-success/10 text-success"
                              }`}
                            >
                              {isHidden ? "Hidden" : "Live"}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                toggleVisibility(product.id, product.name)
                              }
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                            >
                              {isHidden ? (
                                <>
                                  <Eye className="size-3.5" />
                                  Make live
                                </>
                              ) : (
                                <>
                                  <EyeOff className="size-3.5" />
                                  Hide
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashShell>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  active = false,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-3.5 sm:p-4 ${
        active ? "border-primary/25" : "border-border"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-muted-foreground">
          {label}
        </p>
        <div
          className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
            active
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
