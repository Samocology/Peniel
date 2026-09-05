import { createFileRoute } from "@tanstack/react-router";
import { Banknote, CheckCircle2, Landmark } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/payouts")({
  head: () => ({
    meta: [
      { title: "Payouts — Vendra business console" },
      { name: "description", content: "See your available balance, payout schedule and every completed payout to your bank account." },
      { property: "og:title", content: "Payouts — Vendra business console" },
      { property: "og:description", content: "Know exactly when your money lands." },
    ],
  }),
  component: VendorPayouts,
});

const payouts = [
  ["PO-2025-0521", "21 May 2025", 486200, "GTBank ••••4471", "Completed"],
  ["PO-2025-0514", "14 May 2025", 512750, "GTBank ••••4471", "Completed"],
  ["PO-2025-0507", "7 May 2025", 398400, "GTBank ••••4471", "Completed"],
  ["PO-2025-0430", "30 Apr 2025", 441000, "GTBank ••••4471", "Completed"],
] as const;

function VendorPayouts() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Payouts"
      subtitle="Paid every Friday, straight to your bank account"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Available now" value={naira(618900)} hint="Clears Friday" tone="primary" />
            <StatCard label="Pending fulfilment" value={naira(123400)} hint="Released after delivery" tone="gold" />
            <StatCard label="Paid out lifetime" value={naira(3475700)} hint="18 payouts" />
          </div>

          <Panel title="Payout history">
            <DataTable
              head={["Reference", "Date", "Amount", "Destination", "Status"]}
              rows={payouts.map((p) => [
                <span className="font-mono text-xs">{p[0]}</span>,
                <span className="text-muted-foreground">{p[1]}</span>,
                <span className="font-semibold">{naira(p[2])}</span>,
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <Landmark className="size-3.5" /> {p[3]}
                </span>,
                <StatusPill status={p[4]} />,
              ])}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Next payout">
            <p className="font-display text-3xl font-bold text-primary">{naira(618900)}</p>
            <p className="mt-1 text-sm text-muted-foreground">Friday, 30 May 2025</p>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              {[
                ["Sales in period", naira(631530)],
                ["Platform fees", "−" + naira(12630)],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-muted-foreground">{l}</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="size-3.5" /> Bank account verified
            </p>
          </Panel>

          <Panel title="Payout account">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft">
                <Banknote className="size-5 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold">Guaranty Trust Bank</p>
                <p className="text-sm text-muted-foreground">Abigail's Kitchen Ltd · ••••4471</p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold">Change account</button>
            <p className="mt-3 text-xs text-muted-foreground">
              Changes take effect from your next payout cycle and require identity confirmation.
            </p>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
