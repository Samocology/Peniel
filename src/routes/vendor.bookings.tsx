import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Vendra business console" },
      { name: "description", content: "Today's schedule, upcoming reservations and staff assignment for every booking." },
      { property: "og:title", content: "Bookings — Vendra business console" },
      { property: "og:description", content: "See your day at a glance and manage every reservation." },
    ],
  }),
  component: VendorBookings,
});

const slots = [
  ["09:00", "Cooking class · 4 guests", "Abigail", "Confirmed"],
  ["12:30", "Table for 6 · Nwosu", "Front of house", "Confirmed"],
  ["15:00", "Catering tasting · Eko Events", "Abigail + Chef Musa", "Preparing"],
  ["18:30", "Table for 2 · Salami", "Front of house", "Confirmed"],
  ["20:00", "Private dinner · 8 guests", "Chef Musa", "New"],
] as const;

const upcoming = [
  ["BKG-4471", "Eko Events Ltd", "Catering · 40 guests", "Sat 24 May, 5:00 PM", 260000, "Confirmed"],
  ["BKG-4468", "Chioma Amadi", "Cooking class · 2", "Sun 25 May, 11:00 AM", 50000, "Confirmed"],
  ["BKG-4462", "Damilola O.", "Table for 4", "Fri 23 May, 8:30 PM", 0, "New"],
] as const;

function VendorBookings() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Bookings"
      subtitle="Friday, 23 May 2025"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's bookings" value="5" hint="1 awaiting confirmation" tone="primary" />
        <StatCard label="This week" value="18" hint="+6 vs last week" />
        <StatCard label="Occupancy" value="72%" hint="Peak 7–9 PM" />
        <StatCard label="Deposits held" value={naira(155000)} hint="Released after service" tone="gold" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Panel title="Today's schedule">
          <ul className="space-y-3">
            {slots.map((s) => (
              <li key={s[0]} className="grid grid-cols-[58px_minmax(0,1fr)] gap-3 rounded-xl border border-border p-3.5">
                <span className="font-display text-sm font-bold text-primary">{s[0]}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{s[1]}</span>
                  <span className="mt-0.5 flex items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">{s[2]}</span>
                    <StatusPill status={s[3]} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Upcoming bookings"
          action={
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" /> Next 14 days
            </span>
          }
        >
          <DataTable
            head={["Ref", "Customer", "Service", "When", "Value", "Status"]}
            rows={upcoming.map((r) => [
              <span className="font-mono text-xs">{r[0]}</span>,
              <span className="font-medium">{r[1]}</span>,
              <span className="text-muted-foreground">{r[2]}</span>,
              <span className="text-muted-foreground">{r[3]}</span>,
              r[4] === 0 ? <span className="text-muted-foreground">—</span> : naira(r[4]),
              <StatusPill status={r[5]} />,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
