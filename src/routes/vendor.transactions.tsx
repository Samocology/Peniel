import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Download, Landmark, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { app, useApp, useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/transactions")({
  head: () => ({
    meta: [
      { title: "Finance - Peniel business console" },
      { name: "description", content: "Review recorded transactions, payout estimates, bank details and Peniel card options." },
      { property: "og:title", content: "Finance - Peniel business console" },
      { property: "og:description", content: "Review business transactions and payout information." },
    ],
  }),
  component: VendorFinance,
});

const inputClass = "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";
const labelClass = "mb-1.5 block text-xs font-semibold text-muted-foreground";

function VendorFinance() {
  const { vendor, account } = useCurrentVendor();
  const state = useApp();
  const [editingBank, setEditingBank] = useState(false);
  const orders = state.orders.filter((order) => order.vendorSlug === vendor.slug);
  const activeOrders = orders.filter((order) => order.status !== "Cancelled");
  const completed = activeOrders.filter((order) => order.status === "Delivered");
  const pending = activeOrders
    .filter((order) => order.status !== "Delivered")
    .reduce((sum, order) => sum + order.total, 0);
  const sales = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const fees = activeOrders.reduce((sum, order) => sum + Math.round(order.total * 0.02), 0);
  const available = completed.reduce((sum, order) => sum + order.total - Math.round(order.total * 0.02), 0);
  const activity = vendor.fulfilment === "order" ? "orders" : vendor.fulfilment === "booking" ? "appointments" : "reservations";

  const saveBank = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const linked = app.linkPayoutBank(
      String(form.get("bankName") ?? ""),
      String(form.get("accountName") ?? ""),
      String(form.get("accountNumber") ?? ""),
    );
    if (!linked) {
      toast.error("Choose a bank, enter the account name, and provide a valid 10-digit account number.");
      return;
    }
    event.currentTarget.reset();
    setEditingBank(false);
    toast.success("Bank details saved to this browser. This demo does not verify the account or initiate payouts.");
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Finance"
      subtitle={`Transactions and payout estimates for ${vendor.name}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
          <Download className="size-4" /> Print statement
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Recorded sales" value={naira(sales)} hint={`${activeOrders.length} ${activity}; excludes cancelled`} tone="primary" />
        <StatCard label="Estimated fees" value={naira(fees)} hint="2% estimate on recorded activity" />
        <StatCard label="Ready after fulfilment" value={naira(available)} hint="Delivered activity, less estimated fee" tone="gold" />
        <StatCard label="Pending fulfilment" value={naira(pending)} hint="Not yet delivered or completed" />
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="size-4 text-primary" /> Demo finance data
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Estimates are based on orders saved in this browser. Live payment settlement, bank verification and payouts are not connected.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Peniel ATM card">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-primary p-5 text-white shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Peniel</p>
                <p className="mt-1 text-lg font-bold">Business card</p>
              </div>
              <CreditCard className="size-7 text-white/80" />
            </div>
            <p className="mt-8 font-mono text-lg tracking-[0.2em]">•••• •••• •••• ••••</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <span className="min-w-0 truncate text-sm font-semibold">{vendor.name}</span>
              <span className="rounded-full border border-white/30 px-2 py-1 text-[10px] font-bold uppercase">Preview</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Card design preview only. No card has been issued, and card payments or ATM withdrawals are unavailable.
          </p>
          <button
            type="button"
            onClick={() => toast.info("Peniel card issuing is not connected in this demo.")}
            className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold"
          >
            Card issuing unavailable
          </button>
        </Panel>

        <Panel title="Payout bank account">
          {account.payoutBank && !editingBank ? (
            <>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                  <Landmark className="size-5 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{account.payoutBank.bankName}</p>
                  <p className="text-sm text-muted-foreground">{account.payoutBank.accountName}</p>
                  <p className="font-mono text-xs text-muted-foreground">••••••{account.payoutBank.accountLast4}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Demo details saved {new Date(account.payoutBank.linkedAt).toLocaleString()}; account ownership has not been verified.
              </p>
              <button type="button" onClick={() => setEditingBank(true)} className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
                Update bank details
              </button>
            </>
          ) : (
            <form onSubmit={saveBank} className="space-y-3">
              <label className="block">
                <span className={labelClass}>Bank</span>
                <select name="bankName" required defaultValue={account.payoutBank?.bankName ?? ""} className={inputClass}>
                  <option value="" disabled>Select a bank</option>
                  {["Access Bank", "First Bank", "GTBank", "UBA", "Zenith Bank", "Other"].map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className={labelClass}>Account name</span>
                <input name="accountName" required defaultValue={account.payoutBank?.accountName ?? ""} autoComplete="off" className={inputClass} />
              </label>
              <label className="block">
                <span className={labelClass}>10-digit account number</span>
                <input name="accountNumber" required inputMode="numeric" pattern="[0-9 ]{10,13}" maxLength={13} autoComplete="off" className={inputClass} />
              </label>
              <p className="text-xs text-muted-foreground">
                Demo only: the full account number is not saved. Only the bank name, account name and last four digits are stored in this browser; no bank verification or transfer occurs.
              </p>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
                  Save demo bank details
                </button>
                {editingBank && (
                  <button type="button" onClick={() => setEditingBank(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Transaction history">
          {orders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No transactions have been recorded for this account yet.</p>
          ) : (
            <DataTable
              head={["Reference", "Customer", "Amount", "Fee", "Estimated net", "Status"]}
              rows={orders.map((order) => {
                const fee = order.status === "Cancelled" ? 0 : Math.round(order.total * 0.02);
                return [
                  <span className="font-mono text-xs">{order.id}</span>,
                  <span className="font-medium">{order.customer}</span>,
                  naira(order.total),
                  <span className="text-muted-foreground">{naira(fee)}</span>,
                  <span className="font-semibold">{naira(order.total - fee)}</span>,
                  <StatusPill status={order.status} />,
                ];
              })}
            />
          )}
        </Panel>

        <Panel title="Payout history">
          <div className="py-8 text-center">
            <Landmark className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-3 text-sm font-semibold">No payouts recorded</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Payout history appears when a settlement provider is connected. {completed.length ? `${completed.length} completed ${activity} contribute to the estimate above.` : "Completed activity will contribute to the estimate above."}
            </p>
          </div>
        </Panel>
      </div>
    </DashShell>
  );
}
