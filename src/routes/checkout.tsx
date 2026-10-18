import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Building2, CreditCard, Lock, MapPin, ShieldCheck, Smartphone, Truck } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { naira } from "@/lib/data";
import { totalsFor, useApp } from "@/lib/vendra-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vendra" },
      { name: "description", content: "Fast, secure Vendra checkout: delivery details, Vendra Pay payment methods and one confirmation." },
      { property: "og:title", content: "Checkout — Vendra" },
      { property: "og:description", content: "Fast, secure Vendra checkout with central payment protection." },
    ],
  }),
  component: CheckoutPage,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function CheckoutPage() {
  const s = useApp();
  const cartLines = s.cart;
  const totals = totalsFor(cartLines, s.promo);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {["Cart", "Checkout", "Payment", "Confirmation"].map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={
                  "grid size-5 place-items-center rounded-full text-[10px] font-bold " +
                  (i <= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                }
              >
                {i + 1}
              </span>
              <span className={i <= 1 ? "font-semibold" : "text-muted-foreground"}>{s}</span>
              {i < 3 && <span className="h-px w-6 bg-border" />}
            </span>
          ))}
        </div>

        <h1 className="mt-6 font-display text-3xl font-bold">Checkout</h1>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold">Customer information</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className={label}>Full name</span>
                  <input className={field} defaultValue="Tosin Adeyemi" />
                </div>
                <div>
                  <span className={label}>Phone number</span>
                  <input className={field} defaultValue="+234 803 000 0000" />
                </div>
                <div className="sm:col-span-2">
                  <span className={label}>Email</span>
                  <input className={field} defaultValue="tosin@example.com" />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold">Delivery</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [Truck, "Deliver to me", "45–70 mins · ₦2,500"],
                  [MapPin, "Pick up myself", "Ready in 25 mins · Free"],
                ].map(([Icon, t, s], i) => {
                  const I = Icon as typeof Truck;
                  return (
                    <label
                      key={t as string}
                      className={
                        "flex cursor-pointer items-start gap-3 rounded-xl border p-4 " +
                        (i === 0 ? "border-primary bg-primary-soft" : "border-border")
                      }
                    >
                      <input type="radio" name="fulfilment" defaultChecked={i === 0} className="mt-1 accent-primary" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 text-sm font-semibold">
                          <I className="size-4 text-primary" /> {t as string}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{s as string}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className={label}>Delivery address</span>
                  <input className={field} defaultValue="12 Adeola Odeku Street, Victoria Island" />
                </div>
                <div>
                  <span className={label}>City</span>
                  <input className={field} defaultValue="Lagos" />
                </div>
                <div>
                  <span className={label}>Landmark (optional)</span>
                  <input className={field} placeholder="Opposite Eko Hotel gate" />
                </div>
                <div className="sm:col-span-2">
                  <span className={label}>Delivery note</span>
                  <textarea rows={2} className={field} placeholder="Call when you arrive at the gate" />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">Payment</h2>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                  <ShieldCheck className="size-3.5" /> Vendra Pay
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Payments are handled securely by Vendra. Businesses never see your card details.
              </p>
              <div className="mt-4 space-y-3">
                {[
                  [CreditCard, "Card", "Visa, Mastercard, Verve"],
                  [Building2, "Bank transfer", "Pay to a one-time Vendra account number"],
                  [Smartphone, "USSD", "Complete on your phone"],
                  [Banknote, "Vendra wallet", "Balance ₦18,400"],
                ].map(([Icon, t, s], i) => {
                  const I = Icon as typeof CreditCard;
                  return (
                    <label
                      key={t as string}
                      className={
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-4 " +
                        (i === 0 ? "border-primary bg-primary-soft" : "border-border")
                      }
                    >
                      <input type="radio" name="pay" defaultChecked={i === 0} className="accent-primary" />
                      <I className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{t as string}</span>
                        <span className="block text-xs text-muted-foreground">{s as string}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-24">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="font-display text-lg font-bold">Order summary</p>
              <ul className="mt-4 space-y-3 text-sm">
                {cartLines.map((l) => (
                  <li key={l.id} className="flex justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {l.qty}× {l.item}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">{l.vendor}</span>
                    </span>
                    <span className="shrink-0">{naira(l.price * l.qty)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                {[
                  ["Subtotal", totals.subtotal],
                  ...(totals.discount ? [["Promo discount", -totals.discount]] : []),
                  ["Delivery", totals.delivery],
                  ["Platform fee", totals.platformFee],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex justify-between">
                    <dt className="text-muted-foreground">{l as string}</dt>
                    <dd>{naira(v as number)}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 flex justify-between border-t border-border pt-4">
                <span className="font-semibold">Total to pay</span>
                <span className="font-display text-xl font-bold text-primary">{naira(totals.total)}</span>
              </div>
              <Link
                to="/payment"
                search={{ state: "processing", amount: totals.total }}
                disabled={!cartLines.length}
                className="mt-5 block aria-disabled:pointer-events-none aria-disabled:opacity-50 rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Pay {naira(totals.total)}
              </Link>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="size-3.5" /> Encrypted end-to-end
              </p>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                By paying you agree to Vendra's Terms and Refund Policy.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
