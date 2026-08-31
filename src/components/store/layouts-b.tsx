import { Link } from "@tanstack/react-router";
import {
  BedDouble,
  CalendarDays,
  Cake,
  Check,
  Coffee,
  Heart,
  Plus,
  ShieldCheck,
  Truck,
  Wifi,
} from "lucide-react";
import { naira, type Vendor } from "@/lib/data";
import { GroupTabs, ItemArt, ItemLink, Price, StoreBadges } from "./store-kit";
import { StoreSidebar } from "./layouts-a";

/* ─────────────── 5. PLAYFUL — Mama Cee Confectionery (bakery) ─────────────── */
export function PlayfulStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="relative overflow-hidden px-4 pt-12 pb-6 sm:px-6">
        <div className="absolute -top-24 -right-16 size-72 rounded-full" style={{ background: t.soft }} />
        <div className="absolute top-40 -left-20 size-56 rounded-full" style={{ background: t.accent + "22" }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: t.accent, color: t.accentInk }}>
              <Cake className="size-3.5" /> Baked to order in Port Harcourt
            </span>
            <h1 className="mt-5 text-4xl leading-tight font-bold sm:text-5xl">
              Every celebration
              <br />
              deserves cake.
            </h1>
            <p className="mt-4 max-w-md text-sm opacity-70">{vendor.about}</p>
            <div className="mt-6">
              <StoreBadges vendor={vendor} />
            </div>
          </div>
          <div className="overflow-hidden" style={{ borderRadius: t.radius }}>
            <img src={vendor.cover} alt={vendor.name} className="h-72 w-full object-cover sm:h-80" width={1600} height={900} />
          </div>
        </div>
      </section>

      {/* cake configurator */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 border p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]" style={{ background: t.soft, borderColor: t.line, borderRadius: t.radius }}>
          <div>
            <p className="text-lg font-bold">Design your cake</p>
            {[
              ["Size", ['6" (8–10 slices)', '8" (15–20)', 'Two-tier (30+)']],
              ["Flavour", ["Vanilla", "Red velvet", "Chocolate fudge", "Carrot"]],
              ["Finish", ["Buttercream", "Fondant", "Ganache drip"]],
            ].map(([label, opts], gi) => (
              <div key={label as string} className="mt-5">
                <p className="mb-2 text-xs font-bold tracking-wide uppercase opacity-55">{label as string}</p>
                <div className="flex flex-wrap gap-2">
                  {(opts as string[]).map((o, i) => (
                    <span
                      key={o}
                      className="rounded-full border px-3.5 py-1.5 text-xs font-medium"
                      style={i === gi % 2 ? { background: t.accent, color: t.accentInk, borderColor: t.accent } : { borderColor: t.line, background: "#fff" }}
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold tracking-wide uppercase opacity-55">Message on cake</p>
              <input
                className="w-full border px-4 py-3 text-sm outline-none"
                style={{ borderColor: t.line, borderRadius: t.radius, background: "#fff" }}
                placeholder="Happy Birthday Chioma!"
              />
            </div>
          </div>
          <div className="flex flex-col justify-between border p-6" style={{ background: "#fff", borderColor: t.line, borderRadius: t.radius }}>
            <div>
              <p className="text-sm font-bold">Your cake</p>
              <ul className="mt-3 space-y-2 text-sm opacity-75">
                {['8" round · serves 15–20', "Red velvet sponge", "Buttercream finish", "Message piped free", "Pickup or PH delivery"].map((i) => (
                  <li key={i} className="flex gap-2">
                    <Check className="size-4 shrink-0" style={{ color: t.accent }} /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6">
              <p className="text-xs opacity-60">Total</p>
              <p className="text-3xl font-bold" style={{ color: t.accent }}>
                {naira(48000)}
              </p>
              <Link to="/cart" className="mt-4 block py-3 text-center text-sm font-bold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                Add to cart
              </Link>
              <p className="mt-2 text-center text-xs opacity-55">48hrs notice required</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <GroupTabs vendor={vendor} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="border p-3 transition-transform hover:-translate-y-1"
                style={{ borderColor: t.line, borderRadius: t.radius, background: "#fff" }}
              >
                <ItemArt vendor={vendor} seed={i} className="h-32 w-full" label={p.name} />
                <div className="p-2">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-xs opacity-65">{p.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Price value={p.price} vendor={vendor} />
                    <span className="grid size-8 place-items-center rounded-full" style={{ background: t.accent, color: t.accentInk }}>
                      <Plus className="size-4" />
                    </span>
                  </div>
                </div>
              </ItemLink>
            ))}
          </div>
        </div>
        <StoreSidebar vendor={vendor} />
      </div>
    </div>
  );
}

/* ─────────────── 6. RESERVATION — Eko Heights Hotel ─────────────── */
export function ReservationStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="relative">
        <img src={vendor.cover} alt={vendor.name} className="h-[68vh] min-h-[440px] w-full object-cover" width={1600} height={900} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${t.bg}b3, ${t.bg}f2)` }} />
        <div className="absolute inset-0 flex flex-col justify-center">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6" style={{ color: t.ink }}>
            <p className="text-xs tracking-[0.35em] uppercase" style={{ color: t.accent }}>
              Victoria Island · Lagos
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-6xl">Rest above the city.</h1>
            <p className="mt-4 max-w-md text-sm opacity-75">{vendor.about}</p>
            <div className="mt-6">
              <StoreBadges vendor={vendor} />
            </div>
          </div>
        </div>

        {/* booking bar */}
        <div className="absolute -bottom-12 left-0 w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-3 border p-4 sm:grid-cols-[1fr_1fr_1fr_auto]" style={{ background: t.soft, borderColor: t.line, borderRadius: t.radius, color: t.ink }}>
              {[
                ["Check-in", "Fri, 23 May"],
                ["Check-out", "Sun, 25 May"],
                ["Guests", "2 adults · 1 room"],
              ].map(([l, v]) => (
                <div key={l} className="border-r pr-3 last:border-0 sm:border-opacity-30" style={{ borderColor: t.line }}>
                  <p className="text-[11px] tracking-wide uppercase opacity-55">{l}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="size-4" style={{ color: t.accent }} /> {v}
                  </p>
                </div>
              ))}
              <Link to="/cart" className="grid place-items-center px-6 py-3 text-sm font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                Check availability
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-24 pb-6 sm:px-6">
        <div className="flex flex-wrap gap-6 border-b pb-8 text-sm" style={{ borderColor: t.line }}>
          {[
            [Wifi, "Fibre Wi-Fi"],
            [Coffee, "Breakfast included"],
            [ShieldCheck, "24/7 security"],
            [Truck, "Airport pickup"],
            [BedDouble, "42 rooms & suites"],
          ].map(([Icon, label], i) => {
            const I = Icon as typeof Wifi;
            return (
              <span key={i} className="inline-flex items-center gap-2 opacity-80">
                <I className="size-4" style={{ color: t.accent }} /> {label as string}
              </span>
            );
          })}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 className="text-2xl font-bold">Rooms & rates</h2>
          <p className="mt-1 text-sm opacity-60">Rates shown per night, taxes included.</p>
          <div className="mt-6 space-y-4">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="grid gap-4 border p-4 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:items-center"
                style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
              >
                <ItemArt vendor={vendor} seed={i} className="h-32 w-full" />
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.name}
                    {p.tag && (
                      <span className="ml-2 rounded px-2 py-0.5 text-[10px] font-bold" style={{ background: t.accent, color: t.accentInk }}>
                        {p.tag}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 text-sm opacity-65">{p.desc}</p>
                  <p className="mt-2 text-xs opacity-50">Free cancellation up to 48 hours before check-in</p>
                </div>
                <div className="text-left sm:text-right">
                  <Price value={p.price} vendor={vendor} />
                  <p className="text-xs opacity-55">{p.meta}</p>
                  <span className="mt-2 inline-block px-4 py-2 text-xs font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                    Reserve
                  </span>
                </div>
              </ItemLink>
            ))}
          </div>
        </div>
        <StoreSidebar vendor={vendor} />
      </div>
    </div>
  );
}

/* ─────────────── 7. GRID — Lagos Tech Hub (electronics) ─────────────── */
export function GridStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="border-b" style={{ borderColor: t.line }}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase" style={{ color: t.accent }}>
              Computer Village · Ikeja
            </p>
            <h1 className="mt-4 text-4xl font-bold sm:text-5xl">
              Verified gadgets.
              <br />
              Real warranty.
            </h1>
            <p className="mt-4 max-w-md text-sm opacity-70">{vendor.about}</p>
            <div className="mt-6">
              <StoreBadges vendor={vendor} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["12 mo", "Warranty"],
                ["48 hr", "Return window"],
                ["5.6K+", "Devices sold"],
              ].map(([v, l]) => (
                <div key={l} className="border p-3" style={{ borderColor: t.line, borderRadius: t.radius }}>
                  <p className="font-bold" style={{ color: t.accent }}>
                    {v}
                  </p>
                  <p className="text-[11px] opacity-60">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <img src={vendor.cover} alt={vendor.name} className="h-64 w-full object-cover lg:h-80" style={{ borderRadius: t.radius }} width={1600} height={900} />
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="space-y-6 self-start lg:sticky lg:top-24">
          <div>
            <p className="font-mono text-[11px] tracking-widest uppercase opacity-55">Departments</p>
            <div className="mt-3 space-y-1 text-sm">
              {vendor.groups.map((g, i) => (
                <p
                  key={g}
                  className="px-3 py-2"
                  style={i === 0 ? { background: t.accent, color: t.accentInk, borderRadius: t.radius } : { opacity: 0.7 }}
                >
                  {g}
                </p>
              ))}
            </div>
          </div>
          <div className="border p-4 text-sm" style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}>
            <p className="font-semibold">Bench repairs</p>
            <p className="mt-1 text-xs opacity-65">Screens, batteries, board-level fixes. Same-day for most models.</p>
            <Link to="/cart" className="mt-3 inline-block px-3 py-2 text-xs font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
              Book a repair
            </Link>
          </div>
          <StoreSidebar vendor={vendor} />
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold">All products</h2>
            <div className="flex gap-2 font-mono text-xs">
              {["In stock", "Price ↑", "Newest"].map((f, i) => (
                <span key={f} className="border px-3 py-1.5" style={i === 0 ? { borderColor: t.accent, color: t.accent } : { borderColor: t.line, opacity: 0.7 }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="flex flex-col border p-4"
                style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] tracking-wider uppercase opacity-50">{p.group}</span>
                  {p.tag && (
                    <span className="px-1.5 py-0.5 font-mono text-[10px] font-bold" style={{ background: t.accent, color: t.accentInk }}>
                      {p.tag}
                    </span>
                  )}
                </div>
                <ItemArt vendor={vendor} seed={i} className="mt-3 h-32 w-full" />
                <p className="mt-3 text-sm font-semibold">{p.name}</p>
                <p className="mt-1 text-xs opacity-60">{p.desc}</p>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div>
                    <p className="font-mono text-[10px] opacity-50">{p.meta ?? "In stock"}</p>
                    <Price value={p.price} vendor={vendor} />
                  </div>
                  <span className="flex items-center gap-1 px-3 py-2 text-xs font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                    <Plus className="size-3.5" /> Add
                  </span>
                </div>
              </ItemLink>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 border p-4 text-sm" style={{ borderColor: t.line, borderRadius: t.radius }}>
            <Heart className="size-4" style={{ color: t.accent }} />
            <p className="opacity-70">Save this store to get restock alerts on the devices you follow.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
