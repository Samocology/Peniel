import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, RotateCcw, Star } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { useMemo, useState } from "react";
import { useMyOrders, minorToNaira, backendStatusLabel } from "@/lib/vendor-hooks";
import { type OrderRecord } from "@/lib/api-client";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order history - Peniel" },
      {
        name: "description",
        content:
          "Every order and booking you've placed across Peniel businesses, with tracking, receipts and one-tap reorder.",
      },
      { property: "og:title", content: "Order history - Peniel" },
      { property: "og:description", content: "All your Peniel orders and bookings in one place." },
    ],
  }),
  component: OrdersPage,
});

const filters = ["All", "Active", "Completed", "Cancelled"] as const;

type OrderRow = {
  order: OrderRecord;
  vendorOrder: NonNullable<OrderRecord["vendor_orders"]>[number];
};

function OrdersPage() {
  const liveOrders = useMyOrders();
  const [f, setF] = useState<(typeof filters)[number]>("All");

  const rows = useMemo<OrderRow[]>(() => {
    if (!liveOrders.data) return [];
    const flattened: OrderRow[] = [];
    for (const order of liveOrders.data) {
      for (const vo of order.vendor_orders) {
        flattened.push({ order, vendorOrder: vo });
      }
    }
    return flattened.sort((a, b) => b.order.created_at.localeCompare(a.order.created_at));
  }, [liveOrders.data]);

  const statusLabel = (vo: OrderRow["vendorOrder"]) => backendStatusLabel(vo.status);
  const isActive = (vo: OrderRow["vendorOrder"]) => {
    const s = statusLabel(vo);
    return s !== "Delivered" && s !== "Cancelled" && s !== "Completed";
  };
  const filtered = rows.filter((row) => {
    const s = statusLabel(row.vendorOrder);
    if (f === "All") return true;
    if (f === "Active") return isActive(row.vendorOrder);
    if (f === "Completed") return s === "Delivered" || s === "Completed";
    if (f === "Cancelled") return s === "Cancelled";
    return true;
  });

  const placed = (iso: string) =>
    new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

  if (liveOrders.loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Orders & bookings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading your orders…</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (liveOrders.error) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Orders & bookings</h1>
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">
              Unable to load orders: {liveOrders.error}
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Orders & bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track, reorder and review everything you've bought on Peniel.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {filters.map((filter, i) => (
            <button
              key={filter}
              type="button"
              onClick={() => setF(filter)}
              className={
                "rounded-full border px-4 py-1.5 font-medium transition " +
                (f === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground")
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-16 text-center">
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <PackageSearch className="size-5" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {f === "All" ? "No orders yet" : `No ${f.toLowerCase()} orders yet`}
            </p>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
              Orders you place on Peniel will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {filtered.map((row) => {
              const vo = row.vendorOrder;
              const order = row.order;
              const vendorName = vo.vendors?.name ?? vo.order_id;
              const itemCount = vo.order_items.reduce((s, i) => s + i.quantity, 0);
              const firstItem = vo.order_items[0]?.product_snapshot.name;
              const totalMinor = vo.subtotal_minor + vo.delivery_minor;
              const label = statusLabel(vo);
              const kind =
                label === "Appointment" || label === "Reservation"
                  ? (label.toLowerCase() as "booking" | "reservation")
                  : "order";
              return (
                <div key={vo.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{vendorName}</p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {order.reference}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {firstItem ? `${itemCount}× ${firstItem}` : `${itemCount} items`} ·{" "}
                        {placed(order.created_at)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <StatusPill status={label} />
                      <p className="mt-2 font-display font-bold">{minorToNaira(totalMinor)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-sm">
                    <Link
                      to="/orders/$id"
                      params={{ id: order.id }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                    >
                      <PackageSearch className="size-3.5" />
                      {kind === "booking"
                        ? "View appointment"
                        : kind === "reservation"
                          ? "View reservation"
                          : "Track order"}
                    </Link>
                    <Link
                      to="/store/$slug"
                      params={{ slug: vo.vendors?.slug ?? "" }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold"
                    >
                      <RotateCcw className="size-3.5" /> Reorder
                    </Link>
                    {(label === "Delivered" || label === "Confirmed") && (
                      <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold">
                        <Star className="size-3.5 text-gold" /> Leave a review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
