import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageSquare, Star } from "lucide-react";
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
      { property: "og:description", content: "Review customer feedback for your storefront." },
    ],
  }),
  component: VendorReviews,
});

function VendorReviews() {
  const { vendor } = useCurrentVendor();
  const recentReviews = reviews.filter((review) => review.vendor === vendor.name);

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Reviews"
      subtitle={`${vendor.rating.toFixed(1)} average rating for ${vendor.name}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Average rating"
          value={vendor.rating.toFixed(1)}
          hint="Current storefront rating"
          tone="primary"
          icon={<Star className="size-4 fill-gold text-gold" />}
        />
        <StatCard
          label="Customer reviews"
          value={String(vendor.reviews)}
          hint="Reviews received on this storefront"
        />
        <StatCard
          label="Response rate"
          value="Not tracked"
          hint="Reply metrics are not available in this demo"
          tone="gold"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Recent customer feedback">
          {recentReviews.length ? (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <article
                  key={`${review.name}-${review.when}`}
                  className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{review.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{review.when}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-bold text-gold-foreground">
                      <Star className="size-3 fill-current" /> {review.stars}.0
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.text}</p>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <span className="text-[11px] text-muted-foreground">
                      Keep the conversation on Peniel
                    </span>
                    <Link
                      to="/vendor/messages"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      <MessageSquare className="size-3.5" /> Open chats{" "}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Star className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-semibold">Your next review starts with a great experience</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                No review text is included for this sample storefront yet. Your overall rating and
                review count come from the storefront profile.
              </p>
            </div>
          )}
        </Panel>
        <Panel title="Build a trusted reputation">
          <div className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <Star className="size-4" />
              </span>
              <p className="leading-6 text-muted-foreground">
                Deliver consistent quality and ask customers to leave honest feedback after their
                order or booking.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <MessageSquare className="size-4" />
              </span>
              <p className="leading-6 text-muted-foreground">
                Use in-app chats to resolve questions promptly. Customer contact details remain
                private.
              </p>
            </div>
          </div>
          <Link
            to="/vendor/messages"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:border-primary/40"
          >
            Go to chats <ArrowRight className="size-4" />
          </Link>
        </Panel>
      </div>
    </DashShell>
  );
}
