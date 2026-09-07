import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — Vendra admin" },
      { name: "description", content: "Set platform fees, payout schedules, verification rules, team access and marketplace policies." },
      { property: "og:title", content: "Platform settings — Vendra admin" },
      { property: "og:description", content: "The rules that run the marketplace." },
    ],
  }),
  component: AdminSettings,
});

const field = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function AdminSettings() {
  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Platform settings"
      subtitle="Fees, payouts, verification and team"
      actions={<button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Save changes</button>}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel title="Fees">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>Platform fee (%)</span>
                <input className={field} defaultValue="2" />
              </div>
              <div>
                <span className={label}>Standard delivery fee</span>
                <input className={field} defaultValue="2500" />
              </div>
              <div>
                <span className={label}>Minimum order</span>
                <input className={field} defaultValue="2000" />
              </div>
              <div>
                <span className={label}>Booking deposit (%)</span>
                <input className={field} defaultValue="30" />
              </div>
            </div>
          </Panel>

          <Panel title="Payouts">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>Settlement schedule</span>
                <select className={field}>
                  <option>Daily at 6:00 PM WAT</option>
                  <option>Every weekday</option>
                  <option>Weekly on Fridays</option>
                </select>
              </div>
              <div>
                <span className={label}>Hold period after delivery</span>
                <select className={field}>
                  <option>24 hours</option>
                  <option>48 hours</option>
                  <option>72 hours</option>
                </select>
              </div>
              <div>
                <span className={label}>Minimum payout</span>
                <input className={field} defaultValue="5000" />
              </div>
              <div>
                <span className={label}>Bank name check</span>
                <select className={field}>
                  <option>Required</option>
                  <option>Optional</option>
                </select>
              </div>
            </div>
          </Panel>

          <Panel title="Verification rules">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <span className={label}>Distinct customers to apply</span>
                <input className={field} defaultValue="5" />
              </div>
              <div>
                <span className={label}>Minimum rating to apply</span>
                <input className={field} defaultValue="4.0" />
              </div>
              <div>
                <span className={label}>Maximum open complaints</span>
                <input className={field} defaultValue="1" />
              </div>
              <div>
                <span className={label}>Re-apply waiting period</span>
                <input className={field} defaultValue="30 days" />
              </div>
            </div>
            <p className="mt-4 flex gap-2 rounded-xl bg-primary-soft p-3.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              Serving five customers only unlocks eligibility to apply. Approval always depends on satisfaction, complaints, fraud checks,
              identity and policy compliance — and it can never be purchased.
            </p>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Team access">
            <ul className="space-y-3 text-sm">
              {[
                ["Ada N.", "Owner"],
                ["Femi B.", "Payments"],
                ["Ifeoma K.", "Verification"],
                ["Sola A.", "Support"],
              ].map(([n, r]) => (
                <li key={n} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate font-medium">{n}</span>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {r}
                  </span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold">Invite teammate</button>
          </Panel>

          <Panel title="Marketplace policy">
            <div className="space-y-3 text-sm">
              {[
                ["Allow pharmacies", false],
                ["Allow alcohol (bars)", true],
                ["Require ID for payouts", true],
                ["New vendors reviewed manually", true],
              ].map(([t, on]) => (
                <label key={t as string} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{t as string}</span>
                  <span className={"relative h-6 w-11 shrink-0 rounded-full transition " + (on ? "bg-primary" : "bg-muted")}>
                    <span className={"absolute top-1 size-4 rounded-full bg-card transition " + (on ? "left-6" : "left-1")} />
                  </span>
                </label>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
