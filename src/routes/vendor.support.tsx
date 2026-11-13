import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Headset,
  MessageSquare,
  Phone,
  Send,
  Ticket,
} from "lucide-react";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { app, useApp, useCurrentVendor } from "@/lib/peniel-store";
import { toast } from "sonner";

export const Route = createFileRoute("/vendor/support")({
  head: () => ({
    meta: [
      { title: "Support - Peniel business console" },
      {
        name: "description",
        content:
          "Message the Peniel team, track your tickets and read guides on selling, payouts and verification.",
      },
      { property: "og:title", content: "Support - Peniel business console" },
      {
        property: "og:description",
        content: "Real help from real people, in your timezone.",
      },
    ],
  }),
  component: VendorSupport,
});

function VendorSupport() {
  const { vendor } = useCurrentVendor();
  const state = useApp();

  const tickets = (state.supportTickets ?? [])
    .filter((ticket) => ticket.vendorSlug === vendor.slug)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const topics = [
    "Payments & payouts",
    vendor.fulfilment === "order"
      ? "Orders & delivery"
      : vendor.fulfilment === "booking"
        ? "Appointments"
        : "Reservations",
    "Verification",
    "Storefront & catalog",
    "Something else",
  ];

  const guides = [
    {
      title: "How payouts and platform fees work",
      description: "Understand payments and your earnings.",
    },
    {
      title: "Getting verified",
      description: "Learn about the 5-customer requirement.",
    },
    {
      title: `Writing ${
        vendor.type === "beauty" ? "service" : vendor.type === "hotel" ? "room" : "product"
      } descriptions that sell`,
      description: "Make your storefront more compelling.",
    },
    {
      title: "Handling refunds and disputes",
      description: "Understand how to handle customer issues.",
    },
    {
      title: "Sharing your store",
      description: "Promote your business on social platforms.",
    },
  ];

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Support"
      subtitle="Get help with your business, payments and storefront."
      storeLink={{ label: "View storefront", slug: vendor.slug }}
    >
      <div className="space-y-6">
        {/* Support overview */}
        <section className="relative overflow-hidden rounded-2xl border border-border bg-card">
          <div className="pointer-events-none absolute -right-12 -top-20 size-64 rounded-full bg-primary/[0.06] blur-3xl" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Headset className="size-5" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold">We're here to help.</p>
                <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
                  Whether you're having trouble with an order, a payout or your storefront, send us
                  a message and we'll help you work through it.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-background text-primary">
                <Clock3 className="size-4" />
              </div>
              <div>
                <p className="text-xs font-semibold">Response time</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Within 2 hours on weekdays</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">9am – 7pm WAT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
            {/* New support request */}
            <Panel title="Start a conversation">
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();

                  const form = new FormData(event.currentTarget);
                  const topic = String(form.get("topic") ?? "");
                  const message = String(form.get("message") ?? "");

                  const created = app.submitSupportTicket(topic, message);

                  if (!created) {
                    toast.error("Choose a topic and add a message before submitting.");
                    return;
                  }

                  event.currentTarget.reset();
                  toast.success("Support request sent. It is now in your ticket list.");
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="support-topic"
                      className="mb-2 block text-xs font-semibold text-foreground"
                    >
                      What do you need help with?
                    </label>

                    <select
                      id="support-topic"
                      name="topic"
                      required
                      defaultValue={topics[0]}
                      className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      {topics.map((topic) => (
                        <option key={topic} value={topic}>
                          {topic}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-3">
                      <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      <p className="text-xs leading-5 text-muted-foreground">
                        Your request will be attached to{" "}
                        <span className="font-medium text-foreground">{vendor.name}</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="support-message"
                    className="mb-2 block text-xs font-semibold text-foreground"
                  >
                    Your message
                  </label>

                  <textarea
                    id="support-message"
                    name="message"
                    rows={6}
                    required
                    minLength={5}
                    placeholder="Tell us what happened. Include an order reference or any useful details if you have them."
                    className="w-full resize-y rounded-xl border border-input bg-background px-3.5 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />

                  <p className="mt-2 text-[11px] text-muted-foreground">
                    Please avoid including passwords or sensitive account credentials.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">
                    We typically respond during our support hours.
                  </p>

                  <button
                    type="submit"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.98]"
                  >
                    <Send className="size-4" />
                    Submit request
                  </button>
                </div>

                <p className="text-[11px] leading-5 text-muted-foreground">
                  Support requests are currently saved in this browser prototype and visible only in
                  this business console.
                </p>
              </form>
            </Panel>

            {/* Ticket history */}
            <Panel title="Your support tickets">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Your recent conversations with the support team.
                </p>
                <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
                </span>
              </div>

              {tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-5 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Ticket className="size-5" />
                  </div>

                  <p className="mt-4 text-sm font-semibold">No support requests yet</p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    When you submit a support request, you'll be able to find it here.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {tickets.map((ticket) => (
                    <li
                      key={ticket.id}
                      className="rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted/20 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold">{ticket.topic}</p>

                          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                            <span>{ticket.id}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {new Date(ticket.createdAt).toLocaleDateString("en-NG", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </div>

                        <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                          <span className="size-1.5 rounded-full bg-current" />
                          {ticket.status}
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words border-t border-border pt-3 text-sm leading-6 text-muted-foreground">
                        {ticket.message}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-5">
            {/* Contact */}
            <Panel title="Reach our team">
              <div className="space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MessageSquare className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold">WhatsApp business line</p>
                    <p className="mt-1 text-sm text-muted-foreground">+234 700 PENIEL</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Phone className="size-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold">Call us</p>
                    <p className="mt-1 text-sm text-muted-foreground">+234 1 888 0000</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-[11px] leading-5 text-muted-foreground">
                For detailed issues, submitting a support ticket helps keep your request organised.
              </p>
            </Panel>

            {/* Guides */}
            <Panel title="Helpful guides">
              <div className="space-y-1">
                {guides.map((guide, index) => (
                  <div key={guide.title} className="flex items-start gap-3 rounded-xl px-2 py-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <BookOpen className="size-4" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-5">{guide.title}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Support note */}
            <div className="rounded-2xl border border-primary/15 bg-primary/[0.04] p-4">
              <div className="flex items-center gap-2">
                <Headset className="size-4 text-primary" />
                <p className="text-xs font-semibold">Need urgent assistance?</p>
              </div>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Include relevant order references and a clear description of the issue so the team
                can understand your request.
              </p>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <Clock3 className="size-3.5" />
                Weekdays, 9am – 7pm WAT
              </div>
            </div>
          </aside>
        </div>
      </div>
    </DashShell>
  );
}
