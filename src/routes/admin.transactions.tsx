import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira, orders } from "@/lib/data";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions - Peniel admin" },
      { name: "description", content: "Every payment collected through Peniel Pay, with method, fee, vendor share and settlement state." },
      { property: "og:title", content: "Transactions - Peniel admin" },
      { property: "og:description", content: "All money movement in one ledger." },
    ],
  }),
  component: AdminTransactions,
});

const methods = ["Card", "Bank transfer", "USSD", "Peniel wallet"];

function AdminTransactions() {
  const rows = [...orders, ...orders, ...orders].slice(0, 10);

  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Transactions" subtitle="Collected through Peniel Pay">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Volume today" value={naira(48920000)} tone="primary" />
        <StatCard label="Platform fees" value={naira(978400)} tone="gold" />
        <StatCard label="Held in escrow" value={naira(6412000)} />
        <StatCard label="Failed payments" value="0.8%" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Payment ledger">
          <DataTable
            head={["Reference", "Vendor", "Method", "Amount", "Fee", "Vendor share"]}
            rows={rows.map((o, i) => [
              <span className="font-mono text-xs">TXN-{o.id.slice(-5)}</span>,
              <span className="font-medium">{o.vendor}</span>,
              <span className="text-muted-foreground">{methods[i % methods.length]}</span>,
              naira(o.total),
              naira(Math.round(o.total * 0.02)),
              naira(o.total - Math.round(o.total * 0.02)),
            ])}
          />
        </Panel>

        <Panel title="How money flows">
          <ul className="space-y-4 text-sm">
            {[
              ["Customer pays Peniel", "One checkout, every business."],
              ["Funds held briefly", "Released once the order is confirmed delivered or the booking is served."],
              ["Vendor share settled", "Paid into the vendor's verified bank account on their payout schedule."],
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
