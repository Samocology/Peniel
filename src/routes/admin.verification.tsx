
import { createFileRoute } from "@tanstack/react-router";
import {
  BadgeCheck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock3,
  AlertTriangle,
  Users,
  Star,
  ClipboardCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
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
      {
        property: "og:description",
        content: "Verification is earned, never bought.",
      },
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

type Decision = "Approved" | "Declined";

function AdminVerification() {
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});

  const stats = useMemo(() => {
    const approved = Object.values(decisions).filter(
      (decision) => decision === "Approved",
    ).length;

    const declined = Object.values(decisions).filter(
      (decision) => decision === "Declined",
    ).length;

    return { approved, declined };
  }, [decisions]);

  const getSignal = (business: (typeof queue)[number]) => {
    const decision = decisions[business[0]];

    if (decision === "Approved") return "Approved";
    if (decision === "Declined") return "Declined";

    return business[5];
  };

  const approve = (business: (typeof queue)[number]) => {
    setDecisions((current) => ({
      ...current,
      [business[0]]: "Approved",
    }));

    toast.success(`${business[0]} approved in this admin view.`);
  };

  const decline = (business: (typeof queue)[number]) => {
    setDecisions((current) => ({
      ...current,
      [business[0]]: "Declined",
    }));

    toast("Application declined in this admin view.");
  };

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Verification"
      subtitle="Review business applications and maintain marketplace trust."
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Applications waiting" value="12" tone="primary" />
        <StatCard label="Approved this month" value="84" tone="gold" />
        <StatCard label="Declined this month" value="19" />
        <StatCard label="Average decision time" value="1.4 days" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Application queue"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {queue.length} sample applications
            </span>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Awaiting review
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <ShieldCheck className="size-4 text-success" />
              <span className="text-xs text-muted-foreground">
                Manual review required
              </span>
            </div>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[850px]">
              <DataTable
                head={[
                  "Business",
                  "Category",
                  "Customers",
                  "Rating",
                  "Complaints",
                  "Review signal",
                  "Decision",
                ]}
                rows={queue.map((business) => {
                  const signal = getSignal(business);
                  const decision = decisions[business[0]];

                  const signalStyle =
                    signal === "Approved" ||
                    signal === "Ready to approve"
                      ? "bg-success/10 text-success"
                      : signal === "Declined"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-gold/15 text-gold-foreground";

                  return [
                    <div>
                      <p className="font-semibold text-foreground">
                        {business[0]}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Verification application
                      </p>
                    </div>,

                    <span className="text-xs text-muted-foreground">
                      {business[1]}
                    </span>,

                    <span className="text-sm font-medium">
                      {business[2]}
                    </span>,

                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="size-3.5 fill-gold text-gold" />
                      {business[3]}
                    </span>,

                    <span
                      className={
                        "font-medium " +
                        (Number(business[4]) > 0
                          ? "text-gold-foreground"
                          : "text-muted-foreground")
                      }
                    >
                      {business[4]}
                    </span>,

                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${signalStyle}`}
                    >
                      {signal}
                    </span>,

                    decision ? (
                      <span
                        className={
                          "inline-flex items-center gap-1.5 text-xs font-semibold " +
                          (decision === "Approved"
                            ? "text-success"
                            : "text-destructive")
                        }
                      >
                        {decision === "Approved" ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : (
                          <XCircle className="size-3.5" />
                        )}
                        {decision}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => approve(business)}
                          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() => decline(business)}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                        >
                          Decline
                        </button>
                      </div>
                    ),
                  ];
                })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {stats.approved} approved · {stats.declined} declined in this view
            </p>
            <p className="text-xs text-muted-foreground">
              Decisions shown are local demo states
            </p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Review requirements">
            <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    Trust is earned
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Meeting the minimum requirements only unlocks an
                    application. It does not automatically grant verification.
                  </p>
                </div>
              </div>
            </div>

            <ul className="space-y-3">
              {[
                {
                  icon: Users,
                  text: "At least 5 different customers served successfully",
                },
                {
                  icon: Star,
                  text: "Customer satisfaction and review quality",
                },
                {
                  icon: AlertTriangle,
                  text: "Complaint and refund history",
                },
                {
                  icon: ShieldCheck,
                  text: "No fraud or payment abuse signals",
                },
                {
                  icon: BadgeCheck,
                  text: "Valid identity and business details",
                },
                {
                  icon: ClipboardCheck,
                  text: "Compliance with Peniel policies",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <li key={item.text} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {item.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Required documents">
            <div className="space-y-3">
              {[
                "Owner ID (NIN)",
                "CAC certificate",
                "Proof of address",
                "Bank account name check",
              ].map((document) => (
                <div
                  key={document}
                  className="flex items-center gap-2.5"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </span>

                  <span className="min-w-0 flex-1 text-xs font-medium">
                    {document}
                  </span>

                  <span className="shrink-0 text-[11px] font-semibold text-success">
                    Submitted
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                Verification cannot be purchased or upgraded through a
                subscription plan.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Review submitted documents and business activity before making a
          decision. Approval should only be recorded after the checks have
          actually been completed.
        </p>
      </div>
    </DashShell>
  );
}
