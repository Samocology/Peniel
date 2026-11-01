import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, MessageSquare, Phone } from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { useCurrentVendor } from "@/lib/peniel-store";

export const Route = createFileRoute("/vendor/support")({
  head: () => ({
    meta: [
      { title: "Support - Peniel business console" },
      { name: "description", content: "Message the Peniel team, track your tickets and read guides on selling, payouts and verification." },
      { property: "og:title", content: "Support - Peniel business console" },
      { property: "og:description", content: "Real help from real people, in your timezone." },
    ],
  }),
  component: VendorSupport,
});

function VendorSupport() {
  const { vendor } = useCurrentVendor();
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Support"
      subtitle="We reply within 2 hours on weekdays, 9am - 7pm WAT"
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel title="Start a conversation">
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">Topic</span>
                <select className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                  <option>Payments & payouts</option>
                  <option>{vendor.fulfilment === "order" ? "Orders & delivery" : vendor.fulfilment === "booking" ? "Appointments" : "Reservations"}</option>
                  <option>Verification</option>
                  <option>Storefront & catalog</option>
                  <option>Something else</option>
                </select>
              </div>
              <div>
                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">Message</span>
                <textarea
                  rows={5}
                  placeholder="Tell us what happened, and include an order reference if you have one."
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <p className="text-xs text-muted-foreground">Support ticket submission is not connected in this demo.</p>
            </div>
          </Panel>

          <Panel title="Your tickets">
            <p className="py-8 text-center text-sm text-muted-foreground">No support tickets are connected to this account yet.</p>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Reach us">
            <ul className="space-y-3 text-sm">
              {[
                [MessageSquare, "WhatsApp business line", "+234 700 PENIEL"],
                [Phone, "Call us", "+234 1 888 0000"],
              ].map(([Icon, t, v]) => {
                const I = Icon as typeof Phone;
                return (
                  <li key={t as string} className="flex gap-3">
                    <I className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block font-medium">{t as string}</span>
                      <span className="block text-xs text-muted-foreground">{v as string}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Guides">
            <ul className="space-y-3 text-sm">
              {[
                "How payouts and platform fees work",
                "Getting verified: the 5-customer rule",
                `Writing ${vendor.type === "beauty" ? "service" : vendor.type === "hotel" ? "room" : "product"} descriptions that sell`,
                "Handling refunds and disputes",
                "Sharing your store on WhatsApp & Instagram",
              ].map((g) => (
                <li key={g} className="flex gap-2.5">
                  <BookOpen className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">{g}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
