import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { app, useCurrentVendor, type Plan } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade your plan - Peniel business console" },
      {
        name: "description",
        content:
          "Unlock promotions, verification applications and unlimited storefront design changes.",
      },
      { property: "og:title", content: "Upgrade your plan - Peniel" },
      { property: "og:description", content: "Unlock more growth tools for your business." },
    ],
  }),
  component: Upgrade,
});

const plans: { id: Plan; name: string; price: string; perks: string[] }[] = [
  {
    id: "starter",
    name: "Starter",
    price: "Free",
    perks: ["1 storefront design choice", "Orders, bookings & chat", "Peniel Pay checkout"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "₦9,500/mo",
    perks: [
      "Switch storefront designs any time",
      "Promotions & promo codes",
      "Apply for verification",
      "Advanced analytics",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: "₦24,000/mo",
    perks: ["Everything in Growth", "Staff roles", "Faster payouts", "Account manager"],
  },
];

function Upgrade() {
  const { vendor, account } = useCurrentVendor();
  const [paying, setPaying] = useState<Plan | null>(null);

  const choose = (p: Plan) => {
    if (p === account.plan) return;
    if (p === "starter") {
      app.upgrade("starter");
      toast("Switched to the free Starter plan");
      return;
    }
    setPaying(p);
    // Simulated Peniel Pay charge until payments are connected.
    setTimeout(() => {
      app.upgrade(p);
      setPaying(null);
      toast.success(`${vendor.name} is now on ${p === "growth" ? "Growth" : "Business"}`);
    }, 1600);
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Plans"
      subtitle={`Current plan: ${account.plan === "starter" ? "Starter (free)" : account.plan}`}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const current = p.id === account.plan;
          return (
            <Panel key={p.id} className={current ? "ring-2 ring-primary" : ""}>
              <p className="font-display text-lg font-bold">{p.name}</p>
              <p className="mt-1 font-display text-2xl font-bold text-primary">{p.price}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {p.perks.map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check className="size-4 shrink-0 text-primary" /> {x}
                  </li>
                ))}
              </ul>
              <button
                disabled={current || paying !== null}
                onClick={() => choose(p.id)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {paying === p.id && <Loader2 className="size-4 animate-spin" />}
                {current
                  ? "Current plan"
                  : paying === p.id
                    ? "Processing payment…"
                    : p.id === "starter"
                      ? "Downgrade"
                      : `Pay & upgrade`}
              </button>
            </Panel>
          );
        })}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" /> Charged through Peniel Pay. Plans never buy
        verification.
      </p>
    </DashShell>
  );
}
