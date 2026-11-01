import { createFileRoute } from "@tanstack/react-router";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { adminNav } from "@/components/dash/vendor-nav";
import { StatCard } from "@/components/site/bits";
import { naira } from "@/lib/data";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({
    meta: [
      { title: "Disputes - Peniel admin" },
      { name: "description", content: "Resolve refund requests and order disputes with funds still held safely by Peniel Pay." },
      { property: "og:title", content: "Disputes - Peniel admin" },
      { property: "og:description", content: "Fair outcomes for customers and vendors." },
    ],
  }),
  component: AdminDisputes,
});

const cases = [
  ["DSP-1042", "Abigail's Kitchen", "Order arrived cold", 26760, "Open", "Today"],
  ["DSP-1039", "Lagos Tech Hub Store", "Wrong charger in the box", 184000, "Awaiting vendor", "Yesterday"],
  ["DSP-1031", "Kemi's Couture", "Dress measurements off", 165000, "Awaiting customer", "3 days ago"],
  ["DSP-1024", "Mama Cee Confectionery", "Cake delivered late", 48000, "Resolved", "1 week ago"],
] as const;

function AdminDisputes() {
  return (
    <DashShell nav={adminNav} kicker="Platform admin" title="Disputes" subtitle="4 cases open right now">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open cases" value="4" tone="primary" />
        <StatCard label="Value held" value={naira(375760)} tone="gold" />
        <StatCard label="Resolved this month" value="38" />
        <StatCard label="Average resolution" value="1.1 days" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Panel title="Case list">
          <DataTable
            head={["Case", "Vendor", "Reason", "Amount", "Status", "Opened", ""]}
            rows={cases.map((c) => [
              <span className="font-mono text-xs">{c[0]}</span>,
              <span className="font-medium">{c[1]}</span>,
              <span className="text-muted-foreground">{c[2]}</span>,
              naira(c[3]),
              <span
                className={
                  "rounded-full px-2.5 py-1 text-xs font-semibold " +
                  (c[4] === "Resolved" ? "bg-success/12 text-success" : "bg-gold/15 text-gold-foreground")
                }
              >
                {c[4]}
              </span>,
              <span className="text-muted-foreground">{c[5]}</span>,
              <button className="text-xs font-semibold text-primary">Open case</button>,
            ])}
          />
        </Panel>

        <Panel title="Resolution options">
          <ul className="space-y-3 text-sm text-muted-foreground">
            {[
              "Refund the customer in full from held funds",
              "Refund part of the order and settle the rest",
              "Release the payment to the vendor",
              "Ask both sides for more evidence",
            ].map((o) => (
              <li key={o} className="rounded-xl border border-border p-3.5">
                {o}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            Because Peniel collects every payment, money can be returned without chasing the vendor.
          </p>
        </Panel>
      </div>
    </DashShell>
  );
}
