import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PackagePlus } from "lucide-react";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";

export const Route = createFileRoute("/vendor/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Vendra business console" },
      { name: "description", content: "Track stock levels, set low-stock alerts and restock before you run out mid-service." },
      { property: "og:title", content: "Inventory — Vendra business console" },
      { property: "og:description", content: "Never sell what you don't have." },
    ],
  }),
  component: VendorInventory,
});

const stock = [
  ["Goat meat", "kg", 3, 10, "Low"],
  ["Chin chin packs", "pack", 6, 25, "Low"],
  ["Rice (long grain)", "bag", 12, 8, "Healthy"],
  ["Palm oil", "litre", 30, 10, "Healthy"],
  ["Chicken (whole)", "unit", 0, 12, "Out of stock"],
  ["Pounded yam flour", "kg", 18, 10, "Healthy"],
] as const;

function VendorInventory() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Inventory"
      subtitle="6 tracked items · 2 need restocking"
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
          <PackagePlus className="size-4" /> Restock
        </button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Healthy stock" value="3 items" tone="primary" />
        <StatCard label="Low stock" value="2 items" hint="Reorder today" tone="gold" />
        <StatCard label="Out of stock" value="1 item" hint="Hidden from storefront" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Stock levels">
          <DataTable
            head={["Item", "Unit", "On hand", "Reorder at", "Status", ""]}
            rows={stock.map((s) => [
              <span className="font-medium">{s[0]}</span>,
              <span className="text-muted-foreground">{s[1]}</span>,
              <span className="font-semibold">{s[2]}</span>,
              <span className="text-muted-foreground">{s[3]}</span>,
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (s[4] === "Healthy"
                    ? "bg-success/12 text-success"
                    : s[4] === "Low"
                      ? "bg-gold/20 text-gold-foreground"
                      : "bg-destructive/10 text-destructive")
                }
              >
                {s[4]}
              </span>,
              <button className="text-xs font-semibold text-primary">Adjust</button>,
            ])}
          />
        </Panel>

        <Panel title="Alerts">
          <ul className="space-y-3 text-sm">
            {[
              ["Chicken (whole) sold out", "3 menu items hidden automatically"],
              ["Goat meat below reorder point", "Enough for about 4 more orders"],
              ["Chin chin packs low", "Popular add-on — restock before weekend"],
            ].map(([t, h]) => (
              <li key={t} className="flex gap-3 rounded-xl border border-border p-3.5">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" />
                <span className="min-w-0">
                  <span className="block font-medium">{t}</span>
                  <span className="block text-xs text-muted-foreground">{h}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashShell>
  );
}
