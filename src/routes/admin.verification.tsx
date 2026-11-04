import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FileText } from "lucide-react";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/verification")({
  head: () => ({
    meta: [
      { title: "Verification review - Peniel admin" },
      {
        name: "description",
        content:
          "Review vendor verification applications against served customers, satisfaction, complaints and identity checks.",
      },
      { property: "og:title", content: "Verification review - Peniel admin" },
      { property: "og:description", content: "Verification is earned, never bought." },
    ],
  }),
  component: AdminVerification,
});

const queue = [
  ["Abigail's Kitchen", "Restaurants", "9 served", "4.8", "0", "Ready to approve"],
  ["Mama Cee Confectionery", "Cakes & Bakeries", "6 served", "4.6", "1", "Needs a closer look"],
  ["Lagos Tech Hub Store", "Electronics", "12 served", "4.5", "2", "Needs a closer look"],
  ["Oyo Fabrics", "Fashion", "5 served", "4.9", "0", "Ready to approve"],
  ["Bright Cuts Barbers", "Salons & Barbers", "5 served", "4.2", "0", "Ready to approve"],
] as const;

function AdminVerification() {
  const [decisions, setDecisions] = useState<Record<string, "Approved" | "Declined">>({});

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Verification review"
      subtitle="12 applications waiting"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Waiting" value="12" tone="primary" />
        <StatCard label="Approved this month" value="84" tone="gold" />
        <StatCard label="Declined this month" value="19" />
        <StatCard label="Average decision time" value="1.4 days" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="Application queue">
          <DataTable
            head={[
              "Business",
              "Category",
              "Customers served",
              "Rating",
              "Complaints",
              "Signal",
              "",
            ]}
            rows={queue.map((q) => [
              <span className="font-medium">{q[0]}</span>,
              <span className="text-muted-foreground">{q[1]}</span>,
              q[2],
              q[3],
              q[4],
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (decisions[q[0]] === "Approved" ||
                  (!decisions[q[0]] && q[5] === "Ready to approve")
                    ? "bg-success/12 text-success"
                    : decisions[q[0]] === "Declined"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-gold/15 text-gold-foreground")
                }
              >
                {decisions[q[0]] ?? q[5]}
              </span>,
              decisions[q[0]] ? (
                <span className="text-xs font-semibold text-muted-foreground">
                  {decisions[q[0]]}
                </span>
              ) : (
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDecisions((current) => ({ ...current, [q[0]]: "Approved" }));
                      toast.success(`${q[0]} approved in this admin view.`);
                    }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDecisions((current) => ({ ...current, [q[0]]: "Declined" }));
                      toast("Application declined in this admin view.");
                    }}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                  >
                    Decline
                  </button>
                </span>
              ),
            ])}
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="What we check">
            <ul className="space-y-3 text-sm">
              {[
                "At least 5 different customers served successfully - this only unlocks the application, it never verifies a business on its own",
                "Customer satisfaction and review quality",
                "Complaint and refund history",
                "No fraud or payment abuse signals",
                "Valid identity and business details",
                "Compliance with Peniel policies",
              ].map((c) => (
                <li key={c} className="flex gap-2.5">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0 text-muted-foreground">{c}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Documents submitted">
            <ul className="space-y-3 text-sm">
              {[
                "Owner ID (NIN)",
                "CAC certificate",
                "Proof of address",
                "Bank account name check",
              ].map((d) => (
                <li key={d} className="flex items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">{d}</span>
                  <span className="shrink-0 text-xs font-semibold text-success">Submitted</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              Verification cannot be purchased or upgraded with a plan.
            </p>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
