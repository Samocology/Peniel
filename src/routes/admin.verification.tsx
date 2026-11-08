import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { adminApi, type AdminVerification } from "@/lib/api-client";
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

function AdminVerification() {
  const [applications, setApplications] = useState<AdminVerification[]>([]);
  const [filter, setFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminApi.verification().then((result) => {
      if (!active) return;
      if (result.ok) {
        setApplications(result.data);
      } else {
        setError(result.error || "Failed to load verification applications.");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const visibleApplications = useMemo(
    () =>
      applications.filter(
        (a) => filter === "All" || a.status.toLowerCase() === filter.toLowerCase(),
      ),
    [applications, filter],
  );

  const handleDecision = async (
    appId: string,
    decision: "approved" | "rejected",
    note?: string,
  ) => {
    const result = await adminApi.reviewVerification(appId, decision, note);
    if (!result.ok) {
      toast.error(result.error || "Failed to record verification decision.");
      return;
    }
    setApplications((current) =>
      current.map((a) =>
        a.id === appId ? { ...a, status: decision === "approved" ? "approved" : "rejected" } : a,
      ),
    );
    toast.success(`Application ${decision}.`);
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Verification"
        subtitle="Review business applications and maintain marketplace trust."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <BadgeCheck className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading applications…</p>
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
        title="Verification"
        subtitle="Review business applications and maintain marketplace trust."
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

  const pending = applications.filter((a) => a.status === "pending").length;
  const approved = applications.filter((a) => a.status === "approved").length;
  const rejected = applications.filter((a) => a.status === "rejected").length;

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Verification"
      subtitle="Review business applications and maintain marketplace trust."
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Applications waiting" value={pending.toLocaleString()} tone="primary" />
        <StatCard label="Approved this month" value={approved.toLocaleString()} tone="gold" />
        <StatCard label="Declined this month" value={rejected.toLocaleString()} />
        <StatCard label="Average decision time" value="1.4 days" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Application queue"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {applications.length} sample applications
            </span>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <Clock3 className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Awaiting review</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
              <ShieldCheck className="size-4 text-success" />
              <span className="text-xs text-muted-foreground">Manual review required</span>
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
                  "",
                ]}
                rows={visibleApplications.map((app) => {
                  const signal = app.review_note ?? "Pending review";
                  const signalStyle =
                    signal === "Ready to approve" || signal === "Approved"
                      ? "bg-success/10 text-success"
                      : signal === "Declined"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-gold/15 text-gold-foreground";
                  return [
                    <div>
                      <p className="font-semibold text-foreground">
                        {app.vendors?.name ?? "Vendor"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Verification application
                      </p>
                    </div>,
                    <span className="text-xs text-muted-foreground">
                      {app.vendors?.business_type ?? "—"}
                    </span>,
                    <span className="text-sm font-medium">—</span>,
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star className="size-3.5 fill-gold text-gold" />—
                    </span>,
                    <span className="font-medium text-muted-foreground">0</span>,
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${signalStyle}`}
                    >
                      {signal}
                    </span>,
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${app.status === "approved" ? "text-success" : app.status === "rejected" ? "text-destructive" : "text-muted-foreground"}`}
                    >
                      {app.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>,
                    <div className="flex items-center gap-2">
                      {app.status === "pending" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecision(app.id, "approved", "Verified by admin")}
                            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleDecision(app.id, "rejected", "Not approved by admin")
                            }
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-muted"
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">{app.status}</span>
                      )}
                    </div>,
                  ];
                })}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              {pending} pending · {approved} approved · {rejected} declined
            </p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Review requirements">
            <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Trust is earned</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Meeting the minimum requirements only unlocks an application. It does not
                    automatically grant verification.
                  </p>
                </div>
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { icon: Users, text: "At least 5 different customers served successfully" },
                { icon: Star, text: "Customer satisfaction and review quality" },
                { icon: AlertTriangle, text: "Complaint and refund history" },
                { icon: ShieldCheck, text: "No fraud or payment abuse signals" },
                { icon: BadgeCheck, text: "Valid identity and business details" },
                { icon: ClipboardCheck, text: "Compliance with Peniel policies" },
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
                <div key={document} className="flex items-center gap-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted">
                    <FileText className="size-4 text-muted-foreground" />
                  </span>
                  <span className="min-w-0 flex-1 text-xs font-medium">{document}</span>
                  <span className="shrink-0 text-[11px] font-semibold text-success">Submitted</span>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" /> Verification cannot
                be purchased or upgraded through a subscription plan.
              </p>
            </div>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Review submitted documents and business activity before making a decision. Approval should
          only be recorded after the checks have actually been completed.
        </p>
      </div>
    </DashShell>
  );
}
