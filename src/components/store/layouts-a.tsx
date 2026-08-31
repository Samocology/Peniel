import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Flame,
  Gift,
  MapPin,
  Minus,
  Phone,
  Plus,
  Sparkles,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { naira, reviews, type Vendor } from "@/lib/data";
import { GroupTabs, ItemArt, ItemLink, Price, StoreBadges } from "./store-kit";

/* ─────────────── 1. CINEMATIC — Abigail's Kitchen (restaurant) ─────────────── */
export function CinematicStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="relative h-[62vh] min-h-[420px]">
        <img src={vendor.cover} alt={vendor.name} className="size-full object-cover" width={1600} height={900} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${t.bg}f2 0%, ${t.bg}80 55%, transparent 100%)` }} />
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="text-script text-4xl leading-tight sm:text-6xl" style={{ color: t.ink }}>
              Bold Flavors.
              <br />
              Made with love.
            </p>
            <p className="mt-4 max-w-sm text-sm opacity-75" style={{ color: t.ink }}>
              Experience delicious meals crafted with the finest ingredients, cooked fresh every single day.
            </p>
          </div>
        </div>
      </section>

      {/* floating identity card */}
      <div className="mx-auto -mt-16 max-w-6xl px-4 sm:px-6">
        <div
          className="relative grid gap-6 border p-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
          style={{ background: t.soft, borderColor: t.line, borderRadius: t.radius, color: t.ink }}
        >
          <div
            className="grid size-24 place-items-center rounded-full border-4 text-2xl font-bold"
            style={{ borderColor: t.accent, background: t.bg, fontFamily: t.heading, color: t.accent }}
          >
            {vendor.monogram}
          </div>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold">{vendor.name}</h1>
            <div className="mt-2">
              <StoreBadges vendor={vendor} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {["Restaurants", "Nigerian Cuisine", "Grills", "Catering"].map((c) => (
                <span key={c} className="rounded-full border px-2.5 py-1 opacity-80" style={{ borderColor: t.line }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/cart"
              className="px-6 py-3 text-sm font-semibold"
              style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}
            >
              Order now
            </Link>
            <button
              className="border px-6 py-3 text-sm font-semibold"
              style={{ borderColor: t.line, borderRadius: t.radius }}
            >
              Book a table
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <GroupTabs vendor={vendor} />
          <h2 className="mt-8 mb-4 flex items-center gap-2 text-xl font-bold">
            <Flame className="size-5" style={{ color: t.accent }} /> Popular items
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vendor.products.map((p, i) => (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className="group overflow-hidden border transition-transform hover:-translate-y-1"
                style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
              >
                <div className="relative">
                  <ItemArt vendor={vendor} seed={i} className="h-36 w-full" label={p.name} />
                  {p.tag && (
                    <span
                      className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold"
                      style={{ background: t.accent, color: t.accentInk }}
                    >
                      {p.tag}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold">{p.name}</p>
                  <p className="mt-1 text-xs opacity-65">{p.desc}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <Price value={p.price} vendor={vendor} />
                    <span
                      className="grid size-8 place-items-center rounded-lg"
                      style={{ background: t.accent, color: t.accentInk }}
                    >
                      <Plus className="size-4" />
                    </span>
                  </div>
                </div>
              </ItemLink>
            ))}
          </div>

          <div
            className="mt-8 flex flex-wrap items-center gap-4 border p-5"
            style={{ borderColor: t.accent + "66", background: t.accent + "1a", borderRadius: t.radius }}
          >
            <Gift className="size-6" style={{ color: t.accent }} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Weekend special</p>
              <p className="text-sm opacity-70">Get 10% off all orders above ₦15,000 this weekend only.</p>
            </div>
            <Link to="/cart" className="px-5 py-2.5 text-sm font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
              Order now
            </Link>
          </div>

          <h2 className="mt-10 mb-4 text-xl font-bold">What customers are saying</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {reviews.slice(0, 2).map((r) => (
              <div key={r.name} className="border p-5" style={{ borderColor: t.line, borderRadius: t.radius }}>
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full text-xs font-bold" style={{ background: t.accent, color: t.accentInk }}>
                    {r.name[0]}
                  </span>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <span className="ml-auto text-xs opacity-60">{r.when}</span>
                </div>
                <div className="mt-2 flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="size-3.5" style={{ color: t.accent, fill: t.accent }} />
                  ))}
                </div>
                <p className="mt-2 text-sm opacity-75">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <StoreSidebar vendor={vendor} />
      </div>

      {/* sticky cart bar */}
      <div className="sticky bottom-4 z-30 mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className="flex items-center justify-between gap-4 p-4"
          style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}
        >
          <div>
            <p className="text-sm font-bold">2 items in cart</p>
            <p className="text-xs opacity-80">{naira(9000)}</p>
          </div>
          <Link to="/cart" className="rounded-lg bg-black/15 px-5 py-2.5 text-sm font-semibold">
            View cart & checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

export function StoreSidebar({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const rows = [
    { icon: MapPin, label: "Location", value: vendor.location },
    { icon: Clock, label: "Opening hours", value: vendor.hours },
    { icon: Phone, label: "Contact", value: `${vendor.phone}\n${vendor.email}` },
    { icon: Truck, label: "Fulfilment", value: vendor.delivery },
  ];
  return (
    <aside className="space-y-4 self-start lg:sticky lg:top-24">
      <div className="border p-5" style={{ borderColor: t.line, borderRadius: t.radius }}>
        <p className="font-semibold">About {vendor.name}</p>
        <p className="mt-2 text-sm opacity-70">{vendor.about}</p>
      </div>
      <div className="space-y-4 border p-5" style={{ borderColor: t.line, borderRadius: t.radius }}>
        {rows.map((r) => (
          <div key={r.label} className="flex gap-3">
            <r.icon className="mt-0.5 size-4 shrink-0" style={{ color: t.accent }} />
            <div className="min-w-0">
              <p className="text-sm font-semibold">{r.label}</p>
              <p className="text-sm whitespace-pre-line opacity-70">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="border p-5" style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}>
        <p className="text-sm font-semibold">Payments secured by Vendra Pay</p>
        <p className="mt-1 text-xs opacity-65">
          Card, transfer, USSD and wallet. Your money is protected until the order is fulfilled.
        </p>
      </div>
    </aside>
  );
}

/* ─────────────── 2. BUILDER — Fresh From the Farm (fresh food) ─────────────── */
export function BuilderStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: t.soft, color: t.accent }}>
            <Sparkles className="size-3.5" /> Signature experience
          </span>
          <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
            Tell us the dish.
            <br />
            We measure everything.
          </h1>
          <p className="mt-4 max-w-md text-sm opacity-70">{vendor.about}</p>
          <div className="mt-6">
            <StoreBadges vendor={vendor} />
          </div>
        </div>

        {/* meal kit calculator */}
        <div className="border p-6" style={{ background: "#fff", borderColor: t.line, borderRadius: t.radius }}>
          <p className="font-semibold">Build your meal kit</p>
          <div className="mt-4 space-y-4 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide uppercase opacity-60">Dish</p>
              <div className="flex flex-wrap gap-2">
                {["Egusi Soup", "Efo Riro", "Jollof Rice", "Banga Soup"].map((d, i) => (
                  <span
                    key={d}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={i === 0 ? { background: t.accent, color: t.accentInk, borderColor: t.accent } : { borderColor: t.line }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide uppercase opacity-60">People</p>
              <div className="flex items-center gap-3">
                <button className="grid size-9 place-items-center rounded-full border" style={{ borderColor: t.line }}>
                  <Minus className="size-4" />
                </button>
                <span className="flex items-center gap-2 text-lg font-bold">
                  <Users className="size-4 opacity-50" /> 6
                </span>
                <button className="grid size-9 place-items-center rounded-full" style={{ background: t.accent, color: t.accentInk }}>
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide uppercase opacity-60">Protein</p>
              <div className="flex flex-wrap gap-2">
                {["Goat meat", "Beef", "Chicken", "Assorted", "None"].map((p, i) => (
                  <span
                    key={p}
                    className="rounded-full border px-3 py-1.5 text-xs font-medium"
                    style={i === 0 ? { background: t.accent, color: t.accentInk, borderColor: t.accent } : { borderColor: t.line }}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t pt-4" style={{ borderColor: t.line }}>
              <p className="text-xs font-semibold tracking-wide uppercase opacity-60">Your kit includes</p>
              <ul className="mt-2 grid grid-cols-2 gap-1 text-xs opacity-75">
                {["Ground egusi 500g", "Ugu leaves 2 bunches", "Palm oil 500ml", "Crayfish 200g", "Goat meat 2kg", "Pepper mix 1L"].map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs opacity-60">Total for 6 people</p>
                <p className="text-2xl font-bold" style={{ color: t.accent }}>
                  {naira(24500)}
                </p>
              </div>
              <Link to="/cart" className="px-6 py-3 text-sm font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                Add to cart
              </Link>
            </div>
            <p className="text-xs opacity-55">Includes cooking instructions and a step-by-step video.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="overflow-hidden" style={{ borderRadius: t.radius }}>
          <img src={vendor.cover} alt={vendor.name} loading="lazy" className="h-56 w-full object-cover sm:h-72" />
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <GroupTabs vendor={vendor} />
          <div className="mt-6 space-y-8">
            {vendor.groups.map((g) => {
              const items = vendor.products.filter((p) => p.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <h2 className="mb-3 text-lg font-bold">{g}</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {items.map((p, i) => (
                      <ItemLink
                        key={p.id}
                        vendor={vendor}
                        product={p}
                        className="flex items-center gap-4 border p-3 transition-colors"
                        style={{ borderColor: t.line, borderRadius: t.radius, background: "#fff" }}
                      >
                        <ItemArt vendor={vendor} seed={i} className="size-20 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{p.name}</p>
                          <p className="line-clamp-2 text-xs opacity-65">{p.desc}</p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Price value={p.price} vendor={vendor} />
                            {p.meta && <span className="text-xs opacity-55">{p.meta}</span>}
                          </div>
                        </div>
                        <span className="grid size-9 shrink-0 place-items-center rounded-full" style={{ background: t.accent, color: t.accentInk }}>
                          <Plus className="size-4" />
                        </span>
                      </ItemLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <StoreSidebar vendor={vendor} />
      </div>
    </div>
  );
}

/* ─────────────── 3. EDITORIAL — Glamour Beauty Lounge (beauty) ─────────────── */
export function EditorialStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="text-script text-5xl sm:text-6xl" style={{ color: t.accent }}>
              Relax. Refresh.
              <br />
              Glow.
            </p>
            <p className="mt-5 max-w-md text-sm opacity-70">{vendor.about}</p>
            <div className="mt-6">
              <StoreBadges vendor={vendor} />
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/cart" className="px-6 py-3 text-sm font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: "999px" }}>
                Book an appointment
              </Link>
              <a href={`tel:${vendor.phone}`} className="border px-6 py-3 text-sm font-semibold" style={{ borderColor: t.accent, color: t.accent, borderRadius: "999px" }}>
                Call the lounge
              </a>
            </div>
          </div>
          <div className="overflow-hidden" style={{ borderRadius: "180px 180px 24px 24px" }}>
            <img src={vendor.cover} alt={vendor.name} className="h-80 w-full object-cover" width={1600} height={900} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div>
          <h2 className="text-2xl font-bold">Service menu</h2>
          <p className="mt-1 text-sm opacity-65">Choose a service, pick your specialist and time.</p>
          <div className="mt-6 space-y-8">
            {vendor.groups.map((g) => {
              const items = vendor.products.filter((p) => p.group === g);
              if (!items.length) return null;
              return (
                <div key={g}>
                  <p className="mb-3 text-xs font-bold tracking-[0.18em] uppercase" style={{ color: t.accent }}>
                    {g}
                  </p>
                  <div className="divide-y" style={{ borderColor: t.line }}>
                    {items.map((p) => (
                      <ItemLink
                        key={p.id}
                        vendor={vendor}
                        product={p}
                        className="flex items-center gap-4 py-4"
                        style={{ borderColor: t.line }}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {p.name}
                            {p.tag && (
                              <span className="ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: t.soft, color: t.accent }}>
                                {p.tag}
                              </span>
                            )}
                          </p>
                          <p className="text-sm opacity-65">{p.desc}</p>
                          <p className="mt-1 text-xs opacity-55">{p.meta}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <Price value={p.price} vendor={vendor} />
                          <p className="mt-1 inline-flex items-center gap-1 text-xs" style={{ color: t.accent }}>
                            Book <ArrowRight className="size-3" />
                          </p>
                        </div>
                      </ItemLink>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="space-y-4 self-start lg:sticky lg:top-24">
          <div className="border p-5" style={{ borderColor: t.line, borderRadius: t.radius, background: "#fff" }}>
            <p className="flex items-center gap-2 font-semibold">
              <CalendarCheck className="size-4" style={{ color: t.accent }} /> Available today
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              {["10:00", "11:30", "13:00", "14:30", "16:00", "17:30"].map((s, i) => (
                <span
                  key={s}
                  className="rounded-full border py-2 text-center font-medium"
                  style={i === 3 ? { background: t.accent, color: t.accentInk, borderColor: t.accent } : { borderColor: t.line }}
                >
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs opacity-60">Specialists: Esther B., Joy N., Amaka T.</p>
            <Link to="/checkout" className="mt-4 block py-3 text-center text-sm font-semibold" style={{ background: t.accent, color: t.accentInk, borderRadius: "999px" }}>
              Confirm 14:30 slot
            </Link>
          </div>
          <StoreSidebar vendor={vendor} />
        </aside>
      </section>
    </div>
  );
}

/* ─────────────── 4. GALLERY — Kemi's Couture (fashion) ─────────────── */
export function GalleryStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  return (
    <div>
      <section className="relative">
        <img src={vendor.cover} alt={vendor.name} className="h-[70vh] min-h-[440px] w-full object-cover" width={1600} height={900} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${t.bg} 4%, transparent 60%)` }} />
        <div className="absolute bottom-10 left-0 w-full">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="text-xs tracking-[0.4em] uppercase" style={{ color: t.accent }}>
              Atelier · Victoria Island
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl" style={{ color: t.ink }}>
              KEMI'S
              <br />
              COUTURE
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b pb-8" style={{ borderColor: t.line }}>
          <div>
            <p className="max-w-md text-sm opacity-70">{vendor.about}</p>
            <div className="mt-4">
              <StoreBadges vendor={vendor} />
            </div>
          </div>
          <div className="flex gap-3 text-xs tracking-[0.2em] uppercase">
            {vendor.groups.map((g, i) => (
              <span key={g} style={i === 0 ? { color: t.accent, borderBottom: `1px solid ${t.accent}` } : { opacity: 0.6 }}>
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* asymmetric lookbook grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {vendor.products.map((p, i) => {
            const tall = i % 3 === 0;
            return (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className={"group block " + (tall ? "md:row-span-2" : "")}
              >
                <ItemArt vendor={vendor} seed={i} className={"w-full " + (tall ? "h-96" : "h-56")} label={p.name} />
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm tracking-wide uppercase">{p.name}</p>
                    <p className="mt-0.5 text-xs opacity-55">{p.meta ?? p.group}</p>
                  </div>
                  <span className="shrink-0 text-sm" style={{ color: t.accent }}>
                    {naira(p.price)}
                  </span>
                </div>
              </ItemLink>
            );
          })}
        </div>

        <div className="mt-16 grid gap-8 border-t pt-10 md:grid-cols-3" style={{ borderColor: t.line }}>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: t.accent }}>
              Atelier
            </p>
            <p className="mt-2 text-sm opacity-70">{vendor.location}</p>
            <p className="mt-1 text-sm opacity-70">{vendor.hours}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: t.accent }}>
              Shipping
            </p>
            <p className="mt-2 text-sm opacity-70">{vendor.delivery}</p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase" style={{ color: t.accent }}>
              Made to measure
            </p>
            <p className="mt-2 text-sm opacity-70">
              Book a fitting appointment and we'll cut to your measurements. Two fittings included.
            </p>
            <Link to="/cart" className="mt-4 inline-block border px-6 py-3 text-xs tracking-[0.2em] uppercase" style={{ borderColor: t.accent, color: t.accent }}>
              Request a fitting
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
