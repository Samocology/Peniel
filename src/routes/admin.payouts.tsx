
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Banknote,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { naira, vendors } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts - Peniel admin" },
      {
        name: "description",
        content:
          "Review and release vendor payouts, check bank destinations and see the settlement schedule.",
      },
      { property: "og:title", content: "Payouts - Peniel admin" },
      {
        property: "og:description",
        content: "Release vendor earnings safely.",
      },
    ],
  }),
  component: AdminPayouts,
});

type PayoutStatus = "Released" | "On hold";

function PayoutMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary" | "gold";
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/20 bg-primary-soft"
      : tone === "gold"
        ? "border-gold/30 bg-gold/10"
        : "border-border bg-card";

  return (
    <div className={`min-w-0 rounded-2xl border p-3.5 sm:p-4 ${toneClass}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p className="mt-2 break-words text-[clamp(1rem,4.5vw,1.5rem)] font-bold leading-tight tabular-nums sm:mt-2.5 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function AdminPayouts() {
  const [statusByVendor, setStatusByVendor] = useState<
    Record<string, PayoutStatus>
  >({});

  const payoutRows = useMemo(
    () =>
      vendors.map((vendor, index) => ({
        ...vendor,
        index,
        amount: 180000 + index * 94000,
        bank: [
          "GTBank",
          "Access",
          "Zenith",
          "Kuda",
          "UBA",
          "First Bank",
          "Moniepoint",
        ][index],
        account: 1000 + index * 137,
        requestTime: `Today, ${8 + index}:${`0${index}`.slice(-2)} AM`,
        bankVerified: index !== 4,
      })),
    [],
  );

  const pendingCount = payoutRows.filter(
    (vendor) => !statusByVendor[vendor.slug],
  ).length;

  const releaseAllApproved = () => {
    const eligible = payoutRows.filter(
      (vendor) => vendor.bankVerified && !statusByVendor[vendor.slug],
    );

    if (eligible.length === 0) {
      toast("There are no eligible payouts awaiting release.");
      return;
    }

    setStatusByVendor((current) => ({
      ...current,
      ...Object.fromEntries(
        eligible.map((vendor) => [vendor.slug, "Released" as const]),
      ),
    }));

    toast.success(
      `${eligible.length} eligible payouts released. The name-mismatch transfer remains on hold.`,
    );
  };

  const releasePayout = (vendor: (typeof payoutRows)[number]) => {
    if (!vendor.bankVerified) return;

    setStatusByVendor((current) => ({
      ...current,
      [vendor.slug]: "Released",
    }));

    toast.success(`${vendor.name}'s payout released`);
  };

  const holdPayout = (vendor: (typeof payoutRows)[number]) => {
    setStatusByVendor((current) => ({
      ...current,
      [vendor.slug]: "On hold",
    }));

    toast("Payout placed on hold");
  };

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Payouts"
      subtitle={`${pendingCount} payouts awaiting action`}
      actions={
        <button
          type="button"
          onClick={releaseAllApproved}
          disabled={
            !payoutRows.some(
              (vendor) =>
                vendor.bankVerified && !statusByVendor[vendor.slug],
            )
          }
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          <ArrowUpRight className="size-4" />
          Release approved
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <PayoutMetric
          label="Awaiting release"
          value={naira(6412000)}
          tone="primary"
        />
        <PayoutMetric
          label="Released today"
          value={naira(21840000)}
        />
        <PayoutMetric
          label="Next batch"
          value="6:00 PM WAT"
          tone="gold"
        />
        <PayoutMetric
          label="Failed transfers"
          value="2"
        />
      </div>

      <div className="mt-5 grid min-w-0 gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_290px]">
        <Panel
          title="Payout queue"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {payoutRows.length} requests
            </span>
          }
        >
          <div className="mb-4 grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="text-xs leading-snug text-muted-foreground">
                Settlement batch · 6:00 PM WAT
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <ShieldCheck className="size-4 text-success" />
              <span className="text-xs leading-snug text-muted-foreground">
                Bank verification required
              </span>
            </div>
          </div>

          <div className="space-y-3 sm:hidden">
            {payoutRows.map((vendor) => {
              const status = statusByVendor[vendor.slug];

              return (
                <article
                  key={vendor.slug}
                  className="rounded-xl border border-border bg-background/70 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                        {vendor.monogram}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {vendor.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">
                          Vendor payout
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-sm font-bold tabular-nums">
                      {naira(vendor.amount)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-muted/40 p-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Bank destination
                      </p>
                      <p className="mt-1 truncate text-xs font-semibold">
                        {vendor.bank}
                      </p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        ···· {vendor.account}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                        Requested
                      </p>
                      <p className="mt-1 text-xs font-medium">
                        {vendor.requestTime}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                        (vendor.bankVerified
                          ? "bg-success/10 text-success"
                          : "bg-gold/15 text-gold-foreground")
                      }
                    >
                      {vendor.bankVerified ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <AlertCircle className="size-3" />
                      )}
                      {vendor.bankVerified ? "Verified" : "Name mismatch"}
                    </span>

                    {status ? (
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold " +
                          (status === "Released"
                            ? "bg-success/10 text-success"
                            : "bg-gold/15 text-gold-foreground")
                        }
                      >
                        {status === "Released" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Clock3 className="size-3" />
                        )}
                        {status}
                      </span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={!vendor.bankVerified}
                          onClick={() => releasePayout(vendor)}
                          className="min-h-9 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Release
                        </button>
                        <button
                          type="button"
                          onClick={() => holdPayout(vendor)}
                          className="min-h-9 rounded-lg border border-border bg-card px-3 text-xs font-semibold transition hover:bg-muted"
                        >
                          Hold
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto sm:block">
            <div className="min-w-[850px]">
              <DataTable
                head={[
                  "Vendor",
                  "Bank destination",
                  "Amount",
                  "Requested",
                  "Verification",
                  "Action",
                ]}
                rows={payoutRows.map((vendor) => {
                  const status = statusByVendor[vendor.slug];

                  return [
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {vendor.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Vendor payout
                      </p>
                    </div>,

                    <div>
                      <p className="text-sm font-medium">{vendor.bank}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        ···· {vendor.account}
                      </p>
                    </div>,

                    <span className="font-semibold tabular-nums">
                      {naira(vendor.amount)}
                    </span>,

                    <span className="text-xs text-muted-foreground">
                      {vendor.requestTime}
                    </span>,

                    <span
                      className={
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
                        (vendor.bankVerified
                          ? "bg-success/10 text-success"
                          : "bg-gold/15 text-gold-foreground")
                      }
                    >
                      {vendor.bankVerified ? (
                        <CheckCircle2 className="size-3" />
                      ) : (
                        <AlertCircle className="size-3" />
                      )}
                      {vendor.bankVerified ? "Verified" : "Name mismatch"}
                    </span>,

                    status ? (
                      <span
                        className={
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold " +
                          (status === "Released"
                            ? "bg-success/10 text-success"
                            : "bg-gold/15 text-gold-foreground")
                        }
                      >
                        {status === "Released" ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Clock3 className="size-3" />
                        )}
                        {status}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!vendor.bankVerified}
                          onClick={() => releasePayout(vendor)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Release
                        </button>
                        <button
                          type="button"
                          onClick={() => holdPayout(vendor)}
                          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                        >
                          Hold
                        </button>
                      </div>
                    ),
                  ];
                })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-1 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {payoutRows.length} payout requests
            </p>
            <p className="text-xs text-muted-foreground">
              Transfers require verified bank details
            </p>
          </div>
        </Panel>

        <div className="space-y-4 sm:space-y-5">
          <Panel title="Settlement overview">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <Wallet className="size-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Available for payout</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {naira(6412000)} currently awaiting release.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <Banknote className="size-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Next settlement</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Today's scheduled batch is at 6:00 PM WAT.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted">
                  <ShieldCheck className="size-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Account verification</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Payouts with account-name mismatches must be reviewed
                    before release.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Payout attention">
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-3.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-gold-foreground" />
                <div>
                  <p className="text-sm font-semibold">1 account needs review</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    A vendor's bank account name does not match the verified
                    business details. This payout cannot be released yet.
                  </p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3 sm:mt-5">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Always verify the vendor's account name, account number and settlement
          eligibility before initiating a transfer. A status update in this
          dashboard should only follow a confirmed payout-provider response.
        </p>
      </div>
    </DashShell>
  );
}
