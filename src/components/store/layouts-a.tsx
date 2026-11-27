import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, MessageCircle, PackageCheck, ShieldCheck, Star } from "lucide-react";
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

/** Signature layout for fresh-food and restaurant vendors. It deliberately uses
 * the vendor's real catalogue; it never invents dishes, prices or ingredients. */
export function BuilderStore({ vendor }: { vendor: Vendor }) {
  const t = vendor.theme;
  const groups = vendor.groups.length
    ? vendor.groups
    : [...new Set(vendor.products.map((product) => product.group))];

  return (
    <div
      className="storefront-page storefront-signature-builder min-h-screen overflow-x-clip antialiased"
      style={{ background: t.bg, color: t.ink }}
    >
      <section
        className="relative isolate overflow-hidden px-5 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:pb-24"
        style={{ background: t.soft }}
      >
        {vendor.cover && (
          <img
            src={vendor.cover}
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20"
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
              className="mt-7 text-4xl leading-[1.02] font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: t.heading }}
            >
              {vendor.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg font-medium leading-relaxed sm:text-xl" style={{ color: t.accent }}>
              {vendor.tagline || "Good food. Great moments."}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 opacity-70 sm:text-base">
              {vendor.about}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <span className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: t.line, background: `${t.bg}99` }}>
                <Star className="size-3.5" style={{ color: t.accent }} fill={Number(vendor.reviews) > 0 ? t.accent : "none"} />
                {Number(vendor.reviews) > 0 && Number(vendor.rating) > 0 ? (
                  <><strong>{Number(vendor.rating).toFixed(1)}</strong><span className="opacity-65">{vendor.reviews} {Number(vendor.reviews) === 1 ? "review" : "reviews"}</span></>
                ) : (
                  <><strong>New on Peniel</strong><span className="opacity-65">· Be the first to review</span></>
                )}
              </span>
              {vendor.orders && !/^0(?:\s|$)/.test(vendor.orders) && !/^new on peniel$/i.test(vendor.orders) && (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-2 text-xs" style={{ borderColor: t.line, background: `${t.bg}99` }}>
                  <PackageCheck className="size-3.5" style={{ color: t.accent }} /> {vendor.orders}
                </span>
              )}
            </div>
            <a
              href="#catalogue"
              className="mt-8 inline-flex min-h-12 items-center gap-3 rounded-full px-6 text-xs font-bold transition-transform hover:-translate-y-0.5"
              style={{ background: t.accent, color: t.accentInk }}
            >
              {vendor.type === "restaurant" ? "Explore our menu" : "Explore the catalogue"} <ArrowRight className="size-4" />
            </a>
          </div>
          <div className="hidden lg:block">
            <StoreSidebar vendor={vendor} />
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:px-8 sm:py-20">
        <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: t.accent }}>
              Made available by {vendor.name}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl" style={{ fontFamily: t.heading }}>
              Explore the catalogue
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
                          <div className="mt-3"><Price value={product.price} vendor={vendor} /></div>
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
