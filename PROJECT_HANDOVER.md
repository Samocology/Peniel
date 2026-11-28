# Peniel Multi-Vendor Commerce Platform - Technical Handover Report

**Project:** Peniel (Flourish Platform)  
**Date:** 2026-11-28  
**Location:** `C:\Users\TECH\flourish-platform`  
**Purpose:** Complete technical documentation for the 33-storefront template redesign and marketplace vendor logo fix

---

## 1. Project Overview

### 1.1 Architecture Stack
| Layer | Technology |
|-------|------------|
| **Framework** | TanStack Start (React 19, TanStack Router, Vite, TypeScript) |
| **Deployment** | Cloudflare Workers |
| **Database** | Supabase (PostgreSQL) with RLS policies |
| **Media Storage** | Cloudflare R2 (logos, covers, product images) |
| **Styling** | Tailwind CSS v4, Radix UI primitives |
| **State Management** | Local-first `src/lib/peniel-store.ts` (localStorage + `storage` event sync) |
| **Validation** | Zod |

### 1.2 Business Domain
- **7 Business Categories:** `restaurant`, `fresh-food`, `beauty`, `fashion`, `bakery`, `hotel`, `electronics`
- **3 Fulfilment Modes:** `order` (delivery/pickup), `booking` (appointments), `reservation` (hotel rooms)
- **33 Storefront Templates:** 7 signature + 26 composed
- **Marketplace:** Discovery across 24 Nigerian cities

---

## 2. Completed Work Summary

### 2.1 Marketplace Vendor Logo Fix (Complete)
**Files Modified:**
- `src/components/site/bits.tsx` - Added `VendorLogo` component (lines 25-58)
- `src/routes/marketplace.tsx` - Integrated `VendorLogo` into 4 card representations:
  1. **Featured strip** (line 574)
  2. **Grid view** - mobile grid (line 785), desktop `VendorCard` (line 812)
  3. **List view** (line 834)
  4. **Top-rated section** (line 879)

**VendorLogo Component API:**
```tsx
interface VendorLogoProps {
  vendor: Vendor;
  size?: "sm" | "md" | "lg";  // sm: 28px, md: 36px, lg: 48px
}
```
- Shows uploaded logo from R2 if available
- Falls back to monogram (first 2 initials) in vendor's accent color
- Uses vendor's theme for border (`theme.line`) and background (`theme.accent`)

### 2.2 33-Storefront Template Redesign (Complete)

#### 2.2.1 Signature Layouts (7) - `src/components/store/layouts-a.tsx`
| Template ID | Name | Layout | Business Types |
|-------------|------|--------|----------------|
| `cinematic` | Cinematic | Full-bleed cover + floating card | restaurant, hotel |
| `builder` | Kit Builder | Interactive ingredient builder | fresh-food, restaurant |
| `editorial` | Editorial Arch | Script type, arched hero, booking slots | beauty |
| `gallery` | Atelier Gallery | Full-height lookbook, asymmetric grid | fashion, beauty |
| `playful` | Sugar Pop | Rounded, colorful, cake configurator | bakery |
| `reservation` | Grand Stay | Immersive hero with booking bar | hotel |
| `grid` | Tech Grid | Technical departments + spec cards | electronics |

#### 2.2.2 Composed Templates (26) - `src/components/store/layouts-c.tsx`
Each has unique `HeroBlock`, `ProductCard`, and `CatalogBlock` variants:

| Template ID | Name | Hero | Catalog | Best For | Theme Vibe |
|-------------|------|------|---------|----------|------------|
| `lagos-noir` | Lagos Noir | Split | Cards | restaurant, fashion | Black/gold luxury |
| `palm-wine` | Palm Wine | Centered | Board | restaurant | Warm terracotta |
| `neon-market` | Neon Market | Poster | Bento | electronics, fashion | Electric dark mode |
| `ankara-bloom` | Ankara Bloom | Magazine | Masonry | fashion, beauty | Bold print-inspired |
| `soft-spa` | Soft Spa | Minimal | List | beauty | Calm sage |
| `street-chop` | Street Chop | Marquee | Rail | restaurant, bakery | Loud yellow |
| `garden-fresh` | Garden Fresh | Split | Cards | restaurant, fresh-food | Light organic |
| `burger-barn` | Burger Barn | Poster | Bento | restaurant | Dark high-contrast |
| `royal-indigo` | Royal Indigo | Banner | Polaroid | fashion, hotel | Adire indigo/gold |
| `fresh-crate` | Fresh Crate | Split | List | fresh-food | Market-crate greens |
| `blush-boutique` | Blush Boutique | Centered | Polaroid | bakery, beauty | Pink handwritten |
| `concrete` | Concrete | Minimal | Board | electronics, fashion | Brutalist mono |
| `safari-lodge` | Safari Lodge | Magazine | Cards | hotel, restaurant | Earthy khaki |
| `ocean-breeze` | Ocean Breeze | Banner | Bento | hotel, beauty | Coastal blues |
| `cocoa-house` | Cocoa House | Poster | Rail | bakery, restaurant | Chocolate tones |
| `gadget-lab` | Gadget Lab | Split | Masonry | electronics | Clean white lab |
| `harmattan` | Harmattan | Centered | Masonry | fashion, hotel | Dusty sand luxury |
| `party-jollof` | Party Jollof | Marquee | Bento | restaurant, bakery | Festive orange |
| `midnight-lounge` | Midnight Lounge | Banner | List | restaurant, hotel | Deep purple |
| `kola-nut` | Kola Nut | Magazine | Rail | fashion, fresh-food | Rich red-brown |
| `mint-fresh` | Mint Fresh | Poster | Polaroid | fresh-food, beauty | Bright mint |
| `gold-coast` | Gold Coast | Minimal | Cards | hotel, bakery | Ivory and gold |
| `afro-beat` | Afrobeat | Marquee | Masonry | fashion, electronics, restaurant | High-contrast poster |

---

## 3. Key File Structure & Architecture

### 3.1 Storefront Routing (`src/routes/store.$slug.tsx`)
- **Loader:** Fetches vendor from `/api/vendors?slug=` → falls back to static `getVendor(slug)`
- **Template Selection Priority:**
  1. `?t=` preview param
  2. Vendor's `templateId` (saved choice)
  3. Account's `choice` (onboarding selection)
  4. `defaultTemplateFor(vendor)` - category-aware default
- **Render Logic:** Signature layouts render dedicated components; composed templates use `<ComposedStore vendor={vendor} tpl={tpl} />`

### 3.2 Template Definitions (`src/lib/templates.ts`)
```typescript
type StoreTemplate = {
  id: string;
  name: string;
  vibe: string;
  bestFor: BusinessType[];
  kind: "signature" | "composed";
  layout?: StoreLayout;           // signature only
  hero?: Hero;                     // composed only
  catalog?: Catalog;               // composed only
  caps?: boolean;                  // uppercase headings
  theme: Theme;                    // complete theme object
};
```
- **7 Signature:** Use `layout` field, themes derived from demo vendors
- **26 Composed:** Use `hero` + `catalog` fields, custom themes defined inline
- **Category-specific defaults:** `categoryTemplateIds` maps marketplace categories to template IDs

### 3.3 Composed Storefront (`src/components/store/layouts-c.tsx`)
- **2240 lines** - Complete implementation
- **Key Functions:**
  - `HeroBlock()` - 26 template-specific hero variants (lines 231-1118)
  - `ProductCard()` - Template-specific card styling via `getCardClasses()` (lines 1124-1249)
  - `CatalogBlock()` - 26 template-specific catalog variants (lines 1255-1893)
  - `TrustSection()` - Shared trust indicators
  - `BrandStory()` - Shared about section
  - `ComposedStore()` - Main composition (lines 2020-2240)

### 3.4 Vendor Data Mapping (`src/lib/backend-catalog.ts`)
- **R2 URL Generation:** `buildR2Url(objectKey)` → `https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev/{key}`
- **mapBackendVendor()** - Transforms Supabase vendor record to frontend `Vendor` type
- **Preserves backend vendor `id`** for vendor-scoped review APIs
- **Never uses demo logo/cover for different vendor** - only R2 URLs from storefront record

### 3.5 Client State (`src/lib/peniel-store.ts`)
- **Key:** `peniel-app-v2` in localStorage
- **Synced across tabs** via `storage` event
- **State includes:** cart, vendor accounts/plans, storefront choice, orders, chats, custom vendors
- **Auth:** Session restored via `/api/auth/session`, Supabase auth integration

---

## 4. Backend Functionality (Preserved - No Changes)

### 4.1 API Endpoints (`src/backend/`)
| Endpoint | Purpose |
|----------|---------|
| `/api/vendors` | List/search vendors (marketplace, storefront) |
| `/api/vendors/:slug` | Single vendor details |
| `/api/auth/*` | Supabase auth (login, logout, session, signup) |
| `/api/orders` | Order management |
| `/api/products` | Product CRUD |
| `/api/payments` | Peniel Pay integration |
| `/api/chat` | Customer-vendor messaging |
| `/api/admin/*` | Admin dashboard |

### 4.2 Database Schema (Supabase)
Key tables (via RLS policies):
- `vendors` - Business profiles, storefront config, theme, media keys
- `products` - Catalog items with `attributes` JSONB (image_object_key, meta, sizes)
- `orders` - Order/booking/reservation records
- `customers` - Customer profiles, addresses
- `chats` - Message threads with `sanitizeChat()` guard
- `reviews` - Ratings and reviews

### 4.3 Media Pipeline
- **Upload:** Vendor dashboard → Cloudflare R2 (signed URLs)
- **Keys Stored:** `logo_object_key`, `cover_object_key`, `image_object_key` in storefronts/products
- **Public URL:** `VITE_R2_PUBLIC_MEDIA_URL` env var (default: `https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev`)

---

## 5. Type Definitions (Critical for Changes)

### 5.1 Vendor Type (`src/lib/data.ts:131-174`)
```typescript
type Vendor = {
  id?: string;                    // Backend vendor ID
  slug: string;
  name: string;
  tagline: string;
  about: string;
  type: BusinessType;
  categorySlug: string;
  categoryLabel: string;
  layout: StoreLayout;
  templateId?: string;            // Selected composed template
  cover: string;                  // R2 URL or local asset
  logo?: string;                  // R2 URL if uploaded
  logo_object_key?: string;       // R2 object key
  cover_object_key?: string;
  monogram: string;               // Auto-generated from name
  verified: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  orders: string;                 // Display string
  location: string;
  hours: string;
  delivery: string;
  phone: string;
  email: string;
  fulfilment: "order" | "booking" | "reservation";
  status: string;
  theme: Theme;
  groups: string[];
  products: Product[];
};
```

### 5.2 Theme Type (`src/lib/data.ts:162-171`)
```typescript
type Theme = {
  bg: string;           // Background
  ink: string;          // Primary text
  accent: string;       // Brand accent
  accentInk: string;    // Text on accent
  soft: string;         // Subtle backgrounds
  line: string;         // Borders/dividers
  radius: string;       // Border radius (CSS value)
  heading: string;      // Font family (CSS var)
};
```

### 5.3 Product Type (`src/lib/data.ts:119-129`)
```typescript
type Product = {
  id: string;
  name: string;
  desc: string;
  price: number;        // In Naira (major units)
  tag?: string;         // "Bestseller", "New", etc.
  meta?: string;        // "Serves 2", "60 min", etc.
  group: string;        // Category group
  sizes?: string[];     // For fashion items
  images?: string[];    // R2 URLs
};
```

---

## 6. Existing Issues & Known Limitations

### 6.1 TypeScript Errors (Pre-existing, Unrelated to Redesign)
- `src/routes/admin.tsx` - Multiple errors in admin dashboard components
- `src/routes/vendor.tsx` - Multiple errors in vendor dashboard
- **These are pre-existing and were not introduced by the redesign**

### 6.2 Mobile Bottom Navigation
**Preserved as-is** - Located in `src/components/site/site-footer.tsx` or similar
- Must not be modified during any storefront work

### 6.3 Chat Guard (`src/lib/chat-guard.ts`)
- All chat text passes through `sanitizeChat()` to prevent contact detail exchange
- Must be preserved for any messaging features

### 6.4 Environment Variables Required
```env
VITE_R2_PUBLIC_MEDIA_URL=https://pub-d473c936045541be8e8ec4972efdf0ea.r2.dev
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
# Cloudflare Workers
# (configured in wrangler.toml)
```

---

## 7. Development Commands

```bash
# Development
npm run dev                    # Start Vite dev server

# Build
npm run build                  # Production build
npm run build:dev              # Development build

# Testing
npm run test:backend           # Run backend tests

# Deployment
npm run deploy                 # Build + wrangler deploy
npm run cf-typegen             # Generate Cloudflare types

# Code Quality
npm run lint                   # ESLint
npm run format                 # Prettier
```

---

## 8. How to Extend / Modify

### 8.1 Adding a New Composed Template
1. Add entry to `templates` array in `src/lib/templates.ts`:
   ```typescript
   {
     id: "my-template",
     name: "My Template",
     vibe: "Description",
     bestFor: ["restaurant"],
     kind: "composed",
     hero: "split",           // split | centered | banner | poster | minimal | magazine | marquee
     catalog: "cards",        // cards | list | masonry | rail | board | bento | polaroid
     caps: false,
     theme: t(bg, ink, accent, accentInk, soft, radius, heading, dark)
   }
   ```
2. Add `HeroBlock` variant in `layouts-c.tsx` (search for `// ═══ TEMPLATE-SPECIFIC HERO BLOCKS`)
3. Add `ProductCard` styling in `getCardClasses()` (line 1142)
4. Add `CatalogBlock` variant (search for `// ═══ TEMPLATE-SPECIFIC CATALOGUE VARIANTS`)
5. Add to `categoryTemplateIds` for relevant categories

### 8.2 Adding a New Signature Layout
1. Create component in `src/components/store/layouts-a.tsx` (or `layouts-b.tsx` for reservation)
2. Export from the file
3. Add to `templates` array with `kind: "signature"` and `layout: "your-layout"`
4. Add import and case in `src/routes/store.$slug.tsx` StorePage component

### 8.3 Modifying Marketplace Vendor Cards
- All 4 representations use `<VendorLogo vendor={v} size="sm" />` from `bits.tsx`
- To change logo display: edit `VendorLogo` component in `bits.tsx:25-58`
- To change card layout: edit `VendorCard` in `bits.tsx:80-137` or inline JSX in `marketplace.tsx`

---

## 9. File Checklist for Handover

All modified/created files remain on disk at `C:\Users\TECH\flourish-platform\`:

| File | Status | Description |
|------|--------|-------------|
| `src/components/site/bits.tsx` | ✅ Modified | Added `VendorLogo` component |
| `src/routes/marketplace.tsx` | ✅ Modified | Integrated `VendorLogo` in 4 locations |
| `src/components/store/layouts-a.tsx` | ✅ Redesigned | 6 signature layouts + StoreSidebar |
| `src/components/store/layouts-b.tsx` | ✅ Preserved | `ReservationStore` (Grand Stay) |
| `src/components/store/layouts-c.tsx` | ✅ Redesigned | 26 composed templates (2240 lines) |
| `src/routes/store.$slug.tsx` | ✅ Updated | Template selection logic |
| `src/lib/templates.ts` | ✅ Source of truth | 33 template definitions |
| `REDESIGN_README.md` | ✅ Created | Redesign summary documentation |
| `PROJECT_HANDOVER.md` | ✅ Created | This file |

---

## 10. Verification Steps

### 10.1 TypeScript Check
```bash
npx tsc --noEmit
# Should pass with only pre-existing admin/vendor route errors
```

### 10.2 Build Check
```bash
npm run build
# Should complete successfully
```

### 10.3 Manual Verification
1. **Marketplace** - Visit `/marketplace`, verify vendor logos appear in:
   - Featured strip (top)
   - Grid view (desktop cards + mobile)
   - List view
   - Top-rated section
2. **Storefronts** - Visit `/store/{slug}?t={templateId}` for each of 33 templates:
   - 7 signature: `cinematic`, `builder`, `editorial`, `gallery`, `playful`, `reservation`, `grid`
   - 26 composed: all IDs from `templates.ts` lines 136-371
3. **Mobile** - Verify bottom navigation works on all storefronts

---

## 11. Critical Notes for Next Developer

1. **DO NOT MODIFY** mobile bottom navigation - preserved across all storefronts
2. **DO NOT REMOVE** `VendorLogo` from marketplace - it's the fix for missing vendor logos
3. **Template themes** are complete in `templates.ts` - each composed template has unique colors, fonts, radius
3. **R2 URLs** are generated via `buildR2Url()` in both `store.$slug.tsx` and `backend-catalog.ts`
4. **Vendor data** flows: Backend → `mapBackendVendor()` → loader → `mergeVendor()` with account overrides → components
5. **State persistence** is localStorage + cross-tab sync - no backend state yet
6. **Chat guard** (`sanitizeChat`) must wrap all user-generated text in messaging

---

*End of Handover Report*