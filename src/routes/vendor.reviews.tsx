import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews - Peniel business console" },
      { name: "description", content: "Review your storefront rating and customer feedback status." },
      { property: "og:title", content: "Reviews - Peniel business console" },
      { property: "og:description", content: "Review customer feedback for your storefront." },
    ],
  }),
  component: VendorReviews,
});

function VendorReviews() {
  const { vendor } = useCurrentVendor();

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Reviews"
      subtitle={`${vendor.rating.toFixed(1)} average rating for ${vendor.name}`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average rating" value={vendor.rating.toFixed(1)} hint="Current storefront rating" tone="primary" icon={<Star className="size-4 fill-gold text-gold" />} />
        <StatCard label="Customer reviews" value={String(vendor.reviews)} hint="Review text is not available in this dashboard yet" />
        <StatCard label="Response rate" value="-" hint="Response data is not connected" tone="gold" />
      </div>

      <div className="mt-6">
        <Panel title="Customer feedback">
          <p className="py-8 text-center text-sm text-muted-foreground">
            Review details and replies will appear here when review data is connected to this business account.
          </p>
        </Panel>
      </div>
    </DashShell>
  );
}
