import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Customers - Peniel admin" },
      {
        name: "description",
        content:
          "Every shopper on Peniel with order counts, lifetime spend, location and account standing.",
      },
      { property: "og:title", content: "Customers - Peniel admin" },
      { property: "og:description", content: "Understand who is buying on Peniel." },
    ],
  }),
  component: AdminCustomers,
});

const rows = [
  ["Tosin Adeyemi", "tosin@example.com", "Lagos", 34, 986000, "Good standing"],
  ["Chioma Anyanwu", "chioma@example.com", "Abuja", 21, 642000, "Good standing"],
  ["Ngozi Eze", "ngozi@example.com", "Port Harcourt", 18, 511000, "Good standing"],
  ["Musa Bello", "musa@example.com", "Kano", 12, 288000, "Good standing"],
  ["Linda Okoro", "linda@example.com", "Lagos", 9, 214000, "Under review"],
  ["Ade Salami", "ade@example.com", "Ibadan", 4, 78000, "Good standing"],
] as const;

function AdminCustomers() {
  const [query, setQuery] = useState("");
  const visibleRows = rows.filter((row) =>
    row
      .slice(0, 3)
      .some((value) => String(value).toLowerCase().includes(query.trim().toLowerCase())),
  );

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Customers"
      subtitle="128,904 registered shoppers"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total customers" value="128,904" tone="primary" />
        <StatCard label="Active this month" value="41,220" />
        <StatCard label="Repeat rate" value="46%" tone="gold" />
        <StatCard label="Average order" value={naira(24800)} />
      </div>

      <div className="mt-6">
        <Panel
          title="All customers"
          action={
            <span className="flex items-center gap-2 rounded-xl border border-input px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                aria-label="Search customers"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customers"
                className="w-40 bg-transparent text-sm outline-none"
              />
            </span>
          }
        >
          <DataTable
            head={["Customer", "Email", "City", "Orders", "Lifetime spend", "Standing"]}
            rows={visibleRows.map((r) => [
              <span className="font-medium">{r[0]}</span>,
              <span className="text-muted-foreground">{r[1]}</span>,
              <span className="text-muted-foreground">{r[2]}</span>,
              r[3],
              naira(r[4]),
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (r[5] === "Good standing"
                    ? "bg-success/12 text-success"
                    : "bg-gold/15 text-gold-foreground")
                }
              >
                {r[5]}
              </span>,
            ])}
          />
          {visibleRows.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No customers match “{query}”.
            </p>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
