import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  getVendor,
  type Vendor,
  type Product,
  type StoreLayout,
  type BusinessType,
} from "@/lib/data";
import { defaultTemplateFor, getTemplate } from "@/lib/templates";
import { mergeVendor, useApp } from "@/lib/peniel-store";
import { StoreFooter, StoreTopBar } from "@/components/store/store-kit";
import { BuilderStore } from "@/components/store/layouts-a";
import { ReservationStore } from "@/components/store/layouts-b";
import { ComposedStore } from "@/components/store/layouts-c";

const businessTypes: BusinessType[] = [
  "restaurant",
  "fresh-food",
  "beauty",
  "fashion",
  "bakery",
  "hotel",
  "electronics",
];
const layouts: StoreLayout[] = [
  "cinematic",
  "builder",
  "editorial",
  "gallery",
  "playful",
  "reservation",
  "grid",
];

const R2_PUBLIC_URL =
  import.meta.env["VITE_R2_PUBLIC_MEDIA_URL"] ?? "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev";

function buildR2Url(objectKey: string | undefined): string | undefined {
  if (!objectKey || typeof objectKey !== "string") return undefined;
  return `${R2_PUBLIC_URL}/${objectKey}`;
}

function extractTheme(storefront: Record<string, unknown> | undefined) {
  if (!storefront || typeof storefront["theme"] !== "object" || storefront["theme"] === null)
    return undefined;
  const theme = storefront["theme"] as Record<string, unknown>;
  return {
    bg: typeof theme["bg"] === "string" ? theme["bg"] : undefined,
    ink: typeof theme["ink"] === "string" ? theme["ink"] : undefined,
    accent: typeof theme["accent"] === "string" ? theme["accent"] : undefined,
    accentInk: typeof theme["accentInk"] === "string" ? theme["accentInk"] : undefined,
    soft: typeof theme["soft"] === "string" ? theme["soft"] : undefined,
    line: typeof theme["line"] === "string" ? theme["line"] : undefined,
    radius: typeof theme["radius"] === "string" ? theme["radius"] : undefined,
    heading: typeof theme["heading"] === "string" ? theme["heading"] : undefined,
  };
}

function mapBackendVendorForLoader(value: Record<string, unknown>): Vendor {
  const slug = typeof value["slug"] === "string" ? value["slug"] : "";
  const demo = getVendor(slug);
  const fallback = demo ?? getVendor("abigails-kitchen")!;
  if (!fallback) throw new Error("No fallback vendor available");

  const typeValue = value["business_type"];
  const businessType = businessTypes.includes(typeValue as BusinessType)
    ? (typeValue as BusinessType)
    : fallback.type;
  const fulfilmentValue = value["fulfilment"];
  const fulfilment =
    fulfilmentValue === "booking" ||
    fulfilmentValue === "reservation" ||
    fulfilmentValue === "order"
      ? fulfilmentValue
      : fallback.fulfilment;
  const storefront = Array.isArray(value["storefronts"]) ? value["storefronts"][0] : undefined;
  const layoutValue =
    storefront && typeof storefront === "object" ? storefront["layout"] : undefined;
  const layout = layouts.includes(layoutValue as StoreLayout)
    ? (layoutValue as StoreLayout)
    : fallback.layout;

  // Extract storefront customizations
  const coverUrl = buildR2Url(storefront?.["cover_object_key"] as string);
  const logoUrl = buildR2Url(storefront?.["logo_object_key"] as string);
  const theme = extractTheme(storefront);

  const openingHours = storefront && typeof storefront === "object" ? storefront["opening_hours"] : undefined;
  const hours =
    typeof openingHours === "string"
      ? openingHours
      : openingHours && typeof openingHours === "object" && typeof openingHours["text"] === "string"
        ? openingHours["text"]
        : typeof value["hours"] === "string"
          ? value["hours"]
          : "";

  const products = Array.isArray(value["products"])
    ? value["products"]
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const prod = p as Record<string, unknown>;
          const meta =
            prod["attributes"] &&
            typeof prod["attributes"] === "object" &&
            typeof (prod["attributes"] as Record<string, unknown>)["meta"] === "string"
              ? (prod["attributes"] as Record<string, unknown>)["meta"]
              : undefined;
          return {
            id: typeof prod["id"] === "string" ? prod["id"] : "",
            name: typeof prod["name"] === "string" ? prod["name"] : "",
            desc: typeof prod["description"] === "string" ? prod["description"] : "",
            price: typeof prod["price_minor"] === "number" ? prod["price_minor"] / 100 : 0,
            group: typeof prod["group_name"] === "string" ? prod["group_name"] : "General",
            ...(meta ? { meta } : {}),
          };
        })
        .filter((p): p is Product => p !== null && p.id !== "")
    : [];
  const category = Array.isArray(value["categories"]) ? value["categories"][0] : undefined;
  const description = typeof value["description"] === "string" ? value["description"] : "";

  const name = typeof value["name"] === "string" ? value["name"] : fallback.name;
  const monogram = logoUrl
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : fallback.monogram;

  return {
    ...fallback,
    slug,
    name,
    tagline: description.split(/[.!?]/, 1)[0]?.trim() || fallback.tagline,
    about: description || fallback.about,
    type: businessType,
    categorySlug:
      typeof category === "object" && category && typeof category["slug"] === "string"
        ? category["slug"]
        : fallback.categorySlug,
    categoryLabel:
      typeof category === "object" && category && typeof category["name"] === "string"
        ? category["name"]
        : fallback.categoryLabel,
    layout,
    cover: coverUrl ?? "",
    ...(logoUrl ? { logo: logoUrl } : { logo: "" }),
    monogram,
    theme: theme
      ? {
          bg: theme.bg ?? fallback.theme.bg,
          ink: theme.ink ?? fallback.theme.ink,
          accent: theme.accent ?? fallback.theme.accent,
          accentInk: theme.accentInk ?? fallback.theme.accentInk,
          soft: theme.soft ?? fallback.theme.soft,
          line: theme.line ?? fallback.theme.line,
          radius: theme.radius ?? fallback.theme.radius,
          heading: theme.heading ?? fallback.theme.heading,
        }
      : fallback.theme,
    verified: false,
    featured: false,
    rating: 0,
    reviews: 0,
    orders: "New on Peniel",
    location: typeof value["location"] === "string" ? value["location"] : "",
    phone: typeof value["phone"] === "string" ? value["phone"] : "",
    hours,
    fulfilment,
    groups: [...new Set(products.map((product) => product.group))],
    products,
  };
}

export const Route = createFileRoute("/store/$slug")({
  validateSearch: z.object({ t: z.string().optional() }),
  loader: async ({ params }) => {
    // Try fetching live vendor data from the backend first so that
    // uploaded logos, cover images, and updated details are shown.
    try {
      const response = await fetch(`/api/vendors?slug=${params.slug}`, {
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.ok && Array.isArray(result.data) && result.data.length > 0) {
          const backendVendor = result.data[0];
          return { vendor: mapBackendVendorForLoader(backendVendor) };
        }
      }
    } catch (error) {
      console.error("Could not load vendor from backend in loader:", error);
    }

    // Fall back to static data if the backend is unavailable
    const staticVendor = getVendor(params.slug);
    if (staticVendor) {
      return { vendor: staticVendor };
    }

    return { vendor: null };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.vendor) {
      return {
        meta: [{ title: "Store unavailable - Peniel" }, { name: "robots", content: "noindex" }],
      };
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
  const { vendor: baseFromLoader } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const { t: previewId } = Route.useSearch();
  const s = useApp();

  // Check custom vendors from the app store as fallback (e.g. newly onboarded vendors)
  const customVendor = s.customVendors?.find((v) => v.slug === slug);
  const storeBase = customVendor ?? baseFromLoader;

  if (!storeBase) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Loading storefront…</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Please wait while we load the store.
          </p>
        </main>
      </div>
    );
  }

  const acc = s.accounts[storeBase.slug];

  // Template selection priority: preview param → saved choice → storefront layout → default for type
  const tpl =
    getTemplate(previewId) ??
    (acc?.choice ? getTemplate(acc.choice) : undefined) ??
    defaultTemplateFor(storeBase);
  const vendor = { ...mergeVendor(storeBase, acc), theme: tpl.theme };
  const published = acc?.profile.published !== false;
  const paused = acc?.profile.paused === true;
  const acceptingActivity =
    vendor.fulfilment === "order"
      ? acc?.profile.acceptingOrders !== false
      : acc?.profile.acceptingBookings !== false;

  const L = storeBase.layout;
  const body =
    tpl.kind === "composed" ? (
      <ComposedStore vendor={vendor} tpl={tpl} />
    ) : L === "cinematic" ? (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "banner", catalog: "cards" }} />
    ) : L === "builder" ? (
      <BuilderStore vendor={vendor} />
    ) : L === "editorial" ? (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "centered", catalog: "list" }} />
    ) : L === "gallery" ? (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "magazine", catalog: "masonry" }} />
    ) : L === "playful" ? (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "centered", catalog: "polaroid" }} />
    ) : L === "reservation" ? (
      <ReservationStore vendor={vendor} />
    ) : L === "grid" ? (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "poster", catalog: "cards" }} />
    ) : (
      <ComposedStore vendor={vendor} tpl={{ ...tpl, hero: "poster", catalog: "bento" }} />
    );

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
              <p
                className="rounded-xl border px-4 py-3 text-center text-sm font-medium"
                style={{ borderColor: vendor.theme.line, background: vendor.theme.soft }}
              >
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
