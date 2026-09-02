import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { AlertCircle, BadgeCheck, Check, Clock, FileText, Lock, ShieldCheck, Upload, X } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";

export const Route = createFileRoute("/vendor/verification")({
  validateSearch: z.object({
    stage: z.enum(["progress", "eligible", "apply", "review", "approved", "rejected"]).default("progress"),
  }),
  head: () => ({
    meta: [
      { title: "Verification — earn your Vendra badge" },
      { name: "description", content: "Serve five different customers well to unlock your verification application. Verification is earned, never bought." },
      { property: "og:title", content: "Verification — earn your Vendra badge" },
      { property: "og:description", content: "Trust on Vendra is earned through real customer service." },
    ],
  }),
  component: VerificationPage,
});

const eligibility = [
  ["Serve 5 different customers", "3 of 5 completed", false],
  ["Customer satisfaction above 4.0", "Currently 4.8", true],
  ["No unresolved serious complaints", "None on record", true],
  ["No confirmed fraud", "Clear", true],
  ["Identity & business information", "1 document missing", false],
  ["Compliance with platform policies", "In good standing", true],
] as const;

function VerificationPage() {
  const { stage } = Route.useSearch();
  const eligible = stage !== "progress";

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Verification"
      subtitle="Verification cannot be bought. It is earned by serving real customers well."
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {stage === "progress" && (
            <Panel>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Clock className="size-3.5" /> New vendor
                  </span>
                  <h2 className="mt-3 font-display text-xl font-bold">3 of 5 customers successfully served</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    2 more customers needed before you can apply.
                  </p>
                </div>
                <Lock className="size-5 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/5 rounded-full bg-primary" />
              </div>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={
                      "grid size-9 place-items-center rounded-full text-xs font-bold " +
                      (n <= 3 ? "bg-primary text-primary-foreground" : "border border-dashed border-border text-muted-foreground")
                    }
                  >
                    {n <= 3 ? <Check className="size-4" /> : n}
                  </span>
                ))}
              </div>
              <button
                disabled
                className="mt-5 w-full cursor-not-allowed rounded-xl bg-muted py-3 text-sm font-bold text-muted-foreground sm:w-auto sm:px-6"
              >
                Apply for verification (locked)
              </button>
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
                You've served 5 different customers with a 4.8 rating. Eligibility unlocks the application — it is not automatic approval.
              </p>
              <Link
                to="/vendor/verification"
                search={{ stage: "apply" }}
                className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
              >
                Apply for verification
              </Link>
            </Panel>
          )}

          {stage === "apply" && (
            <Panel title="Verification application">
              <div className="space-y-5">
                {[
                  ["Business owner full name", "Abigail Nwachukwu"],
                  ["Business registration number (CAC)", "RC 1849302"],
                  ["Business phone", "+234 803 000 0000"],
                  ["Business address", "14 Awolowo Road, Ikoyi, Lagos"],
                ].map(([l, v]) => (
                  <div key={l}>
                    <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">{l}</span>
                    <input
                      defaultValue={v}
                      className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                ))}
                <div>
                  <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">Documents</span>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Government ID", "CAC certificate", "Proof of address", "Food handling permit"].map((d, i) => (
                      <div key={d} className="flex items-center gap-3 rounded-xl border border-border p-3.5 text-sm">
                        {i < 2 ? <FileText className="size-4 shrink-0 text-success" /> : <Upload className="size-4 shrink-0 text-muted-foreground" />}
                        <span className="min-w-0 flex-1 truncate">{d}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">{i < 2 ? "Uploaded" : "Upload"}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" defaultChecked className="mt-1 accent-primary" />
                  <span className="text-muted-foreground">
                    I confirm this information is accurate and I accept Vendra's verification policy.
                  </span>
                </label>
                <Link
                  to="/vendor/verification"
                  search={{ stage: "review" }}
                  className="inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
                >
                  Submit application
                </Link>
              </div>
            </Panel>
          )}

          {stage === "review" && (
            <Panel className="border-gold/40 bg-gold/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                <Clock className="size-3.5" /> Under review
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">Verification submitted</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team is reviewing your application. Most reviews finish within 3 business days. You'll be notified by email and in your dashboard.
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
                Your badge is now visible on your storefront and in the marketplace. It can be suspended if serious issues are confirmed.
              </p>
            </Panel>
          )}

          {stage === "rejected" && (
            <Panel className="border-destructive/30 bg-destructive/8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
                <X className="size-3.5" /> Application not approved
              </span>
              <h2 className="mt-3 font-display text-xl font-bold">We couldn't verify your business yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reason: the business name on your CAC certificate does not match your storefront name.
              </p>
              <p className="mt-3 text-sm">You can reapply after <span className="font-semibold">30 days</span> or once the document is corrected.</p>
            </Panel>
          )}

          <Panel title="Eligibility checklist">
            <ul className="space-y-3.5">
              {eligibility.map(([t, v, done]) => (
                <li key={t} className="grid grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3 text-sm">
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
                ["New vendor", "You are here", true],
                ["Eligible for verification", "5 customers served", eligible],
                ["Verified business", "Reviewed & approved", stage === "approved"],
                ["Trusted / Top rated", "Sustained 4.8+ and 100+ orders", false],
              ].map(([t, h, on]) => (
                <li key={t as string} className="grid grid-cols-[20px_minmax(0,1fr)] gap-3">
                  <span
                    className={
                      "mt-1 size-3 rounded-full " + (on ? "bg-primary" : "border border-border bg-muted")
                    }
                  />
                  <span className="min-w-0">
                    <span className={"block font-semibold " + (on ? "" : "text-muted-foreground")}>{t as string}</span>
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
              Premium plans give you better tools. Only real, well-served customers earn you the badge.
            </p>
          </Panel>

          <Panel title="Preview stages">
            <div className="flex flex-wrap gap-2">
              {(["progress", "eligible", "apply", "review", "approved", "rejected"] as const).map((s) => (
                <Link
                  key={s}
                  to="/vendor/verification"
                  search={{ stage: s }}
                  className={
                    "rounded-full border px-3 py-1 text-xs font-medium " +
                    (s === stage ? "border-primary text-primary" : "border-border text-muted-foreground")
                  }
                >
                  {s}
                </Link>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
