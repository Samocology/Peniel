import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarCheck, CalendarPlus, Clock, MapPin, MessageCircle, ShieldCheck, User, XCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { StatusPill } from "@/components/site/bits";
import { getVendor, naira, orders } from "@/lib/data";

export const Route = createFileRoute("/bookings/$id")({
  loader: ({ params }) => {
    const booking = orders.find((o) => o.id === params.id && o.kind === "booking");
    if (!booking) throw notFound();
    return { booking, vendor: getVendor(booking.vendorSlug) ?? null };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Booking unavailable — Vendra" }, { name: "robots", content: "noindex" }] };
    }
    const b = loaderData.booking;
    return {
      meta: [
        { title: `Booking ${b.id} — ${b.vendor} on Vendra` },
        { name: "description", content: `Your ${b.vendor} appointment is ${b.status.toLowerCase()}. View time, specialist and location.` },
        { property: "og:title", content: `Booking confirmed — ${b.vendor}` },
        { property: "og:description", content: `Appointment details and reminders for your ${b.vendor} booking.` },
      ],
    };
  },
  component: BookingPage,
});

function BookingPage() {
  const { booking, vendor } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/12">
              <CalendarCheck className="size-7 text-success" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Booking confirmed</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {vendor?.name ?? booking.vendor} is expecting you. We'll remind you 2 hours before.
            </p>
            <div className="mt-3 flex justify-center">
              <StatusPill status={booking.status} />
            </div>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              [CalendarCheck, "Date", "Saturday, 24 May 2025"],
              [Clock, "Time", "2:00 PM · 90 minutes"],
              [User, "Specialist", "Esther B."],
              [MapPin, "Location", vendor?.location ?? "Lekki Phase 1, Lagos"],
            ].map(([Icon, l, v]) => {
              const I = Icon as typeof Clock;
              return (
                <div key={l as string} className="rounded-2xl border border-border p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                    <I className="size-3.5 text-primary" /> {l as string}
                  </p>
                  <p className="mt-1.5 font-semibold">{v as string}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service</span>
              <span className="font-medium">{booking.items}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{booking.id}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3">
              <span className="font-semibold">Paid</span>
              <span className="font-display font-bold text-primary">{naira(booking.total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
              <CalendarPlus className="size-4" /> Add to calendar
            </button>
            <Link
              to="/messages"
              search={{ v: vendor?.slug ?? "glamour-beauty-lounge" }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold"
            >
              <MessageCircle className="size-4" /> Chat with business
            </Link>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-success" /> Free reschedule up to 12 hours before
            </span>
            <button className="inline-flex items-center gap-1.5 text-destructive">
              <XCircle className="size-3.5" /> Cancel booking
            </button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link to="/orders" className="font-semibold text-primary">
            ← All bookings
          </Link>
          {vendor && (
            <Link to="/store/$slug" params={{ slug: vendor.slug }} className="font-semibold text-primary">
              Visit {vendor.name}
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
