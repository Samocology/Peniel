import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Flag,
  Star,
  Search,
  ShieldCheck,
  EyeOff,
  MessageSquare,
  Check,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { adminApi, type AdminReview } from "@/lib/api-client";
import { useAdminReviews } from "@/lib/admin-hooks";
import { toast } from "sonner";

type Filter = "All" | "Flagged" | "Pending" | "Reviewed";

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
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const { data: reviews = [], loading, error } = useAdminReviews();

  const flaggedCount = reviews.filter((r) => r.moderation_status === "flagged").length;
  const pendingCount = reviews.filter((r) => r.moderation_status === "pending").length;

  const filteredReviews = reviews.filter((review) => {
    const matchesQuery =
      `${review.body} ${review.vendors?.name ?? ""} ${review.profiles?.full_name ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    const matchesFilter =
      filter === "All" || review.moderation_status.toLowerCase() === filter.toLowerCase();
    return matchesQuery && matchesFilter;
  });

  const handleDecision = async (reviewId: string, status: "published" | "hidden" | "pending") => {
    const result = await adminApi.moderateReview(reviewId, status);
    if (!result.ok) {
      toast.error(result.error || "Failed to moderate review.");
      return;
    }
    toast.success(`Review ${status}.`);
  };

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform admin"
        title="Reviews"
        subtitle="Monitor customer feedback and maintain trust across Peniel."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Star className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading reviews…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform admin"
        title="Reviews"
        subtitle="Monitor customer feedback and maintain trust across Peniel."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Reviews"
      subtitle="Monitor customer feedback and maintain trust across Peniel."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Reviews total" value={reviews.length.toLocaleString()} tone="primary" />
        <StatCard label="Flagged for review" value={flaggedCount.toLocaleString()} tone="gold" />
        <StatCard
          label="Removed this month"
          value={reviews.filter((r) => r.moderation_status === "hidden").length.toLocaleString()}
        />
        <StatCard label="Platform average" value="4.6" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-4">
          <Panel>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold">Review moderation</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Review customer feedback and take action where necessary.
                  </p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold-foreground`}
                >
                  <AlertCircle className="size-3.5" /> {pendingCount} awaiting review
                </span>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search customer, vendor or review..."
                    className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <SlidersHorizontal className="size-3.5" /> {filteredReviews.length} results
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(["All", "Flagged", "Pending", "Reviewed"] as Filter[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${filter === item ? "bg-primary text-primary-foreground" : "border border-border bg-background text-muted-foreground hover:bg-muted"}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          {filteredReviews.length > 0 ? (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <Panel key={review.id}>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {review.profiles?.full_name ?? "Customer"}
                          </h3>
                          {review.moderation_status === "flagged" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold-foreground">
                              <Flag className="size-3" /> Flagged
                            </span>
                          )}
                          {review.moderation_status !== "pending" && (
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${review.moderation_status === "hidden" ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}
                            >
                              {review.moderation_status === "hidden" ? (
                                <EyeOff className="size-3" />
                              ) : (
                                <Check className="size-3" />
                              )}
                              {review.moderation_status.replace(/\b\w/g, (c) => c.toUpperCase())}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reviewed{" "}
                          <span className="font-medium text-foreground">
                            {review.vendors?.name ?? "—"}
                          </span>{" "}
                          <span className="mx-1.5">·</span>{" "}
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-gold text-gold" />
                        ))}
                        <span className="ml-1 text-xs font-semibold tabular-nums">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3.5">
                      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <MessageSquare className="size-3.5" /> Customer feedback
                      </div>
                      <p className="text-sm leading-6 text-foreground/85">{review.body}</p>
                    </div>
                    <div className="flex flex-col-reverse gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-[11px] text-muted-foreground">
                        {review.moderation_status === "flagged"
                          ? "This review has been flagged for moderation."
                          : "No moderation action has been taken."}
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleDecision(review.id, "published")}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold transition hover:bg-muted sm:flex-none"
                        >
                          <Check className="size-3.5" /> Keep review
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDecision(review.id, "hidden")}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/5 sm:flex-none"
                        >
                          <EyeOff className="size-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>
          ) : (
            <Panel>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-muted">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">No reviews found</h3>
                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  Try another search or change the selected filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </Panel>
          )}
        </div>

        <aside className="space-y-4">
          <Panel>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-success/10 text-success">
                <ShieldCheck className="size-4.5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Trust & safety</h3>
                <p className="text-xs text-muted-foreground">Moderation overview</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pending decisions</span>
                <span className="font-semibold tabular-nums">{pendingCount}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-primary transition-all`}
                  style={{
                    width: `${reviews.length ? ((reviews.length - pendingCount) / reviews.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Flagged reviews</span>
                <span className="font-semibold tabular-nums">{flaggedCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Kept</span>
                <span className="font-semibold text-success tabular-nums">
                  {reviews.filter((r) => r.moderation_status === "published").length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Removed</span>
                <span className="font-semibold text-muted-foreground tabular-nums">
                  {reviews.filter((r) => r.moderation_status === "hidden").length}
                </span>
              </div>
            </div>
          </Panel>
          <Panel>
            <h3 className="text-sm font-semibold">Moderation guidelines</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Keep customer feedback authentic while protecting vendors and shoppers from abusive or
              misleading content.
            </p>
            <div className="mt-3 space-y-3">
              {[
                "Remove spam, threats and abusive content.",
                "Keep honest criticism, even when it is negative.",
                "Do not remove reviews simply because a vendor disagrees.",
                "Review flagged content before taking action.",
              ].map((guideline, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                  <p className="text-xs leading-5 text-muted-foreground">{guideline}</p>
                </div>
              ))}
            </div>
          </Panel>
          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <AlertCircle className="size-3.5 text-muted-foreground" /> Moderation reminder
            </div>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Review content fairly. A low star rating alone is not a reason to remove a customer
              review.
            </p>
          </div>
        </aside>
      </div>
    </DashShell>
  );
}
