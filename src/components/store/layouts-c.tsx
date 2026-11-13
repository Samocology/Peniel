import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MapPin,
  Plus,
  Star,
  Truck,
  ShieldCheck,
  Sparkles,
  MessageCircle,
  CheckCircle2,
  PackageCheck,
  Heart,
  ChevronRight,
  Zap,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { naira, type Product, type Vendor } from "@/lib/data";
import type { StoreTemplate } from "@/lib/templates";
import { ItemArt, ItemLink, StoreBadges } from "./store-kit";

type P = { vendor: Vendor; tpl: StoreTemplate };

const category = (v: Vendor) => {
  const value = `${v.categoryLabel} ${v.name}`.toLowerCase();

  if (/fashion|couture|cloth|apparel|boutique|wear|tailor/.test(value)) return "fashion";
  if (/beauty|salon|spa|makeup|nail|hair/.test(value)) return "beauty";
  if (/hotel|hospitality|resort|guest house/.test(value)) return "hospitality";
  if (/restaurant|food|kitchen|bakery|cafe|catering/.test(value)) return "food";
  if (/electronics|gadget|technology|tech hub|device/.test(value)) return "electronics";

  return "general";
};

const cta = (v: Vendor) =>
  v.fulfilment === "order"
    ? "Explore collection"
    : v.fulfilment === "booking"
      ? "Book an appointment"
      : "Reserve a room";

function Eyebrow({ children, color }: { children: ReactNode; color: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>
      {children}
    </p>
  );
}

function Heading({
  vendor,
  tpl,
  children,
  className = "",
  style,
}: {
  vendor: Vendor;
  tpl: StoreTemplate;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <h1
      className={[
        "font-semibold leading-[1.04] tracking-[-0.055em]",
        tpl.caps ? "uppercase tracking-[-0.035em]" : "",
        className,
      ].join(" ")}
      style={{ fontFamily: vendor.theme.heading, ...style }}
    >
      {children}
    </h1>
  );
}

function Button({
  vendor,
  children,
  ghost = false,
  href = "#catalogue",
}: {
  vendor: Vendor;
  children: ReactNode;
  ghost?: boolean;
  href?: string;
}) {
  const th = vendor.theme;

  return (
    <a
      href={href}
      className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
      style={
        ghost
          ? {
              border: `1px solid ${th.line}`,
              color: th.ink,
              background: "transparent",
            }
          : {
              background: th.accent,
              color: th.accentInk,
              boxShadow: `0 8px 25px -12px ${th.accent}`,
            }
      }
    >
      {children}
      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

function StoreMeta({ vendor }: { vendor: Vendor }) {
  const th = vendor.theme;

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs">
      <span className="inline-flex items-center gap-2 opacity-65">
        <MapPin className="size-3.5" style={{ color: th.accent }} />
        {vendor.location}
      </span>
      <span className="inline-flex items-center gap-2 opacity-65">
        <Clock className="size-3.5" style={{ color: th.accent }} />
        {vendor.hours}
      </span>
    </div>
  );
}

/* ───────────────── HERO ───────────────── */

function HeroBlock({ vendor: v, tpl }: P) {
  const th = v.theme;
  const type = category(v);

  const heroImage = (
    <img
      src={v.cover}
      alt={`${v.name} storefront`}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      width={1600}
      height={1400}
    />
  );

  const stats = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs">
      {v.verified && (
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-4" style={{ color: th.accent }} />
          Verified store
        </span>
      )}

      <span className="inline-flex items-center gap-1.5">
        <Star className="size-3.5" fill={th.accent} stroke={th.accent} />
        {v.rating} ({v.reviews} reviews)
      </span>

      <span className="opacity-60">{v.orders}</span>
    </div>
  );

  switch (tpl.hero) {
    case "centered":
      return (
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div
            className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl text-xl font-bold"
            style={{ background: th.soft, color: th.accent }}
          >
            {v.monogram}
          </div>

          <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>

          <Heading vendor={v} tpl={tpl} className="mx-auto mt-5 max-w-4xl text-5xl sm:text-7xl">
            {v.name}
          </Heading>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 opacity-60 sm:text-base">
            {v.tagline}
          </p>

          <div className="mt-6 flex justify-center">
            <StoreBadges vendor={v} />
          </div>

          <div className="mt-8 flex justify-center">
            <Button vendor={v}>{cta(v)}</Button>
          </div>

          <div className="group mt-12 overflow-hidden rounded-2xl" style={{ background: th.soft }}>
            <div className="aspect-[16/9] max-h-[580px]">{heroImage}</div>
          </div>
        </section>
      );

    case "banner":
      return (
        <section className="relative isolate min-h-[540px] overflow-hidden sm:min-h-[690px]">
          <div className="absolute inset-0">{heroImage}</div>

          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${th.bg} 0%, ${th.bg}ee 32%, ${th.bg}75 70%, ${th.bg}25 100%)`,
            }}
          />

          <div className="relative mx-auto flex min-h-[540px] max-w-6xl items-end px-5 py-16 sm:min-h-[690px] sm:px-6 sm:py-24">
            <div className="max-w-2xl">
              <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>

              <Heading vendor={v} tpl={tpl} className="mt-6 text-5xl sm:text-7xl">
                {v.name}
              </Heading>

              <p className="mt-6 max-w-lg text-sm leading-8 opacity-75 sm:text-base">{v.tagline}</p>

              <div className="mt-7">
                <StoreBadges vendor={v} />
              </div>

              <div className="mt-8">
                <Button vendor={v}>{cta(v)}</Button>
              </div>
            </div>
          </div>
        </section>
      );

    case "poster":
      return (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
          <div
            className="grid overflow-hidden rounded-2xl md:grid-cols-[1fr_0.95fr]"
            style={{ background: th.soft, color: th.ink }}
          >
            <div className="flex flex-col justify-center p-7 sm:p-12">
              <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>

              <Heading vendor={v} tpl={tpl} className="mt-5 text-5xl sm:text-7xl">
                {v.name}
              </Heading>

              <p className="mt-5 max-w-md text-sm leading-8 opacity-65">{v.tagline}</p>

              <div className="mt-7">
                <StoreBadges vendor={v} />
              </div>

              <div className="mt-8">
                <Button vendor={v}>{cta(v)}</Button>
              </div>
            </div>

            <div className="group min-h-[300px] overflow-hidden md:min-h-[540px]">{heroImage}</div>
          </div>
        </section>
      );

    case "minimal":
      return (
        <section
          className="mx-auto max-w-6xl border-b px-4 py-16 sm:px-6 sm:py-24"
          style={{ borderColor: th.line }}
        >
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>
              <Heading vendor={v} tpl={tpl} className="mt-5 max-w-3xl text-5xl sm:text-7xl">
                {v.name}
              </Heading>
              <p className="mt-5 max-w-xl text-sm leading-8 opacity-65">{v.about}</p>
            </div>

            <div className="flex flex-col items-start gap-5 md:items-end">
              <StoreBadges vendor={v} />
              <Button vendor={v}>{cta(v)}</Button>
            </div>
          </div>

          <div className="group mt-12 overflow-hidden rounded-2xl">
            <div className="aspect-[16/7]">{heroImage}</div>
          </div>
        </section>
      );

    case "magazine":
      return (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
          <div
            className="flex items-center justify-between border-y py-4 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-55"
            style={{ borderColor: th.line }}
          >
            <span>{v.categoryLabel}</span>
            <span className="hidden sm:inline">A Peniel feature</span>
            <span>{v.location.split(",")[0]}</span>
          </div>

          <Heading vendor={v} tpl={tpl} className="mt-10 text-center text-5xl sm:text-8xl">
            {v.name}
          </Heading>

          <div className="mt-12 grid items-center gap-8 md:grid-cols-[0.8fr_1.5fr_0.8fr]">
            <p className="text-sm leading-8 opacity-65">{v.about}</p>

            <div className="group overflow-hidden rounded-2xl">
              <div className="aspect-[4/3]">{heroImage}</div>
            </div>

            <div className="flex flex-col items-start gap-5">
              <p className="text-2xl leading-tight" style={{ fontFamily: th.heading }}>
                {v.tagline}
              </p>
              <StoreBadges vendor={v} />
              <Button vendor={v}>{cta(v)}</Button>
            </div>
          </div>
        </section>
      );

    case "marquee":
      return (
        <>
          <div
            className="overflow-hidden border-y py-3"
            style={{
              background: th.soft,
              color: th.ink,
              borderColor: th.line,
            }}
          >
            <div className="whitespace-nowrap text-center text-[9px] font-semibold uppercase tracking-[0.25em]">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="mx-8">
                  {v.tagline} <span style={{ color: th.accent }}>✦</span> {v.categoryLabel}
                </span>
              ))}
            </div>
          </div>

          <section className="mx-auto grid max-w-6xl items-center gap-9 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-[1fr_1.1fr]">
            <div>
              <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>
              <Heading vendor={v} tpl={tpl} className="mt-5 text-5xl sm:text-7xl">
                {v.name}
              </Heading>
              <p className="mt-5 max-w-md text-sm leading-8 opacity-65">{v.tagline}</p>
              <div className="mt-7">
                <StoreBadges vendor={v} />
              </div>
              <div className="mt-8">
                <Button vendor={v}>{cta(v)}</Button>
              </div>
            </div>

            <div className="group overflow-hidden rounded-2xl">
              <div className="aspect-[5/4]">{heroImage}</div>
            </div>
          </section>
        </>
      );

    case "split":
    default:
      return (
        <section className="mx-auto grid max-w-6xl items-center gap-9 px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
          <div className="order-2 md:order-1">
            <Eyebrow color={th.accent}>{v.categoryLabel}</Eyebrow>

            <Heading vendor={v} tpl={tpl} className="mt-5 max-w-xl text-[clamp(2.7rem,7vw,5.5rem)]">
              {v.name}
            </Heading>

            <p className="mt-5 max-w-md text-sm leading-8 opacity-65 sm:text-base">{v.tagline}</p>

            <div className="mt-6">
              <StoreBadges vendor={v} />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button vendor={v}>{cta(v)}</Button>
              <Button vendor={v} ghost href="#about">
                About us
              </Button>
            </div>

            <div className="mt-9 border-t pt-5" style={{ borderColor: th.line }}>
              <StoreMeta vendor={v} />
            </div>
          </div>

          <div className="group relative order-1 md:order-2">
            <div
              className="aspect-[5/4] overflow-hidden rounded-2xl sm:aspect-[4/5] md:aspect-[5/6]"
              style={{ background: th.soft }}
            >
              {heroImage}
            </div>

            <div
              className="absolute -bottom-5 left-4 right-4 rounded-2xl border p-4 sm:left-auto sm:right-5 sm:w-[260px]"
              style={{
                background: th.bg,
                borderColor: th.line,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-widest opacity-50">
                    Customer rating
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">
                    {v.rating}
                    <span className="ml-1 text-xs opacity-45">/ 5.0</span>
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-3" fill={th.accent} stroke={th.accent} />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-[10px] opacity-50">Based on {v.reviews} customer reviews</p>
            </div>
          </div>
        </section>
      );
  }
}

/* ───────────────── PRODUCT CARDS ───────────────── */

function ProductCard({
  vendor: v,
  product: p,
  index,
  tall = false,
}: {
  vendor: Vendor;
  product: Product;
  index: number;
  tall?: boolean;
}) {
  const th = v.theme;
  const fashion = category(v) === "fashion";
  const electronics = category(v) === "electronics";

  return (
    <ItemLink
      vendor={v}
      product={p}
      className="group block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{
        borderColor: th.line,
        background: th.bg,
      }}
    >
      <div className="relative overflow-hidden">
        <ItemArt
          vendor={v}
          seed={index}
          label={p.name}
          className={[
            tall || fashion ? "aspect-[3/4]" : "aspect-[4/3]",
            "w-full transition-transform duration-700 group-hover:scale-[1.04]",
          ].join(" ")}
        />

        {p.tag && (
          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider"
            style={{
              background: th.bg,
              color: th.ink,
              border: `1px solid ${th.line}`,
            }}
          >
            {p.tag}
          </span>
        )}

        {electronics && p.group && (
          <span
            className="absolute bottom-3 left-3 rounded-full border px-2.5 py-1 text-[9px] font-semibold backdrop-blur-md"
            style={{
              background: th.bg,
              color: th.ink,
              borderColor: th.line,
            }}
          >
            {p.group}
          </span>
        )}

        <span
          className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-lg transition-all duration-300 group-hover:scale-110"
          style={{
            background: th.accent,
            color: th.accentInk,
          }}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>

      <div className="p-3.5 sm:p-4">
        <p className="truncate text-sm font-semibold tracking-tight">{p.name}</p>

        {p.desc && !fashion && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 opacity-50">{p.desc}</p>
        )}

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-sm font-bold tabular-nums" style={{ color: th.accent }}>
            {naira(p.price)}
          </p>
          <span className="text-[9px] font-medium uppercase tracking-wider opacity-40">
            View item
          </span>
        </div>
      </div>
    </ItemLink>
  );
}

/* ───────────────── CATALOGUE ───────────────── */

function CatalogBlock({ vendor: v, tpl }: P) {
  const items = v.products;
  const th = v.theme;
  const type = category(v);

  switch (tpl.catalog) {
    case "list":
      return (
        <div className="space-y-12 sm:space-y-16">
          {v.groups.map((group, groupIndex) => {
            const groupItems = items.filter((p) => p.group === group);
            if (!groupItems.length) return null;

            return (
              <div key={group}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <Eyebrow color={th.accent}>
                      {String(groupIndex + 1).padStart(2, "0")} / COLLECTION
                    </Eyebrow>
                    <h3
                      className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
                      style={{ fontFamily: th.heading }}
                    >
                      {group}
                    </h3>
                  </div>
                  <span className="pb-1 text-[10px] uppercase tracking-wider opacity-45">
                    {groupItems.length} items
                  </span>
                </div>

                <div className="mb-5 h-px" style={{ background: th.line }} />

                <div className="grid gap-3">
                  {groupItems.map((p, i) => (
                    <ItemLink
                      key={p.id}
                      vendor={v}
                      product={p}
                      className="group block overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                      style={{
                        borderColor: th.line,
                        background: th.bg,
                      }}
                    >
                      <div className="flex flex-col gap-4 p-3.5 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                        <div className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                          <ItemArt
                            vendor={v}
                            seed={i + groupIndex * 3}
                            label={p.name}
                            className="aspect-[16/10] w-full sm:aspect-square"
                          />
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-semibold sm:text-lg">{p.name}</h4>
                            {p.desc && (
                              <p className="mt-1.5 max-w-lg text-xs leading-6 opacity-55 sm:text-sm">
                                {p.desc}
                              </p>
                            )}
                            {p.meta && (
                              <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] opacity-55">
                                <Clock className="size-3" />
                                {p.meta}
                              </span>
                            )}
                          </div>

                          <div className="flex shrink-0 items-center justify-between gap-4 border-t pt-3 sm:min-w-[130px] sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                            <div className="sm:text-right">
                              <p className="text-[9px] uppercase tracking-wider opacity-45">
                                Price
                              </p>
                              <p
                                className="mt-1 text-lg font-bold tabular-nums"
                                style={{ color: th.accent }}
                              >
                                {naira(p.price)}
                              </p>
                            </div>
                            <ArrowRight className="size-4" style={{ color: th.accent }} />
                          </div>
                        </div>
                      </div>
                    </ItemLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "masonry":
      return (
        <div className="columns-2 gap-3 sm:gap-5 md:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid sm:[&>*]:mb-5">
          {items.map((p, i) => (
            <div key={p.id}>
              <ProductCard vendor={v} product={p} index={i} tall={i % 3 === 0} />
            </div>
          ))}
        </div>
      );

    case "rail":
      return (
        <div className="space-y-10">
          {v.groups.map((group) => {
            const groupItems = items.filter((p) => p.group === group);
            if (!groupItems.length) return null;

            return (
              <div key={group}>
                <div className="mb-4 flex items-baseline justify-between">
                  <h3
                    className="text-xl font-semibold tracking-tight"
                    style={{ fontFamily: th.heading }}
                  >
                    {group}
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider opacity-45">
                    {groupItems.length} items
                  </span>
                </div>

                <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-4">
                  {groupItems.map((p, i) => (
                    <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-64">
                      <ProductCard vendor={v} product={p} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "board":
      return (
        <div
          className="grid gap-x-12 gap-y-10 rounded-2xl border p-5 sm:grid-cols-2 sm:p-10"
          style={{
            background: th.soft,
            borderColor: th.line,
          }}
        >
          {v.groups.map((group) => {
            const groupItems = items.filter((p) => p.group === group);
            if (!groupItems.length) return null;

            return (
              <div key={group}>
                <h3
                  className="mb-4 border-b pb-3 text-lg font-semibold"
                  style={{ fontFamily: th.heading, borderColor: th.accent }}
                >
                  {group}
                </h3>
                <div className="space-y-4">
                  {groupItems.map((p) => (
                    <ItemLink
                      key={p.id}
                      vendor={v}
                      product={p}
                      className="flex items-baseline gap-2 text-sm transition-opacity hover:opacity-65"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="flex-1 border-b border-dotted opacity-30" />
                      <span className="font-semibold tabular-nums">{naira(p.price)}</span>
                    </ItemLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case "bento":
      return (
        <div className="grid auto-rows-[180px] grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {items.map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={v}
              product={p}
              className={[
                "group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1",
                i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-2" : "",
              ].join(" ")}
              style={{
                background: i % 2 === 0 ? th.soft : th.accent,
                color: i % 2 === 0 ? th.ink : th.accentInk,
              }}
            >
              <span className="text-[9px] font-semibold uppercase tracking-widest opacity-60">
                {p.group}
              </span>
              <span
                className={[
                  "mt-2 block font-semibold leading-tight",
                  i === 0 ? "text-3xl sm:text-4xl" : "text-lg",
                ].join(" ")}
                style={{ fontFamily: th.heading }}
              >
                {p.name}
              </span>
              {i === 0 && p.desc && (
                <span className="mt-3 block max-w-xs text-sm leading-6 opacity-70">{p.desc}</span>
              )}
              <span className="absolute bottom-5 left-5 text-sm font-bold tabular-nums">
                {naira(p.price)}
              </span>
              <span
                className="absolute bottom-5 right-5 grid size-9 place-items-center rounded-full"
                style={{
                  background: i % 2 === 0 ? th.accent : th.bg,
                  color: i % 2 === 0 ? th.accentInk : th.ink,
                }}
              >
                <Plus className="size-4" />
              </span>
            </ItemLink>
          ))}
        </div>
      );

    case "polaroid":
      return (
        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {items.map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={v}
              product={p}
              className="group block rounded-2xl border p-2.5 pb-4 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-3 sm:pb-5"
              style={{
                background: th.bg,
                borderColor: th.line,
              }}
            >
              <ItemArt vendor={v} seed={i} label={p.name} className="aspect-square rounded-xl" />
              <p className="mt-3 truncate text-center text-sm font-medium">{p.name}</p>
              <p className="mt-1 text-center text-sm font-bold" style={{ color: th.accent }}>
                {naira(p.price)}
              </p>
            </ItemLink>
          ))}
        </div>
      );

    case "cards":
    default:
      return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} vendor={v} product={p} index={i} tall={type === "fashion"} />
          ))}
        </div>
      );
  }
}

/* ───────────────── TRUST STRIP ───────────────── */

function TrustSection({ vendor: v }: { vendor: Vendor }) {
  const th = v.theme;

  const items = [
    {
      icon: PackageCheck,
      title: "Delivery & fulfilment",
      detail: v.delivery.split(".")[0],
    },
    {
      icon: Star,
      title: "Customer rating",
      detail: `${v.rating} average · ${v.reviews} reviews`,
    },
    {
      icon: Clock,
      title: "Opening hours",
      detail: v.hours,
    },
  ];

  return (
    <section
      id="reviews"
      className="border-y"
      style={{ borderColor: th.line, background: th.soft }}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 px-4 sm:grid-cols-3 sm:px-6">
        {items.map((item, index) => (
          <div
            key={item.title}
            className={[
              "flex items-start gap-3 py-5 sm:px-5 sm:py-7",
              index > 0 ? "border-t sm:border-l sm:border-t-0" : "",
            ].join(" ")}
            style={{ borderColor: th.line }}
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-xl border"
              style={{
                background: th.bg,
                color: th.accent,
                borderColor: th.line,
              }}
            >
              <item.icon className="size-4" strokeWidth={1.7} />
            </span>

            <span className="min-w-0">
              <span className="block text-[9px] font-bold uppercase tracking-widest opacity-50">
                {item.title}
              </span>
              <span className="mt-1 block text-sm font-medium leading-6">{item.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────────── BRAND STORY ───────────────── */

function BrandStory({ vendor: v, tpl }: P) {
  const th = v.theme;

  return (
    <section id="about" className="border-y" style={{ borderColor: th.line, background: th.soft }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-[1fr_0.7fr] md:items-center md:gap-16">
        <div className="max-w-2xl">
          <Eyebrow color={th.accent}>The story behind the brand</Eyebrow>

          <h2
            className={[
              "mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl",
              tpl.caps ? "uppercase" : "",
            ].join(" ")}
            style={{ fontFamily: th.heading }}
          >
            A little about {v.name}
          </h2>

          <p className="mt-5 text-sm leading-8 opacity-65 sm:text-base">{v.about}</p>

          <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
            {v.verified && (
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4" style={{ color: th.accent }} />
                Verified Peniel store
              </span>
            )}

            <span className="inline-flex items-center gap-2">
              <Sparkles className="size-4" style={{ color: th.accent }} />
              {v.rating} customer rating
            </span>
          </div>
        </div>

        <div
          className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:p-9"
          style={{
            background: th.bg,
            borderColor: th.line,
          }}
        >
          <span
            className="grid size-12 place-items-center rounded-xl"
            style={{ background: th.soft, color: th.accent }}
          >
            <Zap className="size-5" />
          </span>

          <Eyebrow color={th.accent}>Ready when you are</Eyebrow>

          <p
            className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl"
            style={{ fontFamily: th.heading }}
          >
            Find something you will love.
          </p>

          <p className="text-sm leading-7 opacity-60">
            Explore the collection and connect directly with {v.name}.
          </p>

          <Button vendor={v}>{cta(v)}</Button>
        </div>
      </div>
    </section>
  );
}

/* ───────────────── MAIN STOREFRONT ───────────────── */

export function ComposedStore({ vendor, tpl }: P) {
  const v = vendor;
  const th = v.theme;
  const type = category(v);

  const catalogueTitle =
    type === "electronics"
      ? "Tech, thoughtfully selected"
      : type === "fashion"
        ? "The collection"
        : type === "beauty"
          ? "Our treatments & services"
          : type === "food"
            ? "Explore our menu"
            : type === "hospitality"
              ? "Rooms & experiences"
              : v.fulfilment === "booking"
                ? "Explore our services"
                : v.fulfilment === "order"
                  ? "Explore our collection"
                  : "Explore available options";

  const catalogueDescription =
    type === "electronics"
      ? "Explore phones, laptops, audio, accessories and dependable repairs from one trusted store."
      : type === "fashion"
        ? "Discover thoughtfully designed pieces, carefully selected fabrics and timeless styles."
        : type === "beauty"
          ? "Explore our services and find the right experience for you."
          : type === "food"
            ? "Explore our selection and find something you will love."
            : type === "hospitality"
              ? "Discover comfortable spaces and experiences for your next stay."
              : v.fulfilment === "booking"
                ? "Find the service that is right for you and choose your preferred option."
                : v.fulfilment === "order"
                  ? "Discover what we have prepared for you."
                  : "Explore the options available for your stay.";

  const catalogueLabel =
    type === "electronics"
      ? "Devices & essentials"
      : type === "fashion"
        ? "Selected pieces"
        : type === "beauty"
          ? "Our services"
          : type === "food"
            ? "Freshly prepared"
            : type === "hospitality"
              ? "Stay with us"
              : "Our catalogue";

  return (
    <div
      className="min-h-screen overflow-x-hidden antialiased"
      style={{
        background: th.bg,
        color: th.ink,
      }}
    >
      <HeroBlock vendor={v} tpl={tpl} />

      <TrustSection vendor={v} />

      {/* Catalogue */}
      <section
        id="catalogue"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <Eyebrow color={th.accent}>{catalogueLabel}</Eyebrow>

            <h2
              className={[
                "mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl",
                tpl.caps ? "uppercase" : "",
              ].join(" ")}
              style={{ fontFamily: th.heading }}
            >
              {catalogueTitle}
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 opacity-60">{catalogueDescription}</p>
          </div>

          <span
            className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              borderColor: th.line,
              background: th.soft,
            }}
          >
            <span className="size-1.5 rounded-full" style={{ background: th.accent }} />
            {v.products.length} {v.products.length === 1 ? "item" : "items"}
          </span>
        </div>

        <CatalogBlock vendor={v} tpl={tpl} />
      </section>

      <BrandStory vendor={v} tpl={tpl} />

      {/* Store contact */}
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pb-12 sm:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <span
                className="grid size-12 place-items-center rounded-xl text-sm font-bold"
                style={{ background: th.accent, color: th.accentInk }}
              >
                {v.monogram}
              </span>

              <div>
                <p className="text-sm font-bold">{v.name}</p>
                <p className="mt-0.5 text-[10px] opacity-50">Official Peniel store</p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-xs leading-7 opacity-55">{v.about}</p>

            <div className="mt-4">
              <StoreBadges vendor={v} />
            </div>
          </div>

          <div>
            <Eyebrow color={th.accent}>Find us</Eyebrow>
            <div className="mt-5 flex items-start gap-2 text-xs leading-6 opacity-65">
              <MapPin className="mt-1 size-4 shrink-0" style={{ color: th.accent }} />
              {v.location}
            </div>

            <div className="mt-4 flex items-start gap-2 text-xs leading-6 opacity-65">
              <Clock className="mt-1 size-4 shrink-0" style={{ color: th.accent }} />
              {v.hours}
            </div>
          </div>

          <div>
            <Eyebrow color={th.accent}>Get in touch</Eyebrow>

            <a
              href={`/messages?v=${v.slug}`}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{
                background: th.accent,
                color: th.accentInk,
              }}
            >
              <MessageCircle className="size-4" />
              Chat with us
              <ArrowUpRight className="size-3.5" />
            </a>

            <p className="mt-4 text-[10px] leading-6 opacity-45">
              Your contact details stay private on Peniel. All conversations are protected.
            </p>
          </div>
        </div>

        <div
          className="mt-12 flex flex-col gap-3 border-t pt-6 text-[10px] opacity-45 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: th.line }}
        >
          <p>
            © {new Date().getFullYear()} {v.name}. All rights reserved.
          </p>
          <a href="/" className="font-semibold transition-opacity hover:opacity-100">
            Powered by Peniel · Payments secured by Peniel Pay
          </a>
        </div>
      </footer>
    </div>
  );
}
