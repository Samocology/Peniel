import {
  getVendor,
  vendors as demoVendors,
  type BusinessType,
  type Product,
  type StoreLayout,
  type Vendor,
} from "./data";

type JsonRecord = Record<string, unknown>;

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
  import.meta.env.VITE_R2_PUBLIC_MEDIA_URL ?? "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev";

function buildR2Url(objectKey: string | undefined): string | undefined {
  if (!objectKey || typeof objectKey !== "string") return undefined;
  return `${R2_PUBLIC_URL}/${objectKey}`;
}

function extractTheme(storefront: JsonRecord | undefined) {
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

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function firstRelation(value: unknown): JsonRecord | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return isRecord(first) ? first : undefined;
  }
  return isRecord(value) ? value : undefined;
}

function mapProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;
  const {
    id,
    name,
    description,
    group_name: groupName,
    price_minor: priceMinor,
    attributes,
  } = value;
  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof description !== "string" ||
    typeof groupName !== "string" ||
    typeof priceMinor !== "number" ||
    !Number.isSafeInteger(priceMinor) ||
    priceMinor < 0
  ) {
    return null;
  }
  const meta =
    isRecord(attributes) && typeof attributes["meta"] === "string" ? attributes["meta"] : undefined;
  return {
    id,
    name,
    desc: description,
    price: priceMinor / 100,
    group: groupName,
    ...(meta ? { meta } : {}),
  };
}

export function mapBackendVendor(value: unknown): Vendor | null {
  if (!isRecord(value) || typeof value["slug"] !== "string") return null;
  const slug = value["slug"];
  const demo = getVendor(slug);
  const fallback = demo ?? demoVendors[0];
  if (!fallback) return null;

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
  const storefront = firstRelation(value["storefronts"]);
  const layoutValue = storefront?.["layout"];
  const layout = layouts.includes(layoutValue as StoreLayout)
    ? (layoutValue as StoreLayout)
    : fallback.layout;

  // Extract storefront customizations
  const coverUrl = buildR2Url(storefront?.["cover_object_key"] as string);
  const logoUrl = buildR2Url(storefront?.["logo_object_key"] as string);
  const theme = extractTheme(storefront);

  const products = Array.isArray(value["products"])
    ? value["products"].map(mapProduct).filter((product): product is Product => product !== null)
    : [];
  const category = firstRelation(value["categories"]);
  const description = typeof value["description"] === "string" ? value["description"] : "";

  // Build monogram from name if no logo
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
    categorySlug: typeof category?.["slug"] === "string" ? category["slug"] : fallback.categorySlug,
    categoryLabel:
      typeof category?.["name"] === "string" ? category["name"] : fallback.categoryLabel,
    layout,
    cover: coverUrl ?? fallback.cover,
    monogram,
    theme: theme ? { ...fallback.theme, ...theme } : fallback.theme,
    verified: false,
    featured: false,
    rating: 0,
    reviews: 0,
    orders: "New on Peniel",
    location: typeof value["location"] === "string" ? value["location"] : fallback.location,
    phone: typeof value["phone"] === "string" ? value["phone"] : "",
    fulfilment,
    groups: [...new Set(products.map((product) => product.group))],
    products,
  };
}

export async function fetchBackendVendors(search: Record<string, string> = {}): Promise<Vendor[]> {
  const query = new URLSearchParams(search);
  const queryString = query.toString();
  const response = await fetch(`/api/vendors${queryString ? `?${queryString}` : ""}`, {
    credentials: "same-origin",
  });
  const result: unknown = await response.json();
  if (
    !response.ok ||
    !isRecord(result) ||
    result["ok"] !== true ||
    !Array.isArray(result["data"])
  ) {
    const message =
      isRecord(result) && typeof result["error"] === "string"
        ? result["error"]
        : "Could not load marketplace data.";
    throw new Error(message);
  }
  return result["data"].map(mapBackendVendor).filter((vendor): vendor is Vendor => vendor !== null);
}

export async function fetchBackendVendor(slug: string): Promise<Vendor | null> {
  const matching = await fetchBackendVendors({ slug });
  return matching.find((vendor) => vendor.slug === slug) ?? null;
}
