import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShieldCheck, ShoppingBasket, Store, Tag, Trash2 } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useState } from "react";
import { toast } from "sonner";
import { getVendor, naira } from "@/lib/data";
import { app, totalsFor, useApp } from "@/lib/peniel-store";
import { ItemArt } from "@/components/store/store-kit";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart - Peniel" },
      {
        name: "description",
        content:
          "Review items from every Peniel business in one cart and check out securely with Peniel Pay.",
      },
      { property: "og:title", content: "Your cart - Peniel" },
      {
        property: "og:description",
        content: "Review items from every Peniel business in one cart and check out securely.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const s = useApp();
  const cartLines = s.cart;
  const totals = totalsFor(cartLines, s.promo);
  const [code, setCode] = useState("");
  const groups = Array.from(new Set(cartLines.map((l) => l.vendorSlug)));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-display text-3xl font-bold">Your cart</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {cartLines.length} items from {groups.length} businesses · one checkout, one payment
        </p>

        {cartLines.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border p-10 text-center">
            <ShoppingBasket className="mx-auto size-10 text-primary" />
            <p className="mt-3 font-display text-xl font-bold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Find something you love from a Peniel business.
            </p>
            <Link
              to="/marketplace"
              className="mt-5 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Explore businesses
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
            <div className="space-y-6">
              {groups.map((slug) => {
                const lines = cartLines.filter((l) => l.vendorSlug === slug);
                const first = lines[0]!;
                return (
                  <div key={slug} className="rounded-2xl border border-border bg-card">
                    <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                      <div className="flex min-w-0 items-center gap-2">
                        <Store className="size-4 shrink-0 text-primary" />
                        <Link
                          to="/store/$slug"
                          params={{ slug }}
                          className="truncate text-sm font-semibold hover:text-primary"
                        >
                          {first.vendor}
                        </Link>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lines.length} item{lines.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {lines.map((l, index) => (
                        <div
                          key={l.id}
                          className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 p-4 sm:gap-4 sm:p-5 sm:grid-cols-[72px_minmax(0,1fr)_auto]"
                        >
                          {getVendor(l.vendorSlug) ? (
                            <ItemArt
                              vendor={getVendor(l.vendorSlug)!}
                              seed={index}
                              label={l.item}
                              className="size-16 shrink-0 rounded-xl sm:size-18"
                            />
                          ) : (
                            <div className="size-16 shrink-0 rounded-xl bg-primary-soft sm:size-18" />
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold">{l.item}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{l.meta}</p>
                            <div className="mt-3 flex items-center gap-4">
                              <div className="flex items-center gap-3 rounded-lg border border-border px-2 py-1">
                                <button
                                  onClick={() => app.setQty(l.id, l.qty - 1)}
                                  aria-label="Decrease quantity"
                                  className="grid size-6 place-items-center text-muted-foreground"
                                >
                                  <Minus className="size-3.5" />
                                </button>
                                <span className="w-4 text-center text-sm font-semibold">
                                  {l.qty}
                                </span>
                                <button
                                  onClick={() => app.setQty(l.id, l.qty + 1)}
                                  aria-label="Increase quantity"
                                  className="grid size-6 place-items-center text-muted-foreground"
                                >
                                  <Plus className="size-3.5" />
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  app.setQty(l.id, 0);
                                  toast("Removed from cart");
                                }}
                                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" /> Remove
                              </button>
                            </div>
                          </div>
                          <p className="col-span-2 font-display font-bold sm:col-span-1 sm:text-right">
                            {naira(l.price * l.qty)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <Link to="/marketplace" className="inline-block text-sm font-semibold text-primary">
                ← Continue shopping
              </Link>
            </div>

            <aside className="space-y-4 self-start lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="font-display text-lg font-bold">Order summary</p>
                <dl className="mt-4 space-y-2.5 text-sm">
                  {[
                    ["Subtotal", totals.subtotal],
                    ...(totals.discount ? [[`Promo ${s.promo}`, -totals.discount]] : []),
                    ["Delivery", totals.delivery],
                    ["Platform fee (2%)", totals.platformFee],
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <dt className="text-muted-foreground">{l as string}</dt>
                      <dd>{naira(v as number)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold">Total</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {naira(totals.total)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="mt-5 block rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground transition hover:opacity-90"
                >
                  Proceed to checkout
                </Link>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck className="size-3.5 text-success" /> Secured by Peniel Pay
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Tag className="size-4 text-gold" /> Promo code
                </p>
                <div className="mt-3 flex gap-2">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Try WEEKEND10"
                    className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    onClick={() =>
                      app.applyPromo(code)
                        ? toast.success("Promo applied")
                        : toast.error("That code isn't valid")
                    }
                    className="shrink-0 rounded-lg border border-border px-4 text-sm font-semibold"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 text-sm">
                <p className="font-semibold">One cart, many businesses</p>
                <p className="mt-1 text-muted-foreground">
                  Each business is paid separately after fulfilment. You only make one payment.
                </p>
              </div>
            </aside>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
