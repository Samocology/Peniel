import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, orders } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions - Peniel admin" },
      {
        name: "description",
        content:
          "Every payment collected through Peniel Pay, with method, fee, vendor share and settlement state.",
      },
      { property: "og:title", content: "Transactions - Peniel admin" },
      { property: "og:description", content: "All money movement in one ledger." },
    ],
  }),
  component: AdminTransactions,
});

const methods = ["Card", "Bank transfer", "USSD", "Peniel wallet"];

function AdminTransactions() {
  const rows = [...orders, ...orders, ...orders].slice(0, 10);
  const [query, setQuery] = useState("");
  const visibleRows = rows.filter((order) =>
    `${order.id} ${order.vendor}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const exportLedger = () => {
    const csvRows = [
      ["Reference", "Vendor", "Method", "Amount", "Fee", "Vendor share"],
      ...visibleRows.map((order, index) => {
        const fee = Math.round(order.total * 0.02);
        return [
          `TXN-${order.id.slice(-5)}`,
          order.vendor,
          methods[index % methods.length]!,
          String(order.total),
          String(fee),
          String(order.total - fee),
        ];
      }),
    ];
    const csv = csvRows
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "peniel-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${visibleRows.length} transaction rows exported.`);
  };

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Transactions"
      subtitle="Collected through Peniel Pay"
      actions={
        <button
          type="button"
          onClick={exportLedger}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40"
        >
          <Download className="size-4" /> Export ledger
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Volume today" value={naira(48920000)} tone="primary" />
        <StatCard label="Platform fees" value={naira(978400)} tone="gold" />
        <StatCard label="Held in escrow" value={naira(6412000)} />
        <StatCard label="Failed payments" value="0.8%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel
          title="Payment ledger"
          action={
            <label className="flex items-center gap-2 rounded-xl border border-input px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Search transaction ledger"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ledger"
                className="w-28 bg-transparent text-xs outline-none sm:w-40"
              />
            </label>
          }
        >
          <DataTable
            head={["Reference", "Vendor", "Method", "Amount", "Fee", "Vendor share"]}
            rows={visibleRows.map((o, i) => [
              <span className="font-mono text-xs">TXN-{o.id.slice(-5)}</span>,
              <span className="font-medium">{o.vendor}</span>,
              <span className="text-muted-foreground">{methods[i % methods.length]}</span>,
              naira(o.total),
              naira(Math.round(o.total * 0.02)),
              naira(o.total - Math.round(o.total * 0.02)),
            ])}
          />
          {visibleRows.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions match “{query}”.
            </p>
          )}
        </Panel>

        <Panel title="How money flows">
          <ul className="space-y-4 text-sm">
            {[
              ["Customer pays Peniel", "One checkout, every business."],
              [
                "Funds held briefly",
                "Released once the order is confirmed delivered or the booking is served.",
              ],
              [
                "Vendor share settled",
                "Paid into the vendor's verified bank account on their payout schedule.",
              ],
            ].map(([t, b], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{t}</span>
                  <span className="block text-xs text-muted-foreground">{b}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Vendors never connect their own payment gateway or handle API keys.
          </p>
        </Panel>
      </div>
    </DashShell>
  );
}
