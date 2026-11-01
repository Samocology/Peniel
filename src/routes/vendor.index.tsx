import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, CalendarDays, Package, Star, ShoppingBag } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/")({
  head: () => ({
    meta: [
      { title: "Vendor dashboard - Peniel business console" },
      { name: "description", content: "Review your storefront, catalogue and recent customer activity." },
      { property: "og:title", content: "Vendor dashboard - Peniel" },
      { property: "og:description", content: "Run your business from one command center." },
    ],
  }),
  component: VendorOverview,
});

function VendorOverview() {
  const { vendor, account } = useCurrentVendor();
  const state = useApp();
  const orders = state.orders.filter((order) => order.vendorSlug === vendor.slug);
  const openOrders = orders.filter((order) =>
    ["New", "Confirmed", "Preparing", "Out for delivery"].includes(order.status),
  );
  const revenue = orders
    .filter((order) => order.status !== "Cancelled")
    .reduce((total, order) => total + order.total, 0);
  const catalogLabel =
    vendor.type === "restaurant" || vendor.type === "bakery"
      ? "Menu"
      : vendor.type === "beauty"
        ? "Services"
        : vendor.type === "hotel"
          ? "Rooms"
          : "Products";
  const itemLabel =
    vendor.type === "beauty" ? "service" : vendor.type === "hotel" ? "room" : "item";
  const activityLabel =
    vendor.fulfilment === "reservation"
      ? "reservations"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "orders";

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={`Welcome, ${vendor.name}`}
      subtitle={`Your ${vendor.categoryLabel.toLowerCase()} business overview.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <>
          <Link to="/vendor/products/new" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Add {itemLabel}
          </Link>
          <Link to="/vendor/promotions" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            New promotion
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tracked revenue" value={naira(revenue)} hint="Based on this account's saved orders" tone="primary" icon={<ArrowUpRight className="size-4 text-success" />} />
        <StatCard label={`Open ${activityLabel}`} value={String(openOrders.length)} hint="Needs attention or fulfilment" icon={vendor.fulfilment === "order" ? <ShoppingBag className="size-4 text-muted-foreground" /> : <CalendarDays className="size-4 text-muted-foreground" />} />
        <StatCard label={catalogLabel} value={String(vendor.products.length)} hint={`Live listings for ${vendor.name}`} tone="gold" icon={<Package className="size-4 text-gold" />} />
        <StatCard label="Store rating" value={vendor.rating.toFixed(1)} hint={`${vendor.reviews.toLocaleString()} customer reviews`} icon={<Star className="size-4 text-muted-foreground" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel
            title={`Recent ${activityLabel}`}
            action={
              <Link
                to={vendor.fulfilment === "order" ? "/vendor/orders" : "/vendor/bookings"}
                className="text-xs font-semibold text-primary"
              >
                View all
              </Link>
            }
          >
            {orders.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No {activityLabel} have been recorded for this account yet.
              </p>
            ) : (
              <DataTable
                head={["Reference", "Customer", "Items", "Total", "Status"]}
                rows={orders.slice(0, 5).map((order) => [
                  <span className="font-mono text-xs">{order.id}</span>,
                  <span className="font-medium">{order.customer}</span>,
                  <span className="text-muted-foreground">{order.items}</span>,
                  naira(order.total),
                  <StatusPill status={order.status} />,
                ])}
              />
            )}
          </Panel>

          <Panel title={`${catalogLabel} overview`}>
            {vendor.products.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">Your catalogue is empty. Add your first {itemLabel} to get started.</p>
            ) : (
              <ul className="divide-y divide-border">
                {vendor.products.slice(0, 5).map((product) => (
                  <li key={product.id} className="flex items-center justify-between gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{product.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">{product.group}{product.meta ? ` · ${product.meta}` : ""}</span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold">{naira(product.price)}</span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/vendor/products" className="mt-4 inline-block text-xs font-semibold text-primary">
              Manage {catalogLabel.toLowerCase()} →
            </Link>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Account verification">
            <p className="text-sm text-muted-foreground">
              {account.verification === "applied"
                ? "Your verification application is being reviewed."
                : "Verify your business to build trust and unlock account features."}
            </p>
            <Link
              to="/vendor/verification"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold"
            >
              <BadgeCheck className="size-4 text-primary" />
              {account.verification === "applied" ? "View application" : "Verification details"}
            </Link>
          </Panel>

          <Panel title="Business details">
            <p className="font-semibold">{vendor.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{vendor.categoryLabel}</p>
            <p className="mt-3 text-sm text-muted-foreground">{vendor.location}</p>
            <p className="mt-2 text-xs text-muted-foreground">{vendor.hours}</p>
            <Link to="/vendor/settings" className="mt-4 inline-block text-xs font-semibold text-primary">
              Update business details →
            </Link>
          </Panel>

          {vendor.fulfilment !== "order" && (
            <Panel title={vendor.fulfilment === "reservation" ? "Reservations" : "Appointments"}>
              <p className="text-sm text-muted-foreground">
                Booking activity is managed in your bookings workspace.
              </p>
              <Link to="/vendor/bookings" className="mt-4 inline-block text-xs font-semibold text-primary">
                Manage {vendor.fulfilment === "reservation" ? "reservations" : "appointments"} →
              </Link>
            </Panel>
          )}
        </div>
      </div>
    </DashShell>
  );
}
