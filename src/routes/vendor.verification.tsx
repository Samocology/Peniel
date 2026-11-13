import { PlanGate } from "@/components/dash/plan-gate";
import { app, isPaid, useApp, useCurrentVendor } from "@/lib/peniel-store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  FileCheck,
  Lock,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";

export const Route = createFileRoute("/vendor/verification")({
  validateSearch: z.object({
    stage: z
      .enum(["progress", "eligible", "apply", "review", "approved", "rejected"])
      .default("progress"),
  }),
  head: () => ({
    meta: [
      { title: "Verification - earn your Peniel badge" },
      {
        name: "description",
        content:
          "Serve five different customers well to unlock your verification application. Verification is earned, never bought.",
      },
      { property: "og:title", content: "Verification - earn your Peniel badge" },
      {
        property: "og:description",
        content: "Trust on Peniel is earned through real customer service.",
      },
    ],
  }),
  component: VerificationPage,
});

function VerificationPage() {
  const { stage: requestedStage } = Route.useSearch();
  const navigate = useNavigate({ from: "/vendor/verification" });
  const { vendor, account } = useCurrentVendor();
  const state = useApp();

  const [documentFiles, setDocumentFiles] = useState<Record<string, string>>({});

  const isVendor = state.user?.role === "vendor";

  useEffect(() => {
    if (!isVendor) {
      void navigate({
        to: "/auth",
        search: {
          mode: "login",
          role: "vendor",
          returnTo: "/vendor/verification",
        },
      });
    }
  }, [isVendor, navigate]);

  if (!isVendor) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>

          <h1 className="mt-4 text-lg font-semibold">Sign in to view verification</h1>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            We're taking you to sign in or create your business account.
          </p>

          <Link
            to="/auth"
            search={{
              mode: "login",
              role: "vendor",
              returnTo: "/vendor/verification",
            }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Continue to sign in
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </main>
    );
  }

  const servedCustomers = new Set(
    state.orders
      .filter((order) => order.vendorSlug === vendor.slug && order.status === "Delivered")
      .map((order) => order.customer),
  ).size;

  const eligible = servedCustomers >= 5 && vendor.rating >= 4;

  const stage =
    account.verification === "applied"
      ? "review"
      : !eligible && (requestedStage === "eligible" || requestedStage === "apply")
        ? "progress"
        : requestedStage;

  const eligibility = [
    ["Serve 5 different customers", `${servedCustomers} of 5 completed`, servedCustomers >= 5],
    ["Customer satisfaction above 4.0", `${vendor.rating.toFixed(1)} average`, vendor.rating >= 4],
    ["No unresolved serious complaints", "Requires platform review", false],
    ["No confirmed fraud", "Requires platform review", false],
    ["Identity & business information", "Provide business documents", false],
    ["Compliance with platform policies", "Requires platform review", false],
  ] as const;

  const documents =
    vendor.type === "restaurant" || vendor.type === "bakery" || vendor.type === "fresh-food"
      ? ["Government ID", "Business registration", "Proof of address", "Food safety certificate"]
      : ["Government ID", "Business registration", "Proof of address", "Business-specific license"];

  const progress = Math.min(100, (servedCustomers / 5) * 100);

  const stages = [
    {
      title: "New vendor",
      description: vendor.categoryLabel,
      complete: servedCustomers > 0,
    },
    {
      title: "Eligible for verification",
      description: "5 different customers served",
      complete: eligible,
    },
    {
      title: "Verified business",
      description: "Reviewed and approved",
      complete: stage === "approved",
    },
    {
      title: "Trusted / Top rated",
      description: "Sustained 4.8+ and 100+ orders",
      complete: false,
    },
  ];

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Verification"
      subtitle="Build customer trust through consistent service and genuine business information."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="space-y-6">
        {/* Intro banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-12 size-48 rounded-full bg-primary/5 blur-2xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <BadgeCheck className="size-6" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">Earn your verified business badge</p>
                <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
                  Verification helps customers recognise businesses that have demonstrated genuine
                  service, reliability and compliance.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-primary/20 bg-background/70 px-3 py-1.5 text-[11px] font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              Earned, never bought
            </span>
          </div>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          {/* Main column */}
          <div className="min-w-0 space-y-5">
            {/* Progress stage */}
            {stage === "progress" && (
              <Panel title="Your verification journey">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      <Clock className="size-3.5" />
                      In progress
                    </span>

                    <h2 className="mt-3 text-lg font-semibold tracking-tight">
                      {servedCustomers} of 5 customers served
                    </h2>

                    <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">
                      Serve five different customers successfully to unlock your verification
                      application.
                    </p>
                  </div>

                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                    <Lock className="size-4" />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-muted-foreground">
                      Customer service progress
                    </span>
                    <span className="font-semibold tabular-nums">{Math.round(progress)}%</span>
                  </div>

                  <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2">
                  {[1, 2, 3, 4, 5].map((number) => (
                    <div key={number} className="flex flex-1 flex-col items-center gap-2">
                      <span
                        className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                          number <= servedCustomers
                            ? "bg-primary text-primary-foreground"
                            : "border border-dashed border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {number <= servedCustomers ? <Check className="size-4" /> : number}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Customer {number}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold">
                      {servedCustomers >= 5
                        ? "Customer requirement completed"
                        : `${Math.max(0, 5 - servedCustomers)} more ${
                            5 - servedCustomers === 1 ? "customer" : "customers"
                          } to go`}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Your rating must also be at least 4.0.
                    </p>
                  </div>

                  {eligible ? (
                    <Link
                      to="/vendor/verification"
                      search={{ stage: "apply" }}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      {isPaid(account.plan) ? "Apply for verification" : "Upgrade to apply"}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  ) : (
                    <span className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-xs font-semibold text-muted-foreground">
                      <Lock className="size-3.5" />
                      Application locked
                    </span>
                  )}
                </div>
              </Panel>
            )}

            {/* Eligible stage */}
            {stage === "eligible" && (
              <Panel className="border-success/30 bg-success/5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                    <BadgeCheck className="size-6" />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                      Eligible to apply
                    </span>

                    <h2 className="mt-3 text-lg font-semibold">
                      You've reached the eligibility milestone.
                    </h2>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      You've served {servedCustomers} different customers with a{" "}
                      {vendor.rating.toFixed(1)} rating. Eligibility unlocks the application; it
                      does not guarantee approval.
                    </p>

                    <Link
                      to="/vendor/verification"
                      search={{ stage: "apply" }}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      {isPaid(account.plan) ? "Start application" : "Upgrade to apply"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </Panel>
            )}

            {/* Application stage */}
            {stage === "apply" && (
              <PlanGate feature="Verification applications">
                <Panel title="Verification application">
                  <div className="mb-5 rounded-xl border border-border bg-muted/20 p-3.5">
                    <div className="flex items-start gap-2.5">
                      <FileCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">Business information and documents</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          Provide accurate details and select the requested supporting documents for
                          review.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      ["Business owner full name", ""],
                      ["Business registration number", ""],
                      ["Business phone", vendor.phone],
                      ["Business address", vendor.location],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                          {label}
                        </label>
                        <input
                          defaultValue={value}
                          className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                        />
                      </div>
                    ))}

                    <div className="border-t border-border pt-5">
                      <div className="mb-3">
                        <p className="text-sm font-semibold">Supporting documents</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Select a PDF or image for each required document.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {documents.map((document) => (
                          <label
                            key={document}
                            className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-3.5 transition hover:border-primary/40 hover:bg-muted/20"
                          >
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              {documentFiles[document] ? (
                                <Check className="size-4" />
                              ) : (
                                <Upload className="size-4" />
                              )}
                            </div>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-xs font-semibold">
                                {document}
                              </span>
                              <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                                {documentFiles[document] ?? "Choose a PDF or image"}
                              </span>
                            </span>

                            <input
                              type="file"
                              accept="image/*,.pdf"
                              aria-label={`Upload ${document}`}
                              onChange={(event) => {
                                const file = event.currentTarget.files?.[0];

                                if (file) {
                                  setDocumentFiles((current) => ({
                                    ...current,
                                    [document]: file.name,
                                  }));
                                }
                              }}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </div>

                      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                        Documents are selected locally in this prototype. They are not uploaded to a
                        server.
                      </p>
                    </div>

                    <div className="border-t border-border pt-4">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="mt-0.5 size-4 shrink-0 accent-primary"
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                          I confirm that this information is accurate and I accept Peniel's
                          verification policy.
                        </span>
                      </label>
                    </div>

                    <Link
                      to="/vendor/verification"
                      search={{ stage: "review" }}
                      onClick={() => app.applyVerification()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
                    >
                      Submit application
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </Panel>
              </PlanGate>
            )}

            {/* Under review */}
            {stage === "review" && (
              <Panel className="border-gold/30 bg-gold/5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-foreground">
                    <Clock className="size-5" />
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-gold/15 px-2.5 py-1 text-[11px] font-semibold text-gold-foreground">
                      Under review
                    </span>

                    <h2 className="mt-3 text-lg font-semibold">Verification submitted</h2>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Our team is reviewing your application. Most reviews finish within 3 business
                      days. You'll be notified by email and in your dashboard.
                    </p>
                  </div>
                </div>
              </Panel>
            )}

            {/* Approved */}
            {stage === "approved" && (
              <Panel className="border-success/30 bg-success/5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
                    <BadgeCheck className="size-6" />
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
                      Verified business
                    </span>

                    <h2 className="mt-3 text-lg font-semibold">Your business is verified</h2>

                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Your badge is now visible on your storefront and in the marketplace. It can be
                      suspended if serious issues are confirmed.
                    </p>
                  </div>
                </div>
              </Panel>
            )}

            {/* Rejected */}
            {stage === "rejected" && (
              <Panel className="border-destructive/30 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <X className="size-5" />
                  </div>

                  <div>
                    <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                      Application not approved
                    </span>

                    <h2 className="mt-3 text-lg font-semibold">
                      We couldn't verify your business yet
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      Reason: the business name on your CAC certificate does not match your
                      storefront name.
                    </p>

                    <div className="mt-4 rounded-xl border border-destructive/15 bg-background/70 p-3.5">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        You can reapply after{" "}
                        <span className="font-semibold text-foreground">30 days</span> or once the
                        document is corrected.
                      </p>
                    </div>
                  </div>
                </div>
              </Panel>
            )}

            {/* Eligibility checklist */}
            <Panel title="Eligibility checklist">
              <div className="mb-4">
                <p className="text-xs text-muted-foreground">
                  Requirements considered during the verification process.
                </p>
              </div>

              <div className="space-y-3">
                {eligibility.map(([title, description, done]) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-xl border border-border/70 p-3"
                  >
                    <div
                      className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                        done ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="size-4" /> : <AlertCircle className="size-4" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold">{title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>

                    <span
                      className={`mt-1 shrink-0 text-[10px] font-semibold ${
                        done ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {done ? "Complete" : "Pending"}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                Some requirements, including complaints, fraud and policy compliance, can only be
                confirmed through platform review.
              </p>
            </Panel>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            <Panel title="Reputation levels">
              <p className="mb-5 text-xs leading-relaxed text-muted-foreground">
                Your business progresses through reputation milestones as you build a track record
                on Peniel.
              </p>

              <ol className="relative space-y-5 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-border">
                {stages.map((item, index) => {
                  const current =
                    index === 0
                      ? servedCustomers > 0 && !eligible
                      : index === 1
                        ? eligible && stage !== "approved"
                        : index === 2
                          ? stage === "approved"
                          : false;

                  return (
                    <li key={item.title} className="relative flex items-start gap-3">
                      <span
                        className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border-2 ${
                          item.complete
                            ? "border-primary bg-primary text-primary-foreground"
                            : current
                              ? "border-primary bg-background text-primary"
                              : "border-border bg-card text-muted-foreground"
                        }`}
                      >
                        {item.complete ? (
                          <Check className="size-3.5" />
                        ) : (
                          <span className="text-[10px] font-semibold">{index + 1}</span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1 pt-0.5">
                        <p
                          className={`text-xs font-semibold ${
                            item.complete || current ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-4.5" />
                </div>
                <p className="text-sm font-semibold">Trust is earned here</p>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Premium plans provide better business tools. Only genuine customer service and a
                successful review can earn your verification badge.
              </p>

              <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-[11px] font-medium text-primary">
                <Sparkles className="size-3.5" />
                Built on customer trust
              </div>
            </Panel>
          </aside>
        </div>
      </div>
    </DashShell>
  );
}
