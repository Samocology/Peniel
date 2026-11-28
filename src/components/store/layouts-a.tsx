import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, MessageCircle, PackageCheck, ShieldCheck, Star, Sparkles, Truck } from "lucide-react";
import type { Vendor } from "@/lib/data";
import { ItemArt, ItemLink, Price } from "./store-kit";

export function StoreSidebar({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <aside
      className="h-fit border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
      style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft }}
    >
      {vendor.verified && (
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold" style={{ background: `${t.accent}14`, color: t.accent }}>
          <ShieldCheck className="size-3.5" /> Verified business
        </span>
      )}
      <h2 className="mt-4 text-lg font-semibold" style={{ fontFamily: t.heading }}>{vendor.name}</h2>
      <p className="mt-2 text-sm leading-relaxed opacity-65">{vendor.about}</p>
      <p className="mt-4 flex items-center gap-2 text-xs leading-relaxed opacity-60">
        <MapPin className="size-3.5" /> {vendor.location}
      </p>
      <p className="mt-2 flex items-center gap-2 text-xs leading-relaxed opacity-60">
        <Clock className="size-3.5" /> {vendor.hours}
      </p>
      <Link
        to="/messages"
        search={{ v: vendor.slug }}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold"
        style={{ background: t.accent, color: t.accentInk }}
      >
        <MessageCircle className="size-4" /> Contact store <ArrowRight className="size-4" />
      </Link>
    </aside>
  );
}

/** Signature layout for fresh-food and restaurant vendors. */
export function BuilderStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const groups = vendor.groups.length
    ? vendor.groups
    : [...new Set(vendor.products.map((product) => product.group))];

  const type = vendor.type === "restaurant" ? "restaurant" : "fresh-food";
  const hasReviews = Number(vendor.reviews) > 0 && Number(vendor.rating) > 0;
  const rating = Number(vendor.rating);
  const reviewCount = Number(vendor.reviews);

  return (
    <div
      className="storefront-page storefront-signature-builder min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Full bleed with floating card */}
      <section
        className="relative isolate overflow-hidden px-5 pb-16 pt-24 sm:px-8 sm:pb-22 sm:pt-28 lg:pb-28"
        style={{ background: t.soft }}
      >
        {vendor.cover && (
          <img
            src={vendor.cover}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-15"
            width={1800}
            height={900}
          />
        )}
        <div className="mx-auto grid max-w-7xl items-end gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="max-w-3xl">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em]"
              style={{ borderColor: t.line, color: t.accent }}
            >
              <PackageCheck className="size-3.5" /> {vendor.categoryLabel || "Storefront"}
            </span>
            <h1
              className="mt-6 text-4xl leading-[1.02] font-semibold tracking-[-0.055em] sm:text-5xl lg:text-6xl xl:text-7xl"
              style={{ fontFamily: t.heading }}
            >
              {vendor.name}
            </h1>
            {vendor.tagline && (
              <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed sm:text-xl" style={{ color: t.accent }}>
                {vendor.tagline}
              </p>
            )}
            {vendor.about && (
              <p className="mt-3 max-w-xl text-sm leading-7 opacity-70 sm:text-base">
                {vendor.about}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span
                className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs"
                style={{ borderColor: t.line, background: `${t.bg}99` }}
              >
                <Star className="size-3.5" style={{ color: t.accent }} fill={hasReviews ? t.accent : "none"} />
                {hasReviews ? (
                  <>
                    <strong>{rating.toFixed(1)}</strong>
                    <span className="opacity-65">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
                  </>
                ) : (
                  <>
                    <strong>New on Peniel</strong>
                    <span className="opacity-65">· Be the first to review</span>
                  </>
                )}
              </span>
              {vendor.orders && !/^0(?:\s|$)/.test(vendor.orders) && !/^new on peniel$/i.test(vendor.orders) && (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: t.line, background: `${t.bg}99` }}>
                  <PackageCheck className="size-3.5" style={{ color: t.accent }} /> {vendor.orders}
                </span>
              )}
              {vendor.verified && (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: `${t.accent}55`, background: `${t.accent}12` }}>
                  <ShieldCheck className="size-3.5" style={{ color: t.accent }} /> Verified
                </span>
              )}
            </div>
            <a
              href="#catalogue"
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full px-6 text-xs font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: t.accent, color: t.accentInk }}
            >
              {type === "restaurant" ? "Explore our menu" : "Explore the catalogue"} <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="hidden lg:block">
            <StoreSidebar vendor={vendor} />
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS STRIP */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8" aria-label="Highlights">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: Sparkles, title: type === "restaurant" ? "Chef's specials" : "Farm fresh daily", desc: type === "restaurant" ? "Hand-crafted signatures" : "Harvested this morning" },
            { icon: Truck, title: type === "restaurant" ? "Quick delivery" : "Cold-chain logistics", desc: type === "restaurant" ? "30-45 min to your door" : "Temperature controlled" },
            { icon: ShieldCheck, title: "Quality assured", desc: "Every item inspected" },
            { icon: Star, title: "Customer favourites", desc: "Top-rated by locals" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <div
                className="grid size-11 place-items-center"
                style={{
                  background: t.bg,
                  color: t.accent,
                  borderRadius: t.radius,
                }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOGUE */}
      <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
              Made available by {vendor.name}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl" style={{ fontFamily: t.heading }}>
              {type === "restaurant" ? "Our menu" : "Fresh catalogue"}
            </h2>
          </div>
          <span className="text-xs opacity-55">{vendor.products.length} {vendor.products.length === 1 ? "item" : "items"}</span>
        </div>

        {vendor.products.length === 0 ? (
          <div className="rounded-2xl border border-dashed px-6 py-16 text-center" style={{ borderColor: t.line }}>
            <PackageCheck className="mx-auto size-8 opacity-45" />
            <h3 className="mt-4 text-lg font-semibold">The catalogue is being prepared</h3>
            <p className="mt-2 text-sm opacity-60">Please check back soon or contact {vendor.name}.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {(groups.length ? groups : ["Available items"]).map((group) => {
              const products = vendor.products.filter((product) => product.group === group);
              if (!products.length) return null;
              return (
                <section key={group} aria-label={group}>
                  <div className="mb-5 flex items-center justify-between border-b pb-3" style={{ borderColor: t.line }}>
                    <h3 className="text-lg font-semibold" style={{ fontFamily: t.heading }}>{group}</h3>
                    <span className="text-[10px] uppercase tracking-wider opacity-50">{products.length} items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product, index) => (
                      <ItemLink
                        key={product.id}
                        vendor={vendor}
                        product={product}
                        className="group min-w-0 overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                        style={{ borderColor: t.line, background: t.bg }}
                      >
                        <div className="aspect-[4/3] overflow-hidden" style={{ background: t.soft }}>
                          <ItemArt vendor={vendor} seed={index} image={product.images?.[0]} className="transition duration-500 group-hover:scale-105" />
                        </div>
                        <div className="p-3.5 sm:p-4">
                          <h4 className="line-clamp-2 text-sm font-semibold">{product.name}</h4>
                          {product.desc && <p className="mt-1.5 line-clamp-2 text-xs leading-5 opacity-55">{product.desc}</p>}
                          <div className="mt-3 flex items-center justify-between">
                            <Price value={product.price} vendor={vendor} />
                            <span className="text-[9px] font-medium uppercase tracking-wider opacity-40">View</span>
                          </div>
                        </div>
                      </ItemLink>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="mx-auto max-w-7xl px-4 pb-14 sm:px-8">
        <div className="grid gap-6 rounded-3xl p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-10" style={{ background: t.soft }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: t.accent }}>A direct connection</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>Good service starts with a real conversation.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 opacity-65">Ask {vendor.name} about availability, product details or your order before you decide.</p>
          </div>
          <Link to="/messages" search={{ v: vendor.slug }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-xs font-bold" style={{ background: t.accent, color: t.accentInk }}>
            Message the store <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}

/** Cinematic signature - moody full-bleed with floating identity */
export function CinematicStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const hasReviews = Number(vendor.reviews) > 0 && Number(vendor.rating) > 0;
  const rating = Number(vendor.rating);
  const reviewCount = Number(vendor.reviews);

  return (
    <div
      className="storefront-page storefront-signature-cinematic min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Full viewport cinematic */}
      <section className="relative isolate min-h-screen overflow-hidden">
        {vendor.cover ? (
          <img
            src={vendor.cover}
            alt={vendor.name}
            className="absolute inset-0 -z-20 h-full w-full object-cover"
            width={2000}
            height={1400}
            fetchPriority="high"
          />
        ) : (
          <div
            className="absolute inset-0 -z-20 flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 70% 25%, ${t.accent}45, transparent 38%), linear-gradient(135deg, ${t.soft}, ${t.bg})`,
            }}
          >
            <span
              className="grid size-28 place-items-center rounded-[2rem] border border-white/20 bg-white/10 text-4xl font-semibold text-white/80 backdrop-blur"
              style={{ fontFamily: t.heading }}
            >
              {vendor.monogram}
            </span>
          </div>
        )}

        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/65 to-black/10" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-transparent to-black/15" />

        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center px-5 pb-20 pt-20 sm:px-10 lg:px-16">
          <div className="max-w-3xl text-white">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-semibold tracking-[0.17em] text-white/90 uppercase backdrop-blur-md"
              >
                <Sparkles className="size-3.5 text-amber-300" />
                {vendor.categoryLabel}
              </span>
              {hasReviews ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-white/85">
                  <Star className="size-4 fill-amber-300 text-amber-300" />
                  <strong className="text-white">{rating.toFixed(1)}</strong>
                  <span className="text-white/70">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur-md">
                  <span className="size-1.5 rounded-full" style={{ background: t.accent }} />
                  New on Peniel
                </span>
              )}
            </div>

            <h1 className="mt-6 max-w-2xl text-[clamp(2.8rem,6vw,5rem)] font-medium leading-[0.96] tracking-[-0.04em]" style={{ fontFamily: t.heading }}>
              {vendor.name}
            </h1>

            {vendor.tagline && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70" style={{ fontFamily: t.heading, fontWeight: 400 }}>
                {vendor.tagline}
              </p>
            )}

            {vendor.about && vendor.about !== vendor.tagline && (
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                {vendor.about}
              </p>
            )}

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#catalogue"
                className="inline-flex min-h-12 items-center justify-center gap-3 px-6 py-3 text-xs font-bold transition hover:-translate-y-0.5 hover:opacity-90 sm:text-sm"
                style={{
                  background: t.accent,
                  color: t.accentInk,
                  borderRadius: t.radius,
                }}
              >
                Explore collection <ArrowRight className="size-4" />
              </a>
              <a
                href="#about"
                className="inline-flex min-h-12 items-center justify-center gap-2 border border-white/30 bg-white/5 px-5 py-3 text-xs font-semibold text-white transition hover:bg-white/15 sm:text-sm"
                style={{ borderRadius: t.radius }}
              >
                Our story
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/20 pt-6">
              {[
                { icon: ShieldCheck, label: "Verified business" },
                hasReviews ? { icon: Star, label: `${rating.toFixed(1)}★ (${reviewCount} ${reviewCount === 1 ? "review" : "reviews"})` } : { icon: Star, label: "New on Peniel" },
                { icon: MapPin, label: vendor.location.split(",")[0] },
                { icon: Clock, label: vendor.hours.split(".")[0] },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 text-[11px] text-white/75">
                  <Icon className="size-4 text-amber-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 right-6 hidden items-center gap-3 text-[9px] font-semibold tracking-[0.2em] text-white/50 uppercase lg:flex">
          <span className="h-px w-12 bg-white/40" />
          Discover {vendor.name}
        </div>
      </section>

      {/* CATALOGUE - Editorial cards */}
      <section id="catalogue" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24" style={{ background: t.soft }}>
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: t.accent }}>
              Curated by {vendor.name}
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl" style={{ fontFamily: t.heading }}>
              Signature collection
            </h2>
            <p className="mt-3 text-sm opacity-55">Hand-selected favourites and new arrivals.</p>
          </div>
          <span className="text-xs opacity-50">{vendor.products.length} items</span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {vendor.products.slice(0, 8).map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={vendor}
              product={p}
              className="group flex min-w-0 flex-col overflow-hidden border transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.bg,
              }}
            >
              <div className="relative overflow-hidden">
                <ItemArt
                  vendor={vendor}
                  seed={i}
                  label={p.name}
                  image={p.images?.[0]}
                  className="h-56 w-full transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />
                {p.tag && (
                  <span
                    className="absolute left-4 top-4 px-3 py-2 text-[9px] font-bold tracking-[0.12em] uppercase"
                    style={{
                      background: t.accent,
                      color: t.accentInk,
                      borderRadius: t.radius,
                    }}
                  >
                    {p.tag}
                  </span>
                )}
                <span className="absolute bottom-4 right-4 flex items-center gap-1.5 text-[10px] font-medium text-white">
                  <Star className="size-3 fill-amber-300 text-amber-300" />
                  Popular
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                    <p className="mt-1 text-[11px] opacity-50">{p.meta || "Signature item"}</p>
                  </div>
                  <Sparkles className="mt-1 size-5 shrink-0" style={{ color: t.accent }} />
                </div>
                <p className="mt-4 line-clamp-3 text-xs leading-6 opacity-60">{p.desc}</p>
                <div className="mt-6 flex items-end justify-between gap-3 border-t pt-5" style={{ borderColor: t.line }}>
                  <div className="min-w-0">
                    <p className="text-[10px] opacity-45">Price</p>
                    <div className="mt-1"><Price value={p.price} vendor={vendor} /></div>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-2 px-4 py-3 text-[11px] font-bold transition group-hover:opacity-80" style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}>
                    View <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            </ItemLink>
          ))}
        </div>

        {vendor.products.length > 8 && (
          <div className="mt-10 text-center">
            <a
              href="#catalogue"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-6 text-xs font-bold transition hover:bg-muted/60"
              style={{ borderColor: t.line, color: t.ink }}
            >
              View all {vendor.products.length} items <ArrowRight className="size-4" />
            </a>
          </div>
        )}
      </section>

      {/* BRAND STORY */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24" style={{ background: t.bg }}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: t.accent }}>
              The story behind the brand
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl" style={{ fontFamily: t.heading }}>
              Thoughtfully crafted for every occasion.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 opacity-60">{vendor.about}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
              {vendor.verified && (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" style={{ color: t.accent }} />
                  Verified Peniel store
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="size-4" style={{ color: t.accent }} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? `${Number(vendor.rating).toFixed(1)} customer rating` : "New on Peniel"}
              </span>
            </div>
          </div>
          <div className="relative min-h-[340px] overflow-hidden rounded-[2rem]">
            {vendor.cover ? (
              <img
                src={vendor.cover}
                alt={`${vendor.name} ambience`}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 70% 20%, ${t.accent}55, transparent 42%), linear-gradient(145deg, ${t.soft}, ${t.bg})`,
                }}
              >
                <span
                  className="grid size-24 place-items-center rounded-[2rem] border border-white/20 bg-white/10 text-3xl font-semibold text-white/80"
                  style={{ fontFamily: t.heading }}
                >
                  {vendor.monogram}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
              <p className="text-[10px] font-semibold tracking-[0.24em] text-white/65 uppercase">
                Visit us
              </p>
              <h3 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">{vendor.name}</h3>
              <p className="mt-3 max-w-sm text-xs leading-6 text-white/70">
                Experience the difference of a business that cares.
              </p>
              <a
                href="#catalogue"
                className="mt-6 inline-flex items-center gap-2 text-xs font-semibold transition hover:gap-3"
              >
                Explore collection <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}

/** Gallery signature - full-height lookbook, asymmetric grid */
export function GalleryStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const hasReviews = Number(vendor.reviews) > 0 && Number(vendor.rating) > 0;
  const rating = Number(vendor.rating);
  const reviewCount = Number(vendor.reviews);

  return (
    <div
      className="storefront-page storefront-signature-gallery min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Full height lookbook */}
      <section className="relative isolate min-h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          {vendor.cover ? (
            <img
              src={vendor.cover}
              alt={vendor.name}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
              width={1800}
              height={1600}
              fetchPriority="high"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle at 70% 20%, ${t.accent}25, transparent 42%), linear-gradient(145deg, ${t.soft}, ${t.bg})`,
              }}
            >
              <span
                className="grid size-24 place-items-center rounded-[2rem] border text-3xl font-semibold"
                style={{
                  color: t.accent,
                  borderColor: `${t.accent}25`,
                  background: `${t.bg}cc`,
                  fontFamily: t.heading,
                }}
              >
                {vendor.monogram}
              </span>
            </div>
          )}
        </div>

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, ${t.bg}10 0%, ${t.bg}40 35%, ${t.bg}80 65%, ${t.bg} 100%)`,
          }}
        />

        <div className="relative mx-auto flex min-h-[85vh] max-w-7xl flex-col justify-end px-6 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-sm" style={{ borderColor: `${t.accent}35`, background: `${t.bg}80` }}>
              <span className="size-2 rounded-full" style={{ background: t.accent }} />
              <span className="opacity-80">{vendor.categoryLabel}</span>
            </div>

            <h1 className="text-5xl font-light tracking-[-0.04em] sm:text-7xl md:text-8xl lg:text-9xl" style={{ fontFamily: t.heading, color: t.ink }}>
              {vendor.name}
            </h1>

            {vendor.tagline && (
              <p className="mt-5 max-w-xl text-base leading-relaxed opacity-70 sm:text-lg" style={{ color: t.ink }}>
                {vendor.tagline}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#catalogue"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: t.accent,
                  color: t.accentInk,
                  boxShadow: `0 8px 25px -12px ${t.accent}`,
                }}
              >
                Shop the lookbook <ArrowRight className="size-4" />
              </a>
              <div className="flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: t.line, background: `${t.soft}cc` }}>
                <Star className="size-3.5 shrink-0" fill={hasReviews ? t.accent : "none"} stroke={t.accent} />
                {hasReviews ? (
                  <>
                    <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
                    <span className="opacity-65">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">New on Peniel</span>
                    <span className="opacity-65">· Be the first to review</span>
                  </>
                )}
              </div>
            </div>

            <div className="mt-10 flex items-center gap-5 border-t pt-6" style={{ borderColor: `${t.line}40` }}>
              {vendor.verified && (
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold"
                  style={{ borderColor: `${t.accent}55`, background: `${t.accent}12`, color: t.accent }}
                >
                  <ShieldCheck className="size-3.5" />
                  Verified business
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ASYMMETRIC GRID - Featured pieces */}
      <section id="catalogue" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24" style={{ background: t.soft }}>
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: t.accent }}>
              The edit
            </p>
            <h2 className="mt-4 text-3xl font-medium tracking-[-0.045em] sm:text-4xl" style={{ fontFamily: t.heading }}>
              Selected pieces
            </h2>
            <p className="mt-3 text-sm opacity-55">Discover thoughtfully designed pieces, carefully selected fabrics and timeless styles.</p>
          </div>
          <span className="text-xs opacity-50">{vendor.products.length} items</span>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr] md:grid-rows-[auto_auto]">
          {vendor.products.slice(0, 6).map((p, i) => {
            const isLarge = i === 0 || i === 3;
            return (
              <ItemLink
                key={p.id}
                vendor={vendor}
                product={p}
                className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isLarge ? "md:col-span-2 md:row-span-2" : ""}`}
                style={{
                  borderColor: t.line,
                  borderRadius: t.radius,
                  background: t.bg,
                }}
              >
                <div className="relative overflow-hidden" style={{ aspectRatio: isLarge ? "1/1" : "3/4" }}>
                  <ItemArt
                    vendor={vendor}
                    seed={i}
                    label={p.name}
                    image={p.images?.[0]}
                    className="aspect-[1/1] w-full transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  {p.tag && (
                    <span
                      className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider"
                      style={{
                        background: t.bg,
                        color: t.ink,
                        border: `1px solid ${t.line}`,
                      }}
                    >
                      {p.tag}
                    </span>
                  )}
                  <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full shadow-lg transition-all duration-300 group-hover:scale-110" style={{ background: t.accent, color: t.accentInk }}>
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <p className="truncate text-sm font-semibold tracking-tight sm:text-[15px]">{p.name}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-sm font-bold tabular-nums" style={{ color: t.accent }}>{`₦${Number(p.price).toLocaleString()}`}</p>
                    <span className="text-[9px] font-medium uppercase tracking-wider opacity-40">View</span>
                  </div>
                </div>
              </ItemLink>
            );
          })}
        </div>

        {vendor.products.length > 6 && (
          <div className="mt-10 text-center">
            <a
              href="#catalogue"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border px-6 text-xs font-bold transition hover:bg-muted/60"
              style={{ borderColor: t.line, color: t.ink }}
            >
              View all {vendor.products.length} pieces <ArrowRight className="size-4" />
            </a>
          </div>
        )}
      </section>

      {/* LOOKBOOK STORY */}
      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8 sm:pb-24" style={{ background: t.bg }}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: t.accent }}>
              The art of selection
            </p>
            <h2 className="mt-5 max-w-2xl text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl" style={{ fontFamily: t.heading }}>
              A little about {vendor.name}
            </h2>
            <p className="mt-5 text-sm leading-8 opacity-65 sm:text-base">{vendor.about}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
              {vendor.verified && (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" style={{ color: t.accent }} />
                  Verified Peniel store
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="size-4" style={{ color: t.accent }} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? `${Number(vendor.rating).toFixed(1)} customer rating` : "New on Peniel"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:p-9" style={{ background: t.soft, borderColor: t.line }}>
            <span className="grid size-12 place-items-center rounded-xl" style={{ background: t.bg, color: t.accent }}>
              <Sparkles className="size-5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>Ready when you are</p>
            <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>Find something you will love.</p>
            <p className="text-sm leading-7 opacity-60">Explore the collection and connect directly with {vendor.name}.</p>
            <a
              href="#catalogue"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                background: t.accent,
                color: t.accentInk,
                boxShadow: `0 8px 25px -12px ${t.accent}`,
              }}
            >
              Shop the edit <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}

/** Playful signature - rounded, colourful, cake configurator vibe */
export function PlayfulStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const hasReviews = Number(vendor.reviews) > 0 && Number(vendor.rating) > 0;
  const rating = Number(vendor.rating);
  const reviewCount = Number(vendor.reviews);

  return (
    <div
      className="storefront-page storefront-signature-playful min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Centered with organic shapes */}
      <section className="store-hero mx-auto max-w-6xl px-4 pb-16 pt-22 text-center sm:px-6 sm:pb-24 sm:pt-28" style={{ background: t.soft }}>
        <div className="mx-auto mb-6 grid size-14 place-items-center rounded-2xl" style={{ background: t.accent, color: t.accentInk }}>
          {vendor.logo ? (
            <img src={vendor.logo} alt="" className="h-10 w-auto object-contain" />
          ) : (
            <span style={{ fontFamily: t.heading }}>{vendor.monogram}</span>
          )}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
          {vendor.categoryLabel}
        </p>

        <h1 className="mt-5 mx-auto max-w-4xl text-4xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-5xl lg:text-6xl xl:text-7xl" style={{ fontFamily: t.heading }}>
          {vendor.name}
        </h1>

        {vendor.tagline && (
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 opacity-60 sm:text-lg">
            {vendor.tagline}
          </p>
        )}

        <div className="mt-7 flex justify-center">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm" style={{ borderColor: t.line, background: `${t.soft}cc` }}>
            <Star className="size-4 shrink-0" fill={hasReviews ? t.accent : "none"} stroke={t.accent} />
            {hasReviews ? (
              <>
                <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
                <span className="opacity-65">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
              </>
            ) : (
              <>
                <span className="font-medium">New on Peniel</span>
                <span className="opacity-65">· Be the first to review</span>
              </>
            )}
          </div>
        </div>

        {vendor.verified && (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: `${t.accent}55`, background: `${t.accent}12`, color: t.accent }}>
              <ShieldCheck className="size-3.5" />
              Verified business
            </span>
          </div>
        )}

        <div className="mt-7 flex justify-center">
          <a
            href="#catalogue"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: t.accent,
              color: t.accentInk,
              boxShadow: `0 8px 25px -12px ${t.accent}`,
            }}
          >
            {vendor.type === "bakery" ? "Order a treat" : "Explore our menu"} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="group mt-10 overflow-hidden rounded-[1.5rem]">
          <div className="aspect-[16/9] max-h-[520px]">
            {vendor.cover ? (
              <img
                src={vendor.cover}
                alt={`${vendor.name} storefront`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                width={1600}
                height={1400}
                fetchPriority="high"
              />
            ) : (
              <div
                className="store-cover-placeholder flex h-full w-full items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 70% 20%, ${t.accent}25, transparent 42%), linear-gradient(145deg, ${t.soft}, ${t.bg})`,
                }}
              >
                <span
                  className="grid size-24 place-items-center rounded-[2rem] border text-3xl font-semibold"
                  style={{
                    color: t.accent,
                    borderColor: `${t.accent}25`,
                    background: `${t.bg}cc`,
                    fontFamily: t.heading,
                  }}
                >
                  {vendor.monogram}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FLAVOUR HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16" style={{ background: t.bg }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Fresh daily", desc: "Baked each morning" },
            { icon: Sparkles, title: "Custom orders", desc: "Your design, our craft" },
            { icon: Star, title: "Local favourites", desc: "Loved by the community" },
            { icon: Truck, title: "Delivery available", desc: "Straight to your door" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <div
                className="grid size-11 place-items-center"
                style={{
                  background: t.bg,
                  color: t.accent,
                  borderRadius: t.radius,
                }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOGUE - Polaroid style cards */}
      <section id="catalogue" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24" style={{ background: t.soft }}>
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: t.accent }}>
              Sweet selections
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl" style={{ fontFamily: t.heading }}>
              {vendor.type === "bakery" ? "Fresh from the oven" : "Our delicious menu"}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 opacity-60">
              {vendor.type === "bakery"
                ? "Discover cakes, pastries and sweet treats made fresh every morning."
                : "Explore our selection and find something you will love."}
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: t.line, background: t.soft }}>
            <span className="size-1.5 rounded-full" style={{ background: t.accent }} />
            {vendor.products.length} {vendor.products.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-4">
          {vendor.products.map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={vendor}
              product={p}
              className="group block rounded-2xl border p-2.5 pb-4 transition-all hover:-translate-y-1 hover:shadow-xl sm:p-3 sm:pb-5"
              style={{ background: t.bg, borderColor: t.line }}
            >
              <ItemArt
                vendor={vendor}
                seed={i}
                label={p.name}
                image={p.images?.[0]}
                className="aspect-square rounded-xl"
              />
              <p className="mt-3 truncate text-center text-sm font-medium">{p.name}</p>
              <p className="mt-1 text-center text-sm font-bold" style={{ color: t.accent }}>₦{Number(p.price).toLocaleString()}</p>
            </ItemLink>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl border-y px-4 py-16 sm:px-6 sm:py-24" style={{ borderColor: t.line, background: t.soft }}>
        <div className="mx-auto grid max-w-2xl gap-10 px-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>The story behind the brand</p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: t.heading }}>A little about {vendor.name}</h2>
            <p className="mt-5 text-sm leading-8 opacity-65 sm:text-base">{vendor.about}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
              {vendor.verified && (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" style={{ color: t.accent }} />
                  Verified Peniel store
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="size-4" style={{ color: t.accent }} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? `${Number(vendor.rating).toFixed(1)} customer rating` : "New on Peniel"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:p-9" style={{ background: t.bg, borderColor: t.line }}>
            <span className="grid size-12 place-items-center rounded-xl" style={{ background: t.soft, color: t.accent }}>
              <Sparkles className="size-5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>Ready when you are</p>
            <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>Find something you will love.</p>
            <p className="text-sm leading-7 opacity-60">Explore the collection and connect directly with {vendor.name}.</p>
            <a
              href="#catalogue"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: t.accent, color: t.accentInk, boxShadow: `0 8px 25px -12px ${t.accent}` }}
            >
              {vendor.type === "bakery" ? "Order now" : "Explore menu"} <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}

/** Grid signature - technical departments and spec cards */
export function GridStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const hasReviews = Number(vendor.reviews) > 0 && Number(vendor.rating) > 0;
  const rating = Number(vendor.rating);
  const reviewCount = Number(vendor.reviews);

  return (
    <div
      className="storefront-page storefront-signature-grid min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Poster style with split */}
      <section className="store-hero store-hero-poster relative overflow-hidden pt-12" style={{ background: t.bg }}>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
          <div
            className="grid items-stretch gap-0 overflow-hidden rounded-[1.5rem] md:grid-cols-[1.15fr_0.85fr]"
            style={{ background: t.soft }}
          >
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <div
                className="mb-3 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: t.accent, color: t.accentInk }}
              >
                {vendor.categoryLabel}
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl" style={{ fontFamily: t.heading }}>
                {vendor.name}
              </h1>

              {vendor.tagline && (
                <p className="mt-3 max-w-md text-base font-medium leading-relaxed opacity-85 sm:text-lg">
                  {vendor.tagline}
                </p>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm"
                  style={{ borderColor: t.line, background: `${t.soft}cc` }}
                >
                  <Star className="size-4 shrink-0" fill={hasReviews ? t.accent : "none"} stroke={t.accent} />
                  {hasReviews ? (
                    <>
                      <span className="font-semibold tabular-nums">{rating.toFixed(1)}</span>
                      <span className="opacity-60">{reviewCount} {reviewCount === 1 ? "review" : "reviews"}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">New on Peniel</span>
                      <span className="opacity-60">· Be the first to review</span>
                    </>
                  )}
                </div>
                {vendor.verified && (
                  <span
                    className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold"
                    style={{ borderColor: `${t.accent}55`, background: `${t.accent}12`, color: t.accent }}
                  >
                    <ShieldCheck className="size-3.5" />
                    Verified business
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#catalogue"
                  className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                  style={{
                    background: t.accent,
                    color: t.accentInk,
                    boxShadow: `0 8px 25px -12px ${t.accent}`,
                  }}
                >
                  Browse devices <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a
                  href="#about"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 border px-5 py-3 text-xs font-semibold transition hover:bg-muted/50"
                  style={{ borderColor: t.line, borderRadius: t.radius }}
                >
                  About us
                </a>
              </div>
            </div>

            <div className="group relative min-h-[280px] overflow-hidden md:min-h-[420px]">
              {vendor.cover ? (
                <img
                  src={vendor.cover}
                  alt={`${vendor.name} storefront`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                  width={1600}
                  height={1400}
                  fetchPriority="high"
                />
              ) : (
                <div
                  className="store-cover-placeholder flex h-full w-full items-center justify-center"
                  style={{
                    background: `radial-gradient(circle at 70% 20%, ${t.accent}25, transparent 42%), linear-gradient(145deg, ${t.soft}, ${t.bg})`,
                  }}
                >
                  <span
                    className="grid size-24 place-items-center rounded-[2rem] border text-3xl font-semibold"
                    style={{
                      color: t.accent,
                      borderColor: `${t.accent}25`,
                      background: `${t.bg}cc`,
                      fontFamily: t.heading,
                    }}
                  >
                    {vendor.monogram}
                  </span>
                </div>
              )}
              <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${t.soft} 0%, transparent 35%)` }} />
              <div className="absolute bottom-4 right-4 rounded-xl px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: t.accent, color: t.accentInk }}>
                Shop now
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DEPARTMENT GRID */}
      <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24" style={{ background: t.soft }}>
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: t.accent }}>
              Departments
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl" style={{ fontFamily: t.heading }}>
              Tech, thoughtfully selected
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 opacity-60">
              Explore phones, laptops, audio, accessories and dependable repairs from one trusted store.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: t.line, background: t.soft }}>
            <span className="size-1.5 rounded-full" style={{ background: t.accent }} />
            {vendor.products.length} items
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {vendor.products.map((p, i) => (
            <ItemLink
              key={p.id}
              vendor={vendor}
              product={p}
              className="group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: i % 2 === 0 ? t.soft : t.accent,
                color: i % 2 === 0 ? t.ink : t.accentInk,
              }}
            >
              <ItemArt
                vendor={vendor}
                seed={i}
                label={p.name}
                image={p.images?.[0]}
                className="absolute inset-0 size-full opacity-35 transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${i % 2 === 0 ? t.soft : t.accent}e8 0%, ${i % 2 === 0 ? t.soft : t.accent}8c 55%, transparent 100%)` }} />
              <span className="relative z-10 text-[9px] font-semibold uppercase tracking-widest opacity-75">{p.group}</span>
              <span className={["relative z-10 mt-2 block font-semibold leading-tight", i === 0 ? "text-3xl sm:text-4xl" : "text-lg"].join(" ")} style={{ fontFamily: t.heading }}>
                {p.name}
              </span>
              {i === 0 && p.desc && (
                <span className="relative z-10 mt-3 block max-w-xs text-sm leading-6 opacity-75">{p.desc}</span>
              )}
              <span className="absolute bottom-5 left-5 z-10 text-sm font-bold tabular-nums">₦{Number(p.price).toLocaleString()}</span>
              <span className="absolute bottom-5 right-5 z-10 grid size-9 place-items-center rounded-full" style={{ background: i % 2 === 0 ? t.accent : t.bg, color: i % 2 === 0 ? t.accentInk : t.ink }}>
                <ArrowRight className="size-4" />
              </span>
            </ItemLink>
          ))}
        </div>
      </section>

      {/* SPECS HIGHLIGHTS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16" style={{ background: t.bg }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Genuine products", desc: "Authorised distributor" },
            { icon: Sparkles, title: "Expert repairs", desc: "Certified technicians" },
            { icon: Star, title: "Warranty included", desc: "Peace of mind" },
            { icon: Truck, title: "Fast delivery", desc: "Lagos & nationwide" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <div
                className="grid size-11 place-items-center"
                style={{
                  background: t.bg,
                  color: t.accent,
                  borderRadius: t.radius,
                }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-7xl border-y px-4 py-16 sm:px-6 sm:py-24" style={{ borderColor: t.line, background: t.soft }}>
        <div className="mx-auto grid max-w-2xl gap-10 px-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>The story behind the brand</p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: t.heading }}>A little about {vendor.name}</h2>
            <p className="mt-5 text-sm leading-8 opacity-65 sm:text-base">{vendor.about}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
              {vendor.verified && (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" style={{ color: t.accent }} />
                  Verified Peniel store
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="size-4" style={{ color: t.accent }} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? `${Number(vendor.rating).toFixed(1)} customer rating` : "New on Peniel"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:p-9" style={{ background: t.bg, borderColor: t.line }}>
            <span className="grid size-12 place-items-center rounded-xl" style={{ background: t.soft, color: t.accent }}>
              <Sparkles className="size-5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>Ready when you are</p>
            <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>Find something you will love.</p>
            <p className="text-sm leading-7 opacity-60">Explore the collection and connect directly with {vendor.name}.</p>
            <a
              href="#catalogue"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: t.accent, color: t.accentInk, boxShadow: `0 8px 25px -12px ${t.accent}` }}
            >
              Browse devices <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}

/** Editorial signature - script type, arched hero, booking slots */
export function EditorialStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;

  return (
    <div
      className="storefront-page storefront-signature-editorial min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      {/* HERO - Centered with arched/editorial feel */}
      <section className="store-hero mx-auto max-w-6xl px-4 pb-14 pt-24 text-center sm:px-6 sm:pb-24 sm:pt-28" style={{ background: t.soft }}>
        <div className="mx-auto mb-6 grid size-16 place-items-center rounded-2xl text-xl font-bold" style={{ background: t.bg, color: t.accent }}>
          {vendor.monogram}
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
          {vendor.categoryLabel}
        </p>

        <h1 className="mt-5 mx-auto max-w-4xl text-5xl font-semibold leading-[1.04] tracking-[-0.055em] sm:text-7xl" style={{ fontFamily: t.heading }}>
          {vendor.name}
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-8 opacity-60 sm:text-base">
          {vendor.tagline}
        </p>

        <div className="mt-6 flex justify-center">
          <div className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: t.line, background: `${t.soft}cc` }}>
            <Star className="size-3.5 shrink-0" fill={Number(vendor.reviews) > 0 ? t.accent : "none"} stroke={t.accent} />
            {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? (
              <>
                <span className="font-semibold tabular-nums">{Number(vendor.rating).toFixed(1)}</span>
                <span className="opacity-65">{vendor.reviews} {vendor.reviews === 1 ? "review" : "reviews"}</span>
              </>
            ) : (
              <>
                <span className="font-semibold">New on Peniel</span>
                <span className="opacity-65">· Be the first to review</span>
              </>
            )}
          </div>
        </div>

        {vendor.verified && (
          <div className="mt-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold" style={{ borderColor: `${t.accent}55`, background: `${t.accent}12`, color: t.accent }}>
              <ShieldCheck className="size-3.5" />
              Verified business
            </span>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <a
            href="#catalogue"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: t.accent,
              color: t.accentInk,
              boxShadow: `0 8px 25px -12px ${t.accent}`,
            }}
          >
            Book appointment <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="group mt-12 overflow-hidden rounded-2xl" style={{ background: t.bg }}>
          <div className="aspect-[16/9] max-h-[580px]">
            {vendor.cover ? (
              <img
                src={vendor.cover}
                alt={`${vendor.name} storefront`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                width={1600}
                height={1400}
                fetchPriority="high"
              />
            ) : (
              <div
                className="store-cover-placeholder flex h-full w-full items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 70% 20%, ${t.accent}35, transparent 42%), linear-gradient(145deg, ${t.soft}, ${t.bg})`,
                }}
              >
                <span
                  className="grid size-24 place-items-center rounded-[2rem] border text-3xl font-semibold"
                  style={{
                    color: t.accent,
                    borderColor: `${t.accent}35`,
                    background: `${t.bg}aa`,
                    fontFamily: t.heading,
                  }}
                >
                  {vendor.monogram}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SERVICES HIGHLIGHTS */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16" style={{ background: t.bg }}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: "Certified experts", desc: "Licensed professionals" },
            { icon: Sparkles, title: "Personalised care", desc: "Tailored to you" },
            { icon: Star, title: "Premium products", desc: "Top-tier brands only" },
            { icon: Truck, title: "Flexible booking", desc: "Online or walk-in" },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
              style={{
                borderColor: t.line,
                borderRadius: t.radius,
                background: t.soft,
              }}
            >
              <div
                className="grid size-11 place-items-center"
                style={{
                  background: t.bg,
                  color: t.accent,
                  borderRadius: t.radius,
                }}
              >
                <Icon className="size-5" />
              </div>
              <h3 className="mt-5 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-[11px] leading-5 opacity-50">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATALOGUE - List style for services */}
      <section id="catalogue" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6 sm:py-24" style={{ background: t.soft }}>
        <div className="mb-9 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]" style={{ color: t.accent }}>
              Our treatments
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.055em] sm:text-5xl" style={{ fontFamily: t.heading }}>
              Services & treatments
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 opacity-60">
              Explore our services and find the right experience for you.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ borderColor: t.line, background: t.soft }}>
            <span className="size-1.5 rounded-full" style={{ background: t.accent }} />
            {vendor.products.length} services
          </span>
        </div>

        <div className="space-y-12">
          {vendor.groups.map((group) => {
            const groupItems = vendor.products.filter((p) => p.group === group);
            if (!groupItems.length) return null;
            return (
              <section key={group} aria-label={group}>
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
                      {group.toUpperCase()}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>{group}</h3>
                  </div>
                  <span className="pb-1 text-[10px] uppercase tracking-wider opacity-45">{groupItems.length} services</span>
                </div>
                <div className="mb-5 h-px" style={{ background: t.line }} />
                <div className="grid gap-3">
                  {groupItems.map((p, i) => (
                    <ItemLink
                      key={p.id}
                      vendor={vendor}
                      product={p}
                      className="group block overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl"
                      style={{ borderColor: t.line, background: t.bg }}
                    >
                      <div className="flex flex-col gap-4 p-3.5 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                        <div className="relative w-full shrink-0 overflow-hidden rounded-xl sm:w-28">
                          <ItemArt
                            vendor={vendor}
                            seed={i}
                            label={p.name}
                            image={p.images?.[0]}
                            className="aspect-[16/10] w-full sm:aspect-square"
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-base font-semibold sm:text-lg">{p.name}</h4>
                            {p.desc && <p className="mt-1.5 max-w-lg text-xs leading-6 opacity-55 sm:text-sm">{p.desc}</p>}
                            {p.meta && <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] opacity-55"><Clock className="size-3" /> {p.meta}</span>}
                          </div>
                          <div className="flex shrink-0 items-center justify-between gap-4 border-t pt-3 sm:min-w-[130px] sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                            <div className="sm:text-right">
                              <p className="text-[9px] uppercase tracking-wider opacity-45">Price</p>
                              <p className="mt-1 text-lg font-bold tabular-nums" style={{ color: t.accent }}>₦{Number(p.price).toLocaleString()}</p>
                            </div>
                            <ArrowRight className="size-4" style={{ color: t.accent }} />
                          </div>
                        </div>
                      </div>
                    </ItemLink>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-6xl border-y px-4 py-16 sm:px-6 sm:py-24" style={{ borderColor: t.line, background: t.soft }}>
        <div className="mx-auto grid max-w-2xl gap-10 px-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>The story behind the brand</p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl" style={{ fontFamily: t.heading }}>A little about {vendor.name}</h2>
            <p className="mt-5 text-sm leading-8 opacity-65 sm:text-base">{vendor.about}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs opacity-65">
              {vendor.verified && (
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4" style={{ color: t.accent }} />
                  Verified Peniel store
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Star className="size-4" style={{ color: t.accent }} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? `${Number(vendor.rating).toFixed(1)} customer rating` : "New on Peniel"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start gap-5 rounded-2xl border p-6 sm:p-9" style={{ background: t.bg, borderColor: t.line }}>
            <span className="grid size-12 place-items-center rounded-xl" style={{ background: t.soft, color: t.accent }}>
              <Sparkles className="size-5" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>Ready when you are</p>
            <p className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl" style={{ fontFamily: t.heading }}>Find something you will love.</p>
            <p className="text-sm leading-7 opacity-60">Explore the collection and connect directly with {vendor.name}.</p>
            <a
              href="#catalogue"
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-6 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
              style={{ background: t.accent, color: t.accentInk, boxShadow: `0 8px 25px -12px ${t.accent}` }}
            >
              Book appointment <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t px-5 py-8 text-center text-[11px] opacity-55" style={{ borderColor: t.line }}>
        © {new Date().getFullYear()} {vendor.name}. Powered by Peniel.
      </footer>
    </div>
  );
}