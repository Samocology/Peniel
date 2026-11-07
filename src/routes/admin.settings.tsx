
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  Users,
  Wallet,
  SlidersHorizontal,
  Store,
  Plus,
  Check,
  Settings2,
  LockKeyhole,
  Mail,
  Info,
  Trash2,
} from "lucide-react";
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
  "h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

const label =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

type PolicyKey =
  | "Allow pharmacies"
  | "Allow alcohol (bars)"
  | "Require ID for payouts"
  | "New vendors reviewed manually";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function SettingField({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className={label}>{title}</label>
      {children}
    </div>
  );
}

function AdminSettings() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [team, setTeam] = useState<[string, string][]>([
    ["Ada N.", "Owner"],
    ["Femi B.", "Payments"],
    ["Ifeoma K.", "Verification"],
    ["Sola A.", "Support"],
  ]);
  const [policy, setPolicy] = useState<Record<PolicyKey, boolean>>({
    "Allow pharmacies": false,
    "Allow alcohol (bars)": true,
    "Require ID for payouts": true,
    "New vendors reviewed manually": true,
  });

  const markUnsaved = () => setSaved(false);

  const updatePolicy = (key: PolicyKey) => {
    setPolicy((current) => ({
      ...current,
      [key]: !current[key],
    }));
    markUnsaved();
  };

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Platform settings"
      subtitle="Configure how Peniel operates, pays vendors and manages access."
      actions={
        <button
          type="submit"
          form="admin-settings"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:w-auto"
        >
          {saved ? (
            <>
              <Check className="size-4" />
              Saved
            </>
          ) : (
            <>
              <Check className="size-4" />
              Save changes
            </>
          )}
        </button>
      }
    >
      <form
        id="admin-settings"
        onChange={markUnsaved}
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
          toast.success("Platform settings saved in this prototype.");
        }}
      >
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <Panel>
              <SectionHeading
                icon={Wallet}
                title="Fees & pricing"
                description="Configure platform charges and order requirements."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SettingField title="Platform fee (%)">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    defaultValue="2"
                  />
                </SettingField>

                <SettingField title="Standard delivery fee (₦)">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    defaultValue="2500"
                  />
                </SettingField>

                <SettingField title="Minimum order (₦)">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    defaultValue="2000"
                  />
                </SettingField>

                <SettingField title="Booking deposit (%)">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="30"
                  />
                </SettingField>
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={Wallet}
                title="Payout configuration"
                description="Control vendor settlement timing and withdrawal requirements."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SettingField title="Settlement schedule">
                  <select className={field} defaultValue="daily">
                    <option value="daily">Daily at 6:00 PM WAT</option>
                    <option value="weekdays">Every weekday</option>
                    <option value="weekly">Weekly on Fridays</option>
                  </select>
                </SettingField>

                <SettingField title="Hold period after delivery">
                  <select className={field} defaultValue="24">
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                  </select>
                </SettingField>

                <SettingField title="Minimum payout (₦)">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    defaultValue="5000"
                  />
                </SettingField>

                <SettingField title="Bank name verification">
                  <select className={field} defaultValue="required">
                    <option value="required">Required</option>
                    <option value="optional">Optional</option>
                  </select>
                </SettingField>
              </div>
            </Panel>

            <Panel>
              <SectionHeading
                icon={ShieldCheck}
                title="Verification requirements"
                description="Set the eligibility criteria for vendor verification."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SettingField title="Distinct customers to apply">
                  <input
                    className={field}
                    type="number"
                    min="1"
                    defaultValue="5"
                  />
                </SettingField>

                <SettingField title="Minimum rating to apply">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    defaultValue="4.0"
                  />
                </SettingField>

                <SettingField title="Maximum open complaints">
                  <input
                    className={field}
                    type="number"
                    min="0"
                    defaultValue="1"
                  />
                </SettingField>

                <SettingField title="Re-apply waiting period">
                  <select className={field} defaultValue="30">
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </SettingField>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">Verification integrity</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Serving five customers only unlocks eligibility to apply.
                    Approval still depends on customer satisfaction, complaints,
                    fraud checks, identity and policy compliance. Verification
                    cannot be purchased.
                  </p>
                </div>
              </div>
            </Panel>

            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <p className="text-xs leading-5 text-muted-foreground">
                Changes to fees, settlement rules and verification requirements
                can affect active vendors and future transactions. Review
                configuration changes carefully before applying them.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <Panel>
              <SectionHeading
                icon={Users}
                title="Team access"
                description="Manage your platform administrators."
              />

              <div className="space-y-2">
                {team.map(([name, role], index) => (
                  <div
                    key={`${name}-${index}`}
                    className="flex items-center gap-2.5 rounded-xl border border-border p-2.5"
                  >
                    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .replace(".", "")
                        .slice(0, 2)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{name}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {role}
                      </p>
                    </div>

                    {role === "Owner" ? (
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                        Owner
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${name} from team`}
                        onClick={() => {
                          setTeam((current) =>
                            current.filter((_, itemIndex) => itemIndex !== index),
                          );
                          markUnsaved();
                          toast.success(`${name} removed from the team list.`);
                        }}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setInviteOpen(true)}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-muted/50"
              >
                <Plus className="size-3.5" />
                Invite teammate
              </button>
            </Panel>

            <Panel>
              <SectionHeading
                icon={Store}
                title="Marketplace policy"
                description="Control which services and rules apply."
              />

              <div className="space-y-1">
                {(Object.entries(policy) as [PolicyKey, boolean][]).map(
                  ([name, enabled]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{name}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {enabled ? "Currently enabled" : "Currently disabled"}
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-label={name}
                        aria-checked={enabled}
                        onClick={() => updatePolicy(name)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          enabled ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <span
                          className={`absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all ${
                            enabled ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ),
                )}
              </div>
            </Panel>

            <Panel>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <LockKeyhole className="size-4" />
                </div>
                <h3 className="text-sm font-semibold">Access & security</h3>
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Give each team member access only to the platform areas they
                need. Sensitive financial and verification actions should be
                restricted to authorised administrators.
              </p>
            </Panel>
          </aside>
        </div>
      </form>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl">
          <DialogHeader>
            <div className="mb-1 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="size-4.5" />
            </div>
            <DialogTitle className="text-base">Invite a teammate</DialogTitle>
            <DialogDescription className="text-xs leading-5">
              Add a team member and assign the area they will support.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const email = String(form.get("email") ?? "").trim();
              const role = String(form.get("role") ?? "Support");

              if (team.some(([name]) => name.toLowerCase() === email.toLowerCase())) {
                toast.error("This teammate is already on the list.");
                return;
              }

              setTeam((current) => [[email, role], ...current]);
              markUnsaved();
              setInviteOpen(false);
              toast.success(`Invitation prepared for ${email}.`);
            }}
          >
            <label className="block text-xs font-semibold">
              Email address
              <input
                required
                type="email"
                name="email"
                placeholder="name@company.com"
                className={`${field} mt-1.5`}
              />
            </label>

            <label className="block text-xs font-semibold">
              Access area
              <select name="role" className={`${field} mt-1.5`}>
                <option>Support</option>
                <option>Payments</option>
                <option>Verification</option>
                <option>Operations</option>
              </select>
            </label>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setInviteOpen(false)}
                className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="size-4" />
                Prepare invitation
              </button>
            </div>
          </form>

          <p className="text-[11px] leading-5 text-muted-foreground">
            This prototype adds the teammate to the local team list. It does
            not send an email or create an authenticated admin account.
          </p>
        </DialogContent>
      </Dialog>
    </DashShell>
  );
}
