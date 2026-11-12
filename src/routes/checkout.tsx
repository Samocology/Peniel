import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Lock, ShieldCheck, Truck, Wallet } from "lucide-react";
import { useRef, useState, useEffect, type FormEvent } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { naira } from "@/lib/data";
import { app, totalsFor, useApp } from "@/lib/peniel-store";
import { customersApi } from "@/lib/api-client";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Peniel" },
      { name: "description", content: "Secure checkout for Peniel marketplace orders." },
      { property: "og:title", content: "Checkout - Peniel" },
      { property: "og:description", content: "Secure checkout for Peniel marketplace orders." },
    ],
  }),
  component: CheckoutPage,
});

const field =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function CheckoutPage() {
  const s = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [wallet, setWallet] = useState<{ balanceMinor: number; currency: string } | null>(null);
  const [useWallet, setUseWallet] = useState(false);
  const idempotencyKey = useRef(
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const cartLines = s.cart;
  const totals = totalsFor(cartLines, s.promo);

  useEffect(() => {
    let active = true;
    customersApi
      .wallet()
      .then((result) => {
        if (!active) return;
        if (result.ok) setWallet(result.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const walletBalanceKobo = wallet?.balanceMinor ?? 0;
  const walletAmountKobo = useWallet ? Math.min(walletBalanceKobo, totals.total * 100) : 0;
  const payableTotal = totals.total - walletAmountKobo / 100;

  const startPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutError("");
    if (cartLines.some((line) => !line.productId || !/^[0-9a-f-]{36}$/i.test(line.productId))) {
      setCheckoutError(
        "These cart items are demo catalog entries and are not available for real checkout yet.",
      );
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKey.current,
          items: cartLines.map((line) => ({ productId: line.productId, quantity: line.qty })),
          delivery: {
            fullName: formData.get("fullName"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            city: formData.get("city"),
            state: formData.get("state"),
            landmark: formData.get("landmark"),
            note: formData.get("note"),
          },
          useWallet,
          walletAmountMinor: walletAmountKobo,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        data?: {
          paymentUrl?: string | null;
          walletPaid?: boolean;
          walletUsedMinor?: number;
        };
      };
      if (!response.ok || !result.ok) {
        setCheckoutError(
          result.error ?? "Could not start checkout. Your cart has not been charged.",
        );
        return;
      }

      if (result.data?.walletPaid || !result.data?.paymentUrl) {
        app.clearCart();
        window.location.assign(
          `/payment?status=success&tx_ref=${result.data?.walletPaid ? "wallet" : ""}`,
        );
        return;
      }

      const paymentUrl = new URL(result.data.paymentUrl);
      if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "checkout.flutterwave.com") {
        throw new Error("The payment provider returned an unexpected checkout URL.");
      }
      window.location.assign(paymentUrl.toString());
    } catch (error) {
      console.error("Could not start checkout", error);
      setCheckoutError("Checkout is temporarily unavailable. Your cart has not been charged.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <form onSubmit={startPayment}>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {["Cart", "Checkout", "Payment", "Confirmation"].map((s, i) => (
              <span key={s} className="flex items-center gap-2">
                <span
                  className={
                    "grid size-5 place-items-center rounded-full text-[10px] font-bold " +
                    (i <= 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground")
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
                    <input
                      className={field}
                      name="fullName"
                      minLength={2}
                      maxLength={120}
                      required
                      defaultValue={s.user?.name ?? ""}
                    />
                  </div>
                  <div>
                    <span className={label}>Phone number</span>
                    <input
                      className={field}
                      name="phone"
                      type="tel"
                      minLength={7}
                      maxLength={32}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={label}>Email</span>
                    <input className={field} type="email" value={s.user?.email ?? ""} readOnly />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <h2 className="font-display text-lg font-bold">Delivery</h2>
                <div className="flex items-start gap-3 rounded-xl border border-primary bg-primary-soft p-4">
                  <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm font-semibold">
                    Delivery
                    <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                      Delivery charges are calculated from the live checkout settings.
                    </span>
                  </span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <span className={label}>Delivery address</span>
                    <input
                      className={field}
                      name="address"
                      minLength={5}
                      maxLength={500}
                      required
                    />
                  </div>
                  <div>
                    <span className={label}>City</span>
                    <input className={field} name="city" maxLength={120} required />
                  </div>
                  <div>
                    <span className={label}>State</span>
                    <input className={field} name="state" maxLength={120} required />
                  </div>
                  <div>
                    <span className={label}>Landmark (optional)</span>
                    <input
                      className={field}
                      name="landmark"
                      maxLength={200}
                      placeholder="Opposite Eko Hotel gate"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <span className={label}>Delivery note</span>
                    <textarea
                      rows={2}
                      className={field}
                      name="note"
                      maxLength={1000}
                      placeholder="Call when you arrive at the gate"
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold">Payment</h2>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                    <ShieldCheck className="size-3.5" /> Peniel Pay
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Payments are securely processed by Flutterwave. The server calculates the final
                  amount from the live catalog.
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary bg-primary-soft p-4">
                  <CreditCard className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">Flutterwave secure checkout</span>
                    <span className="block text-xs text-muted-foreground">
                      Available payment methods are shown by Flutterwave.
                    </span>
                  </span>
                </div>
                {walletBalanceKobo > 0 && (
                  <div
                    className={[
                      "mt-3 flex items-center gap-3 rounded-xl border p-4",
                      useWallet ? "border-primary bg-primary-soft" : "border-border bg-muted",
                    ].join(" ")}
                  >
                    <Wallet className="size-4 shrink-0 text-primary" />
                    <span className="min-w-0 flex-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useWallet}
                          onChange={() => setUseWallet((u) => !u)}
                          className="rounded border-primary text-primary bg-transparent"
                        />
                        <span className="block font-semibold">Use Peniel Wallet</span>
                        <span className="block text-xs text-muted-foreground">
                          Pay ₦{walletBalanceKobo / 100} from your wallet balance
                        </span>
                      </label>
                    </span>
                    <span className="shrink-0 font-display font-bold text-primary">
                      -{naira(walletAmountKobo / 100)}
                    </span>
                  </div>
                )}
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
                        <span className="block truncate text-xs text-muted-foreground">
                          {l.vendor}
                        </span>
                      </span>
                      <span className="shrink-0">{naira(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                  {[
                    ["Estimated subtotal", totals.subtotal],
                    ...(totals.discount ? [["Promo discount", -totals.discount]] : []),
                    ["Delivery", totals.delivery],
                    ["Platform fee", totals.platformFee],
                    ...(useWallet && walletAmountKobo > 0
                      ? [["Wallet", -walletAmountKobo / 100]]
                      : []),
                  ].map(([l, v]) => (
                    <div key={l as string} className="flex justify-between">
                      <dt className="text-muted-foreground">{l as string}</dt>
                      <dd>{naira(v as number)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-semibold">Payable total</span>
                  <span className="font-display text-xl font-bold text-primary">
                    {naira(payableTotal)}
                  </span>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !cartLines.length}
                  className="mt-5 block w-full rounded-xl bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isSubmitting ? "Starting secure checkout…" : "Continue to secure payment"}
                </button>
                {checkoutError && (
                  <p role="alert" className="mt-3 text-center text-sm text-destructive">
                    {checkoutError}
                  </p>
                )}
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="size-3.5" /> Secure checkout by Flutterwave
                </p>
                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Demo catalog products cannot be purchased until they are added to the live
                  marketplace.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </form>
      <SiteFooter />
    </div>
  );
}
