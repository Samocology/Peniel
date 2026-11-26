import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, Users, UserCheck, MapPin, ArrowUpRight, X, Building2, Phone, Calendar } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { adminApi, type AdminCustomer } from "@/lib/api-client";
import { useAdminCustomers } from "@/lib/admin-hooks";
import { toast } from "sonner";

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
  const [selected, setSelected] = useState<AdminCustomer | null>(null);
  const { data: customers = [], loading, error } = useAdminCustomers();

  const visibleCustomers = useMemo(() => {
    const search = query.trim().toLowerCase();

    return (customers ?? []).filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(search) ||
        (customer.phone ?? "").toLowerCase().includes(search),
    );
  }, [query, customers]);

  if (loading) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Customers"
        subtitle="Understand your shoppers, their activity and purchasing behaviour."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <Users className="size-5" />
            </div>
            <p className="text-sm font-semibold">Loading customers…</p>
          </div>
        </div>
      </DashShell>
    );
  }

  if (error) {
    return (
      <DashShell
        nav={adminNav}
        kicker="Platform administration"
        title="Customers"
        subtitle="Understand your shoppers, their activity and purchasing behaviour."
      >
        <div className="rounded-xl border border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Reload
          </button>
        </div>
      </DashShell>
    );
  }

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform administration"
      title="Customers"
      subtitle="Understand your shoppers, their activity and purchasing behaviour."
    >
      <div className="space-y-6">
        {/* Overview */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Customer overview</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Your marketplace customer base</p>
            </div>
            <span className="text-[11px] text-muted-foreground">Platform-wide</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Total customers</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {customers.length.toLocaleString()}
                  </p>
                </div>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Users size={17} />
                </div>
              </div>
              <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                Registered shopper accounts
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Active customers</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {(customers ?? []).filter((c) => c.role === "customer").length.toLocaleString()}
                  </p>
                </div>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-success/10 text-success">
                  <UserCheck size={17} />
                </div>
              </div>
              <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                Regular shopper role
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Suspended accounts</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {(customers ?? []).filter((c) => c.suspended_at).length.toLocaleString()}
                  </p>
                </div>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-destructive/10 text-destructive">
                  <X size={17} />
                </div>
              </div>
              <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                Restricted shopper accounts
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">New this month</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {(customers ?? []).filter((c) => {
                      const created = new Date(c.created_at).getTime();
                      return Date.now() - created < 30 * 24 * 60 * 60 * 1000;
                    }).length.toLocaleString()}
                  </p>
                </div>
                <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <ArrowUpRight size={17} />
                </div>
              </div>
              <p className="mt-4 border-t border-border/70 pt-3 text-[11px] text-muted-foreground">
                Joined within 30 days
              </p>
            </div>
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
                  placeholder="Search name or phone..."
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
                <span className="font-semibold text-foreground">{visibleCustomers.length}</span>{" "}
                customers found
              </p>
            </div>

            {visibleCustomers.length > 0 ? (
              <div className="max-w-full overflow-x-auto">
                <DataTable
                  head={["Customer", "Phone", "Role", "Status", "Joined", ""]}
                  rows={(visibleCustomers ?? []).map((customer) => [
                    <div className="flex min-w-[150px] items-center gap-2.5">
                      <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-muted/70 text-[11px] font-bold text-foreground">
                        {getInitials(customer.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {customer.full_name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">Customer account</p>
                      </div>
                    </div>,

                    <span className="whitespace-nowrap text-xs text-muted-foreground">
                      {customer.phone ?? "No phone added"}
                    </span>,

                    <span className="whitespace-nowrap text-xs font-semibold">
                      {customer.role.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>,

                    <span
                      className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        customer.suspended_at
                          ? "bg-destructive/10 text-destructive"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {customer.suspended_at ? <X size={11} /> : <UserCheck size={11} />}
                      {customer.suspended_at ? "Suspended" : "Active"}
                    </span>,

                    <span className="whitespace-nowrap text-xs font-semibold">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </span>,

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelected(customer)}
                        className="text-xs font-semibold text-primary transition hover:underline"
                      >
                        View details
                        <ArrowUpRight size={12} />
                      </button>
                    </div>,
                  ])}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="grid size-11 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Building2 size={20} />
                </div>

                <p className="mt-3 text-sm font-semibold">No customers found</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  No customers match your current search.
                </p>

                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-4 text-xs font-semibold text-primary hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </Panel>

        {selected && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            >
              <div
                className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-6 py-6">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <X size={16} />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="grid size-14 place-items-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-lg">
                      {getInitials(selected.full_name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold tracking-tight">
                        {selected.full_name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{selected.role}</p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          selected.suspended_at
                            ? "bg-destructive/10 text-destructive"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {selected.suspended_at ? "Suspended" : "Active"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                  <dl className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                      <dt className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} />
                        Phone
                      </dt>
                      <dd className="font-medium">{selected.phone ?? "—"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                      <dt className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={14} />
                        Joined
                      </dt>
                      <dd className="font-medium">
                        {new Date(selected.created_at).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
                      <dt className="flex items-center gap-2 text-muted-foreground">
                        <Users size={14} />
                        Account ID
                      </dt>
                      <dd className="truncate font-mono text-xs font-medium">
                        {selected.id.slice(0, 12)}…
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Footer */}
                <div className="border-t border-border/60 bg-muted/20 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        <div className="flex items-center justify-center gap-2 pb-2 text-[10px] text-muted-foreground">
          <Users size={13} />
          Peniel customer management
        </div>
      </div>
    </DashShell>
  );
}
