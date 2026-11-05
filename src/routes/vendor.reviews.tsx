import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  MessageSquare,
  ShieldCheck,
  Star,
  TrendingUp,
} from "lucide-react";

import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { reviews } from "@/lib/data";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews - Peniel business console" },
      {
        name: "description",
        content: "Review your storefront rating and customer feedback status.",
      },
      { property: "og:title", content: "Reviews - Peniel business console" },
      {
        property: "og:description",
        content: "Review customer feedback for your storefront.",
      },
    ],
  }),
  component: VendorReviews,
});

function VendorReviews() {
  const { vendor } = useCurrentVendor();

  const recentReviews = reviews.filter(
    (review) => review.vendor === vendor.name,
  );

  const averageRating = vendor.rating.toFixed(1);

  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: recentReviews.filter((review) => review.stars === stars).length,
  }));

  const totalVisibleReviews = ratingDistribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Reviews"
      subtitle="Understand how customers experience your business."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="space-y-6">
        {/* Overview */}
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <StatCard
              label="Average rating"
              value={averageRating}
              hint="Current storefront rating"
              tone="primary"
              icon={<Star className="size-4 fill-gold text-gold" />}
            />
          </div>

          <div className="min-w-0">
            <StatCard
              label="Customer reviews"
              value={String(vendor.reviews)}
              hint="Total reviews received"
              icon={<MessageSquare className="size-4" />}
            />
          </div>

          <div className="min-w-0 min-[360px]:col-span-2 xl:col-span-1">
            <StatCard
              label="Response rate"
              value="Not tracked"
              hint="Reply metrics aren't available yet"
              tone="gold"
              icon={<TrendingUp className="size-4" />}
            />
          </div>
        </div>

        {/* Rating summary */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <Panel title="Rating overview">
            <div className="grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
              <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/20 px-4 py-6">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">
                  {averageRating}
                </span>

                <div className="mt-2 flex items-center gap-1 text-gold">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`size-4 ${
                        index < Math.round(vendor.rating)
                          ? "fill-current"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Based on {vendor.reviews} reviews
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Rating distribution</p>
                  <span className="text-[11px] text-muted-foreground">
                    {totalVisibleReviews} displayed
                  </span>
                </div>

                {ratingDistribution.map((item) => {
                  const percentage =
                    totalVisibleReviews > 0
                      ? (item.count / totalVisibleReviews) * 100
                      : 0;

                  return (
                    <div
                      key={item.stars}
                      className="grid grid-cols-[28px_minmax(0,1fr)_28px] items-center gap-3"
                    >
                      <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
                        {item.stars}
                        <Star className="size-3 fill-gold text-gold" />
                      </span>

                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gold transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <span className="text-right text-xs tabular-nums text-muted-foreground">
                        {item.count}
                      </span>
                    </div>
                  );
                })}

                <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Distribution is calculated from the review entries currently
                  available for this storefront. The overall rating and review
                  count come from your storefront profile.
                </p>
              </div>
            </div>
          </Panel>

          <Panel title="Your reputation">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3.5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Customer trust matters</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Every experience contributes to your reputation.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Maintain consistent service and product quality.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Use Peniel chats to address customer questions promptly.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <Star className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Encourage honest feedback after completed orders or bookings.
                </p>
              </div>
            </div>

            <Link
              to="/vendor/messages"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold transition hover:border-primary/40 hover:bg-muted/50"
            >
              Open customer chats
              <ArrowRight className="size-3.5" />
            </Link>
          </Panel>
        </div>

        {/* Customer feedback */}
        <Panel title="Recent customer feedback">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Feedback shared by customers on your storefront.
            </p>

            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              {recentReviews.length} available
            </span>
          </div>

          {recentReviews.length > 0 ? (
            <div className="divide-y divide-border">
              {recentReviews.map((review) => (
                <article
                  key={`${review.name}-${review.when}`}
                  className="py-4 first:pt-1 last:pb-1"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {review.name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {review.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {review.when}
                          </p>
                        </div>

                        <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-gold/10 px-2.5 py-1 text-xs font-semibold text-gold-foreground">
                          <Star className="size-3 fill-current" />
                          {review.stars}.0
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-0.5 text-gold">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`size-3.5 ${
                              index < review.stars
                                ? "fill-current"
                                : "text-muted-foreground/25"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-foreground/80">
                        {review.text}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                        <span className="text-[11px] text-muted-foreground">
                          Customer feedback
                        </span>

                        <Link
                          to="/vendor/messages"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition hover:opacity-70"
                        >
                          <MessageSquare className="size-3.5" />
                          Open chats
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Star className="size-5" />
              </div>

              <p className="mt-4 text-sm font-semibold">
                Your next review starts with a great experience
              </p>

              <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                No review text is available for this sample storefront yet.
                Your overall rating and review count still come from your
                storefront profile.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
