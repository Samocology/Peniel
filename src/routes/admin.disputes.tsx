
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
      {
        property: "og:description",
        content: "Fair outcomes for customers and vendors.",
      },
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
  [
    "DSP-1024",
    "Mama Cee Confectionery",
    "Cake delivered late",
    48000,
    "Resolved",
    "1 week ago",
  ],
] as const;

type Resolution =
  | "Evidence requested"
  | "Refund recorded"
  | "Funds released";

function getCase(index: number) {
  const disputeCase = cases[index];
  if (!disputeCase) {
    throw new Error(`Dispute case ${index + 1} is unavailable.`);
  }
  return disputeCase;
}

function AdminDisputes() {
  const [selectedCase, setSelectedCase] = useState<number | null>(null);
  const [resolutions, setResolutions] = useState<
    Record<number, Resolution>
  >({});

  const openCases = useMemo(
    () =>
      cases.filter(
        (item, index) =>
          item[4] !== "Resolved" &&
          resolutions[index] !== "Refund recorded" &&
          resolutions[index] !== "Funds released",
      ),
    [resolutions],
  );

  const heldValue = openCases.reduce((total, item) => total + item[3], 0);

  const getStatus = (index: number) => {
    if (resolutions[index] === "Evidence requested") {
      return "Awaiting evidence";
    }

    if (resolutions[index]) return "Resolved";

    return getCase(index)[4];
  };

  const getStatusStyle = (status: string) => {
    if (status === "Resolved") {
      return "bg-success/10 text-success";
    }

    if (status === "Awaiting evidence") {
      return "bg-primary/10 text-primary";
    }

    return "bg-gold/15 text-gold-foreground";
  };

  const recordResolution = (
    index: number,
    outcome: Resolution,
  ) => {
    const caseReference = getCase(index)[0];

    setResolutions((current) => ({
      ...current,
      [index]: outcome,
    }));

    toast.success(`${outcome} for ${caseReference}.`);
    setSelectedCase(null);
  };

  const activeCase =
    selectedCase === null ? null : cases[selectedCase];

  const activeResolution =
    selectedCase === null ? undefined : resolutions[selectedCase];

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Disputes"
      subtitle={`${openCases.length} cases currently require attention`}
    >
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Open cases"
          value={String(openCases.length)}
          tone="primary"
        />
        <StatCard
          label="Value currently held"
          value={naira(heldValue)}
          tone="gold"
        />
        <StatCard
          label="Resolved this month"
          value="38"
        />
        <StatCard
          label="Average resolution"
          value="1.1 days"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Dispute cases"
          action={
            <span className="text-xs font-medium text-muted-foreground">
              {cases.length} records
            </span>
          }
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              {openCases.length} awaiting resolution
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Funds held for review
            </span>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="min-w-[850px]">
              <DataTable
                head={[
                  "Case reference",
                  "Vendor",
                  "Reason",
                  "Amount",
                  "Status",
                  "Opened",
                  "",
                ]}
                rows={cases.map((item, index) => {
                  const status = getStatus(index);

                  return [
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {item[0]}
                    </span>,

                    <span className="font-medium text-foreground">
                      {item[1]}
                    </span>,

                    <span className="text-xs text-muted-foreground">
                      {item[2]}
                    </span>,

                    <span className="font-semibold tabular-nums">
                      {naira(item[3])}
                    </span>,

                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
                    >
                      {status}
                    </span>,

                    <span className="text-xs text-muted-foreground">
                      {item[5]}
                    </span>,

                    <button
                      type="button"
                      onClick={() => setSelectedCase(index)}
                      className="whitespace-nowrap text-xs font-semibold text-primary transition hover:underline"
                    >
                      {resolutions[index] || item[4] === "Resolved"
                        ? "View case"
                        : "Review case"}
                    </button>,
                  ];
                })}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground">
              Showing {cases.length} dispute records
            </p>
            <p className="text-xs text-muted-foreground">
              Resolution actions are prototype-only
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
                      <p className="text-sm font-semibold">
                        {option.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-primary/15 bg-primary/[0.04] p-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Peniel can coordinate refunds because payments are collected
                  through the platform.
                </p>
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
                <li
                  key={guideline}
                  className="flex items-start gap-2.5"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    {guideline}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-3.5 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Disputes should be resolved using order evidence, communication
          records and payment confirmation. Never release or refund funds
          based on an unverified claim.
        </p>
      </div>

      <Dialog
        open={selectedCase !== null}
        onOpenChange={(open) => !open && setSelectedCase(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeCase
                ? `Review ${activeCase[0]}`
                : "Review dispute"}
            </DialogTitle>
            <DialogDescription>
              Review the complaint and record the appropriate next step.
            </DialogDescription>
          </DialogHeader>

          {activeCase && selectedCase !== null && (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {activeCase[1]}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activeCase[0]}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${getStatusStyle(getStatus(selectedCase))}`}
                  >
                    {getStatus(selectedCase)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Dispute reason
                    </p>
                    <p className="mt-1 text-xs font-medium">
                      {activeCase[2]}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-muted-foreground">
                      Amount in dispute
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {naira(activeCase[3])}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    Date opened
                  </span>
                  <span className="text-xs font-medium">
                    {activeCase[5]}
                  </span>
                </div>
              </div>

              {activeResolution || activeCase[4] === "Resolved" ? (
                <div className="rounded-xl border border-success/15 bg-success/5 p-4">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-success">
                        Resolution recorded
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {activeResolution
                          ? `Outcome: ${activeResolution}`
                          : "This case was already resolved."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Choose a resolution action
                  </p>

                  {(
                    [
                      {
                        label: "Request more evidence",
                        outcome: "Evidence requested",
                        icon: FileText,
                        description: "Keep the case open while evidence is collected.",
                      },
                      {
                        label: "Refund customer",
                        outcome: "Refund recorded",
                        icon: Wallet,
                        description: "Record a full customer refund decision.",
                      },
                      {
                        label: "Release funds to vendor",
                        outcome: "Funds released",
                        icon: CheckCircle2,
                        description: "Record a decision to release the held funds.",
                      },
                    ] as const
                  ).map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() =>
                          recordResolution(selectedCase, option.outcome)
                        }
                        className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40 hover:bg-primary/[0.03]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted">
                          <Icon className="size-4 text-primary" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Prototype only: these actions record a local decision. No
                refund or bank transfer is initiated.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
