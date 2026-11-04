import { PlanGate } from "@/components/dash/plan-gate";
import { app, isPaid, useApp, useCurrentVendor } from "@/lib/peniel-store";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AlertCircle, BadgeCheck, Check, Clock, Lock, ShieldCheck, Upload, X } from "lucide-react";
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
        <div className="max-w-sm text-center">
          <ShieldCheck className="mx-auto size-8 text-primary" />
          <h1 className="mt-4 font-display text-xl font-bold">Sign in to view verification</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We’re taking you to sign in or create your business account.
          </p>
          <Link
            to="/auth"
            search={{
              mode: "login",
              role: "vendor",
              returnTo: "/vendor/verification",
            }}
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Continue to sign in
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

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Verification"
      subtitle="Verification cannot be bought. It is earned by serving real customers well."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {stage === "progress" && (
            <Panel>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3.5" /> Verification progress
                  </span>
                  <h2 className="mt-3 font-display text-xl font-bold">
                    {servedCustomers} of 5 customers successfully served
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {Math.max(0, 5 - servedCustomers)} more different customers needed before you
                    can apply.
                  </p>
                </div>
                <Lock className="size-5 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.min(100, (servedCustomers / 5) * 100)}%` }}
                />
              </div>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={
                      "grid size-9 place-items-center rounded-full text-xs font-bold " +
                      (n <= servedCustomers
                        ? "bg-primary text-primary-foreground"
                        : "border border-dashed border-border text-muted-foreground")
                    }
                  >
                    {n <= servedCustomers ? <Check className="size-4" /> : n}
                  </span>
                ))}
              </div>
              {eligible ? (
                <Link
                  to="/vendor/verification"
                  search={{ stage: "apply" }}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 sm:w-auto"
                >
                  {isPaid(account.plan) ? "Apply for verification" : "Upgrade to apply"}
                </Link>
              ) : (
                <button
                  disabled
                  className="mt-5 w-full cursor-not-allowed rounded-xl bg-muted py-3 text-sm font-bold text-muted-foreground sm:w-auto sm:px-6"
                >
                  Application locked
                </button>
              )}
            </Panel>
          )}

          {stage === "eligible" && (
            <Panel className="border-success/30 bg-success/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                <BadgeCheck className="size-3.5" /> Eligible
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">
                Congratulations! You are now eligible to apply for verification.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You’ve served {servedCustomers} different customers with a{" "}
                {vendor.rating.toFixed(1)} rating. Eligibility unlocks the application - it is not
                automatic approval.
              </p>
              <Link
                to="/vendor/verification"
                search={{ stage: "apply" }}
                className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
              >
                {isPaid(account.plan) ? "Apply for verification" : "Upgrade to apply"}
              </Link>
            </Panel>
          )}

          {stage === "apply" && (
            <PlanGate feature="Verification applications">
              <Panel title="Verification application">
                <div className="space-y-5">
                  {[
                    ["Business owner full name", ""],
                    ["Business registration number", ""],
                    ["Business phone", vendor.phone],
                    ["Business address", vendor.location],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {l}
                      </span>
                      <input
                        defaultValue={v}
                        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  ))}
                  <div>
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      Documents
                    </span>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {documents.map((d) => (
                        <label
                          key={d}
                          className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-border p-3.5 text-sm transition hover:border-primary/40"
                        >
                          <Upload className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{d}</span>
                            <span className="block truncate text-[11px] text-muted-foreground">
                              {documentFiles[d] ?? "Choose a PDF or image"}
                            </span>
                          </span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            aria-label={`Upload ${d}`}
                            onChange={(event) => {
                              const file = event.currentTarget.files?.[0];
                              if (file)
                                setDocumentFiles((current) => ({ ...current, [d]: file.name }));
                            }}
                            className="sr-only"
                          />
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Files are selected locally in this prototype; they are not uploaded to a
                      server.
                    </p>
                  </div>
                  <label className="flex items-start gap-3 text-sm">
                    <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                    <span className="text-muted-foreground">
                      I confirm this information is accurate and I accept Peniel's verification
                      policy.
                    </span>
                  </label>
                  <Link
                    to="/vendor/verification"
                    search={{ stage: "review" }}
                    onClick={() => app.applyVerification()}
                    className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                  >
                    Submit application
                  </Link>
                </div>
              </Panel>
            </PlanGate>
          )}

          {stage === "review" && (
            <Panel className="border-gold/40 bg-gold/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                <Clock className="size-3.5" /> Under review
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">Verification submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team is reviewing your application. Most reviews finish within 3 business days.
                You'll be notified by email and in your dashboard.
              </p>
            </Panel>
          )}

          {stage === "approved" && (
            <Panel className="border-success/30 bg-success/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
                <BadgeCheck className="size-3.5" /> Verified business
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">You're verified</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your badge is now visible on your storefront and in the marketplace. It can be
                suspended if serious issues are confirmed.
              </p>
            </Panel>
          )}

          {stage === "rejected" && (
            <Panel className="border-destructive/30 bg-destructive/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
                <X className="size-3.5" /> Application not approved
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">
                We couldn't verify your business yet
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reason: the business name on your CAC certificate does not match your storefront
                name.
              </p>
              <p className="mt-3 text-sm">
                You can reapply after <span className="font-semibold">30 days</span> or once the
                document is corrected.
              </p>
            </Panel>
          )}

          <Panel title="Eligibility checklist">
            <ul className="space-y-3.5">
              {eligibility.map(([t, v, done]) => (
                <li
                  key={t}
                  className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3 text-sm"
                >
                  {done ? (
                    <Check className="mt-0.5 size-4 text-success" />
                  ) : (
                    <AlertCircle className="mt-0.5 size-4 text-gold" />
                  )}
                  <span className="min-w-0 font-medium">{t}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Reputation level">
            <ol className="space-y-4 text-sm">
              {[
                ["New vendor", vendor.categoryLabel, servedCustomers > 0],
                ["Eligible for verification", "5 different customers served", eligible],
                ["Verified business", "Reviewed & approved", stage === "approved"],
                ["Trusted / Top rated", "Sustained 4.8+ and 100+ orders", false],
              ].map(([t, h, on]) => (
                <li key={t as string} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                  <span
                    className={
                      "mt-1 size-3 rounded-full " +
                      (on ? "bg-primary" : "border border-border bg-muted")
                    }
                  />
                  <span className="min-w-0">
                    <span className={"block font-semibold " + (on ? "" : "text-muted-foreground")}>
                      {t as string}
                    </span>
                    <span className="block text-xs text-muted-foreground">{h as string}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Verification is never for sale
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Premium plans give you better tools. Only real, well-served customers earn you the
              badge.
            </p>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
