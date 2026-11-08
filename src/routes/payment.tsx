import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { app } from "@/lib/peniel-store";

const searchSchema = z.object({
  status: z.string().optional(),
  tx_ref: z.string().optional(),
  transaction_id: z.union([z.string(), z.number()]).optional(),
});

type PaymentState = "processing" | "success" | "failed" | "cancelled";

export const Route = createFileRoute("/payment")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Payment status - Peniel" },
      { name: "description", content: "Check the verified status of your Peniel payment." },
      { property: "og:title", content: "Payment status - Peniel" },
      { property: "og:description", content: "Check the verified status of your Peniel payment." },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { status, tx_ref: reference, transaction_id: transactionId } = Route.useSearch();
  const [paymentState, setPaymentState] = useState<PaymentState>("processing");

  useEffect(() => {
    if (status?.toLowerCase() === "cancelled") {
      setPaymentState("cancelled");
      return;
    }
    if (!reference || !transactionId) {
      setPaymentState("failed");
      return;
    }

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reference, transactionId: String(transactionId) }),
          signal: controller.signal,
        });
        const result = (await response.json()) as { ok?: boolean };
        if (!response.ok || !result.ok) {
          setPaymentState("failed");
          return;
        }
        app.clearCart();
        setPaymentState("success");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Could not verify returned payment", error);
        setPaymentState("failed");
      }
    })();

    return () => controller.abort();
  }, [reference, status, transactionId]);

  const config = {
    processing: {
      icon: <Loader2 className="size-8 animate-spin text-primary" />,
      tone: "bg-primary-soft",
      title: "Verifying your payment",
      body: "We are confirming the transaction directly with Flutterwave. Do not close this page.",
    },
    success: {
      icon: <CheckCircle2 className="size-8 text-success" />,
      tone: "bg-success/12",
      title: "Payment verified",
      body: "Flutterwave confirmed your payment and the order has been recorded.",
    },
    failed: {
      icon: <XCircle className="size-8 text-destructive" />,
      tone: "bg-destructive/10",
      title: "Payment not verified",
      body: "We could not confirm a successful payment. Check your Flutterwave receipt or contact support before trying again.",
    },
    cancelled: {
      icon: <Clock className="size-8 text-gold" />,
      tone: "bg-gold/15",
      title: "Payment cancelled",
      body: "No payment was confirmed. Your cart has not been cleared.",
    },
  }[paymentState];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 text-center sm:p-10">
          <div className={"mx-auto grid size-16 place-items-center rounded-full " + config.tone}>
            {config.icon}
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">{config.title}</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{config.body}</p>

          <dl className="mt-7 space-y-3 rounded-2xl border border-border bg-muted/40 p-5 text-left text-sm">
            {[
              ["Reference", reference ?? "Unavailable"],
              ["Payment provider", "Flutterwave"],
              ["Status", paymentState],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {paymentState === "success" && (
              <Link
                to="/marketplace"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
              >
                Keep shopping
              </Link>
            )}
            {(paymentState === "failed" || paymentState === "cancelled") && (
              <>
                <Link
                  to="/checkout"
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  Return to checkout
                </Link>
                <Link
                  to="/cart"
                  className="rounded-xl border border-border px-6 py-3 text-sm font-semibold"
                >
                  View cart
                </Link>
              </>
            )}
            {paymentState === "processing" && (
              <span className="text-xs text-muted-foreground">
                Waiting for the server-side verification result…
              </span>
            )}
          </div>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-success" /> Payment status is confirmed by the
            Peniel server.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
