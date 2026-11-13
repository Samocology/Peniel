import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { isPaid, useCurrentVendor } from "@/lib/peniel-store";

/** Blocks features that the free Starter plan doesn't include. */
export function PlanGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { account } = useCurrentVendor();
  if (isPaid(account.plan)) return <>{children}</>;
  return (
    <div className="rounded-3xl border border-gold/50 bg-gold/10 p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gold text-gold-foreground">
        <Lock className="size-5" />
      </span>
      <p className="mt-4 font-display text-xl font-bold">{feature} needs a paid plan</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        You're on the free Starter plan. Upgrade to Growth or Business to unlock{" "}
        {feature.toLowerCase()}.
      </p>
      <Link
        to="/vendor/upgrade"
        className="mt-5 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
      >
        See upgrade options
      </Link>
    </div>
  );
}
