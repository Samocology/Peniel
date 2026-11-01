import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { naira } from "@/lib/data";
import { app } from "@/lib/peniel-store";

const searchSchema = z.object({
  state: z.enum(["processing", "success", "failed", "cancelled"]).default("success"),
  amount: z.number().optional(),
  checkoutId: z.string().optional(),
  orderId: z.string().optional(),
});

export const Route = createFileRoute("/payment")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Payment status - Peniel" },
      { name: "description", content: "View the result of a local demo checkout. No real payment is processed." },
      { property: "og:title", content: "Payment status - Peniel" },
      { property: "og:description", content: "Local demo checkout status." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { state, amount, checkoutId, orderId }: z.infer<typeof searchSchema> = Route.useSearch();
  const navigate = useNavigate({ from: "/payment" });
  const totals = { total: amount ?? 0 };
  useEffect(() => {
    if (state !== "processing" || !checkoutId) return;
    const id = setTimeout(() => {
      const createdOrderIds = app.completeCheckout(checkoutId);
      const firstOrderId = createdOrderIds[0];
      if (!firstOrderId) {
        navigate({ to: "/cart", replace: true });
        return;
      }
      navigate({ search: { state: "success", amount, checkoutId, orderId: firstOrderId }, replace: true });
    }, 2200);
    return () => clearTimeout(id);
  }, [state, amount, checkoutId, navigate]);

  const config = {
    processing: {
      icon: checkoutId
        ? <Loader2 className="size-8 animate-spin text-primary" />
        : <Clock className="size-8 text-primary" />,
      tone: "bg-primary-soft",
      title: checkoutId ? "Completing demo checkout" : "Processing preview",
      body: checkoutId
        ? "This demo is simulating a successful payment. Orders will be saved locally when it completes."
        : "Preview only. Start from checkout to simulate a payment and create vendor orders.",
    },
    success: {
      icon: <CheckCircle2 className="size-8 text-success" />,
      tone: "bg-success/12",
      title: "Payment successful",
      body: checkoutId
        ? "The payment simulation is complete. Your orders are saved in this browser and appear in each vendor's dashboard."
        : "Preview state only. No payment was processed.",
    },
    failed: {
      icon: <XCircle className="size-8 text-destructive" />,
      tone: "bg-destructive/10",
      title: "Payment failed",
      body: "Preview state only. No payment was processed, and your cart remains unchanged.",
    },
    cancelled: {
      icon: <Clock className="size-8 text-gold" />,
      tone: "bg-gold/15",
      title: "Payment cancelled",
      body: "Preview state only. No payment was processed, and your cart remains unchanged.",
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
              ["Reference", checkoutId ?? "Preview transaction"],
              ["Method", "Demo simulation"],
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
                {orderId && (
                  <Link
                    to="/orders/$id"
                    params={{ id: orderId }}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                  >
                    Track my order
                  </Link>
                )}
                {orderId && (
                  <Link to="/orders" className="rounded-xl border border-border px-6 py-3 text-sm font-semibold">
                    View all orders
                  </Link>
                )}
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
              <span className="text-xs text-muted-foreground">
                {checkoutId ? "This simulation completes in a few seconds…" : "Preview only - no payment is being processed."}
              </span>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> Demo only - no real payment is processed.
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
