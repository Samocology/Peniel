import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira, orders } from "@/lib/data";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Orders & bookings - Peniel admin" },
      {
        name: "description",
        content:
          "Track every order and booking placed on Peniel, including fulfilment status and payment state.",
      },
      { property: "og:title", content: "Orders & bookings - Peniel admin" },
      { property: "og:description", content: "Platform-wide order monitoring." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const all = [...orders, ...orders];
  const [filter, setFilter] = useState("All");
  const visibleOrders = all.filter((order) => {
    if (filter === "Orders") return order.kind === "order";
    if (filter === "Bookings") return order.kind !== "order";
    if (filter === "Cancelled") return order.status === "Cancelled";
    return filter === "All" || order.status === filter;
  });

  return (
    <DashShell
      nav={adminNav}
      kicker="Platform admin"
      title="Orders & bookings"
      subtitle="9,431 placed today"
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Orders today" value="9,431" tone="primary" />
        <StatCard label="Bookings today" value="1,286" />
        <StatCard label="Fulfilled on time" value="94%" tone="gold" />
        <StatCard label="Cancelled" value="1.2%" />
      </div>

      <div className="mt-6">
        <Panel title="Recent activity">
          <div className="mb-4 flex flex-wrap gap-2">
            {["All", "Orders", "Bookings", "Preparing", "Delivered", "Cancelled"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold " +
                  (filter === f
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground")
                }
              >
                {f}
              </button>
            ))}
          </div>
          <DataTable
            head={["Reference", "Vendor", "Type", "Placed", "Status", "Total", "Payment"]}
            rows={visibleOrders.map((o, i) => [
              <span className="font-mono text-xs">{o.id}</span>,
              <span className="font-medium">{o.vendor}</span>,
              <span className="capitalize text-muted-foreground">{o.kind}</span>,
              <span className="text-muted-foreground">{o.placed}</span>,
              <StatusPill status={o.status} />,
              naira(o.total),
              <span className="rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
                {i % 4 === 0 ? "Held in escrow" : "Settled"}
              </span>,
            ])}
          />
          {visibleOrders.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No activity matches this filter.
            </p>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
