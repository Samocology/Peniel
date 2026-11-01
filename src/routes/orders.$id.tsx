import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ChefHat, CircleDot, Download, MessageCircle, Package, ShieldCheck, Star, Truck } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { getVendor, naira, orders } from "@/lib/data";
import { app, mergeVendor, type OrderLine } from "@/lib/peniel-store";

export const Route = createFileRoute("/orders/$id")({
  loader: ({ params }) => {
    const savedOrder = app.get().orders.find((o) => o.id === params.id);
    if (savedOrder) {
      const baseVendor = getVendor(savedOrder.vendorSlug);
      const vendor = baseVendor ? mergeVendor(baseVendor, app.account(savedOrder.vendorSlug)) : null;
      return {
        order: {
          id: savedOrder.id,
          vendor: vendor?.name ?? savedOrder.vendorSlug,
          vendorSlug: savedOrder.vendorSlug,
          kind:
            vendor?.fulfilment === "booking"
              ? "booking" as const
              : vendor?.fulfilment === "reservation"
                ? "reservation" as const
                : "order" as const,
          placed: savedOrder.createdAt ? new Date(savedOrder.createdAt).toLocaleString() : "Saved in this browser",
          status: savedOrder.status,
          total: savedOrder.total,
          items: savedOrder.items,
        },
        vendor,
        lines: savedOrder.lineItems ?? [],
        isSaved: true,
      };
    }
    const order = orders.find((o) => o.id === params.id);
    if (!order) throw notFound();
    return {
      order,
      vendor: getVendor(order.vendorSlug) ?? null,
      lines: [],
      isSaved: false,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Order unavailable - Peniel" }, { name: "robots", content: "noindex" }] };
    }
    const o = loaderData.order;
    return {
      meta: [
        { title: `Order ${o.id} - ${o.vendor} on Peniel` },
        { name: "description", content: `Live tracking for your ${o.vendor} order: ${o.status}. Placed ${o.placed}.` },
        { property: "og:title", content: `Order ${o.id} - ${o.vendor}` },
        { property: "og:description", content: `Live order tracking on Peniel. Status: ${o.status}.` },
      ],
    };
  },
  component: OrderTracking,
});

const steps = [
  { key: "Order received", icon: Check, note: "Payment confirmed by Peniel Pay" },
  { key: "Confirmed by business", icon: CircleDot, note: "Accepted 10:26 AM" },
  { key: "Preparing", icon: ChefHat, note: "Kitchen is on it · ~25 mins" },
  { key: "Out for delivery", icon: Truck, note: "Rider assigned" },
  { key: "Delivered", icon: Package, note: "Enjoy!" },
];

function OrderTracking() {
  const { order, vendor, lines, isSaved } = Route.useLoaderData();
  const activeIndex =
    order.status === "Delivered" ? 4
      : order.status === "Out for delivery" ? 3
        : order.status === "Preparing" ? 2
          : order.status === "Confirmed" ? 1
            : order.status === "New" ? 0
              : -1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 sm:p-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <ShieldCheck className="size-3.5" /> {isSaved ? "Order saved locally" : "Demo tracking preview"}
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                {order.kind === "booking" ? "Appointment" : order.kind === "reservation" ? "Reservation" : "Order"}{" "}
                {order.status.toLowerCase()}
              </h1>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{order.id}</p>
            </div>
            <div className="shrink-0 text-right">
              <StatusPill status={order.status} />
              <p className="mt-2 font-display text-lg font-bold">{naira(order.total)}</p>
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
                          (done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                        }
                      >
                        <I className="size-4" />
                      </span>
                      {i < steps.length - 1 && (
                        <span
                          className={"absolute top-8 h-full w-px " + (i < activeIndex ? "bg-primary" : "bg-border")}
                        />
                      )}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className={"font-semibold " + (done ? "" : "text-muted-foreground")}>{s.key}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{done ? s.note : "Pending"}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {!isSaved && (
              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm">
                <p className="font-semibold">Estimated arrival</p>
                <p className="mt-1 text-muted-foreground">Today between 11:05 AM and 11:35 AM · 12 Adeola Odeku St, VI</p>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">{order.vendor}</p>
              {vendor && <p className="mt-0.5 text-xs text-muted-foreground">{vendor.location}</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/messages" search={{ v: order.vendorSlug }} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold">
                  <MessageCircle className="size-3.5" /> Chat with business
                </Link>
                <Link
                  to="/store/$slug"
                  params={{ slug: order.vendorSlug }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold"
                >
                  Visit store
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold">Items</p>
              <ul className="mt-3 space-y-3 text-sm">
                {lines.length ? lines.map((line: OrderLine) => (
                  <li key={line.item} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate">
                        {line.qty}× {line.item}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{line.meta}</span>
                    </span>
                    <span className="shrink-0">{naira(line.price * line.qty)}</span>
                  </li>
                )) : (
                  <li className="flex justify-between gap-3">
                    <span>{order.items}</span>
                    <span>{naira(order.total)}</span>
                  </li>
                )}
              </ul>
              <div className="mt-4 flex justify-between border-t border-border pt-3 text-sm font-semibold">
                <span>Total paid</span>
                <span>{naira(order.total)}</span>
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
