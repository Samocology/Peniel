import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getVendor } from "@/lib/data";
import { defaultTemplateFor, getTemplate } from "@/lib/templates";
import { mergeVendor, useApp } from "@/lib/peniel-store";
import { StoreFooter, StoreTopBar } from "@/components/store/store-kit";
import { BuilderStore } from "@/components/store/layouts-a";
import { ReservationStore } from "@/components/store/layouts-b";
import { ComposedStore } from "@/components/store/layouts-c";

export const Route = createFileRoute("/store/$slug")({
  validateSearch: z.object({ t: z.string().optional() }),
  loader: ({ params }) => {
    const vendor = getVendor(params.slug);
    if (!vendor) throw notFound();
    return { vendor };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Store unavailable - Peniel" }, { name: "robots", content: "noindex" }] };
    }
    const v = loaderData.vendor;
    return {
      meta: [
        { title: `${v.name} - ${v.tagline}` },
        { name: "description", content: v.about.slice(0, 155) },
        { property: "og:title", content: `${v.name} - ${v.tagline}` },
        { property: "og:description", content: v.about.slice(0, 155) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { vendor: base } = Route.useLoaderData();
  const { t: previewId } = Route.useSearch();
  const s = useApp();
  const acc = s.accounts[base.slug];
  const tpl = getTemplate(previewId) ?? getTemplate(acc?.choice) ?? defaultTemplateFor(base);
  const vendor = { ...mergeVendor(base, acc), theme: tpl.theme };
  const published = acc?.profile.published !== false;
  const paused = acc?.profile.paused === true;
  const acceptingActivity =
    vendor.fulfilment === "order"
      ? acc?.profile.acceptingOrders !== false
      : acc?.profile.acceptingBookings !== false;

  const L = tpl.layout;
  const body =
    tpl.kind === "composed" ? <ComposedStore vendor={vendor} tpl={tpl} />
    : L === "cinematic" ? <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "banner", catalog: "cards" }} />
    : L === "builder" ? <BuilderStore vendor={vendor} />
    : L === "editorial" ? <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "centered", catalog: "list" }} />
    : L === "gallery" ? <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "magazine", catalog: "masonry" }} />
    : L === "playful" ? <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "centered", catalog: "polaroid" }} />
    : L === "reservation" ? <ReservationStore vendor={vendor} />
    : L === "grid" ? <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "poster", catalog: "cards" }} />
    : <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "poster", catalog: "bento" }} />;

  return (
    <div className="min-h-screen" style={{ background: vendor.theme.bg, color: vendor.theme.ink }}>
      {previewId && (
        <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
          Previewing “{tpl.name}” design - choose it in onboarding or Store settings
        </div>
      )}
      <StoreTopBar vendor={vendor} />
      {!published ? (
        <main className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">This storefront is unavailable</h1>
          <p className="mt-3 text-sm opacity-70">The business has not published its storefront.</p>
        </main>
      ) : (
        <>
          {(paused || !acceptingActivity) && (
            <div className="mx-auto mt-20 max-w-6xl px-4 sm:px-6">
              <p className="rounded-xl border px-4 py-3 text-center text-sm font-medium" style={{ borderColor: vendor.theme.line, background: vendor.theme.soft }}>
                {paused
                  ? `${vendor.name} has temporarily paused this storefront.`
                  : `${vendor.name} is not currently accepting ${vendor.fulfilment === "order" ? "orders" : vendor.fulfilment === "booking" ? "appointments" : "reservations"}.`}
              </p>
            </div>
          )}
          {body}
        </>
      )}
      <StoreFooter vendor={vendor} />
    </div>
  );
}
