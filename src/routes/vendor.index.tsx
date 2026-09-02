import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  ChefHat,
  ShoppingBag,
  Star,
  Wallet,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DashShell, DataTable, Panel } from "@/components/dash/shell";
import { vendorNav } from "@/components/dash/vendor-nav";
import { StatCard, StatusPill } from "@/components/site/bits";
import { naira, reviews, salesSeries } from "@/lib/data";

export const Route = createFileRoute("/vendor/")({
  head: () => ({
    meta: [
      { title: "Vendor dashboard — Vendra business console" },
      { name: "description", content: "Today's sales, pending orders, upcoming bookings, payouts and verification progress for your business." },
      { property: "og:title", content: "Vendor dashboard — Vendra" },
      { property: "og:description", content: "Run your whole business from one command center." },
    ],
  }),
  component: VendorOverview,
});

const incoming = [
  ["#ORD-7F4X2", "Tosin Adeyemi", "Jollof rice (party size) +1", 26760, "Preparing"],
  ["#ORD-7F4X1", "Ada Nwosu", "Native soup, pounded yam", 12400, "New"],
  ["#ORD-7F4W9", "Bola Salami", "Suya platter ×2", 16000, "Out for delivery"],
  ["#ORD-7F4W7", "Chidi Okeke", "Small chops tray", 22000, "Delivered"],
] as const;

function VendorOverview() {
  return (
    <DashShell
      nav={vendorNav}
      kicker="Business console"
      title="Good morning, Abigail"
      subtitle="Here's how Abigail's Kitchen is performing today."
      storeLink={{ label: "View storefront", slug: "abigails-kitchen" }}
      actions={
        <>
          <Link to="/vendor/products/new" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Add product
          </Link>
          <Link to="/vendor/promotions" className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold">
            New promotion
          </Link>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's sales" value={naira(186500)} hint="+18% vs yesterday" tone="primary" icon={<ArrowUpRight className="size-4 text-success" />} />
        <StatCard label="Pending orders" value="6" hint="2 awaiting confirmation" icon={<ShoppingBag className="size-4 text-muted-foreground" />} />
        <StatCard label="Available payout" value={naira(742300)} hint="Next payout Friday" tone="gold" icon={<Wallet className="size-4 text-gold" />} />
        <StatCard label="Customers served" value="128" hint="14 new this week" icon={<Star className="size-4 text-muted-foreground" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel
            title="Sales this week"
            action={<span className="text-xs text-muted-foreground">Total {naira(1216000)}</span>}
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesSeries}>
                  <defs>
                    <linearGradient id="vsales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-muted-foreground)" />
                  <Tooltip formatter={(v) => naira(Number(v))} />
                  <Area type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2} fill="url(#vsales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel
            title="Incoming orders"
            action={
              <Link to="/vendor/orders" className="text-xs font-semibold text-primary">
                View all
              </Link>
            }
          >
            <DataTable
              head={["Order", "Customer", "Items", "Total", "Status"]}
              rows={incoming.map((r) => [
                <span className="font-mono text-xs">{r[0]}</span>,
                <span className="font-medium">{r[1]}</span>,
                <span className="text-muted-foreground">{r[2]}</span>,
                naira(r[3]),
                <StatusPill status={r[4]} />,
              ])}
            />
          </Panel>

          <Panel title="Kitchen status">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["In the kitchen", "3 orders", "avg 22 min"],
                ["Ready for pickup", "1 order", "waiting 4 min"],
                ["With riders", "2 orders", "ETA 11:35 AM"],
              ].map(([t, v, h]) => (
                <div key={t} className="rounded-xl border border-border p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    <ChefHat className="size-3.5 text-primary" /> {t}
                  </p>
                  <p className="mt-2 font-display text-xl font-bold">{v}</p>
                  <p className="text-xs text-muted-foreground">{h}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Verification progress">
            <p className="text-sm text-muted-foreground">3 of 5 different customers successfully served.</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-3/5 rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm">
              <span className="font-semibold">2 more customers</span> needed before you can apply.
            </p>
            <Link
              to="/vendor/verification"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold"
            >
              <BadgeCheck className="size-4 text-primary" /> See requirements
            </Link>
          </Panel>

          <Panel title="Upcoming bookings">
            <ul className="space-y-3 text-sm">
              {[
                ["Private catering · 40 guests", "Sat 24 May, 5:00 PM"],
                ["Table for 6", "Fri 23 May, 8:30 PM"],
              ].map(([t, w]) => (
                <li key={t} className="flex gap-3">
                  <CalendarClock className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="block font-medium">{t}</span>
                    <span className="block text-xs text-muted-foreground">{w}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Low stock">
            <ul className="space-y-3 text-sm">
              {[
                ["Goat meat (kg)", "3 left"],
                ["Chin chin packs", "6 left"],
              ].map(([t, v]) => (
                <li key={t} className="flex items-center justify-between gap-3">
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <AlertTriangle className="size-4 shrink-0 text-gold" />
                    <span className="truncate">{t}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-gold-foreground">{v}</span>
                </li>
              ))}
            </ul>
            <Link to="/vendor/inventory" className="mt-4 inline-block text-xs font-semibold text-primary">
              Manage inventory →
            </Link>
          </Panel>

          <Panel title="Recent reviews">
            <ul className="space-y-4">
              {reviews.slice(0, 2).map((r) => (
                <li key={r.name}>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: r.stars }).map((_, i) => (
                      <Star key={i} className="size-3 fill-gold text-gold" />
                    ))}
                    <span className="ml-1 text-xs font-semibold">{r.name}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </DashShell>
  );
}
