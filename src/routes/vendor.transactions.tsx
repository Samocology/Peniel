import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  Download,
  Landmark,
  Wifi,
  ArrowUpRight,
  LockKeyhole,
} from "lucide-react";
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
      {
        name: "description",
        content:
          "Review recorded transactions, payout estimates, bank details and Peniel card options.",
      },
      { property: "og:title", content: "Finance - Peniel business console" },
      {
        property: "og:description",
        content: "Review business transactions and payout information.",
      },
    ],
  }),
  component: VendorFinance,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-muted-foreground";

function VendorFinance() {
  const { vendor, account } = useCurrentVendor();
  const state = useApp();

  const [editingBank, setEditingBank] = useState(false);
  const [historyTab, setHistoryTab] = useState<"transactions" | "payouts">(
    "transactions",
  );

  const orders = state.orders.filter(
    (order) => order.vendorSlug === vendor.slug,
  );

  const activeOrders = orders.filter(
    (order) => order.status !== "Cancelled",
  );

  const completed = activeOrders.filter(
    (order) => order.status === "Delivered",
  );

  const pending = activeOrders
    .filter((order) => order.status !== "Delivered")
    .reduce((sum, order) => sum + order.total, 0);

  const sales = activeOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  const fees = activeOrders.reduce(
    (sum, order) => sum + Math.round(order.total * 0.02),
    0,
  );

  const available = completed.reduce(
    (sum, order) =>
      sum + order.total - Math.round(order.total * 0.02),
    0,
  );

  const activity =
    vendor.fulfilment === "order"
      ? "orders"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "reservations";

  const saveBank = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const linked = app.linkPayoutBank(
      String(form.get("bankName") ?? ""),
      String(form.get("accountName") ?? ""),
      String(form.get("accountNumber") ?? ""),
    );

    if (!linked) {
      toast.error(
        "Choose a bank, enter the account name, and provide a valid 10-digit account number.",
      );
      return;
    }

    event.currentTarget.reset();
    setEditingBank(false);

    toast.success(
      "Bank details saved to this browser. This demo does not verify the account or initiate payouts.",
    );
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Finance"
      subtitle={`Transactions and payout estimates for ${vendor.name}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print statement"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted sm:px-4 sm:text-sm"
        >
          <Download className="size-4 shrink-0" />
          <span className="hidden min-[380px]:inline">Print statement</span>
        </button>
      }
    >
      {/* Financial overview */}
      <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Recorded sales"
          value={naira(sales)}
          hint={`${activeOrders.length} ${activity}; excludes cancelled`}
          tone="primary"
        />
        <StatCard
          label="Estimated fees"
          value={naira(fees)}
          hint="2% estimate on recorded activity"
        />
        <StatCard
          label="Ready after fulfilment"
          value={naira(available)}
          hint="Delivered activity, less estimated fee"
          tone="gold"
        />
        <StatCard
          label="Pending fulfilment"
          value={naira(pending)}
          hint="Not yet delivered or completed"
        />
      </div>

      {/* Card and payout bank */}
      <div className="mt-5 grid items-start gap-5 xl:grid-cols-2">
        <Panel title="Peniel business card">
          <div className="mx-auto w-full max-w-[440px]">
            {/* ATM card design */}
            <div className="relative isolate aspect-[1.586/1] w-full overflow-hidden rounded-[20px] border border-white/15 bg-[#173D2B] p-5 text-white shadow-[0_20px_50px_-18px_rgba(20,55,38,0.45)] sm:p-6">
              {/* Background effects */}
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -right-20 -top-28 size-72 rounded-full border border-white/[0.07]" />
                <div className="absolute -right-10 -top-16 size-56 rounded-full border border-white/[0.06]" />
                <div className="absolute -bottom-36 -left-16 size-80 rounded-full bg-[#2E7950]/55 blur-3xl" />
                <div className="absolute right-0 top-0 h-full w-[48%] bg-gradient-to-bl from-[#4B8A5E]/35 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] via-transparent to-black/20" />
              </div>

              {/* Card heading */}
              <div className="relative flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/p-logo.png"
                    alt=""
                    width={36}
                    height={36}
                    className="size-9 shrink-0 rounded-xl border border-white/20 bg-white p-1 object-contain"
                  />
                  <div>
                    <p className="text-[13px] font-bold tracking-[0.16em]">
                      PENIEL
                    </p>
                    <p className="mt-0.5 text-[8px] font-medium tracking-[0.2em] text-white/55">
                      BUSINESS
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white/80">
                    Preview
                  </span>
                  <span className="text-[8px] tracking-[0.16em] text-white/45">
                    NIGERIA
                  </span>
                </div>
              </div>

              {/* Chip and contactless */}
              <div className="relative mt-5 flex items-center gap-3 sm:mt-6">
                <div className="relative h-8 w-11 overflow-hidden rounded-md border border-[#D8C99C]/60 bg-gradient-to-br from-[#F1E6BE] via-[#BCA875] to-[#E9D9A8] shadow-inner">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#806E48]/50" />
                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-[#806E48]/50" />
                  <div className="absolute left-1 top-1 h-5 w-9 rounded border border-[#806E48]/50" />
                  <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-[#806E48]/60" />
                </div>
                <Wifi className="size-5 rotate-90 text-white/65" />
              </div>

              {/* Card number */}
              <div className="relative mt-5">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/45">
                  Card number
                </p>
                <p className="mt-1.5 font-mono text-[clamp(13px,3.2vw,19px)] tracking-[0.15em] text-white/90 sm:tracking-[0.22em]">
                  •••• &nbsp;•••• &nbsp;•••• &nbsp;••••
                </p>
              </div>

              {/* Cardholder details */}
              <div className="relative mt-5 flex items-end justify-between gap-3 sm:mt-6">
                <div className="min-w-0">
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Cardholder
                  </p>
                  <p className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.1em] sm:text-xs">
                    {vendor.name}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-white/45">
                    Account type
                  </p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] text-white/85">
                    BUSINESS
                  </p>
                </div>
              </div>

              {/* Decorative lower edge */}
              <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#2E7950] via-[#D1B77B] to-[#2E7950] opacity-90" />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-muted/50 p-3">
              <LockKeyhole className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                This is a visual card preview for your business profile. No
                physical or virtual card has been issued. Card payments and
                ATM withdrawals are not available.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                toast.info(
                  "Peniel card issuing is not connected in this demo.",
                )
              }
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
            >
              <CreditCard className="size-4" />
              Card issuing unavailable
            </button>
          </div>
        </Panel>

        {/* Payout bank account */}
        <Panel title="Payout bank account">
          {account.payoutBank && !editingBank ? (
            <>
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Landmark className="size-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {account.payoutBank.bankName}
                      </p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {account.payoutBank.accountName}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                    Demo
                  </span>
                </div>

                <div className="mt-5 border-t border-border pt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Account number
                  </p>
                  <p className="mt-1 font-mono text-sm tracking-widest">
                    •••• ••{account.payoutBank.accountLast4}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Demo details saved{" "}
                {new Date(account.payoutBank.linkedAt).toLocaleString()};
                account ownership has not been verified.
              </p>

              <button
                type="button"
                onClick={() => setEditingBank(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
              >
                <ArrowUpRight className="size-4" />
                Update bank details
              </button>
            </>
          ) : (
            <form onSubmit={saveBank} className="space-y-3.5">
              <div className="rounded-xl bg-muted/40 p-3">
                <p className="text-xs leading-5 text-muted-foreground">
                  Add the bank account you intend to use for business
                  settlements. These details are stored locally for this demo.
                </p>
              </div>

              <label className="block">
                <span className={labelClass}>Bank</span>
                <select
                  name="bankName"
                  required
                  defaultValue={account.payoutBank?.bankName ?? ""}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Select a bank
                  </option>
                  {[
                    "Access Bank",
                    "First Bank",
                    "GTBank",
                    "UBA",
                    "Zenith Bank",
                    "Other",
                  ].map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className={labelClass}>Account name</span>
                <input
                  name="accountName"
                  required
                  defaultValue={account.payoutBank?.accountName ?? ""}
                  autoComplete="off"
                  placeholder="Name on bank account"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className={labelClass}>10-digit account number</span>
                <input
                  name="accountNumber"
                  required
                  inputMode="numeric"
                  pattern="[0-9 ]{10,13}"
                  maxLength={13}
                  autoComplete="off"
                  placeholder="0123456789"
                  className={inputClass}
                />
              </label>

              <p className="text-xs leading-5 text-muted-foreground">
                Demo only: the full account number is not saved. Only the bank
                name, account name and last four digits are stored in this
                browser. No bank verification or transfer occurs.
              </p>

              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                {editingBank && (
                  <button
                    type="button"
                    onClick={() => setEditingBank(false)}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                >
                  Save bank details
                </button>
              </div>
            </form>
          )}
        </Panel>
      </div>

      {/* Transaction and payout history */}
      <div className="mt-5">
        <div
          role="group"
          aria-label="Choose finance history"
          className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/50 p-1 lg:hidden"
        >
          <button
            type="button"
            aria-pressed={historyTab === "transactions"}
            onClick={() => setHistoryTab("transactions")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              historyTab === "transactions"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="size-4" />
            Transactions
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">
              {orders.length}
            </span>
          </button>
          <button
            type="button"
            aria-pressed={historyTab === "payouts"}
            onClick={() => setHistoryTab("payouts")}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              historyTab === "payouts"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Landmark className="size-4" />
            Payouts
          </button>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-2">
          <div
            className={`${historyTab === "transactions" ? "" : "hidden lg:block"} min-w-0`}
          >
            <Panel title="Transaction history" className="h-full min-w-0">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                    <CreditCard className="size-5 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    No transactions yet
                  </p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    Recorded transactions for this business will appear here.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {orders.length} recorded transactions
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      All statuses
                    </span>
                  </div>

                  <div className="space-y-2.5 sm:hidden">
                    {orders.map((order) => {
                      const fee =
                        order.status === "Cancelled"
                          ? 0
                          : Math.round(order.total * 0.02);

                      return (
                        <article
                          key={order.id}
                          className="min-w-0 rounded-xl border border-border bg-background p-3"
                        >
                          <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {order.customer}
                              </p>
                              <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                                {order.id}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-bold tabular-nums text-foreground">
                                {naira(order.total)}
                              </p>
                              <div className="mt-1">
                                <StatusPill status={order.status} />
                              </div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                            <div className="min-w-0">
                              <p className="text-[10px] text-muted-foreground">
                                Fee estimate
                              </p>
                              <p className="mt-0.5 truncate font-medium tabular-nums">
                                {naira(fee)}
                              </p>
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="text-[10px] text-muted-foreground">
                                Estimated net
                              </p>
                              <p className="mt-0.5 truncate font-semibold tabular-nums">
                                {naira(order.total - fee)}
                              </p>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <div className="hidden overflow-x-auto sm:block">
                    <DataTable
                      head={[
                        "Reference",
                        "Customer",
                        "Amount",
                        "Fee",
                        "Estimated net",
                        "Status",
                      ]}
                      rows={orders.map((order) => {
                        const fee =
                          order.status === "Cancelled"
                            ? 0
                            : Math.round(order.total * 0.02);

                        return [
                          <span className="font-mono text-xs">{order.id}</span>,
                          <span className="font-medium">{order.customer}</span>,
                          naira(order.total),
                          <span className="text-muted-foreground">
                            {naira(fee)}
                          </span>,
                          <span className="font-semibold">
                            {naira(order.total - fee)}
                          </span>,
                          <StatusPill status={order.status} />,
                        ];
                      })}
                    />
                  </div>
                </>
              )}
            </Panel>
          </div>

          <div
            className={`${historyTab === "payouts" ? "" : "hidden lg:block"} min-w-0`}
          >
            <Panel title="Payout history" className="h-full min-w-0">
              <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-8 text-center">
                <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
                  <Landmark className="size-5 text-muted-foreground" />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  No payouts recorded
                </p>

                <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
                  Payout history appears when a settlement provider is connected.{" "}
                  {completed.length
                    ? `${completed.length} completed ${activity} contribute to the estimate above.`
                    : "Completed activity will contribute to the estimate above."}
                </p>

                <div className="mt-4 flex items-center gap-2 rounded-full bg-muted px-3 py-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground" />
                  <span className="text-[10px] font-medium text-muted-foreground">
                    Settlement provider not connected
                  </span>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </DashShell>
  );
}
