import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { cartTotals, naira, orders } from "@/lib/data";

const searchSchema = z.object({
  state: z.enum(["processing", "success", "failed", "cancelled"]).default("success"),
});

export const Route = createFileRoute("/payment")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Payment status — Vendra" },
      { name: "description", content: "Track your Vendra Pay transaction: processing, successful, failed or cancelled payment states." },
      { property: "og:title", content: "Payment status — Vendra" },
      { property: "og:description", content: "Track your Vendra Pay transaction status." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { state } = Route.useSearch();
  const totals = cartTotals();
  const order = orders[0]!;

  const config = {
    processing: {
      icon: <Loader2 className="size-8 animate-spin text-primary" />,
      tone: "bg-primary-soft",
      title: "Confirming your payment",
      body: "Hold on — we're confirming this transaction with your bank. Do not close this page.",
    },
    success: {
      icon: <CheckCircle2 className="size-8 text-success" />,
      tone: "bg-success/12",
      title: "Payment successful",
      body: "Your money is held securely by Vendra Pay and released to each business after fulfilment.",
    },
    failed: {
      icon: <XCircle className="size-8 text-destructive" />,
      tone: "bg-destructive/10",
      title: "Payment failed",
      body: "Your bank declined this transaction. Nothing was charged. Try another method.",
    },
    cancelled: {
      icon: <Clock className="size-8 text-gold" />,
      tone: "bg-gold/15",
      title: "Payment cancelled",
      body: "You cancelled before completing payment. Your cart is still saved.",
    },
  }[state];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
          <div className={"mx-auto grid size-16 place-items-center rounded-full " + config.tone}>{config.icon}</div>
          <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{config.title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{config.body}</p>

          <dl className="mt-7 space-y-3 rounded-2xl border border-border bg-muted/40 p-5 text-left text-sm">
            {[
              ["Amount", naira(totals.total)],
              ["Reference", "VNP-8842-2K9L1"],
              ["Method", "Card · Mastercard ••3421"],
              ["Date", "23 May 2025, 10:24 AM"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {state === "success" && (
              <>
                <Link
                  to="/orders/$id"
                  params={{ id: order.id }}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  Track my order
                </Link>
                <Link to="/marketplace" className="rounded-xl border border-border px-6 py-3 text-sm font-semibold">
                  Keep shopping
                </Link>
              </>
            )}
            {(state === "failed" || state === "cancelled") && (
              <>
                <Link to="/checkout" className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
                  Try again
                </Link>
                <Link to="/cart" className="rounded-xl border border-border px-6 py-3 text-sm font-semibold">
                  Back to cart
                </Link>
              </>
            )}
            {state === "processing" && (
              <span className="text-xs text-muted-foreground">This usually takes under 30 seconds…</span>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> Every payment on Vendra is protected until the business delivers.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-muted-foreground">Preview states:</span>
          {(["processing", "success", "failed", "cancelled"] as const).map((s) => (
            <Link
              key={s}
              to="/payment"
              search={{ state: s }}
              className={
                "rounded-full border px-3 py-1 font-medium " +
                (s === state ? "border-primary text-primary" : "border-border text-muted-foreground")
              }
            >
              {s}
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
