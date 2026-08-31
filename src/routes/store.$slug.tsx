import { createFileRoute, notFound } from "@tanstack/react-router";
import { getVendor } from "@/lib/data";
import { StoreFooter, StoreTopBar } from "@/components/store/store-kit";
import { BuilderStore, CinematicStore, EditorialStore, GalleryStore } from "@/components/store/layouts-a";
import { GridStore, PlayfulStore, ReservationStore } from "@/components/store/layouts-b";

export const Route = createFileRoute("/store/$slug")({
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
      ],
    };
  },
  component: StorePage,
});

function StorePage() {
  const { vendor } = Route.useLoaderData();

  const body =
    vendor.layout === "cinematic" ? <CinematicStore vendor={vendor} />
    : vendor.layout === "builder" ? <BuilderStore vendor={vendor} />
    : vendor.layout === "editorial" ? <EditorialStore vendor={vendor} />
    : vendor.layout === "gallery" ? <GalleryStore vendor={vendor} />
    : vendor.layout === "playful" ? <PlayfulStore vendor={vendor} />
    : vendor.layout === "reservation" ? <ReservationStore vendor={vendor} />
    : <GridStore vendor={vendor} />;

  return (
    <div className="min-h-screen" style={{ background: vendor.theme.bg, color: vendor.theme.ink }}>
      <StoreTopBar vendor={vendor} />
      {body}
      <StoreFooter vendor={vendor} />
    </div>
  );
}
