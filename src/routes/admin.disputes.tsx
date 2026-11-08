import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  ShieldCheck,
  Wallet,
  XCircle,
} from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";
import { adminApi, type AdminDispute } from "@/lib/api-client";
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

function AdminDisputes() {
  const [disputes, setDisputes] = useState<AdminDispute[]>([]);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    adminApi.disputes().then((result) => {
      if (!active) return;
      if (result.ok) {
        setDisputes(result.data);
      } else {
        setError(result.error || "Failed to load disputes.");
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const openCases = disputes.filter((d) => d.status !== "resolved" && d.status !== "closed");
  const heldValue = openCases.reduce((total, item) => total + 0, 0);

  const handleResolution = async (
    disputeId: string,
    status: "open" | "investigating" | "resolved" | "closed",
  ) => {
    const result = await adminApi.updateDispute(disputeId, status);
    if (!result.ok) {
      toast.error(result.error || "Failed to record dispute resolution.");
      return;
    }
    setDisputes((current) => current.map((d) => (d.id === disputeId ? { ...d, status } : d)));
    setSelectedCase(null);
    toast.success(`Dispute marked as ${status}.`);
  };

  const activeCase = selectedCase ? (disputes.find((d) => d.id === selectedCase) ?? null) : null;

  const resolutions: {
    label: string;
    outcome: "open" | "investigating" | "resolved" | "closed";
    icon: React.ElementType;
  }[] = [
    { label: "Mark open", outcome: "open", icon: Clock3 },
    { label: "Mark investigating", outcome: "investigating", icon: FileText },
    { label: "Mark resolved", outcome: "resolved", icon: CheckCircle2 },
    { label: "Mark closed", outcome: "closed", icon: XCircle },
  ];

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Disputes"
        subtitle={`${openCases.length} cases currently require attention`}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <AlertCircle className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading disputes…</p>
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
        title="Disputes"
        subtitle={`${openCases.length} cases currently require attention`}
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

  const getStatusStyle = (status: string) => {
    if (status === "resolved" || status === "closed") return "bg-success/10 text-success";
    if (status === "investigating") return "bg-primary/10 text-primary";
    return "bg-gold/15 text-gold-foreground";
  };

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Disputes"
      subtitle={`${openCases.length} cases currently require attention`}
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label="Open cases" value={openCases.length.toLocaleString()} tone="primary" />
        <StatCard label="Value currently held" value={naira(heldValue / 100)} tone="gold" />
        <StatCard
          label="Resolved this month"
          value={disputes.filter((d) => d.status === "resolved").length.toLocaleString()}
        />
        <StatCard label="Average resolution" value="1.1 days" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Dispute cases"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {disputes.length} records
            </span>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" /> {openCases.length} awaiting resolution
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" /> Funds held for review
            </span>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[850px]">
              <DataTable
                head={["Case reference", "Vendor", "Subject", "Status", "Created", ""]}
                rows={disputes.map((d) => [
                  <span className="font-mono text-xs font-semibold text-foreground">{d.id}</span>,
                  <span className="font-medium text-foreground">
                    {d.vendors?.name ?? "Vendor"}
                  </span>,
                  <span className="text-xs text-muted-foreground">{d.subject}</span>,
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(d.status)}`}
                  >
                    {d.status.replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>,
                  <span className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>,
                  <button
                    type="button"
                    onClick={() => setSelectedCase(d.id)}
                    className="whitespace-nowrap text-xs font-semibold text-primary transition hover:underline"
                  >
                    {d.status === "resolved" || d.status === "closed" ? "View case" : "Review case"}
                  </button>,
                ])}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Showing {disputes.length} dispute records
            </p>
            <p className="text-xs text-muted-foreground">
              Resolution actions recorded via platform API.
            </p>
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Resolution options">
            <div className="space-y-3">
              {[
                {
                  icon: Wallet,
                  title: "Full refund",
                  description: "Return the full payment to the customer.",
                },
                {
                  icon: ArrowUpRight,
                  title: "Partial refund",
                  description: "Refund part of the order and settle the balance.",
                },
                {
                  icon: CheckCircle2,
                  title: "Release funds",
                  description: "Release the held payment to the vendor.",
                },
                {
                  icon: MessageSquareText,
                  title: "Request evidence",
                  description: "Ask both parties for additional information.",
                },
              ].map((option) => {
                const Icon = option.icon;
                return (
                  <div
                    key={option.title}
                    className="flex gap-3 rounded-xl border border-border p-3 transition hover:bg-muted/30"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                      <Icon className="size-4 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{option.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Peniel can coordinate refunds because payments are collected through the
                    platform.
                  </p>
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Resolution guidelines">
            <ul className="space-y-3">
              {[
                "Review the customer's complaint.",
                "Check vendor responses and evidence.",
                "Confirm the amount eligible for refund.",
                "Document the final decision.",
              ].map((guideline, index) => (
                <li key={guideline} className="flex items-start gap-2.5">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">{guideline}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Disputes should be resolved using order evidence, communication records and payment
          confirmation. Never release or refund funds based on an unverified claim.
        </p>
      </div>

      <Dialog open={selectedCase !== null} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{activeCase ? `Review ${activeCase.id}` : "Review dispute"}</DialogTitle>
            <DialogDescription>
              Review the complaint and record the appropriate next step.
            </DialogDescription>
          </DialogHeader>
          {activeCase && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{activeCase.subject}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{activeCase.id}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(activeCase.status)}`}
                  >
                    {activeCase.status}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Dispute subject</p>
                    <p className="mt-1 text-xs font-medium">{activeCase.subject}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Vendor</p>
                    <p className="mt-1 text-xs font-medium">{activeCase.vendors?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Date opened</span>
                  <span className="text-xs font-medium">
                    {new Date(activeCase.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {activeCase.status === "resolved" || activeCase.status === "closed" ? (
                <div className="rounded-xl border border-success/15 bg-success/5 p-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-success">Resolution recorded</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        This case was already resolved.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Choose a resolution action
                  </p>
                  {resolutions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => handleResolution(activeCase.id, option.outcome)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary/[0.03]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                          <Icon className="size-4 text-primary" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{option.label}</span>
                        </span>
                      </button>
                    );
                  })}

                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    Recorded via platform API; no refund or bank transfer is initiated from this
                    dashboard alone.
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
