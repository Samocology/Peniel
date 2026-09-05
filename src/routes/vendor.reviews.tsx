import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Star } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { reviews } from "@/lib/data";

export const Route = createFileRoute("/vendor/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Vendra business console" },
      { name: "description", content: "Read verified customer reviews, reply publicly and watch the rating that earns your verification." },
      { property: "og:title", content: "Reviews — Vendra business console" },
      { property: "og:description", content: "Only real customers can review you on Vendra." },
    ],
  }),
  component: VendorReviews,
});

const spread = [
  [5, 84],
  [4, 11],
  [3, 3],
  [2, 1],
  [1, 1],
] as const;

function VendorReviews() {
  const all = [...reviews, ...reviews].slice(0, 6);

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Reviews"
      subtitle="4.8 average from 214 verified customers"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average rating" value="4.8" hint="Top 8% in Restaurants" tone="primary" />
        <StatCard label="Reviews this month" value="27" hint="+9 vs last month" />
        <StatCard label="Response rate" value="92%" hint="Replies build trust" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Panel title="Rating spread">
          <ul className="space-y-3">
            {spread.map(([s, pct]) => (
              <li key={s} className="grid grid-cols-[42px_minmax(0,1fr)_38px] items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 font-medium">
                  {s} <Star className="size-3 fill-gold text-gold" />
                </span>
                <span className="h-2 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </span>
                <span className="text-right text-xs text-muted-foreground">{pct}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Reviews can only be left by customers who paid through Vendra.
          </p>
        </Panel>

        <Panel title="All reviews">
          <ul className="space-y-5">
            {all.map((r, i) => (
              <li key={i} className="border-b border-border pb-5 last:border-0 last:pb-0">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{r.name}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {Array.from({ length: r.stars }).map((_, k) => (
                        <Star key={k} className="size-3 fill-gold text-gold" />
                      ))}
                      <span className="ml-1 text-xs text-muted-foreground">{r.when}</span>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                    Verified buyer
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
                <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">
                  <MessageSquare className="size-3.5" /> Reply
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashShell>
  );
}
