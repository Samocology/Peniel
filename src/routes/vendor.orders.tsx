import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DashShell, Panel } from "@/components/dash/shell";
import { app, useApp, type OrderStatus } from "@/lib/vendra-store";
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

const filters = ["All", "New", "Preparing", "Out for delivery", "Delivered", "Cancelled"] as const;
const next: Partial<Record<OrderStatus, OrderStatus>> = { Preparing: "Out for delivery", "Out for delivery": "Delivered" };

function VendorOrders() {
  const s = useApp();
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const count = (st: OrderStatus) => s.orders.filter((o) => o.status === st).length;
  const rows = s.orders.filter((o) => f === "All" || o.status === f);
  const set = (id: string, st: OrderStatus, msg: string) => {
    app.setOrderStatus(id, st);
    toast.success(msg);
  };
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Orders"
      subtitle={`${count("New") + count("Preparing") + count("Out for delivery")} open orders`}
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
          <Printer className="size-4" /> Print queue
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="New" value={String(count("New"))} hint="Awaiting your confirmation" tone="gold" />
        <StatCard label="Preparing" value={String(count("Preparing"))} hint="In progress" />
        <StatCard label="With riders" value={String(count("Out for delivery"))} hint="On the way" />
        <StatCard label="Completed" value={String(count("Delivered"))} hint="Delivered" tone="primary" />
      </div>

      <div className="mt-6">
        <Panel title="Order queue">
          <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 text-sm hide-scrollbar">
            {filters.map((x) => (
              <button
                key={x}
                onClick={() => setF(x)}
                className={"shrink-0 rounded-full border px-3.5 py-1.5 " + (x === f ? "border-primary bg-primary-soft font-semibold text-primary" : "border-border text-muted-foreground")}
              >
                {x}
              </button>
            ))}
          </div>
          {rows.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No {f.toLowerCase()} orders.</p>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                  <div className="min-w-0 flex-1 basis-48">
                    <p className="text-sm font-semibold">{o.customer} <span className="font-mono text-xs font-normal text-muted-foreground">{o.id}</span></p>
                    <p className="text-xs text-muted-foreground">{o.items} · {o.mode}</p>
                  </div>
                  <span className="font-display text-sm font-bold">{naira(o.total)}</span>
                  <StatusPill status={o.status} />
                  <span className="flex gap-2">
                    {o.status === "New" && (
                      <>
                        <button onClick={() => set(o.id, "Preparing", "Order accepted")} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">Accept</button>
                        <button onClick={() => set(o.id, "Cancelled", "Order declined — customer refunded")} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold">Decline</button>
                      </>
                    )}
                    {next[o.status] && (
                      <button onClick={() => set(o.id, next[o.status]!, `Marked ${next[o.status]!.toLowerCase()}`)} className="rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary">
                        Mark {next[o.status]!.toLowerCase()}
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </DashShell>
  );
}
