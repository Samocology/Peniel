import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChefHat,
  CircleDot,
  Download,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { useMyOrders, minorToNaira, backendStatusLabel } from "@/lib/vendor-hooks";
import { type OrderRecord } from "@/lib/api-client";

export const Route = createFileRoute("/orders/$id")({
  head: ({ params }) => {
    return {
      meta: [
        { title: `Order ${params.id} - Peniel` },
        { name: "description", content: `Live tracking for your Peniel order: ${params.id}.` },
        { property: "og:title", content: `Order ${params.id} - Peniel` },
        { property: "og:description", content: `Live order tracking on Peniel.` },
      ],
    };
  },
  component: OrderTracking,
});

const steps = [
  { key: "Order received", icon: Check, note: "Payment confirmed by Peniel Pay" },
  { key: "Confirmed by business", icon: CircleDot, note: "Accepted" },
  { key: "Preparing", icon: ChefHat, note: "Being prepared" },
  { key: "Out for delivery", icon: Truck, note: "Rider assigned" },
  { key: "Delivered", icon: Package, note: "Enjoy!" },
];

function OrderTracking() {
  const { id: orderId } = Route.useParams();
  const liveOrders = useMyOrders();

  const order = liveOrders.data?.find((o: OrderRecord) => o.id === orderId);

  if (liveOrders.loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Order tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading your order…</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!order || !order.vendor_orders.length) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <h1 className="font-display text-3xl font-bold">Order not found</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            We couldn't find an order with that reference.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const vendorOrders = order.vendor_orders;
  const vendorOrder = vendorOrders[0]!;
  const vendorName = vendorOrder.vendors?.name ?? vendorOrder.order_id;
  const vendorSlug = vendorOrder.vendors?.slug ?? "";
  const statusLabel = backendStatusLabel(vendorOrder.status);
  const totalMinor = vendorOrder.subtotal_minor + vendorOrder.delivery_minor;
  const itemCount = vendorOrder.order_items.reduce((s, i) => s + i.quantity, 0);

  const activeIndex =
    statusLabel === "Delivered"
      ? 4
      : statusLabel === "Out for delivery"
        ? 3
        : statusLabel === "Preparing"
          ? 2
          : statusLabel === "Confirmed"
            ? 1
            : statusLabel === "Paid"
              ? 0
              : -1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <ShieldCheck className="size-3.5" /> Order tracking
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                Order {statusLabel.toLowerCase()}
              </h1>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {order.reference}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <StatusPill status={statusLabel} />
              <p className="mt-2 font-display text-lg font-bold">{minorToNaira(totalMinor)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-display text-lg font-bold">Progress</h2>
            <ol className="mt-5 space-y-6">
              {steps.map((s, i) => {
                const done = i <= activeIndex;
                const I = s.icon;
                return (
                  <li key={s.key} className="grid grid-cols-[32px_minmax(0,1fr)] gap-4">
                    <div className="relative flex justify-center">
                      <span
                        className={
                          "z-1 grid size-8 place-items-center rounded-full " +
                          (done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        <I className="size-4" />
                      </span>
                      {i < steps.length - 1 && (
                        <span
                          className={
                            "absolute top-8 h-full w-px " +
                            (i < activeIndex ? "bg-primary" : "bg-border")
                          }
                        />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className={"font-semibold " + (done ? "" : "text-muted-foreground")}>
                        {s.key}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {done ? s.note : "Pending"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">{vendorName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/messages"
                  search={{ v: vendorSlug }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  <MessageCircle className="size-3.5" /> Chat with business
                </Link>
                <Link
                  to="/store/$slug"
                  params={{ slug: vendorSlug }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  Visit store
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Items</p>
              <ul className="mt-3 space-y-3 text-sm">
                {vendorOrder.order_items.length ? (
                  vendorOrder.order_items.map((line) => (
                    <li key={line.id} className="flex justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate">
                          {line.quantity}× {line.product_snapshot.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {line.product_snapshot.group}
                        </span>
                      </span>
                      <span className="shrink-0">{minorToNaira(line.line_total_minor)}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex justify-between gap-3">
                    <span>{itemCount} items</span>
                    <span>{minorToNaira(totalMinor)}</span>
                  </li>
                )}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>Total paid</span>
                <span>{minorToNaira(totalMinor)}</span>
              </div>
              <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-xs font-semibold">
                <Download className="size-3.5" /> Download receipt
              </button>
            </div>

            <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Star className="size-4 text-gold" /> After delivery
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Your review helps this business earn verification. Only real customers can review.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
