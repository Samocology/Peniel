import { ArrowRight, Clock, MapPin, Plus, Star, Truck } from "lucide-react";
import type { CSSProperties } from "react";
import { naira, type Product, type Vendor } from "@/lib/data";
import type { StoreTemplate } from "@/lib/templates";
import { ItemArt, ItemLink, StoreBadges } from "./store-kit";

type P = { vendor: Vendor; tpl: StoreTemplate };

const cta = (v: Vendor) => (v.fulfilment === "order" ? "Order now" : v.fulfilment === "booking" ? "Book now" : "Reserve");

function H({ v, tpl, className = "", children, style }: { v: Vendor; tpl: StoreTemplate; className?: string; children: React.ReactNode; style?: CSSProperties }) {
  return (
    <h1
      className={"leading-[0.95] font-bold " + (tpl.caps ? "uppercase tracking-tight " : "") + className}
      style={{ fontFamily: v.theme.heading, ...style }}
    >
      {children}
    </h1>
  );
}

function Btn({ v, children, ghost }: { v: Vendor; children: React.ReactNode; ghost?: boolean }) {
  const t = v.theme;
  return (
    <a
      href="#catalogue"
      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold transition hover:opacity-90"
      style={
        ghost
          ? { border: `1px solid ${t.line}`, borderRadius: t.radius, color: t.ink }
          : { background: t.accent, color: t.accentInk, borderRadius: t.radius }
      }
    >
      {children}
    </a>
  );
}

/* ─────────── Heroes ─────────── */

function HeroBlock({ vendor: v, tpl }: P) {
  const t = v.theme;
  const meta = (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-75">
      <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {v.location}</span>
      <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {v.hours}</span>
    </div>
  );

  switch (tpl.hero) {
    case "split":
      return (
        <section className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:items-center md:py-16">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: t.accent }}>{v.categoryLabel}</p>
            <H v={v} tpl={tpl} className="mt-3 text-5xl sm:text-6xl">{v.name}</H>
            <p className="mt-4 max-w-md text-lg opacity-80">{v.tagline}</p>
            <div className="mt-5"><StoreBadges vendor={v} /></div>
            <div className="mt-6 flex flex-wrap gap-3"><Btn v={v}>{cta(v)} <ArrowRight className="size-4" /></Btn><Btn v={v} ghost>About us</Btn></div>
            <div className="mt-6">{meta}</div>
          </div>
          <div className="relative">
            <img src={v.cover} alt={v.name} className="aspect-[4/5] w-full object-cover" style={{ borderRadius: t.radius }} />
            <div className="absolute -bottom-4 -left-4 hidden px-4 py-3 text-sm font-bold shadow-xl sm:block" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
              ★ {v.rating} · {v.reviews} reviews
            </div>
          </div>
        </section>
      );
    case "centered":
      return (
        <section className="px-4 pt-12 pb-8 text-center sm:px-6">
          <span className="mx-auto grid size-20 place-items-center text-2xl font-bold" style={{ background: t.accent, color: t.accentInk, borderRadius: "999px", fontFamily: t.heading }}>{v.monogram}</span>
          <H v={v} tpl={tpl} className="mx-auto mt-5 max-w-3xl text-5xl sm:text-7xl">{v.name}</H>
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-75">{v.tagline}</p>
          <div className="mt-5 flex justify-center"><StoreBadges vendor={v} /></div>
          <div className="mt-6 flex justify-center gap-3"><Btn v={v}>{cta(v)}</Btn></div>
          <img src={v.cover} alt={v.name} className="mx-auto mt-10 h-64 w-full max-w-5xl object-cover sm:h-96" style={{ borderRadius: t.radius }} />
        </section>
      );
    case "banner":
      return (
        <section className="relative">
          <img src={v.cover} alt={v.name} className="h-[420px] w-full object-cover sm:h-[520px]" />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.bg}, ${t.bg}55 50%, transparent)` }} />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-6xl px-4 pb-8 sm:px-6">
            <H v={v} tpl={tpl} className="text-5xl sm:text-7xl">{v.name}</H>
            <p className="mt-3 max-w-lg text-lg opacity-85">{v.tagline}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4"><Btn v={v}>{cta(v)}</Btn><StoreBadges vendor={v} /></div>
          </div>
        </section>
      );
    case "poster":
      return (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="relative overflow-hidden p-6 sm:p-12" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
            <p className="text-xs font-bold tracking-[0.3em] uppercase opacity-80">{v.categoryLabel} · {v.location.split(",").pop()}</p>
            <H v={v} tpl={tpl} className="mt-4 text-6xl sm:text-[8rem]">{v.name}</H>
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px] md:items-end">
              <p className="max-w-md text-lg font-medium">{v.tagline}</p>
              <img src={v.cover} alt={v.name} className="aspect-square w-full rotate-2 object-cover shadow-2xl" style={{ borderRadius: t.radius }} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><StoreBadges vendor={v} /><Btn v={v}>{cta(v)}</Btn></div>
        </section>
      );
    case "minimal":
      return (
        <section className="mx-auto max-w-6xl border-b px-4 py-14 sm:px-6" style={{ borderColor: t.line }}>
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <H v={v} tpl={tpl} className="text-4xl sm:text-6xl">{v.name}</H>
              <p className="mt-3 max-w-xl opacity-70">{v.about}</p>
            </div>
            <div className="space-y-3 md:text-right"><StoreBadges vendor={v} /><Btn v={v}>{cta(v)} →</Btn></div>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <img key={i} src={v.cover} alt="" className="h-28 w-full object-cover sm:h-44" style={{ borderRadius: t.radius, objectPosition: `${i * 50}% 50%` }} />
            ))}
          </div>
        </section>
      );
    case "magazine":
      return (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex items-center justify-between border-y py-2 text-[11px] font-bold tracking-[0.25em] uppercase" style={{ borderColor: t.ink }}>
            <span>Issue Nº 26</span><span>{v.categoryLabel}</span><span className="hidden sm:inline">{v.location.split(",")[0]}</span>
          </div>
          <H v={v} tpl={tpl} className="mt-6 text-center text-6xl sm:text-8xl">{v.name}</H>
          <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.4fr_1fr]">
            <p className="text-sm leading-relaxed opacity-80 first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-bold" style={{ ["--tw" as string]: 0 }}>{v.about}</p>
            <img src={v.cover} alt={v.name} className="aspect-[4/3] w-full object-cover" style={{ borderRadius: t.radius }} />
            <div className="space-y-4">
              <p className="text-2xl italic" style={{ fontFamily: t.heading }}>“{v.tagline}”</p>
              <StoreBadges vendor={v} />
              <Btn v={v}>{cta(v)}</Btn>
            </div>
          </div>
        </section>
      );
    case "marquee":
    default:
      return (
        <section>
          <div className="overflow-hidden py-3 whitespace-nowrap" style={{ background: t.ink, color: t.bg }}>
            <div className="inline-block animate-[marquee_22s_linear_infinite] text-sm font-bold tracking-widest uppercase">
              {Array.from({ length: 8 }).map((_, i) => (
                <span key={i} className="mx-6">★ {v.tagline} ★ {v.delivery.split(".")[0]}</span>
              ))}
            </div>
          </div>
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr] md:items-center">
            <div>
              <H v={v} tpl={tpl} className="text-6xl sm:text-8xl">{v.name}</H>
              <div className="mt-5 flex flex-wrap items-center gap-4"><Btn v={v}>{cta(v)}</Btn><StoreBadges vendor={v} /></div>
            </div>
            <img src={v.cover} alt={v.name} className="aspect-video w-full -rotate-1 object-cover" style={{ borderRadius: t.radius, border: `4px solid ${t.ink}` }} />
          </div>
        </section>
      );
  }
}

/* ─────────── Catalogues ─────────── */

function AddBtn({ v }: { v: Vendor }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center" style={{ background: t(v).accent, color: t(v).accentInk, borderRadius: "999px" }}>
      <Plus className="size-4" />
    </span>
  );
}
const t = (v: Vendor) => v.theme;

function Card({ v, p, i, tall }: { v: Vendor; p: Product; i: number; tall?: boolean }) {
  return (
    <ItemLink vendor={v} product={p} className="group block overflow-hidden border transition hover:-translate-y-0.5" style={{ borderColor: t(v).line, borderRadius: t(v).radius, background: t(v).soft }}>
      <ItemArt vendor={v} seed={i} label={p.name} className={tall ? "aspect-[3/4]" : "aspect-[4/3]"} />
      <div className="flex items-end justify-between gap-2 p-4">
        <div className="min-w-0">
          {p.tag && <p className="text-[10px] font-bold tracking-widest uppercase" style={{ color: t(v).accent }}>{p.tag}</p>}
          <p className="truncate font-semibold">{p.name}</p>
          <p className="text-sm font-bold" style={{ color: t(v).accent }}>{naira(p.price)}</p>
        </div>
        <AddBtn v={v} />
      </div>
    </ItemLink>
  );
}

function CatalogBlock({ vendor: v, tpl }: P) {
  const items = v.products;
  switch (tpl.catalog) {
    case "list":
      return (
        <div className="divide-y" style={{ borderColor: t(v).line }}>
          {v.groups.map((g) => {
            const gi = items.filter((p) => p.group === g);
            if (!gi.length) return null;
            return (
              <div key={g} className="py-6">
                <p className="mb-3 text-xs font-bold tracking-[0.2em] uppercase opacity-60">{g}</p>
                {gi.map((p) => (
                  <ItemLink key={p.id} vendor={v} product={p} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
                    <span className="min-w-0">
                      <span className="block font-semibold" style={{ fontFamily: t(v).heading }}>{p.name}</span>
                      <span className="block truncate text-sm opacity-65">{p.desc}</span>
                    </span>
                    <span className="flex items-center gap-3"><b>{naira(p.price)}</b><AddBtn v={v} /></span>
                  </ItemLink>
                ))}
              </div>
            );
          })}
        </div>
      );
    case "masonry":
      return (
        <div className="columns-2 gap-4 md:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {items.map((p, i) => <Card key={p.id} v={v} p={p} i={i} tall={i % 3 === 0} />)}
        </div>
      );
    case "rail":
      return (
        <div className="space-y-8">
          {v.groups.map((g) => {
            const gi = items.filter((p) => p.group === g);
            if (!gi.length) return null;
            return (
              <div key={g}>
                <p className="mb-3 text-lg font-bold" style={{ fontFamily: t(v).heading }}>{g}</p>
                <div className="flex snap-x gap-4 overflow-x-auto pb-2 hide-scrollbar">
                  {gi.map((p, i) => (
                    <div key={p.id} className="w-60 shrink-0 snap-start"><Card v={v} p={p} i={i} /></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    case "board":
      return (
        <div className="grid gap-x-10 gap-y-8 p-6 sm:p-10 md:grid-cols-2" style={{ background: t(v).soft, borderRadius: t(v).radius, border: `2px solid ${t(v).ink}` }}>
          {v.groups.map((g) => {
            const gi = items.filter((p) => p.group === g);
            if (!gi.length) return null;
            return (
              <div key={g}>
                <p className="mb-3 border-b-2 pb-1 text-xl font-bold uppercase" style={{ fontFamily: t(v).heading, borderColor: t(v).accent }}>{g}</p>
                {gi.map((p) => (
                  <ItemLink key={p.id} vendor={v} product={p} className="flex items-baseline gap-2 py-1.5 text-sm">
                    <span className="font-semibold">{p.name}</span>
                    <span className="flex-1 border-b border-dotted opacity-40" style={{ borderColor: t(v).ink }} />
                    <span className="font-bold">{naira(p.price)}</span>
                  </ItemLink>
                ))}
              </div>
            );
          })}
        </div>
      );
    case "bento":
      return (
        <div className="grid auto-rows-[180px] grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={v}
              product={p}
              className={"relative overflow-hidden p-4 " + (i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "")}
              style={{ background: i % 2 ? t(v).soft : t(v).accent, color: i % 2 ? t(v).ink : t(v).accentInk, borderRadius: t(v).radius }}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase opacity-70">{p.group}</span>
              <span className={"mt-1 block font-bold " + (i === 0 ? "text-3xl" : "text-lg")} style={{ fontFamily: t(v).heading }}>{p.name}</span>
              {i === 0 && <span className="mt-2 block max-w-xs text-sm opacity-80">{p.desc}</span>}
              <span className="absolute bottom-4 left-4 text-sm font-bold">{naira(p.price)}</span>
              <span className="absolute right-4 bottom-4 grid size-8 place-items-center rounded-full" style={{ background: t(v).bg, color: t(v).ink }}><Plus className="size-4" /></span>
            </ItemLink>
          ))}
        </div>
      );
    case "polaroid":
      return (
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((p, i) => (
            <ItemLink key={p.id} vendor={v} product={p} className="block bg-white p-2.5 pb-4 text-neutral-900 shadow-lg transition hover:rotate-0" style={{ transform: `rotate(${((i % 3) - 1) * 2}deg)` }}>
              <ItemArt vendor={v} seed={i} className="aspect-square" />
              <p className="mt-2 truncate text-center text-lg" style={{ fontFamily: t(v).heading }}>{p.name}</p>
              <p className="text-center text-sm font-bold" style={{ color: t(v).accent }}>{naira(p.price)}</p>
            </ItemLink>
          ))}
        </div>
      );
    case "cards":
    default:
      return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {items.map((p, i) => <Card key={p.id} v={v} p={p} i={i} />)}
        </div>
      );
  }
}

/** Mix-and-match storefront: each template pairs a hero and catalogue style with its own type & colour. */
export function ComposedStore({ vendor, tpl }: P) {
  const v = vendor;
  return (
    <div>
      <HeroBlock vendor={v} tpl={tpl} />
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-3 py-6 text-sm sm:grid-cols-3">
          {[
            [Truck, v.delivery.split(".")[0]],
            [Star, `${v.rating} average from ${v.reviews} reviews`],
            [Clock, v.hours],
          ].map(([Icon, txt], i) => {
            const I = Icon as typeof Truck;
            return (
              <div key={i} className="flex items-center gap-3 border px-4 py-3" style={{ borderColor: t(v).line, borderRadius: t(v).radius }}>
                <I className="size-4 shrink-0" style={{ color: t(v).accent }} />
                <span className="min-w-0 truncate">{txt as string}</span>
              </div>
            );
          })}
        </div>
      </section>
      <section id="catalogue" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <h2 className={"text-3xl font-bold " + (tpl.caps ? "uppercase" : "")} style={{ fontFamily: t(v).heading }}>
            {v.fulfilment === "order" ? "Shop the menu" : v.fulfilment === "booking" ? "Services" : "Rooms & rates"}
          </h2>
          <span className="text-xs opacity-60">{v.products.length} items</span>
        </div>
        <CatalogBlock vendor={v} tpl={tpl} />
      </section>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 p-6 sm:p-10 md:grid-cols-[1fr_auto] md:items-center" style={{ background: t(v).soft, borderRadius: t(v).radius }}>
          <div>
            <p className={"text-2xl font-bold " + (tpl.caps ? "uppercase" : "")} style={{ fontFamily: t(v).heading }}>About {v.name}</p>
            <p className="mt-2 max-w-2xl text-sm opacity-75">{v.about}</p>
          </div>
          <Btn v={v}>{cta(v)} <ArrowRight className="size-4" /></Btn>
        </div>
      </section>
    </div>
  );
}
