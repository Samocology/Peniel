import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { getVendor } from "@/lib/data";
import { defaultTemplateFor, getTemplate } from "@/lib/templates";
import { mergeVendor, useApp } from "@/lib/vendra-store";
import { StoreFooter, StoreTopBar } from "@/components/store/store-kit";
import { BuilderStore, CinematicStore, EditorialStore, GalleryStore } from "@/components/store/layouts-a";
import { GridStore, PlayfulStore, ReservationStore } from "@/components/store/layouts-b";
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
      return { meta: [{ title: "Store unavailable — Vendra" }, { name: "robots", content: "noindex" }] };
    }
    const v = loaderData.vendor;
    return {
      meta: [
        { title: `${v.name} — ${v.tagline}` },
        { name: "description", content: v.about.slice(0, 155) },
        { property: "og:title", content: `${v.name} — ${v.tagline}` },
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

  const L = tpl.layout;
  const body =
    tpl.kind === "composed" ? <ComposedStore vendor={vendor} tpl={tpl} />
    : L === "cinematic" ? <CinematicStore vendor={vendor} />
    : L === "builder" ? <BuilderStore vendor={vendor} />
    : L === "editorial" ? <EditorialStore vendor={vendor} />
    : L === "gallery" ? <GalleryStore vendor={vendor} />
    : L === "playful" ? <PlayfulStore vendor={vendor} />
    : L === "reservation" ? <ReservationStore vendor={vendor} />
    : <GridStore vendor={vendor} />;

  return (
    <div className="min-h-screen" style={{ background: vendor.theme.bg, color: vendor.theme.ink }}>
      {previewId && (
        <div className="bg-primary px-4 py-2 text-center text-xs font-semibold text-primary-foreground">
          Previewing “{tpl.name}” design — choose it in onboarding or Store settings
        </div>
      )}
      <StoreTopBar vendor={vendor} />
      {body}
      <StoreFooter vendor={vendor} />
    </div>
  );
}
