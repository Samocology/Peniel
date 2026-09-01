import { createFileRoute, Link } from "@tanstack/react-router";
import { PackageSearch, RotateCcw, Star } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { naira, orders } from "@/lib/data";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order history — Vendra" },
      { name: "description", content: "Every order and booking you've placed across Vendra businesses, with tracking, receipts and one-tap reorder." },
      { property: "og:title", content: "Order history — Vendra" },
      { property: "og:description", content: "All your Vendra orders and bookings in one place." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Orders & bookings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track, reorder and review everything you've bought on Vendra.</p>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {["All", "Active", "Completed", "Bookings", "Cancelled"].map((f, i) => (
            <span
              key={f}
              className={
                "rounded-full border px-4 py-1.5 font-medium " +
                (i === 0 ? "border-primary bg-primary-soft text-primary" : "border-border text-muted-foreground")
              }
            >
              {f}
            </span>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{o.vendor}</p>
                  <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{o.id}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {o.items} · {o.placed}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusPill status={o.status} />
                  <p className="mt-2 font-display font-bold">{naira(o.total)}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4 text-sm">
                <Link
                  to={o.kind === "booking" ? "/bookings/$id" : "/orders/$id"}
                  params={{ id: o.id }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
                >
                  <PackageSearch className="size-3.5" /> {o.kind === "booking" ? "View booking" : "Track order"}
                </Link>
                <Link
                  to="/store/$slug"
                  params={{ slug: o.vendorSlug }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold"
                >
                  <RotateCcw className="size-3.5" /> Reorder
                </Link>
                {(o.status === "Delivered" || o.status === "Confirmed") && (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold">
                    <Star className="size-3.5 text-gold" /> Leave a review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
