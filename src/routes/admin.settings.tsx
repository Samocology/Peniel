import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings - Peniel admin" },
      {
        name: "description",
        content:
          "Set platform fees, payout schedules, verification rules, team access and marketplace policies.",
      },
      { property: "og:title", content: "Platform settings - Peniel admin" },
      { property: "og:description", content: "The rules that run the marketplace." },
    ],
  }),
  component: AdminSettings,
});

const field =
  "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary";
const label = "mb-1.5 block text-xs font-semibold tracking-wide uppercase text-muted-foreground";

function AdminSettings() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [team, setTeam] = useState([
    ["Ada N.", "Owner"],
    ["Femi B.", "Payments"],
    ["Ifeoma K.", "Verification"],
    ["Sola A.", "Support"],
  ]);
  const [policy, setPolicy] = useState({
    "Allow pharmacies": false,
    "Allow alcohol (bars)": true,
    "Require ID for payouts": true,
    "New vendors reviewed manually": true,
  });

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Platform settings"
      subtitle="Fees, payouts, verification and team"
      actions={
        <button
          type="submit"
          form="admin-settings"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
        >
          {saved ? "Saved" : "Save changes"}
        </button>
      }
    >
      <form
        id="admin-settings"
        onChange={() => setSaved(false)}
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
          toast.success("Platform settings saved in this prototype.");
        }}
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
                Serving five customers only unlocks eligibility to apply. Approval always depends on
                satisfaction, complaints, fraud checks, identity and policy compliance - and it can
                never be purchased.
              </p>
            </Panel>
          </div>

          <div className="space-y-6">
            <Panel title="Team access">
              <ul className="space-y-3 text-sm">
                {team.map(([n, r]) => (
                  <li key={n} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate font-medium">{n}</span>
                    <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {r}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold transition hover:border-primary/40"
              >
                Invite teammate
              </button>
            </Panel>

            <Panel title="Marketplace policy">
              <div className="space-y-3 text-sm">
                {Object.entries(policy).map(([label, enabled]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate">{label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-label={label}
                      aria-checked={enabled}
                      onClick={() =>
                        setPolicy((current) => ({
                          ...current,
                          [label]: !current[label as keyof typeof current],
                        }))
                      }
                      className={
                        "relative h-6 w-11 shrink-0 rounded-full transition " +
                        (enabled ? "bg-primary" : "bg-muted")
                      }
                    >
                      <span
                        className={
                          "absolute top-1 size-4 rounded-full bg-card transition " +
                          (enabled ? "left-6" : "left-1")
                        }
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </form>
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a teammate</DialogTitle>
            <DialogDescription>
              Add a team member and choose which admin area they support.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const email = String(form.get("email") ?? "").trim();
              const role = String(form.get("role") ?? "Support");
              setTeam((current) => [[email, role], ...current]);
              setInviteOpen(false);
              toast.success(`Invitation prepared for ${email}.`);
            }}
          >
            <label className="block text-sm font-medium">
              Email address
              <input
                required
                type="email"
                name="email"
                placeholder="name@company.com"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </label>
            <label className="block text-sm font-medium">
              Access area
              <select
                name="role"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5"
              >
                <option>Support</option>
                <option>Payments</option>
                <option>Verification</option>
                <option>Operations</option>
              </select>
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
            >
              Prepare invitation
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            This prototype records the invitation in the team list; it does not send email.
          </p>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
