import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, MessageSquare, Phone, Send } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatusPill } from "@/components/site/bits";

export const Route = createFileRoute("/vendor/support")({
  head: () => ({
    meta: [
      { title: "Support — Vendra business console" },
      { name: "description", content: "Message the Vendra team, track your tickets and read guides on selling, payouts and verification." },
      { property: "og:title", content: "Support — Vendra business console" },
      { property: "og:description", content: "Real help from real people, in your timezone." },
    ],
  }),
  component: VendorSupport,
});

const tickets = [
  ["TKT-2291", "Payout arrived short by ₦4,000", "22 May 2025", "Preparing"],
  ["TKT-2264", "Customer disputed a delivered order", "18 May 2025", "Delivered"],
  ["TKT-2218", "How do I add a second branch?", "9 May 2025", "Delivered"],
] as const;

function VendorSupport() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Support"
      subtitle="We reply within 2 hours on weekdays, 9am – 7pm WAT"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Panel title="Start a conversation">
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-xs font-semibold tracking-wide text-muted-foreground uppercase">Topic</span>
                <select className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                  <option>Payments & payouts</option>
                  <option>Orders & delivery</option>
                  <option>Verification</option>
                  <option>Storefront & products</option>
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
              <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
                <Send className="size-4" /> Send message
              </button>
            </div>
          </Panel>

          <Panel title="Your tickets">
            <DataTable
              head={["Ref", "Subject", "Opened", "Status"]}
              rows={tickets.map((t) => [
                <span className="font-mono text-xs">{t[0]}</span>,
                <span className="font-medium">{t[1]}</span>,
                <span className="text-muted-foreground">{t[2]}</span>,
                <StatusPill status={t[3]} />,
              ])}
            />
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Reach us">
            <ul className="space-y-3 text-sm">
              {[
                [MessageSquare, "WhatsApp business line", "+234 700 VENDRA"],
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
                "Writing product descriptions that sell",
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
