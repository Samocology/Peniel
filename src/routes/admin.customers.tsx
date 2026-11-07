
import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Users,
  UserCheck,
  Repeat2,
  Wallet,
  MapPin,
  ShoppingBag,
  ArrowUpRight,
  X,
  Building2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
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
      {
        property: "og:description",
        content: "Understand who is buying on Peniel.",
      },
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

function CustomerMetric({
  label,
  value,
  description,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  description: string;
  icon: React.ElementType;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {value}
          </p>
        </div>

        <div
          className={`grid size-9 shrink-0 place-items-center rounded-xl ${
            accent
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AdminCustomers() {
  const [query, setQuery] = useState("");

  const visibleRows = useMemo(
    () =>
      rows.filter((row) =>
        row
          .slice(0, 3)
          .some((value) =>
            String(value).toLowerCase().includes(query.trim().toLowerCase()),
          ),
      ),
    [query],
  );

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Customers"
      subtitle="Understand your shoppers, their activity and purchasing behaviour."
    >
      <div className="space-y-6">
        {/* Customer metrics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Customer overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your marketplace customer base
              </p>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Platform-wide
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <CustomerMetric
              label="Total customers"
              value="128,904"
              description="Registered shopper accounts"
              icon={Users}
              accent
            />
            <CustomerMetric
              label="Active customers"
              value="41,220"
              description="Active within the last month"
              icon={UserCheck}
            />
            <CustomerMetric
              label="Repeat purchase rate"
              value="46%"
              description="Customers who purchase again"
              icon={Repeat2}
            />
            <CustomerMetric
              label="Average order value"
              value={naira(24800)}
              description="Average spend per order"
              icon={Wallet}
            />
          </div>
        </section>

        {/* Customer directory */}
        <Panel title="All customers">
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Search and review registered shoppers.
                </p>
              </div>

              <div className="relative w-full sm:max-w-[280px]">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  aria-label="Search customers"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, email or city..."
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-9 text-xs outline-none transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/10"
                />

                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users size={14} />
                Customer directory
              </div>

              <p className="text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {visibleRows.length}
                </span>{" "}
                customers found
              </p>
            </div>

            {visibleRows.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={[
                    "Customer",
                    "Email address",
                    "Location",
                    "Orders",
                    "Lifetime spend",
                    "Account standing",
                  ]}
                  rows={visibleRows.map((r) => [
                    <div className="flex min-w-[150px] items-center gap-2.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-muted/70 text-[11px] font-bold text-foreground">
                        {getInitials(r[0])}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {r[0]}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          Customer account
                        </p>
                      </div>
                    </div>,

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {r[1]}
                    </span>,

                    <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                      <MapPin size={12} />
                      {r[2]}
                    </span>,

                    <span className="inline-flex items-center gap-1.5 text-xs font-medium tabular-nums">
                      <ShoppingBag
                        size={13}
                        className="text-muted-foreground"
                      />
                      {r[3]}
                    </span>,

                    <span className="whitespace-nowrap text-xs font-semibold">
                      {naira(r[4])}
                    </span>,

                    <span
                      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        r[5] === "Good standing"
                          ? "bg-success/10 text-success"
                          : "bg-gold/15 text-gold-foreground"
                      }`}
                    >
                      <span
                        className={`mr-1.5 size-1.5 rounded-full ${
                          r[5] === "Good standing"
                            ? "bg-success"
                            : "bg-gold"
                        }`}
                      />
                      {r[5]}
                    </span>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Building2 size={20} />
                </div>

                <p className="mt-3 text-sm font-semibold">
                  No customers found
                </p>

                <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                  No customers match your current search. Try another name,
                  email or location.
                </p>

                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Clear search
                  <ArrowUpRight size={13} />
                </button>
              </div>
            )}
          </div>
        </Panel>

        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Users size={13} />
          Peniel customer management
        </div>
      </div>
    </DashShell>
  );
}
