
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

const R2_PUBLIC_URL = (
  import.meta.env["VITE_R2_PUBLIC_MEDIA_URL"] ??
  "https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev"
).replace(/\/+$/, "");

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

function getString(
  record: JsonRecord | undefined,
  ...keys: string[]
): string | undefined {
  if (!record) return undefined;

  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function buildR2Url(objectKey: string | undefined): string | undefined {
  if (!objectKey || typeof objectKey !== "string") return undefined;

  const key = objectKey.trim().replace(/^\/+/, "");
  if (!key) return undefined;

  return `${R2_PUBLIC_URL}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

function extractTheme(
  storefront: JsonRecord | undefined,
): Partial<Vendor["theme"]> | undefined {
  if (!storefront) return undefined;

  const rawTheme = storefront["theme"];

  if (!isRecord(rawTheme)) return undefined;

  const theme: Record<string, unknown> = rawTheme;

  return {
    ...(typeof theme["bg"] === "string" ? { bg: theme["bg"] } : {}),
    ...(typeof theme["ink"] === "string" ? { ink: theme["ink"] } : {}),
    ...(typeof theme["accent"] === "string" ? { accent: theme["accent"] } : {}),
    ...(typeof theme["accentInk"] === "string"
      ? { accentInk: theme["accentInk"] }
      : {}),
    ...(typeof theme["soft"] === "string" ? { soft: theme["soft"] } : {}),
    ...(typeof theme["line"] === "string" ? { line: theme["line"] } : {}),
    ...(typeof theme["radius"] === "string" ? { radius: theme["radius"] } : {}),
    ...(typeof theme["heading"] === "string"
      ? { heading: theme["heading"] }
      : {}),
  };
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
    isRecord(attributes) && typeof attributes["meta"] === "string"
      ? attributes["meta"]
      : undefined;

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
  if (!isRecord(value)) return null;

  const slug = getString(value, "slug");
  if (!slug) return null;

  // Keep demo data only as a structural fallback for fields not supplied
  // by the backend. Never use its logo or cover for another vendor.
  const demo = getVendor(slug);
  const fallback = demo ?? demoVendors[0];

  if (!fallback) return null;

  const name = getString(value, "name") ?? fallback.name;

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

  // Support both database and API naming conventions.
  const templateId = getString(
    storefront,
    "template_id",
    "templateId",
    "layout",
  );

  const layoutValue = getString(
    storefront,
    "layout",
    "template_id",
    "templateId",
  );

  const layout = layouts.includes(layoutValue as StoreLayout)
    ? (layoutValue as StoreLayout)
    : fallback.layout;

  const logoKey = getString(
    storefront,
    "logo_object_key",
    "logoObjectKey",
  );

  const coverKey = getString(
    storefront,
    "cover_object_key",
    "coverObjectKey",
  );

  const logoUrl = buildR2Url(logoKey);
  const coverUrl = buildR2Url(coverKey);

  const theme = extractTheme(storefront);

  const products = Array.isArray(value["products"])
    ? value["products"]
        .map(mapProduct)
        .filter((product): product is Product => product !== null)
    : [];

  const category = firstRelation(value["categories"]);

  const description =
    typeof value["description"] === "string"
      ? value["description"]
      : "";

  const monogram = name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    ...fallback,

    slug,
    name,

    tagline:
      description.split(/[.!?]/, 1)[0]?.trim() ||
      fallback.tagline,

    about: description || fallback.about,

    type: businessType,

    categorySlug:
      getString(category, "slug") ?? fallback.categorySlug,

    categoryLabel:
      getString(category, "name") ?? fallback.categoryLabel,

    layout,

    // No demo logo or cover should be shown for a different vendor.
    ...(logoUrl ? { logo: logoUrl } : {}),
    cover: coverUrl ?? fallback.cover,

    ...(logoKey ? { logo_object_key: logoKey } : {}),
    ...(coverKey ? { cover_object_key: coverKey } : {}),

    monogram,

    theme: theme
      ? { ...fallback.theme, ...theme }
      : fallback.theme,

    verified: false,
    featured: false,
    rating: 0,
    reviews: 0,
    orders: "New on Peniel",

    location:
      getString(value, "location") ?? "",

    phone:
      getString(value, "phone") ?? "",

    fulfilment,

    groups: [...new Set(products.map((product) => product.group))],

    products,

    // Keep the selected template available to storefront consumers.
    ...(templateId ? { templateId } : {}),
  };
}

export async function fetchBackendVendors(
  search: Record<string, string> = {},
): Promise<Vendor[]> {
  const query = new URLSearchParams(search);
  const queryString = query.toString();

  const response = await fetch(
    `/api/vendors${queryString ? `?${queryString}` : ""}`,
    {
      credentials: "same-origin",
    },
  );

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

  return result["data"]
    .map(mapBackendVendor)
    .filter((vendor): vendor is Vendor => vendor !== null);
}

export async function fetchBackendVendor(
  slug: string,
): Promise<Vendor | null> {
  const matching = await fetchBackendVendors({ slug });

  return matching.find((vendor) => vendor.slug === slug) ?? null;
}
