import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({
    meta: [
      { title: "Disputes - Peniel admin" },
      {
        name: "description",
        content:
          "Resolve refund requests and order disputes with funds still held safely by Peniel Pay.",
      },
      { property: "og:title", content: "Disputes - Peniel admin" },
      { property: "og:description", content: "Fair outcomes for customers and vendors." },
    ],
  }),
  component: AdminDisputes,
});

const cases = [
  ["DSP-1042", "Abigail's Kitchen", "Order arrived cold", 26760, "Open", "Today"],
  [
    "DSP-1039",
    "Lagos Tech Hub Store",
    "Wrong charger in the box",
    184000,
    "Awaiting vendor",
    "Yesterday",
  ],
  [
    "DSP-1031",
    "Kemi's Couture",
    "Dress measurements off",
    165000,
    "Awaiting customer",
    "3 days ago",
  ],
  ["DSP-1024", "Mama Cee Confectionery", "Cake delivered late", 48000, "Resolved", "1 week ago"],
] as const;

function AdminDisputes() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [resolutions, setResolutions] = useState<Record<number, string>>({});

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Disputes"
      subtitle="4 cases open right now"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open cases" value="4" tone="primary" />
        <StatCard label="Value held" value={naira(375760)} tone="gold" />
        <StatCard label="Resolved this month" value="38" />
        <StatCard label="Average resolution" value="1.1 days" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Case list">
          <DataTable
            head={["Case", "Vendor", "Reason", "Amount", "Status", "Opened", ""]}
            rows={cases.map((c, i) => [
              <span className="font-mono text-xs">{c[0]}</span>,
              <span className="font-medium">{c[1]}</span>,
              <span className="text-muted-foreground">{c[2]}</span>,
              naira(c[3]),
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (c[4] === "Resolved"
                    ? "bg-success/12 text-success"
                    : "bg-gold/15 text-gold-foreground")
                }
              >
                {resolutions[i] === "Evidence requested"
                  ? "Awaiting evidence"
                  : resolutions[i]
                    ? "Resolved"
                    : c[4]}
              </span>,
              <span className="text-muted-foreground">{c[5]}</span>,
              <button
                type="button"
                onClick={() => setSelectedCase(i)}
                className="text-xs font-semibold text-primary"
              >
                {resolutions[i] ? "View outcome" : "Open case"}
              </button>,
            ])}
          />
        </Panel>

        <Panel title="Resolution options">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Refund the customer in full from held funds",
              "Refund part of the order and settle the rest",
              "Release the payment to the vendor",
              "Ask both sides for more evidence",
            ].map((o) => (
              <li key={o} className="rounded-xl border border-border p-3.5">
                {o}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Because Peniel collects every payment, money can be returned without chasing the vendor.
          </p>
        </Panel>
      </div>
      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCase === null ? "Dispute" : `Review ${cases[selectedCase]![0]}`}
            </DialogTitle>
            <DialogDescription>
              Review the order context and record the next resolution step.
            </DialogDescription>
          </DialogHeader>
          {selectedCase !== null && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/60 p-4 text-sm">
                <p className="font-semibold">{cases[selectedCase]![1]}</p>
                <p className="mt-1 text-muted-foreground">
                  {cases[selectedCase]![2]} · {naira(cases[selectedCase]![3])}
                </p>
              </div>
              {resolutions[selectedCase] || cases[selectedCase]![4] === "Resolved" ? (
                <p className="rounded-xl bg-success/10 p-4 text-sm font-semibold text-success">
                  {resolutions[selectedCase]
                    ? `Outcome recorded: ${resolutions[selectedCase]}`
                    : "This case has already been resolved."}
                </p>
              ) : (
                <div className="space-y-2">
                  {(
                    [
                      ["Request more evidence", "Evidence requested"],
                      ["Refund customer", "Refund recorded"],
                      ["Release funds to vendor", "Funds released"],
                    ] as const
                  ).map(([label, outcome]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setResolutions((current) => ({ ...current, [selectedCase]: outcome }));
                        toast.success(`${outcome} for ${cases[selectedCase]![0]}.`);
                        setSelectedCase(null);
                      }}
                      className="w-full rounded-xl border border-border px-4 py-3 text-left text-sm font-semibold transition hover:border-primary/40 hover:bg-primary-soft"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Resolution actions are recorded in this prototype only; no payment is moved.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
