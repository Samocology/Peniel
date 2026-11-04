import { createFileRoute } from "@tanstack/react-router";
import { Flag, Star } from "lucide-react";
import { useState } from "react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { reviews } from "@/lib/data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews - Peniel admin" },
      {
        name: "description",
        content:
          "Moderate customer reviews, handle flagged content and keep ratings honest across the platform.",
      },
      { property: "og:title", content: "Reviews - Peniel admin" },
      { property: "og:description", content: "Keep ratings trustworthy." },
    ],
  }),
  component: AdminReviews,
});

function AdminReviews() {
  const all = [...reviews, ...reviews].slice(0, 6);
  const [decisions, setDecisions] = useState<Record<number, "Kept" | "Removed">>({});

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Reviews"
      subtitle="6 reviews flagged for moderation"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Reviews total" value="412,908" tone="primary" />
        <StatCard label="Flagged" value="6" tone="gold" />
        <StatCard label="Removed this month" value="41" />
        <StatCard label="Platform average" value="4.6" />
      </div>

      <div className="mt-6 space-y-4">
        {all.map((r, i) => (
          <Panel key={i}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {r.name} <span className="font-normal text-muted-foreground">on {r.vendor}</span>
                </p>
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: r.stars }).map((_, k) => (
                    <Star key={k} className="size-3 fill-gold text-gold" />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">{r.when}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                {decisions[i] && (
                  <span
                    className={
                      "rounded-full px-2.5 py-1 text-xs font-semibold " +
                      (decisions[i] === "Removed"
                        ? "bg-muted text-muted-foreground"
                        : "bg-success/12 text-success")
                    }
                  >
                    {decisions[i]}
                  </span>
                )}
                {i % 3 === 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                    <Flag className="size-3" /> Flagged
                  </span>
                )}
                {!decisions[i] && (
                  <span className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDecisions((current) => ({ ...current, [i]: "Kept" }));
                        toast.success("Review kept on the storefront.");
                      }}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                    >
                      Keep
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDecisions((current) => ({ ...current, [i]: "Removed" }));
                        toast.success("Review hidden from the storefront.");
                      }}
                      className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive"
                    >
                      Remove
                    </button>
                  </span>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </DashShell>
  );
}
