import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock } from "lucide-react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { app, useApp, useCurrentVendor } from "@/lib/peniel-store";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings - Peniel business console" },
      { name: "description", content: "Review appointment and reservation activity for your business." },
      { property: "og:title", content: "Bookings - Peniel business console" },
      { property: "og:description", content: "Review appointment and reservation activity." },
    ],
  }),
  component: VendorBookings,
});

function VendorBookings() {
  const { vendor } = useCurrentVendor();
  const state = useApp();
  const supported = vendor.fulfilment !== "order";
  const bookings = state.orders.filter((order) => order.vendorSlug === vendor.slug);
  const upcoming = bookings.filter((order) => order.status !== "Delivered" && order.status !== "Cancelled");
  const activity =
    vendor.fulfilment === "reservation"
      ? "reservations"
      : vendor.fulfilment === "booking"
        ? "appointments"
        : "bookings";
  const title =
    vendor.fulfilment === "reservation"
      ? "Reservations"
      : vendor.fulfilment === "booking"
        ? "Appointments"
        : "Bookings";
  const updateStatus = (id: string, status: "Confirmed" | "Cancelled" | "Delivered", message: string) => {
    app.setOrderStatus(id, status);
    toast.success(message);
  };

  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title={title}
      subtitle={supported ? `${title} for ${vendor.name}` : `Booking management is not enabled for ${vendor.categoryLabel.toLowerCase()} businesses.`}
      storeLink={{ label: "View storefront", slug: vendor.slug }}
      actions={
        supported ? (
          <Link to="/vendor/settings" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            Manage availability
          </Link>
        ) : undefined
      }
    >
      {supported ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label={`Open ${activity}`} value={String(upcoming.length)} hint="Awaiting fulfilment or completion" tone="primary" />
            <StatCard label="Services or room types" value={String(vendor.products.length)} hint="Listed on your storefront" />
            <StatCard label="Business hours" value="Set" hint={vendor.hours} tone="gold" />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <Panel title={`${title} queue`}>
              {bookings.length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">No {activity} yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Customer bookings from checkout will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {bookings.map((booking) => (
                    <li key={booking.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                      <div className="min-w-0 flex-1 basis-48">
                        <p className="text-sm font-semibold">
                          {booking.customer} <span className="font-mono text-xs font-normal text-muted-foreground">{booking.id}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.items} · {booking.mode}</p>
                      </div>
                      <span className="font-display text-sm font-bold">{naira(booking.total)}</span>
                      <StatusPill status={booking.status} />
                      <span className="flex gap-2">
                        {booking.status === "New" && (
                          <>
                            <button
                              onClick={() => updateStatus(booking.id, "Confirmed", "Booking confirmed")}
                              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(booking.id, "Cancelled", "Booking declined")}
                              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {booking.status === "Confirmed" && (
                          <button
                            onClick={() => updateStatus(booking.id, "Delivered", "Booking marked complete")}
                            className="rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary"
                          >
                            Mark complete
                          </button>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel title="Availability">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-sm leading-relaxed text-muted-foreground">{vendor.hours}</p>
              </div>
              <Link to="/vendor/settings" className="mt-4 inline-flex text-xs font-semibold text-primary">
                Update business hours →
              </Link>
            </Panel>
          </div>
        </>
      ) : (
        <Panel title="Orders and fulfilment">
          <p className="text-sm text-muted-foreground">
            This business accepts orders rather than appointments or reservations.
          </p>
          <Link to="/vendor/orders" className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            Open orders
          </Link>
        </Panel>
      )}
    </DashShell>
  );
}
