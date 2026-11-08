import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { naira } from "@/lib/data";
import { adminApi, type AdminPayout } from "@/lib/api-client";
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
      { property: "og:description", content: "Release vendor earnings safely." },
    ],
  }),
  component: AdminPayouts,
});

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
  const [payouts, setPayouts] = useState<AdminPayout[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminApi.payouts().then((result) => {
      if (!active) return;
      if (result.ok) {
        setPayouts(result.data);
      } else {
        setError(result.error || "Failed to load payouts.");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const visiblePayouts = useMemo(
    () =>
      payouts.filter((p) => filter === "All" || p.status.toLowerCase() === filter.toLowerCase()),
    [payouts, filter],
  );

  const handleUpdateStatus = async (
    payoutId: string,
    status: "processing" | "completed" | "failed",
  ) => {
    const result = await adminApi.updatePayout(payoutId, status);
    if (!result.ok) {
      toast.error(result.error || "Failed to update payout status.");
      return;
    }
    setPayouts((current) => current.map((p) => (p.id === payoutId ? { ...p, status } : p)));
    toast.success(`Payout ${status}.`);
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Payouts"
        subtitle="Review and release vendor payouts, check bank destinations and see the settlement schedule."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Wallet className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading payouts…</p>
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
        title="Payouts"
        subtitle="Review and release vendor payouts, check bank destinations and see the settlement schedule."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <Clock3 className="size-3.5" /> Reload
          </button>
        </div>
      </DashShell>
    );
  }

  const awaitingRelease = visiblePayouts.filter((p) => p.status === "processing").length;

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Payouts"
      subtitle={`${awaitingRelease} payouts awaiting action`}
    >
      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Payout overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Vendor settlement records</p>
            </div>
            <span className="text-[11px] text-muted-foreground">Platform-wide</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <PayoutMetric
              label="Awaiting release"
              value={naira(
                visiblePayouts
                  .filter((p) => p.status === "processing")
                  .reduce((s, p) => s + p.amount_minor, 0) / 100,
              )}
              tone="primary"
            />
            <PayoutMetric
              label="Released today"
              value={naira(
                visiblePayouts
                  .filter((p) => p.status === "completed")
                  .reduce((s, p) => s + p.amount_minor, 0) / 100,
              )}
            />
            <PayoutMetric label="Next batch" value="6:00 PM WAT" tone="gold" />
            <PayoutMetric
              label="Failed transfers"
              value={visiblePayouts.filter((p) => p.status === "failed").length.toLocaleString()}
            />
          </div>
        </section>

        <Panel title="Payout queue">
          <div className="space-y-4">
            <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex w-max min-w-full items-center gap-2">
                {["All", "Processing", "Completed", "Failed"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                    className={`shrink-0 whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${filter === item ? "bg-primary text-primary-foreground shadow-sm" : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 size={14} /> Payout records
              </div>
              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{visiblePayouts.length}</span>{" "}
                records found
              </p>
            </div>
            {visiblePayouts.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={["Vendor", "Bank destination", "Amount", "Status", "Created", ""]}
                  rows={visiblePayouts.map((p) => [
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{p.vendors?.name ?? "Vendor"}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{p.vendors?.slug}</p>
                    </div>,
                    <div>
                      <p className="text-sm font-medium">{p.bank_name}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        ···· {p.account_last4}
                      </p>
                    </div>,
                    <span className="font-semibold tabular-nums">
                      {naira(p.amount_minor / 100)}
                    </span>,
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${p.status === "completed" ? "bg-success/10 text-success" : p.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
                    >
                      {p.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>,
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>,
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={p.status !== "processing"}
                        onClick={() => handleUpdateStatus(p.id, "completed")}
                        className="rounded-lg bg-success/10 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/20 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Release
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, "failed")}
                        className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                      >
                        Fail
                      </button>
                    </div>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Wallet size={20} />
                </div>
                <p className="mt-3 text-sm font-semibold">No payouts found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No payouts match the selected filter.
                </p>
              </div>
            )}
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Wallet size={13} /> Peniel payout management
        </div>
      </div>
    </DashShell>
  );
}
