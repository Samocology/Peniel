import { createFileRoute } from "@tanstack/react-router";
import { Download, ShieldCheck } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Vendra business console" },
      { name: "description", content: "Every payment collected on your behalf, the platform fee taken and exactly what lands in your balance." },
      { property: "og:title", content: "Transactions — Vendra business console" },
      { property: "og:description", content: "Clear money in, fees out, balance available." },
    ],
  }),
  component: VendorTransactions,
});

const tx = [
  ["TXN-99412", "#ORD-7F4X2", "Tosin Adeyemi", 26760, 535, "Paid"],
  ["TXN-99408", "#ORD-7F4X1", "Ada Nwosu", 12400, 248, "Paid"],
  ["TXN-99401", "BKG-4471", "Eko Events Ltd", 260000, 5200, "Paid"],
  ["TXN-99388", "#ORD-7F4W7", "Chidi Okeke", 22000, 440, "Paid"],
  ["TXN-99372", "#ORD-7F4W2", "Uche Eze", 9800, 0, "Refunded"],
] as const;

function VendorTransactions() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Transactions"
      subtitle="Collected securely by Vendra Pay on your behalf"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
          <Download className="size-4" /> Statement
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales" value={naira(4218000)} hint="Lifetime" tone="primary" />
        <StatCard label="Platform fees" value={naira(84360)} hint="2% per transaction" />
        <StatCard label="Vendor balance" value={naira(742300)} hint="Includes pending orders" />
        <StatCard label="Available payout" value={naira(618900)} hint="Ready on Friday" tone="gold" />
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-primary" /> You never configure a payment gateway
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vendra collects from customers, records the transaction, deducts the platform fee and pays you on schedule.
        </p>
      </div>

      <div className="mt-6">
        <Panel title="Transaction history">
          <DataTable
            head={["Reference", "Order", "Customer", "Amount", "Fee", "You earn", "Status"]}
            rows={tx.map((t) => [
              <span className="font-mono text-xs">{t[0]}</span>,
              <span className="font-mono text-xs text-muted-foreground">{t[1]}</span>,
              <span className="font-medium">{t[2]}</span>,
              naira(t[3]),
              <span className="text-muted-foreground">{naira(t[4])}</span>,
              <span className="font-semibold">{naira(t[3] - t[4])}</span>,
              <StatusPill status={t[5]} />,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
