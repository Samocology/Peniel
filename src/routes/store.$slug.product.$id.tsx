import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Check, ChevronLeft, Minus, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { getVendor, naira, reviews } from "@/lib/data";
import { ItemArt, ItemLink, Price, StoreFooter, StoreTopBar } from "@/components/store/store-kit";

export const Route = createFileRoute("/store/$slug/product/$id")({
  loader: ({ params }) => {
    const vendor = getVendor(params.slug);
    const product = vendor?.products.find((p) => p.id === params.id);
    if (!vendor || !product) throw notFound();
    return { vendor, product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Item unavailable — Vendra" }, { name: "robots", content: "noindex" }] };
    }
    const { vendor, product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — ${vendor.name}` },
        { name: "description", content: `${product.desc}. ${naira(product.price)} from ${vendor.name} on Vendra.` },
        { property: "og:title", content: `${product.name} — ${vendor.name}` },
        { property: "og:description", content: product.desc },
      ],
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { vendor, product } = Route.useLoaderData();
  const t = vendor.theme;
  const isService = vendor.fulfilment !== "order";
  const related = vendor.products.filter((p) => p.id !== product.id).slice(0, 4);

  const optionGroups: [string, string[]][] =
    vendor.type === "restaurant"
      ? [["Size", ["Regular", "Large (Serves 10–15)"]], ["Add protein", ["Grilled chicken", "Beef", "Goat meat", "None"]]]
      : vendor.type === "fashion"
        ? [["Size", ["UK 6", "UK 8", "UK 10", "UK 12", "UK 14"]], ["Colour", ["Indigo", "Ochre", "Noir"]]]
        : vendor.type === "beauty"
          ? [["Specialist", ["Esther B.", "Joy N.", "Amaka T."]], ["Time", ["10:00", "13:00", "14:30", "16:00"]]]
          : vendor.type === "hotel"
            ? [["Guests", ["1 adult", "2 adults", "2 adults + child"]], ["Package", ["Room only", "Breakfast included", "Half board"]]]
            : vendor.type === "fresh-food"
              ? [["Serves", ["4 people", "6 people", "10 people"]], ["Preparation", ["Raw & cleaned", "Pre-cut", "Fully prepped"]]]
              : vendor.type === "bakery"
                ? [["Size", ['6"', '8"', "Two-tier"]], ["Finish", ["Buttercream", "Fondant", "Ganache"]]]
                : [["Condition", ["Brand new", "UK used"]], ["Warranty", ["12 months", "24 months (+₦25,000)"]]];

  return (
    <div className="min-h-screen" style={{ background: t.bg, color: t.ink }}>
      <StoreTopBar vendor={vendor} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Link to="/store/$slug" params={{ slug: vendor.slug }} className="inline-flex items-center gap-1 text-xs opacity-70">
          <ChevronLeft className="size-3.5" /> Back to {vendor.name}
        </Link>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <ItemArt vendor={vendor} seed={3} className="h-80 w-full sm:h-[420px]" label={product.name} />
            <div className="mt-3 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <ItemArt key={i} vendor={vendor} seed={i} className="h-20 w-full" />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] uppercase opacity-55">{product.group}</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: t.heading }}>
              {product.name}
            </h1>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="size-4" style={{ color: t.accent, fill: t.accent }} /> {vendor.rating}
              </span>
              <span className="opacity-60">{vendor.reviews} reviews</span>
              {product.meta && <span className="opacity-60">· {product.meta}</span>}
            </div>
            <p className="mt-4 text-sm opacity-70">{product.desc}</p>
            <p className="mt-5 text-3xl font-bold" style={{ color: t.accent }}>
              {naira(product.price)}
            </p>

            <div className="mt-6 space-y-5">
              {optionGroups.map(([label, opts], gi) => (
                <div key={label}>
                  <p className="mb-2 text-xs font-bold tracking-wide uppercase opacity-55">{label}</p>
                  <div className="flex flex-wrap gap-2">
                    {opts.map((o, i) => (
                      <span
                        key={o}
                        className="border px-3.5 py-2 text-xs font-medium"
                        style={
                          i === gi % 2
                            ? { background: t.accent, color: t.accentInk, borderColor: t.accent, borderRadius: t.radius }
                            : { borderColor: t.line, borderRadius: t.radius }
                        }
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              {isService && (
                <div className="border p-4" style={{ borderColor: t.line, borderRadius: t.radius }}>
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarDays className="size-4" style={{ color: t.accent }} /> Choose a date
                  </p>
                  <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                    {["Fri 23", "Sat 24", "Sun 25", "Mon 26", "Tue 27"].map((d, i) => (
                      <span
                        key={d}
                        className="shrink-0 border px-4 py-2 text-xs font-medium"
                        style={i === 1 ? { background: t.accent, color: t.accentInk, borderColor: t.accent, borderRadius: t.radius } : { borderColor: t.line, borderRadius: t.radius }}
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-bold tracking-wide uppercase opacity-55">Special request</p>
                <textarea
                  rows={2}
                  placeholder="Anything we should know?"
                  className="w-full border px-4 py-3 text-sm outline-none"
                  style={{ borderColor: t.line, borderRadius: t.radius, background: t.soft, color: t.ink }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 border px-3 py-2" style={{ borderColor: t.line, borderRadius: t.radius }}>
                <button className="grid size-7 place-items-center"><Minus className="size-4" /></button>
                <span className="w-6 text-center font-semibold">1</span>
                <button className="grid size-7 place-items-center"><Plus className="size-4" /></button>
              </div>
              <Link
                to="/cart"
                className="flex-1 px-6 py-3.5 text-center text-sm font-bold"
                style={{ background: t.accent, color: t.accentInk, borderRadius: t.radius }}
              >
                {isService ? "Add booking to cart" : "Add to cart"} · {naira(product.price)}
              </Link>
            </div>

            <div className="mt-6 grid gap-3 text-xs sm:grid-cols-2">
              {[
                [Truck, vendor.delivery],
                [ShieldCheck, "Payments secured by Vendra Pay. Protected until fulfilment."],
              ].map(([Icon, text], i) => {
                const I = Icon as typeof Truck;
                return (
                  <div key={i} className="flex gap-2 border p-3 opacity-75" style={{ borderColor: t.line, borderRadius: t.radius }}>
                    <I className="size-4 shrink-0" style={{ color: t.accent }} />
                    <span>{text as string}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="text-xl font-bold">Customer reviews</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reviews.map((r) => (
              <div key={r.name + r.when} className="border p-4" style={{ borderColor: t.line, borderRadius: t.radius }}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <span className="text-xs opacity-55">{r.when}</span>
                </div>
                <div className="mt-1.5 flex gap-0.5">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="size-3" style={{ color: t.accent, fill: t.accent }} />
                  ))}
                </div>
                <p className="mt-2 text-sm opacity-70">{r.text}</p>
                <p className="mt-2 inline-flex items-center gap-1 text-[11px] opacity-60">
                  <Check className="size-3" /> Verified buyer
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-xl font-bold">You may also like</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <ItemLink key={p.id} vendor={vendor} product={p} className="border p-3" style={{ borderColor: t.line, borderRadius: t.radius }}>
                <ItemArt vendor={vendor} seed={i + 2} className="h-28 w-full" />
                <p className="mt-2 truncate text-sm font-semibold">{p.name}</p>
                <Price value={p.price} vendor={vendor} />
              </ItemLink>
            ))}
          </div>
        </section>
      </div>

      <StoreFooter vendor={vendor} />
    </div>
  );
}
