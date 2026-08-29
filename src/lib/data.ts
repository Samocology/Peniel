import coverAbigails from "@/assets/cover-abigails.jpg";
import coverFarm from "@/assets/cover-farm.jpg";
import coverGlamour from "@/assets/cover-glamour.jpg";
import coverCouture from "@/assets/cover-couture.jpg";
import coverBakery from "@/assets/cover-bakery.jpg";
import coverHotel from "@/assets/cover-hotel.jpg";
import coverTech from "@/assets/cover-tech.jpg";

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export type BusinessType =
  | "restaurant"
  | "fresh-food"
  | "beauty"
  | "fashion"
  | "bakery"
  | "hotel"
  | "electronics";

export type StoreLayout =
  | "cinematic"
  | "builder"
  | "editorial"
  | "gallery"
  | "playful"
  | "reservation"
  | "grid";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  icon: string;
};

export const categories: Category[] = [
  { slug: "restaurants", name: "Restaurants", blurb: "Order meals from kitchens near you", count: 1248, icon: "UtensilsCrossed" },
  { slug: "bars", name: "Bars", blurb: "Drinks, lounges and nightlife", count: 214, icon: "Martini" },
  { slug: "grocery", name: "Grocery", blurb: "Everyday food and household stock", count: 486, icon: "ShoppingBasket" },
  { slug: "fresh-food", name: "Fresh Food & Farm", blurb: "Farm produce and ready meal kits", count: 173, icon: "Sprout" },
  { slug: "fashion", name: "Fashion", blurb: "Ready-to-wear, tailoring and fabric", count: 932, icon: "Shirt" },
  { slug: "beauty", name: "Beauty", blurb: "Skincare, cosmetics and wellness", count: 611, icon: "Sparkles" },
  { slug: "salons", name: "Salons & Barbers", blurb: "Hair, nails, grooming appointments", count: 704, icon: "Scissors" },
  { slug: "bakeries", name: "Cakes & Bakeries", blurb: "Custom cakes, pastries, small chops", count: 389, icon: "CakeSlice" },
  { slug: "electronics", name: "Electronics", blurb: "Phones, laptops, gadgets and repair", count: 268, icon: "Smartphone" },
  { slug: "gifts", name: "Gifts & Florists", blurb: "Flowers, hampers and surprises", count: 197, icon: "Gift" },
  { slug: "hotels", name: "Hotels & Stays", blurb: "Rooms, shortlets and experiences", count: 156, icon: "BedDouble" },
  { slug: "home-services", name: "Home & Personal Services", blurb: "Cleaning, repairs, logistics", count: 342, icon: "Wrench" },
  { slug: "events", name: "Events & Experiences", blurb: "Planners, venues, rentals", count: 128, icon: "PartyPopper" },
];

export type Product = {
  id: string;
  name: string;
  desc: string;
  price: number;
  tag?: string;
  meta?: string;
  group: string;
};

export type Vendor = {
  slug: string;
  name: string;
  tagline: string;
  about: string;
  type: BusinessType;
  categorySlug: string;
  categoryLabel: string;
  layout: StoreLayout;
  cover: string;
  monogram: string;
  verified: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  orders: string;
  location: string;
  hours: string;
  delivery: string;
  phone: string;
  email: string;
  fulfilment: "order" | "booking" | "reservation";
  /** storefront theme — vendor brand owns the visual, platform stays subtle */
  theme: {
    bg: string;
    ink: string;
    accent: string;
    accentInk: string;
    soft: string;
    line: string;
    radius: string;
    heading: string;
  };
  groups: string[];
  products: Product[];
};

export const vendors: Vendor[] = [
  {
    slug: "abigails-kitchen",
    name: "Abigail's Kitchen",
    tagline: "Bold flavours. Made with love.",
    about:
      "Abigail's Kitchen is a Lagos-based restaurant delivering rich, delicious Nigerian meals made with love and fresh ingredients. Party trays, family packs and everyday plates.",
    type: "restaurant",
    categorySlug: "restaurants",
    categoryLabel: "Restaurant",
    layout: "cinematic",
    cover: coverAbigails,
    monogram: "AK",
    verified: true,
    featured: true,
    rating: 4.8,
    reviews: 324,
    orders: "1.2K+ orders completed",
    location: "15 Admiralty Way, Lekki Phase 1, Lagos",
    hours: "Mon – Sun: 8:00 AM – 10:00 PM",
    delivery: "Delivery within Lekki, VI, Ikoyi & environs. ₦1,500 fee. Free above ₦20,000.",
    phone: "0812 345 6789",
    email: "hello@abigailskitchen.ng",
    fulfilment: "order",
    theme: {
      bg: "#12160f",
      ink: "#f6f2e8",
      accent: "#c9a227",
      accentInk: "#1a1a12",
      soft: "#1c2118",
      line: "rgba(246,242,232,0.14)",
      radius: "18px",
      heading: "var(--font-script)",
    },
    groups: ["Popular", "Main Dishes", "Sides", "Drinks", "Combos", "Catering"],
    products: [
      { id: "ak-1", name: "Party Jollof Rice", desc: "Delicious party-style jollof rice with grilled chicken", price: 4500, tag: "Bestseller", group: "Popular", meta: "Serves 1" },
      { id: "ak-2", name: "Egusi Soup (Large)", desc: "Egusi soup with assorted meat and pounded yam", price: 5500, group: "Popular", meta: "Serves 2" },
      { id: "ak-3", name: "Suya Platter", desc: "Spicy grilled meat served with onions & peppers", price: 4000, group: "Popular", meta: "Serves 2" },
      { id: "ak-4", name: "Fried Rice (Large)", desc: "Special fried rice with mixed veggies & chicken", price: 4000, group: "Main Dishes" },
      { id: "ak-5", name: "Peppered Chicken", desc: "Grilled chicken tossed in house pepper sauce", price: 6000, group: "Sides" },
      { id: "ak-6", name: "Moi Moi", desc: "Steamed bean pudding, soft and rich", price: 2000, group: "Sides" },
      { id: "ak-7", name: "Chapman (1L)", desc: "House chapman, chilled and served in a jar", price: 3000, group: "Drinks" },
      { id: "ak-8", name: "Owambe Party Tray", desc: "Jollof, fried rice, protein & small chops for 20", price: 95000, tag: "Catering", group: "Catering" },
    ],
  },
  {
    slug: "fresh-from-the-farm",
    name: "Fresh From the Farm",
    tagline: "From the soil to your kitchen.",
    about:
      "We deliver farm-fresh produce, cleaned and prepped ingredients, meal kits and farm boxes across Lagos. Tell us the dish and how many people you're cooking for — we do the maths.",
    type: "fresh-food",
    categorySlug: "fresh-food",
    categoryLabel: "Fresh Food & Farm",
    layout: "builder",
    cover: coverFarm,
    monogram: "FF",
    verified: true,
    featured: true,
    rating: 4.7,
    reviews: 154,
    orders: "820+ boxes delivered",
    location: "Farm hub, Ikorodu • Delivery across Lagos",
    hours: "Mon – Sat: 7:00 AM – 7:00 PM",
    delivery: "Next-day delivery island & mainland. Free above ₦25,000.",
    phone: "0803 111 2244",
    email: "orders@freshfromthefarm.ng",
    fulfilment: "order",
    theme: {
      bg: "#f4f8ee",
      ink: "#17301a",
      accent: "#3f8f3f",
      accentInk: "#ffffff",
      soft: "#e4efd8",
      line: "rgba(23,48,26,0.12)",
      radius: "26px",
      heading: "var(--font-display)",
    },
    groups: ["Meal Kits", "Farm Boxes", "Fresh Produce", "Proteins", "Prepped & Cleaned"],
    products: [
      { id: "ff-1", name: "Egusi Soup Kit", desc: "Ground egusi, ugu, palm oil, crayfish, seasoning — measured", price: 12500, tag: "Signature", group: "Meal Kits", meta: "Serves 6" },
      { id: "ff-2", name: "Efo Riro Kit", desc: "Shredded efo, locust bean, pepper mix, iru, palm oil", price: 10800, group: "Meal Kits", meta: "Serves 6" },
      { id: "ff-3", name: "Jollof Party Kit", desc: "Long grain rice, blended stew base, spices, oil", price: 15900, group: "Meal Kits", meta: "Serves 10" },
      { id: "ff-4", name: "Weekly Family Farm Box", desc: "Tomatoes, peppers, onions, leafy greens, yam, plantain", price: 22000, tag: "Subscription", group: "Farm Boxes" },
      { id: "ff-5", name: "Fresh Tomatoes (1kg)", desc: "Roma tomatoes, sorted and washed", price: 2500, group: "Fresh Produce" },
      { id: "ff-6", name: "Goat Meat (2kg)", desc: "Cut, cleaned, ready to cook", price: 18000, group: "Proteins" },
      { id: "ff-7", name: "Cleaned Cow Tripe (Shaki)", desc: "Deep-cleaned, par-boiled, portioned", price: 9500, group: "Prepped & Cleaned" },
      { id: "ff-8", name: "Blended Pepper Mix (1L)", desc: "Rodo, tatashe, onion — blended fresh daily", price: 4200, group: "Prepped & Cleaned" },
    ],
  },
  {
    slug: "glamour-beauty-lounge",
    name: "Glamour Beauty Lounge",
    tagline: "Relax. Refresh. Glow.",
    about:
      "A full-service beauty lounge in Lekki Phase 1 offering massage, facials, nails, lashes and bridal glam. Book your slot, choose your specialist, arrive to a room made ready for you.",
    type: "beauty",
    categorySlug: "salons",
    categoryLabel: "Beauty & Spa",
    layout: "editorial",
    cover: coverGlamour,
    monogram: "GB",
    verified: true,
    featured: true,
    rating: 4.8,
    reviews: 236,
    orders: "2.4K+ appointments",
    location: "15 Admiralty Way, Lekki Phase 1, Lagos",
    hours: "Tue – Sun: 9:00 AM – 8:00 PM",
    delivery: "In-lounge service. Home service available within Lekki.",
    phone: "0812 345 6789",
    email: "hello@glamourbeautylounge.com",
    fulfilment: "booking",
    theme: {
      bg: "#fff7fa",
      ink: "#2b0f1c",
      accent: "#d9407e",
      accentInk: "#ffffff",
      soft: "#ffe6ef",
      line: "rgba(43,15,28,0.1)",
      radius: "20px",
      heading: "var(--font-script)",
    },
    groups: ["Massage", "Facials", "Nails", "Lashes & Brows", "Bridal"],
    products: [
      { id: "gb-1", name: "Signature Full Body Massage", desc: "Deep relaxation massage with warm oils", price: 25000, tag: "Most booked", group: "Massage", meta: "60 min" },
      { id: "gb-2", name: "Hot Stone Therapy", desc: "Heated basalt stones to release deep tension", price: 32000, group: "Massage", meta: "75 min" },
      { id: "gb-3", name: "Glow Facial", desc: "Cleanse, exfoliate, extraction, mask, LED", price: 28000, group: "Facials", meta: "50 min" },
      { id: "gb-4", name: "Gel Manicure", desc: "Shaping, cuticle care, gel colour of choice", price: 12000, group: "Nails", meta: "45 min" },
      { id: "gb-5", name: "Luxury Pedicure", desc: "Soak, scrub, massage and polish", price: 15000, group: "Nails", meta: "60 min" },
      { id: "gb-6", name: "Volume Lash Set", desc: "Handmade fans, customised to your eye shape", price: 22000, group: "Lashes & Brows", meta: "90 min" },
      { id: "gb-7", name: "Bridal Glam Package", desc: "Trial, wedding day makeup, gele and touch-up kit", price: 180000, tag: "Package", group: "Bridal", meta: "Full day" },
    ],
  },
  {
    slug: "kemis-couture",
    name: "Kemi's Couture",
    tagline: "Threads of Africa, cut for now.",
    about:
      "Made-to-measure and ready-to-wear pieces from a Victoria Island atelier. Ankara, aso-oke, adire and tailored suiting — produced in small runs.",
    type: "fashion",
    categorySlug: "fashion",
    categoryLabel: "Fashion",
    layout: "gallery",
    cover: coverCouture,
    monogram: "KC",
    verified: true,
    featured: true,
    rating: 4.9,
    reviews: 87,
    orders: "640+ pieces shipped",
    location: "Adeola Odeku, Victoria Island, Lagos",
    hours: "Mon – Sat: 10:00 AM – 7:00 PM",
    delivery: "Nationwide delivery 2–5 days. Free above ₦150,000.",
    phone: "0701 998 3311",
    email: "atelier@kemiscouture.com",
    fulfilment: "order",
    theme: {
      bg: "#0c0c0c",
      ink: "#f2ede4",
      accent: "#c9a227",
      accentInk: "#0c0c0c",
      soft: "#151515",
      line: "rgba(242,237,228,0.16)",
      radius: "0px",
      heading: "var(--font-display)",
    },
    groups: ["New Season", "Ready to Wear", "Made to Measure", "Accessories"],
    products: [
      { id: "kc-1", name: "Adire Column Dress", desc: "Hand-dyed adire, bias cut, floor length", price: 165000, tag: "New", group: "New Season", meta: "UK 6–16" },
      { id: "kc-2", name: "Aso-Oke Blazer", desc: "Structured shoulder, silk-lined, single button", price: 210000, group: "New Season" },
      { id: "kc-3", name: "Ankara Wrap Skirt", desc: "Wax print, adjustable tie waist", price: 78000, group: "Ready to Wear" },
      { id: "kc-4", name: "Kaftan Shirt", desc: "Cotton poplin with embroidered placket", price: 92000, group: "Ready to Wear" },
      { id: "kc-5", name: "Bespoke Agbada (3pc)", desc: "Measured, fitted, two fittings included", price: 480000, tag: "Atelier", group: "Made to Measure", meta: "3–4 weeks" },
      { id: "kc-6", name: "Beaded Clutch", desc: "Hand-beaded, satin lining, chain strap", price: 54000, group: "Accessories" },
    ],
  },
  {
    slug: "mama-cee-confectionery",
    name: "Mama Cee Confectionery",
    tagline: "Every celebration deserves cake.",
    about:
      "Port Harcourt bakery baking custom cakes, cupcakes, small chops and dessert tables. Choose a size, pick a flavour, tell us the message — we bake to order.",
    type: "bakery",
    categorySlug: "bakeries",
    categoryLabel: "Cakes & Bakery",
    layout: "playful",
    cover: coverBakery,
    monogram: "MC",
    verified: true,
    featured: false,
    rating: 4.9,
    reviews: 72,
    orders: "410+ cakes baked",
    location: "GRA Phase 2, Port Harcourt",
    hours: "Mon – Sat: 9:00 AM – 6:00 PM",
    delivery: "Pre-order 48hrs. Pickup or PH delivery from ₦3,000.",
    phone: "0806 552 7788",
    email: "orders@mamacee.ng",
    fulfilment: "order",
    theme: {
      bg: "#fffaf5",
      ink: "#4a2b2b",
      accent: "#e07a8b",
      accentInk: "#ffffff",
      soft: "#ffeef0",
      line: "rgba(74,43,43,0.1)",
      radius: "32px",
      heading: "var(--font-display)",
    },
    groups: ["Celebration Cakes", "Cupcakes", "Small Chops", "Dessert Tables"],
    products: [
      { id: "mc-1", name: "Classic Vanilla Cake", desc: "Buttercream finish, message piped free", price: 35000, tag: "Popular", group: "Celebration Cakes", meta: '8" round' },
      { id: "mc-2", name: "Red Velvet Two-Tier", desc: "Cream cheese frosting, fresh florals", price: 96000, group: "Celebration Cakes", meta: '6" + 8"' },
      { id: "mc-3", name: "Chocolate Fudge Cake", desc: "Rich ganache drip, chocolate shards", price: 48000, group: "Celebration Cakes" },
      { id: "mc-4", name: "Cupcake Box (12)", desc: "Assorted flavours, swirl frosting", price: 18000, group: "Cupcakes" },
      { id: "mc-5", name: "Small Chops Platter", desc: "Puff puff, samosa, spring roll, gizzard", price: 25000, group: "Small Chops", meta: "Serves 10" },
      { id: "mc-6", name: "Dessert Table Setup", desc: "Cake, cupcakes, donuts, macarons, styling", price: 250000, tag: "Events", group: "Dessert Tables" },
    ],
  },
  {
    slug: "eko-heights-hotel",
    name: "Eko Heights Hotel",
    tagline: "Rest above the city.",
    about:
      "A 42-room boutique hotel on the Lagos Island skyline. Rooms, suites and day-use spaces with breakfast, fast Wi-Fi and airport pickup.",
    type: "hotel",
    categorySlug: "hotels",
    categoryLabel: "Hotel & Stays",
    layout: "reservation",
    cover: coverHotel,
    monogram: "EH",
    verified: true,
    featured: false,
    rating: 4.6,
    reviews: 218,
    orders: "3.1K+ nights booked",
    location: "Ozumba Mbadiwe Ave, Victoria Island, Lagos",
    hours: "Reception open 24/7",
    delivery: "Check-in 2:00 PM • Check-out 12:00 PM",
    phone: "0700 356 4488",
    email: "reservations@ekoheights.com",
    fulfilment: "reservation",
    theme: {
      bg: "#0d1424",
      ink: "#eef2f8",
      accent: "#c7973f",
      accentInk: "#0d1424",
      soft: "#141d31",
      line: "rgba(238,242,248,0.14)",
      radius: "8px",
      heading: "var(--font-display)",
    },
    groups: ["Rooms", "Suites", "Day Use", "Extras"],
    products: [
      { id: "eh-1", name: "Classic King Room", desc: "28sqm, king bed, city view, breakfast included", price: 145000, group: "Rooms", meta: "per night" },
      { id: "eh-2", name: "Twin Deluxe", desc: "Two double beds, work desk, breakfast included", price: 168000, group: "Rooms", meta: "per night" },
      { id: "eh-3", name: "Skyline Suite", desc: "Living area, marble bath, lounge access", price: 320000, tag: "Best view", group: "Suites", meta: "per night" },
      { id: "eh-4", name: "Executive Day Office", desc: "9am–6pm private room with Wi-Fi & coffee", price: 55000, group: "Day Use" },
      { id: "eh-5", name: "Airport Pickup", desc: "Private car from Murtala Muhammed to hotel", price: 35000, group: "Extras" },
    ],
  },
  {
    slug: "lagos-tech-hub",
    name: "Lagos Tech Hub Store",
    tagline: "Verified gadgets. Real warranty.",
    about:
      "Computer Village's most-reviewed gadget store. Phones, laptops, audio and accessories with a 12-month warranty and in-house repair bench.",
    type: "electronics",
    categorySlug: "electronics",
    categoryLabel: "Electronics",
    layout: "grid",
    cover: coverTech,
    monogram: "LT",
    verified: true,
    featured: false,
    rating: 4.6,
    reviews: 210,
    orders: "5.6K+ devices sold",
    location: "Computer Village, Ikeja, Lagos",
    hours: "Mon – Sat: 8:30 AM – 7:00 PM",
    delivery: "1–2 day dispatch nationwide. Pickup available.",
    phone: "0809 442 1177",
    email: "sales@lagostechhub.com",
    fulfilment: "order",
    theme: {
      bg: "#0f1216",
      ink: "#e8edf4",
      accent: "#3b82f6",
      accentInk: "#04070d",
      soft: "#171b21",
      line: "rgba(232,237,244,0.12)",
      radius: "10px",
      heading: "var(--font-display)",
    },
    groups: ["Phones", "Laptops", "Audio", "Accessories", "Repairs"],
    products: [
      { id: "lt-1", name: "iPhone 14 Pro (128GB)", desc: "UK used, 92% battery, 12-month warranty", price: 780000, tag: "Hot", group: "Phones" },
      { id: "lt-2", name: "Samsung A55 (256GB)", desc: "Brand new, sealed, Nigerian warranty", price: 520000, group: "Phones" },
      { id: "lt-3", name: "MacBook Air M2", desc: "8GB / 256GB, cycle count under 50", price: 1250000, group: "Laptops" },
      { id: "lt-4", name: "Dell Latitude 7420", desc: "i7 11th gen, 16GB, 512GB SSD", price: 680000, group: "Laptops" },
      { id: "lt-5", name: "Sony WH-1000XM4", desc: "Noise cancelling over-ear, 30h battery", price: 285000, group: "Audio" },
      { id: "lt-6", name: "65W GaN Charger", desc: "Dual USB-C, fast charge, surge safe", price: 32000, group: "Accessories" },
      { id: "lt-7", name: "Screen Replacement", desc: "Bench repair, same-day for most models", price: 65000, group: "Repairs", meta: "from" },
    ],
  },
];

export const getVendor = (slug: string) => vendors.find((v) => v.slug === slug);

export const vendorsByCategory = (slug: string) =>
  vendors.filter((v) => v.categorySlug === slug);

export type CartLine = {
  vendor: string;
  vendorSlug: string;
  item: string;
  meta: string;
  qty: number;
  price: number;
};

export const cartLines: CartLine[] = [
  { vendor: "Abigail's Kitchen", vendorSlug: "abigails-kitchen", item: "Jollof Rice (Party Size)", meta: "Large (Serves 10–15) • Add grilled chicken", qty: 1, price: 15000 },
  { vendor: "Abigail's Kitchen", vendorSlug: "abigails-kitchen", item: "Suya Platter", meta: "Regular", qty: 1, price: 8000 },
  { vendor: "Glamour Beauty Lounge", vendorSlug: "glamour-beauty-lounge", item: "Signature Full Body Massage", meta: "Sat 24 May • 2:00 PM • Esther B.", qty: 1, price: 25000 },
  { vendor: "Fresh From the Farm", vendorSlug: "fresh-from-the-farm", item: "Fresh Tomatoes (1kg)", meta: "Roma tomatoes", qty: 2, price: 2500 },
];

export const cartTotals = () => {
  const subtotal = cartLines.reduce((s, l) => s + l.price * l.qty, 0);
  const delivery = 2500;
  const platformFee = Math.round(subtotal * 0.02);
  return { subtotal, delivery, platformFee, total: subtotal + delivery + platformFee };
};

export type Order = {
  id: string;
  vendor: string;
  vendorSlug: string;
  kind: "order" | "booking";
  placed: string;
  status: "Preparing" | "Out for delivery" | "Delivered" | "Confirmed" | "Cancelled";
  total: number;
  items: string;
};

export const orders: Order[] = [
  { id: "ORD-2025-05-23-7F4X2", vendor: "Abigail's Kitchen", vendorSlug: "abigails-kitchen", kind: "order", placed: "23 May 2025, 10:24 AM", status: "Preparing", total: 26760, items: "2 items" },
  { id: "GBL-2025-05-23-7F4X2", vendor: "Glamour Beauty Lounge", vendorSlug: "glamour-beauty-lounge", kind: "booking", placed: "23 May 2025, 09:02 AM", status: "Confirmed", total: 25000, items: "Signature Full Body Massage" },
  { id: "ORD-2025-05-18-2K9L1", vendor: "Fresh From the Farm", vendorSlug: "fresh-from-the-farm", kind: "order", placed: "18 May 2025, 04:12 PM", status: "Delivered", total: 34500, items: "3 items" },
  { id: "ORD-2025-05-02-8B3M7", vendor: "Kemi's Couture", vendorSlug: "kemis-couture", kind: "order", placed: "2 May 2025, 01:40 PM", status: "Delivered", total: 165000, items: "1 item" },
];

export const reviews = [
  { name: "Tosin A.", when: "2 days ago", stars: 5, text: "The jollof rice was amazing! Great portion and excellent customer service.", vendor: "Abigail's Kitchen" },
  { name: "Linda O.", when: "1 week ago", stars: 5, text: "The best native soup I've had in a long time. Will definitely order again!", vendor: "Abigail's Kitchen" },
  { name: "Chioma A.", when: "3 days ago", stars: 5, text: "Booked the massage and it was worth every naira. The room was ready on time.", vendor: "Glamour Beauty Lounge" },
  { name: "Ngozi E.", when: "2 weeks ago", stars: 4, text: "The egusi kit saved my Sunday. Everything measured, nothing wasted.", vendor: "Fresh From the Farm" },
];

export const salesSeries = [
  { day: "Mon", sales: 82000, orders: 12 },
  { day: "Tue", sales: 124000, orders: 19 },
  { day: "Wed", sales: 96000, orders: 14 },
  { day: "Thu", sales: 158000, orders: 23 },
  { day: "Fri", sales: 246000, orders: 34 },
  { day: "Sat", sales: 312000, orders: 46 },
  { day: "Sun", sales: 198000, orders: 27 },
];

export const platformSeries = [
  { month: "Jan", gmv: 42, revenue: 3.1 },
  { month: "Feb", gmv: 51, revenue: 3.8 },
  { month: "Mar", gmv: 63, revenue: 4.6 },
  { month: "Apr", gmv: 78, revenue: 5.7 },
  { month: "May", gmv: 96, revenue: 7.1 },
  { month: "Jun", gmv: 118, revenue: 8.9 },
];
