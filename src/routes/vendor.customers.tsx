import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Vendra business console" },
      { name: "description", content: "See who buys from you, how often they return and what they spend, so you can grow repeat business." },
      { property: "og:title", content: "Customers — Vendra business console" },
      { property: "og:description", content: "Understand and keep your best customers." },
    ],
  }),
  component: VendorCustomers,
});

const customers = [
  ["Tosin Adeyemi", "tosin@example.com", 11, 268400, "2 days ago", "Loyal"],
  ["Ada Nwosu", "ada@example.com", 7, 132900, "Today", "Loyal"],
  ["Eko Events Ltd", "ops@ekoevents.ng", 4, 940000, "1 week ago", "Corporate"],
  ["Bola Salami", "bola@example.com", 2, 24000, "Today", "New"],
  ["Halima Bello", "halima@example.com", 1, 33500, "5 days ago", "New"],
] as const;

function VendorCustomers() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Customers"
      subtitle="128 customers have bought from you"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
          <Download className="size-4" /> Export
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total customers" value="128" hint="14 new this week" tone="primary" />
        <StatCard label="Repeat rate" value="46%" hint="+4 pts this month" />
        <StatCard label="Average order" value={naira(18400)} hint="Across 312 orders" />
        <StatCard label="Different customers served" value="128" hint="Counts toward verification" tone="gold" />
      </div>

      <div className="mt-6">
        <Panel title="Customer list">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-border px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input placeholder="Search by name, email or phone" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </div>
          <DataTable
            head={["Customer", "Contact", "Orders", "Total spent", "Last order", "Segment"]}
            rows={customers.map((c) => [
              <span className="flex min-w-0 items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                  {c[0].slice(0, 2).toUpperCase()}
                </span>
                <span className="truncate font-medium">{c[0]}</span>
              </span>,
              <span className="truncate text-muted-foreground">{c[1]}</span>,
              c[2],
              naira(c[3]),
              <span className="text-muted-foreground">{c[4]}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (c[5] === "Loyal" ? "bg-success/12 text-success" : c[5] === "Corporate" ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground")
                }
              >
                {c[5]}
              </span>,
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
