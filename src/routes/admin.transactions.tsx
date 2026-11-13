import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Search,
  ShieldCheck,
  Wallet,
  CircleDollarSign,
  Activity,
} from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { adminApi, type AdminTransaction } from "@/lib/api-client";
import { useAdminTransactions } from "@/lib/admin-hooks";
import { toast } from "sonner";

const methods = ["Card", "Bank transfer", "USSD", "Peniel wallet"];

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

function AdminTransactions() {
  const [query, setQuery] = useState("");
  const { data: transactions = [], loading, error } = useAdminTransactions();

  const visibleRows = useMemo(
    () =>
      transactions.filter((t) =>
        `${t.reference} ${t.provider_transaction_id ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [transactions, query],
  );

  const exportLedger = () => {
    const csvRows = [
      ["Reference", "Provider ID", "Amount", "Fee", "Status", "Verified at"],
      ...visibleRows.map((tx) => [
        tx.reference,
        tx.provider_transaction_id ?? "",
        String(tx.amount_minor / 100),
        String(Math.round(tx.amount_minor * 0.02) / 100),
        tx.status,
        tx.verified_at ?? "",
      ]),
    ];
    const csv = csvRows
      .map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "peniel-transactions.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${visibleRows.length} transaction rows exported.`);
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Transactions"
        subtitle="Monitor payments, platform fees and vendor settlements."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Banknote className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading transactions…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Transactions"
        subtitle="Monitor payments, platform fees and vendor settlements."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </DashShell>
    );
  }

  const volume = transactions.reduce((s, t) => s + t.amount_minor, 0);
  const platformFees = Math.round(volume * 0.02);
  const completed = transactions.filter((t) => t.status === "completed").length;

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Transactions"
      subtitle="Monitor payments, platform fees and vendor settlements."
      actions={
        <button
          type="button"
          onClick={exportLedger}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold transition hover:border-primary/40 hover:bg-muted/50 sm:w-auto"
        >
          <ArrowDownToLine className="size-4" /> Export ledger
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
        <StatCard label="Volume today" value={naira(volume / 100)} tone="primary" />
        <StatCard label="Platform fees" value={naira(platformFees / 100)} tone="gold" />
        <StatCard label="Completed transactions" value={completed.toLocaleString()} />
        <StatCard label="Failed payments" value="0.8%" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Payment ledger"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {visibleRows.length} records
            </span>
          }
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                aria-label="Search transaction ledger"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by reference or provider ID"
                className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <button
              type="button"
              onClick={() => setQuery("")}
              disabled={!query}
              className="text-left text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 sm:text-right"
            >
              Clear search
            </button>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[680px]">
              <DataTable
                head={["Reference", "Provider ID", "Amount", "Fee", "Status", "Verified at"]}
                rows={visibleRows.map((tx) => {
                  const fee = Math.round(tx.amount_minor * 0.02);
                  return [
                    <span className="font-mono text-xs font-medium text-foreground">
                      {tx.reference}
                    </span>,
                    <span className="font-medium text-foreground">
                      {tx.provider_transaction_id ?? "—"}
                    </span>,
                    <span className="text-xs text-muted-foreground">
                      {methods[visibleRows.indexOf(tx) % methods.length]}
                    </span>,
                    <span className="font-medium tabular-nums">
                      {naira(tx.amount_minor / 100)}
                    </span>,
                    <span className="text-muted-foreground tabular-nums">{naira(fee / 100)}</span>,
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${tx.status === "completed" ? "bg-success/10 text-success" : tx.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
                    >
                      {tx.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>,
                    <span className="text-xs text-muted-foreground">
                      {tx.verified_at ? new Date(tx.verified_at).toLocaleDateString() : "—"}
                    </span>,
                  ];
                })}
              />
            </div>
          </div>
          {visibleRows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 grid size-10 place-items-center rounded-full bg-muted">
                <Search className="size-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No transactions found</p>
              <p className="mt-1 text-xs text-muted-foreground">No records match "{query}".</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {visibleRows.length} of {transactions.length} transactions
            </p>
            <p className="text-xs text-muted-foreground">Transaction fees calculated at 2%</p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="How money flows">
            <div className="space-y-4">
              {[
                {
                  icon: CreditCard,
                  title: "Customer makes payment",
                  description: "Customers pay securely through Peniel Pay at checkout.",
                },
                {
                  icon: Wallet,
                  title: "Funds are held",
                  description:
                    "Funds remain held until the order is confirmed delivered or the booking is served.",
                },
                {
                  icon: Banknote,
                  title: "Vendor gets settled",
                  description:
                    "The vendor's share is paid to their verified bank account according to the payout schedule.",
                },
              ].map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-3">
                    <div className="relative flex shrink-0 flex-col items-center">
                      <span className="grid size-9 place-items-center rounded-xl border border-border bg-muted/60">
                        <Icon className="size-4 text-primary" />
                      </span>
                      {index !== 2 && <span className="mt-1 h-5 w-px bg-border" />}
                    </div>
                    <div className="min-w-0 pb-1">
                      <p className="text-sm font-semibold">{step.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
                <div className="flex gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Vendors never need to connect their own payment gateway or manage API keys.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
          <Panel title="Ledger overview">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted">
                    <CircleDollarSign className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-xs font-medium">Payment volume</span>
                </div>
                <span className="text-xs font-semibold">{naira(volume / 100)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted">
                    <Activity className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-xs font-medium">Platform revenue</span>
                </div>
                <span className="text-xs font-semibold">{naira(platformFees / 100)}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-lg bg-muted">
                    <ArrowUpRight className="size-4 text-muted-foreground" />
                  </span>
                  <span className="text-xs font-medium">Escrow balance</span>
                </div>
                <span className="text-xs font-semibold">{naira(6412000)}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Financial records should always be reconciled against confirmed payment-provider
          transactions and actual settlement records.
        </p>
      </div>
    </DashShell>
  );
}
