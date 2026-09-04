import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Vendra business console" },
      { name: "description", content: "Accept, prepare and dispatch every order with live status, delivery details and customer notes." },
      { property: "og:title", content: "Orders — Vendra business console" },
      { property: "og:description", content: "Every order from new to delivered in one queue." },
    ],
  }),
  component: VendorOrders,
});

const rows = [
  ["#ORD-7F4X2", "Tosin Adeyemi", "2 items", "Delivery · VI", 26760, "New"],
  ["#ORD-7F4X1", "Ada Nwosu", "1 item", "Pickup", 12400, "Preparing"],
  ["#ORD-7F4W9", "Bola Salami", "2 items", "Delivery · Lekki", 16000, "Out for delivery"],
  ["#ORD-7F4W8", "Kelechi Obi", "4 items", "Delivery · Yaba", 41200, "Preparing"],
  ["#ORD-7F4W7", "Chidi Okeke", "1 item", "Pickup", 22000, "Delivered"],
  ["#ORD-7F4W5", "Halima Bello", "3 items", "Delivery · Ikoyi", 33500, "Delivered"],
  ["#ORD-7F4W2", "Uche Eze", "1 item", "Delivery · Surulere", 9800, "Cancelled"],
] as const;

function VendorOrders() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Orders"
      subtitle="6 open orders · average prep time 22 minutes"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
          <Printer className="size-4" /> Print queue
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New" value="2" hint="Awaiting your confirmation" tone="gold" />
        <StatCard label="Preparing" value="3" hint="In the kitchen" />
        <StatCard label="With riders" value="1" hint="ETA 11:35 AM" />
        <StatCard label="Completed today" value="14" hint={naira(186500)} tone="primary" />
      </div>

      <div className="mt-6">
        <Panel title="Order queue">
          <div className="mb-4 flex flex-wrap gap-2 text-sm">
            {["All", "New", "Preparing", "Out for delivery", "Delivered", "Cancelled"].map((f, i) => (
              <span
                key={f}
                className={
                  "rounded-full border px-3.5 py-1.5 " +
                  (i === 0 ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted-foreground")
                }
              >
                {f}
              </span>
            ))}
          </div>
          <DataTable
            head={["Order", "Customer", "Items", "Fulfilment", "Total", "Status", ""]}
            rows={rows.map((r) => [
              <span className="font-mono text-xs">{r[0]}</span>,
              <span className="font-medium">{r[1]}</span>,
              <span className="text-muted-foreground">{r[2]}</span>,
              <span className="text-muted-foreground">{r[3]}</span>,
              naira(r[4]),
              <StatusPill status={r[5]} />,
              r[5] === "New" ? (
                <span className="flex gap-2">
                  <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Accept</button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Decline</button>
                </span>
              ) : (
                <button className="text-xs font-semibold text-primary">View</button>
              ),
            ])}
          />
        </Panel>
      </div>
    </DashShell>
  );
}
