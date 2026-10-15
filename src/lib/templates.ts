import { vendors, type BusinessType, type StoreLayout, type Vendor } from "@/lib/data";

export type Hero = "split" | "centered" | "banner" | "poster" | "minimal" | "magazine" | "marquee";
export type Catalog = "cards" | "list" | "masonry" | "rail" | "board" | "bento" | "polaroid";

export type Theme = Vendor["theme"];

export type StoreTemplate = {
  id: string;
  name: string;
  vibe: string;
  bestFor: BusinessType[];
  /** signature templates reuse a hand-crafted layout; composed ones mix hero + catalogue */
  kind: "signature" | "composed";
  layout?: StoreLayout;
  hero?: Hero;
  catalog?: Catalog;
  caps?: boolean;
  theme: Theme;
};

const f = {
  display: "var(--font-display)",
  script: "var(--font-script)",
  playfair: "'Playfair Display', serif",
  grotesk: "'Space Grotesk', sans-serif",
  bebas: "'Bebas Neue', sans-serif",
  fraunces: "'Fraunces', serif",
  archivo: "'Archivo Black', sans-serif",
  cormorant: "'Cormorant Garamond', serif",
  dmserif: "'DM Serif Display', serif",
  syne: "'Syne', sans-serif",
  mono: "'JetBrains Mono', monospace",
  caveat: "'Caveat', cursive",
};

const t = (bg: string, ink: string, accent: string, accentInk: string, soft: string, radius: string, heading: string, dark = false): Theme => ({
  bg,
  ink,
  accent,
  accentInk,
  soft,
  line: dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.1)",
  radius,
  heading,
});

const sig = (layout: StoreLayout) => vendors.find((v) => v.layout === layout)!.theme;

const ALL: BusinessType[] = ["restaurant", "fresh-food", "beauty", "fashion", "bakery", "hotel", "electronics"];

export const templates: StoreTemplate[] = [
  // ── Signature layouts ────────────────────────────────
  { id: "cinematic", name: "Cinematic", vibe: "Moody full-bleed cover, floating identity card", bestFor: ["restaurant", "hotel"], kind: "signature", layout: "cinematic", theme: sig("cinematic") },
  { id: "builder", name: "Kit Builder", vibe: "Interactive serving & ingredient builder", bestFor: ["fresh-food", "restaurant"], kind: "signature", layout: "builder", theme: sig("builder") },
  { id: "editorial", name: "Editorial Arch", vibe: "Script type, arched hero, booking slots", bestFor: ["beauty"], kind: "signature", layout: "editorial", theme: sig("editorial") },
  { id: "gallery", name: "Atelier Gallery", vibe: "Full-height lookbook, asymmetric grid", bestFor: ["fashion", "beauty"], kind: "signature", layout: "gallery", theme: sig("gallery") },
  { id: "playful", name: "Sugar Pop", vibe: "Rounded, colourful, cake configurator", bestFor: ["bakery"], kind: "signature", layout: "playful", theme: sig("playful") },
  { id: "reservation", name: "Grand Stay", vibe: "Immersive hero with booking bar", bestFor: ["hotel"], kind: "signature", layout: "reservation", theme: sig("reservation") },
  { id: "grid", name: "Tech Grid", vibe: "Technical departments and spec cards", bestFor: ["electronics"], kind: "signature", layout: "grid", theme: sig("grid") },

  // ── Composed templates ───────────────────────────────
  { id: "lagos-noir", name: "Lagos Noir", vibe: "Black and gold split hero, elegant cards", bestFor: ["restaurant", "fashion"], kind: "composed", hero: "split", catalog: "cards", theme: t("#0d0d0d", "#f5efe0", "#d4a72c", "#111", "#1a1a1a", "14px", f.playfair, true) },
  { id: "palm-wine", name: "Palm Wine", vibe: "Warm terracotta with a menu board", bestFor: ["restaurant"], kind: "composed", hero: "centered", catalog: "board", theme: t("#f6ebdd", "#3b1f12", "#b4532a", "#fff", "#ecd9c3", "6px", f.fraunces) },
  { id: "neon-market", name: "Neon Market", vibe: "Electric dark mode, poster type", bestFor: ["electronics", "fashion"], kind: "composed", hero: "poster", catalog: "bento", caps: true, theme: t("#0b0b1a", "#e8f0ff", "#39ff88", "#06110a", "#15162c", "4px", f.bebas, true) },
  { id: "ankara-bloom", name: "Ankara Bloom", vibe: "Bold print-inspired colour blocks", bestFor: ["fashion", "beauty"], kind: "composed", hero: "magazine", catalog: "masonry", theme: t("#fff6e9", "#2a0f3d", "#e2492f", "#fff", "#ffe2b8", "22px", f.archivo) },
  { id: "soft-spa", name: "Soft Spa", vibe: "Calm sage, generous whitespace", bestFor: ["beauty"], kind: "composed", hero: "minimal", catalog: "list", theme: t("#f3f5ef", "#2c3a2e", "#7a9a7e", "#fff", "#e3eadf", "28px", f.cormorant) },
  { id: "street-chop", name: "Street Chop", vibe: "Loud yellow ticker, fast ordering", bestFor: ["restaurant", "bakery"], kind: "composed", hero: "marquee", catalog: "rail", caps: true, theme: t("#ffd23f", "#111", "#e4002b", "#fff", "#ffe580", "0px", f.bebas) },
  { id: "royal-indigo", name: "Royal Indigo", vibe: "Adire indigo with gold accents", bestFor: ["fashion", "hotel"], kind: "composed", hero: "banner", catalog: "polaroid", theme: t("#101a3d", "#eef1ff", "#e0b04a", "#101a3d", "#1a2656", "12px", f.dmserif, true) },
  { id: "fresh-crate", name: "Fresh Crate", vibe: "Market-crate greens, tidy lists", bestFor: ["fresh-food"], kind: "composed", hero: "split", catalog: "list", theme: t("#fbfdf6", "#1f3d1f", "#5aa02c", "#fff", "#e9f4dc", "16px", f.grotesk) },
  { id: "blush-boutique", name: "Blush Boutique", vibe: "Pink, polaroids and handwritten notes", bestFor: ["bakery", "beauty"], kind: "composed", hero: "centered", catalog: "polaroid", theme: t("#fff0f3", "#4a1d2b", "#e45b86", "#fff", "#ffd9e3", "20px", f.caveat) },
  { id: "concrete", name: "Concrete", vibe: "Brutalist mono type, hard edges", bestFor: ["electronics", "fashion"], kind: "composed", hero: "minimal", catalog: "board", caps: true, theme: t("#e9e9e6", "#121212", "#121212", "#e9e9e6", "#d8d8d4", "0px", f.mono) },
  { id: "safari-lodge", name: "Safari Lodge", vibe: "Earthy khaki, magazine storytelling", bestFor: ["hotel", "restaurant"], kind: "composed", hero: "magazine", catalog: "cards", theme: t("#efe6d2", "#2e2716", "#8a6a2f", "#fff", "#e0d3b6", "10px", f.cormorant) },
  { id: "ocean-breeze", name: "Ocean Breeze", vibe: "Coastal blues and bento tiles", bestFor: ["hotel", "beauty"], kind: "composed", hero: "banner", catalog: "bento", theme: t("#f0f8fb", "#0d3446", "#1c8fb5", "#fff", "#d6edf5", "24px", f.syne) },
  { id: "cocoa-house", name: "Cocoa House", vibe: "Chocolate tones, indulgent rail", bestFor: ["bakery", "restaurant"], kind: "composed", hero: "poster", catalog: "rail", theme: t("#2b1a12", "#f7e9dc", "#e9a24c", "#2b1a12", "#3a251a", "18px", f.fraunces, true) },
  { id: "gadget-lab", name: "Gadget Lab", vibe: "Clean white lab with spec list", bestFor: ["electronics"], kind: "composed", hero: "split", catalog: "masonry", theme: t("#ffffff", "#0f172a", "#2563eb", "#fff", "#eef2ff", "12px", f.grotesk) },
  { id: "harmattan", name: "Harmattan", vibe: "Dusty sand, quiet luxury", bestFor: ["fashion", "hotel"], kind: "composed", hero: "centered", catalog: "masonry", caps: true, theme: t("#f2e9dc", "#3a2f25", "#a8754a", "#fff", "#e6d8c4", "2px", f.syne) },
  { id: "party-jollof", name: "Party Jollof", vibe: "Festive orange, owambe energy", bestFor: ["restaurant", "bakery"], kind: "composed", hero: "marquee", catalog: "bento", theme: t("#fff4ea", "#3d1800", "#ff6a13", "#fff", "#ffe0c7", "26px", f.archivo) },
  { id: "midnight-lounge", name: "Midnight Lounge", vibe: "Deep purple bar-lounge mood", bestFor: ["restaurant", "hotel"], kind: "composed", hero: "banner", catalog: "list", theme: t("#150c24", "#efe6ff", "#b388ff", "#150c24", "#22163a", "16px", f.playfair, true) },
  { id: "kola-nut", name: "Kola Nut", vibe: "Rich red-brown magazine spreads", bestFor: ["fashion", "fresh-food"], kind: "composed", hero: "magazine", catalog: "rail", theme: t("#f8efe7", "#3d120a", "#9c2a16", "#fff", "#f0d9cb", "8px", f.dmserif) },
  { id: "mint-fresh", name: "Mint Fresh", vibe: "Bright mint, playful bento", bestFor: ["fresh-food", "beauty"], kind: "composed", hero: "poster", catalog: "polaroid", theme: t("#effcf6", "#063b2c", "#10b981", "#fff", "#d2f5e6", "30px", f.syne) },
  { id: "gold-coast", name: "Gold Coast", vibe: "Ivory and gold, refined board", bestFor: ["hotel", "bakery"], kind: "composed", hero: "minimal", catalog: "cards", theme: t("#fffdf7", "#2b2410", "#b8912f", "#fff", "#f5ecd2", "14px", f.playfair) },
  { id: "afro-beat", name: "Afrobeat", vibe: "High-contrast, music-poster energy", bestFor: ["fashion", "electronics", "restaurant"], kind: "composed", hero: "marquee", catalog: "masonry", caps: true, theme: t("#111111", "#ffffff", "#ff3d7f", "#fff", "#1e1e1e", "6px", f.archivo, true) },
];

export const templateIds = templates.map((x) => x.id);

export function getTemplate(id: string | undefined) {
  return templates.find((x) => x.id === id);
}

/** Default storefront a vendor gets before choosing one. */
export function defaultTemplateFor(vendor: Vendor) {
  return templates.find((x) => x.layout === vendor.layout) ?? templates[0]!;
}

export function templatesFor(type: BusinessType) {
  return [...templates].sort((a, b) => Number(b.bestFor.includes(type)) - Number(a.bestFor.includes(type)));
}

export { ALL as allBusinessTypes };
