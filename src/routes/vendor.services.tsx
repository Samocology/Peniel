import { createFileRoute } from "@tanstack/react-router";
import { Clock, Plus, Users } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/services")({
  head: () => ({
    meta: [
      { title: "Services — Vendra business console" },
      { name: "description", content: "Manage bookable services, durations, staff assignment and availability windows." },
      { property: "og:title", content: "Services — Vendra business console" },
      { property: "og:description", content: "Set up what you offer, how long it takes and who delivers it." },
    ],
  }),
  component: VendorServices,
});

const services = [
  ["Private catering (per guest)", "Catering", 6500, "3 hours", "Abigail + 2 chefs"],
  ["Table reservation", "Dining", 0, "90 mins", "Front of house"],
  ["Cooking class (group)", "Experiences", 25000, "2 hours", "Abigail"],
  ["Event small chops station", "Catering", 180000, "4 hours", "Team of 3"],
] as const;

function VendorServices() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Services"
      subtitle="Bookable experiences customers can reserve on your storefront"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <Plus className="size-4" /> Add service
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel title="All services">
          <DataTable
            head={["Service", "Group", "Price", "Duration", "Delivered by", ""]}
            rows={services.map((s) => [
              <span className="font-medium">{s[0]}</span>,
              <span className="text-muted-foreground">{s[1]}</span>,
              s[2] === 0 ? <span className="text-muted-foreground">Free</span> : naira(s[2]),
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Clock className="size-3.5" /> {s[3]}
              </span>,
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-3.5" /> {s[4]}
              </span>,
              <button className="text-xs font-semibold text-primary">Edit</button>,
            ])}
          />
        </Panel>

        <div className="space-y-6">
          <Panel title="Availability">
            <ul className="space-y-2.5 text-sm">
              {[
                ["Mon – Thu", "10:00 – 21:00"],
                ["Friday", "10:00 – 23:00"],
                ["Saturday", "09:00 – 23:00"],
                ["Sunday", "12:00 – 20:00"],
              ].map(([d, h]) => (
                <li key={d} className="flex justify-between">
                  <span className="text-muted-foreground">{d}</span>
                  <span className="font-medium">{h}</span>
                </li>
              ))}
            </ul>
            <button className="mt-4 w-full rounded-xl border border-border py-2.5 text-xs font-semibold">Edit hours</button>
          </Panel>
          <Panel title="Booking rules">
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>48 hours notice for catering</li>
              <li>Deposit of 50% collected at booking</li>
              <li>Free reschedule up to 24 hours before</li>
              <li>Maximum 3 bookings per slot</li>
            </ul>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
