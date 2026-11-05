
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Package,
  Plus,
  Settings2,
  ShoppingBag,
  Star,
  Store,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { useApp, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/")({
  head: () => ({
    meta: [
      { title: "Vendor dashboard - Peniel business console" },
      {
        name: "description",
        content:
          "Review your storefront, catalogue and recent customer activity.",
      },
      { property: "og:title", content: "Vendor dashboard - Peniel" },
      {
        property: "og:description",
        content: "Run your business from one command center.",
      },
    ],
  }),
  component: VendorOverview,
});

const quickLinkClass =
  "group inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground transition hover:border-primary/30 hover:bg-muted/60 active:scale-[0.98]";

function SectionLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:gap-2.5"
    >
      {children}
      <ArrowRight className="size-3.5" />
    </Link>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  to,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  to?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-5 py-9 text-center">
      <div className="grid size-11 place-items-center rounded-xl border border-border bg-card text-muted-foreground">
        <Icon className="size-5" />
      </div>

      <p className="mt-3 text-sm font-semibold">{title}</p>

      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      {action && to && (
        <Link
          to={to}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          {action}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

function VendorOverview() {
  const { vendor, account } = useCurrentVendor();
  const state = useApp();

  const orders = state.orders.filter(
    (order) => order.vendorSlug === vendor.slug,
  );

  const openOrders = orders.filter((order) =>
    ["New", "Confirmed", "Preparing", "Out for delivery"].includes(
      order.status,
    ),
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
    vendor.type === "beauty"
      ? "service"
      : vendor.type === "hotel"
        ? "room"
        : "item";

  const activityLabel =
    vendor.fulfilment === "reservation"
      ? "reservations"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "orders";

  const activityTitle =
    vendor.fulfilment === "reservation"
      ? "Reservations"
      : vendor.fulfilment === "booking"
        ? "Appointments"
        : "Orders";

  const activityRoute =
    vendor.fulfilment === "order"
      ? "/vendor/orders"
      : "/vendor/bookings";

  const recentOrders = orders.slice(0, 5);

  const greetingName = vendor.name.trim();

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={`Welcome, ${greetingName}`}
      subtitle="Here's what's happening with your business."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/vendor/products/new"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:brightness-110 active:scale-[0.98] sm:h-10 sm:px-4 sm:text-sm"
          >
            <Plus className="size-4" />
            Add {itemLabel}
          </Link>

          <Link
            to="/vendor/promotions"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3.5 text-xs font-semibold transition hover:bg-muted sm:h-10 sm:px-4 sm:text-sm"
          >
            New promotion
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[1500px]">
        {/* Welcome overview */}
        <section className="relative mb-6 overflow-hidden rounded-xl border border-border bg-card">
          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/[0.045] blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                {vendor.monogram}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-sm font-semibold tracking-tight">
                    {vendor.name}
                  </h2>

                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[9px] font-medium text-muted-foreground">
                    <Store className="size-3" />
                    Business account
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {vendor.categoryLabel} · Your business workspace
                </p>

                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Business dashboard
                  </span>

                  <span className="text-border">·</span>

                  <span className="text-[10px] text-muted-foreground">
                    {vendor.products.length} {catalogLabel.toLowerCase()} listed
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:justify-end">
              <Link
                to="/vendor/settings"
                className={quickLinkClass}
              >
                <Settings2 className="size-3.5 text-muted-foreground" />
                Store settings
              </Link>

              <Link
                to="/vendor/verification"
                className={quickLinkClass}
              >
                <BadgeCheck className="size-3.5 text-primary" />
                Verification
              </Link>
            </div>
          </div>
        </section>

        {/* Performance overview */}
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Business overview
              </h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                A snapshot of your business activity.
              </p>
            </div>

            <span className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:inline-flex">
              <Clock3 className="size-3" />
              Based on saved account data
            </span>
          </div>

          <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-4">
            <StatCard
              label="Tracked revenue"
              value={naira(revenue)}
              hint="Based on non-cancelled saved orders"
              tone="primary"
              icon={
                <Wallet className="size-4 text-primary" />
              }
            />

            <StatCard
              label={`Open ${activityLabel}`}
              value={String(openOrders.length)}
              hint="Awaiting attention or fulfilment"
              icon={
                vendor.fulfilment === "order" ? (
                  <ShoppingBag className="size-4 text-muted-foreground" />
                ) : (
                  <CalendarDays className="size-4 text-muted-foreground" />
                )
              }
            />

            <StatCard
              label={catalogLabel}
              value={String(vendor.products.length)}
              hint={`Listings for ${vendor.name}`}
              tone="gold"
              icon={
                <Package className="size-4 text-gold" />
              }
            />

            <StatCard
              label="Store rating"
              value={vendor.rating.toFixed(1)}
              hint={`${vendor.reviews.toLocaleString()} customer reviews`}
              icon={
                <Star className="size-4 text-muted-foreground" />
              }
            />
          </div>
        </section>

        {/* Main dashboard */}
        <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_310px] 2xl:grid-cols-[minmax(0,1fr)_330px]">
          <div className="min-w-0 space-y-5">
            {/* Recent activity */}
            <Panel
              title={`Recent ${activityLabel}`}
              action={
                <Link
                  to={activityRoute}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2"
                >
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              }
            >
              {orders.length === 0 ? (
                <EmptyState
                  icon={
                    vendor.fulfilment === "order"
                      ? ShoppingBag
                      : CalendarDays
                  }
                  title={`No ${activityLabel} yet`}
                  description={`When customers place ${activityLabel}, their activity will appear here.`}
                  action={
                    vendor.fulfilment === "order"
                      ? "View your storefront"
                      : "Manage bookings"
                  }
                  to={
                    vendor.fulfilment === "order"
                      ? `/store/${vendor.slug}`
                      : "/vendor/bookings"
                  }
                />
              ) : (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/25 px-3.5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="grid size-8 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                        {vendor.fulfilment === "order" ? (
                          <ShoppingBag className="size-4" />
                        ) : (
                          <CalendarDays className="size-4" />
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-semibold">
                          {orders.length} recorded {activityLabel}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {openOrders.length} currently need attention
                        </p>
                      </div>
                    </div>

                    <Link
                      to={activityRoute}
                      className="text-[10px] font-semibold text-primary"
                    >
                      Manage {activityLabel}
                    </Link>
                  </div>

                  <DataTable
                    head={[
                      "Reference",
                      "Customer",
                      "Items",
                      "Total",
                      "Status",
                    ]}
                    rows={recentOrders.map((order) => [
                      <span
                        key="reference"
                        className="font-mono text-[11px] font-medium"
                      >
                        {order.id}
                      </span>,
                      <span
                        key="customer"
                        className="font-medium"
                      >
                        {order.customer}
                      </span>,
                      <span
                        key="items"
                        className="text-muted-foreground"
                      >
                        {order.items}
                      </span>,
                      <span
                        key="total"
                        className="font-semibold"
                      >
                        {naira(order.total)}
                      </span>,
                      <StatusPill
                        key="status"
                        status={order.status}
                      />,
                    ])}
                  />
                </>
              )}
            </Panel>

            {/* Catalogue */}
            <Panel
              title={`${catalogLabel} overview`}
              action={
                <Link
                  to="/vendor/products"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2"
                >
                  View all
                  <ArrowUpRight className="size-3.5" />
                </Link>
              }
            >
              {vendor.products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={`Your ${catalogLabel.toLowerCase()} is empty`}
                  description={`Add your first ${itemLabel} to start building your online catalogue.`}
                  action={`Add your first ${itemLabel}`}
                  to="/vendor/products/new"
                />
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium">
                        Recently listed {itemLabel}s
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        Your latest catalogue entries
                      </p>
                    </div>

                    <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                      {vendor.products.length} total
                    </span>
                  </div>

                  <ul className="divide-y divide-border/70">
                    {vendor.products.slice(0, 5).map((product) => (
                      <li
                        key={product.id}
                        className="flex min-w-0 items-center justify-between gap-3 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-muted/40 text-muted-foreground">
                            <Package className="size-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold">
                              {product.name}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                              {product.group}
                              {product.meta ? ` · ${product.meta}` : ""}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-xs font-semibold tabular-nums">
                          {naira(product.price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {vendor.products.length > 0 && (
                <div className="mt-3 border-t border-border/70 pt-4">
                  <SectionLink to="/vendor/products">
                    Manage {catalogLabel.toLowerCase()}
                  </SectionLink>
                </div>
              )}
            </Panel>

            {/* Business performance note */}
            <div className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/25 p-4">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                <TrendingUp className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold">
                  Keep your business moving
                </p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  Keep your catalogue updated, respond to customer requests
                  and maintain accurate business information to give your
                  customers a better experience.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5 xl:sticky xl:top-5 xl:self-start">
            {/* Verification */}
            <Panel title="Account verification">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/[0.08] text-primary">
                  <BadgeCheck className="size-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold">
                    {account.verification === "applied"
                      ? "Application under review"
                      : "Build customer confidence"}
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                    {account.verification === "applied"
                      ? "Your verification application is being reviewed by our team."
                      : "Complete the verification process to build trust and access eligible account features."}
                  </p>
                </div>
              </div>

              <Link
                to="/vendor/verification"
                className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-xs font-semibold transition hover:border-primary/30 hover:bg-muted/50"
              >
                {account.verification === "applied"
                  ? "View application"
                  : "Verification details"}
                <ArrowRight className="size-3.5" />
              </Link>
            </Panel>

            {/* Business details */}
            <Panel
              title="Business details"
              action={
                <Link
                  to="/vendor/settings"
                  aria-label="Edit business details"
                  className="grid size-7 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              }
            >
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/[0.08] text-primary">
                  <Store className="size-4" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {vendor.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    {vendor.categoryLabel}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3 border-t border-border/70 pt-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-1 text-xs leading-5">
                    {vendor.location || "Location not added"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Business hours
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {vendor.hours || "Business hours not added"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-border/70 pt-3">
                <SectionLink to="/vendor/settings">
                  Update business details
                </SectionLink>
              </div>
            </Panel>

            {/* Rating */}
            <Panel title="Customer experience">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
                  <Star className="size-4 fill-current" />
                </div>

                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-semibold tracking-tight tabular-nums">
                      {vendor.rating.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      / 5.0
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground">
                    {vendor.reviews.toLocaleString()} customer reviews
                  </p>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
                Customer feedback helps build confidence in your business.
                Continue providing a great experience.
              </p>
            </Panel>

            {/* Bookings */}
            {vendor.fulfilment !== "order" && (
              <Panel title={activityTitle}>
                <div className="flex items-start gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/[0.08] text-primary">
                    <CalendarDays className="size-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold">
                      Manage your bookings
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                      View and manage your customer {activityLabel} from one
                      workspace.
                    </p>
                  </div>
                </div>

                <Link
                  to="/vendor/bookings"
                  className="mt-4 flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-xs font-semibold transition hover:bg-muted/50"
                >
                  Open bookings workspace
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              </Panel>
            )}

            {/* Quick actions */}
            <Panel title="Quick actions">
              <div className="space-y-1">
                <Link
                  to="/vendor/products/new"
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 transition hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <Plus className="size-4 text-muted-foreground" />
                    Add {itemLabel}
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/vendor/promotions"
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 transition hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <TrendingUp className="size-4 text-muted-foreground" />
                    Manage promotions
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/vendor/settings"
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 transition hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <Settings2 className="size-4 text-muted-foreground" />
                    Store settings
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Link>

                <Link
                  to="/store/$slug"
                  params={{ slug: vendor.slug }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-2.5 transition hover:bg-muted/60"
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <ExternalLink className="size-4 text-muted-foreground" />
                    Visit storefront
                  </span>
                  <ChevronRight className="size-3.5 text-muted-foreground" />
                </Link>
              </div>
            </Panel>
          </aside>
        </div>

        {/* Bottom note */}
        <div className="mt-6 flex flex-col gap-2 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[10px] text-muted-foreground">
            Peniel Business Console
          </p>

          <span className="inline-flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <CheckCircle2 className="size-3 text-primary" />
            Your business workspace
          </span>
        </div>
      </div>
    </DashShell>
  );
}
