import { useSyncExternalStore } from "react";
import { cartLines as seedCart, getVendor, vendors, type CartLine, type Product, type Vendor } from "./data";
import { sanitizeChat } from "./chat-guard";

/**
 * Local-first app state (no backend yet). Saved in the browser and synced live
 * across every open tab/window of the app via the `storage` event.
 */
export type Plan = "starter" | "growth" | "business";
export type OrderStatus = "New" | "Confirmed" | "Preparing" | "Out for delivery" | "Delivered" | "Cancelled";
export type OrderLine = { id: string; item: string; meta: string; qty: number; price: number };

export type Profile = Partial<Pick<Vendor, "name" | "tagline" | "about" | "location" | "hours" | "delivery">> & {
  deliveryFee?: number;
  freeAbove?: number;
  published?: boolean;
  acceptingOrders?: boolean;
  acceptingBookings?: boolean;
  paused?: boolean;
};

export type Account = {
  plan: Plan;
  choice?: string;
  picks: number;
  profile: Profile;
  verification: "none" | "applied";
  promos: { code: string; offer: string; active: boolean; uses: number; revenue: number }[];
  hidden: string[];
  products?: Product[];
  payoutBank?: {
    bankName: string;
    accountName: string;
    accountLast4: string;
    linkedAt: number;
  };
};

export type ChatMsg = { from: "customer" | "vendor"; text: string; at: number; blocked?: boolean };
export type Thread = { id: string; vendorSlug: string; customer: string; messages: ChatMsg[]; readC: number; readV: number };
export type CartItem = CartLine & { id: string };

export type VendorOrder = {
  id: string;
  vendorSlug: string;
  customer: string;
  items: string;
  mode: string;
  total: number;
  status: OrderStatus;
  createdAt?: number;
  lineItems?: OrderLine[];
};

type State = {
  vendorSlug: string;
  customer: { name: string; city: string };
  user?: { name: string; email: string; role: "customer" | "vendor" } | undefined;
  accounts: Record<string, Account>;
  cart: CartItem[];
  promo?: string | undefined;
  favorites: string[];
  orders: VendorOrder[];
  completedCheckouts?: Record<string, string[]>;
  threads: Thread[];
};

const KEY = "peniel-app-v2";

const seedOrders: VendorOrder[] = [
  { id: "#ORD-7F4X2", vendorSlug: "abigails-kitchen", customer: "Tosin A.", items: "2 items", mode: "Delivery · VI", total: 26760, status: "New" },
  { id: "#ORD-7F4X1", vendorSlug: "abigails-kitchen", customer: "Ada N.", items: "1 item", mode: "Pickup", total: 12400, status: "New" },
  { id: "#ORD-7F4W9", vendorSlug: "abigails-kitchen", customer: "Bola S.", items: "2 items", mode: "Delivery · Lekki", total: 16000, status: "Out for delivery" },
  { id: "#ORD-7F4W8", vendorSlug: "abigails-kitchen", customer: "Kelechi O.", items: "4 items", mode: "Delivery · Yaba", total: 41200, status: "Preparing" },
  { id: "#ORD-7F4W7", vendorSlug: "abigails-kitchen", customer: "Chidi O.", items: "1 item", mode: "Pickup", total: 22000, status: "Delivered" },
  { id: "#ORD-7F4W5", vendorSlug: "abigails-kitchen", customer: "Halima B.", items: "3 items", mode: "Delivery · Ikoyi", total: 33500, status: "Delivered" },
  { id: "#ORD-7F4W2", vendorSlug: "abigails-kitchen", customer: "Uche E.", items: "1 item", mode: "Delivery · Surulere", total: 9800, status: "Cancelled" },
];

const newAccount = (): Account => ({ plan: "starter", picks: 0, profile: {}, verification: "none", promos: [], hidden: [], products: [] });

function makeInitial(): State {
  return {
    vendorSlug: "abigails-kitchen",
    customer: { name: "Tosin A.", city: "Lagos State" },
    accounts: {},
    cart: seedCart.map((l, i) => ({ ...l, id: "seed-" + i })),
    favorites: [],
    orders: seedOrders,
    completedCheckouts: {},
    threads: [
      {
        id: "t-abigails-kitchen",
        vendorSlug: "abigails-kitchen",
        customer: "Tosin A.",
        readC: 2,
        readV: 1,
        messages: [
          { from: "customer", text: "Hi! Can you do party jollof for 30 guests next Saturday?", at: 1760680000000 },
          { from: "vendor", text: "Yes we can! For 30 guests we'd suggest 3 large trays. Want a quote?", at: 1760680600000 },
        ],
      },
    ],
  };
}

const initial = makeInitial();
let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      state = makeInitial();
      return;
    }
    const restored = JSON.parse(raw) as Partial<State>;
    state = {
      ...makeInitial(),
      ...restored,
      completedCheckouts: restored.completedCheckouts ?? {},
      orders: (restored.orders ?? seedOrders).map((order) => ({
        ...order,
        vendorSlug: order.vendorSlug ?? "abigails-kitchen",
      })),
    };
  } catch {
    state = makeInitial();
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  read();
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      read();
      emit();
    }
  });
}

function set(fn: (s: State) => State) {
  load();
  state = fn(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  emit();
}

const acct = (s: State, slug = s.vendorSlug) => s.accounts[slug] ?? newAccount();
const patchAcct = (slug: string, p: (a: Account) => Partial<Account>) =>
  set((s) => ({ ...s, accounts: { ...s.accounts, [slug]: { ...acct(s, slug), ...p(acct(s, slug)) } } }));

/** Free (Starter) vendors may pick a storefront once; paid plans can switch any time. */
export function canPickStorefront(plan: Plan, picksSoFar: number) {
  return plan !== "starter" || picksSoFar < 1;
}
export const isPaid = (plan: Plan) => plan !== "starter";

export const PROMO_CODES: Record<string, number> = { WEEKEND10: 0.1, FIRSTBITE: 0.05 };

export function totalsFor(lines: CartLine[], promo?: string) {
  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const discount = Math.round(subtotal * (promo ? (PROMO_CODES[promo] ?? 0) : 0));
  const delivery = lines.length ? 2500 : 0;
  const platformFee = Math.round((subtotal - discount) * 0.02);
  return { subtotal, discount, delivery, platformFee, total: subtotal - discount + delivery + platformFee };
}

export const app = {
  get: () => {
    load();
    return state;
  },
  subscribe(l: () => void) {
    load();
    listeners.add(l);
    return () => listeners.delete(l);
  },
  account: (slug?: string) => acct(app.get(), slug),
  switchVendor: (slug: string) => set((s) => ({ ...s, vendorSlug: slug })),

  chooseStorefront(templateId: string): boolean {
    const s = app.get();
    const a = acct(s);
    if (a.choice === templateId) return true;
    if (!canPickStorefront(a.plan, a.picks)) return false;
    patchAcct(s.vendorSlug, (x) => ({ choice: templateId, picks: x.picks + 1 }));
    return true;
  },
  /** Plan changes only happen through the upgrade checkout (simulated payment). */
  upgrade: (plan: Plan) => patchAcct(app.get().vendorSlug, () => ({ plan })),
  saveProfile: (profile: Profile) => patchAcct(app.get().vendorSlug, (a) => ({ profile: { ...a.profile, ...profile } })),
  applyVerification: () => {
    if (!isPaid(app.account().plan)) return false;
    patchAcct(app.get().vendorSlug, () => ({ verification: "applied" }));
    return true;
  },
  addPromo(code: string, offer: string) {
    if (!isPaid(app.account().plan)) return false;
    patchAcct(app.get().vendorSlug, (a) => ({ promos: [{ code: code.toUpperCase(), offer, active: true, uses: 0, revenue: 0 }, ...a.promos] }));
    return true;
  },
  togglePromo: (code: string) =>
    patchAcct(app.get().vendorSlug, (a) => ({ promos: a.promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p)) })),
  toggleHidden: (productId: string) =>
    patchAcct(app.get().vendorSlug, (a) => ({
      hidden: a.hidden.includes(productId) ? a.hidden.filter((x) => x !== productId) : [...a.hidden, productId],
    })),
  addProduct: (product: Product) =>
    patchAcct(app.get().vendorSlug, (a) => ({
      products: [...(a.products ?? []), product],
    })),
  setOrderStatus: (id: string, status: OrderStatus) =>
    set((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
  linkPayoutBank(bankName: string, accountName: string, accountNumber: string) {
    const normalizedName = accountName.trim();
    const normalizedNumber = accountNumber.replace(/\s/g, "");
    if (!bankName.trim() || !normalizedName || !/^\d{10}$/.test(normalizedNumber)) return false;
    patchAcct(app.get().vendorSlug, () => ({
      payoutBank: {
        bankName: bankName.trim(),
        accountName: normalizedName,
        accountLast4: normalizedNumber.slice(-4),
        linkedAt: Date.now(),
      },
    }));
    return true;
  },
  completeCheckout(checkoutId: string) {
    let orderIds: string[] = [];
    set((s) => {
      const completed = s.completedCheckouts ?? {};
      if (completed[checkoutId]) {
        orderIds = completed[checkoutId];
        return s;
      }
      if (!s.cart.length) return s;

      const grouped = new Map<string, CartItem[]>();
      for (const line of s.cart) {
        const lines = grouped.get(line.vendorSlug) ?? [];
        lines.push(line);
        grouped.set(line.vendorSlug, lines);
      }

      const groupedLines = [...grouped];
      const subtotal = s.cart.reduce((sum, line) => sum + line.price * line.qty, 0);
      const discount = Math.round(subtotal * (PROMO_CODES[s.promo ?? ""] ?? 0));
      let discountRemaining = discount;
      const createdAt = Date.now();
      const createdOrders: VendorOrder[] = groupedLines.map(([vendorSlug, lines], index) => {
        const vendor = getVendor(vendorSlug);
        const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
        const checkoutSuffix = checkoutId.replace(/[^a-z0-9]/gi, "").slice(-6).toUpperCase();
        const id = `ORD-${createdAt.toString(36).toUpperCase()}-${checkoutSuffix}-${index + 1}`;
        const gross = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
        const plannedDiscount =
          index === groupedLines.length - 1
            ? discountRemaining
            : subtotal > 0
              ? Math.round((discount * gross) / subtotal)
              : 0;
        const discountShare = Math.min(discountRemaining, Math.max(0, plannedDiscount));
        discountRemaining -= discountShare;
        return {
          id,
          vendorSlug,
          customer: s.customer.name,
          items: `${itemCount} ${itemCount === 1 ? "item" : "items"}`,
          mode:
            vendor?.fulfilment === "booking"
              ? "Appointment request"
              : vendor?.fulfilment === "reservation"
                ? "Reservation request"
                : "Delivery",
          total: gross - discountShare,
          status: "New",
          createdAt,
          lineItems: lines.map(({ id: lineId, item, meta, qty, price }) => ({ id: lineId, item, meta, qty, price })),
        };
      });
      orderIds = createdOrders.map((order) => order.id);
      return {
        ...s,
        orders: [...createdOrders, ...s.orders],
        cart: [],
        promo: undefined,
        completedCheckouts: { ...completed, [checkoutId]: orderIds },
      };
    });
    return orderIds;
  },

  addToCart: (line: CartLine) =>
    set((s) => {
      const same = s.cart.find((c) => c.vendorSlug === line.vendorSlug && c.item === line.item && c.meta === line.meta);
      if (same) return { ...s, cart: s.cart.map((c) => (c === same ? { ...c, qty: c.qty + line.qty } : c)) };
      return { ...s, cart: [...s.cart, { ...line, id: Date.now().toString(36) }] };
    }),
  setQty: (id: string, qty: number) =>
    set((s) => ({ ...s, cart: qty <= 0 ? s.cart.filter((c) => c.id !== id) : s.cart.map((c) => (c.id === id ? { ...c, qty } : c)) })),
  clearCart: () => set((s) => ({ ...s, cart: [], promo: undefined })),
  applyPromo(code: string) {
    const c = code.trim().toUpperCase();
    if (!(c in PROMO_CODES)) return false;
    set((s) => ({ ...s, promo: c }));
    return true;
  },
  toggleFavorite: (slug: string) =>
    set((s) => ({ ...s, favorites: s.favorites.includes(slug) ? s.favorites.filter((x) => x !== slug) : [...s.favorites, slug] })),
  signIn: (name: string, email: string, role: "customer" | "vendor") =>
    set((s) => ({ ...s, user: { name, email, role }, customer: { ...s.customer, name } })),
  signOut: () => set((s) => ({ ...s, user: undefined })),
  saveCustomer: (c: State["customer"]) => set((s) => ({ ...s, customer: c })),

  /** Opens (or creates) the customer's chat with a vendor and returns its id. */
  openThread(vendorSlug: string) {
    const s = app.get();
    const found = s.threads.find((t) => t.vendorSlug === vendorSlug && t.customer === s.customer.name);
    if (found) return found.id;
    const id = "t-" + vendorSlug + "-" + Date.now().toString(36);
    set((x) => ({ ...x, threads: [{ id, vendorSlug, customer: x.customer.name, messages: [], readC: 0, readV: 0 }, ...x.threads] }));
    return id;
  },
  send(threadId: string, from: ChatMsg["from"], raw: string) {
    const { text, blocked } = sanitizeChat(raw);
    if (!text.trim()) return { blocked };
    set((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === threadId
          ? {
              ...t,
              messages: [...t.messages, { from, text, at: Date.now(), blocked }],
              readC: from === "customer" ? t.messages.length + 1 : t.readC,
              readV: from === "vendor" ? t.messages.length + 1 : t.readV,
            }
          : t,
      ),
    }));
    return { blocked };
  },
  markRead: (threadId: string, side: ChatMsg["from"]) =>
    set((s) => ({
      ...s,
      threads: s.threads.map((t) =>
        t.id === threadId ? { ...t, [side === "customer" ? "readC" : "readV"]: t.messages.length } : t,
      ),
    })),
};

export function useApp() {
  return useSyncExternalStore(app.subscribe, app.get, () => initial);
}

/** The signed-in vendor account (demo: switchable), merged with their saved edits. */
export function useCurrentVendor() {
  const s = useApp();
  const base = getVendor(s.vendorSlug) ?? vendors[0]!;
  const a = s.accounts[base.slug] ?? newAccount();
  return { vendor: mergeVendor(base, a), account: a, base };
}

export function mergeVendor(v: Vendor, a?: Account): Vendor {
  if (!a) return v;
  const p = a.profile;
  return {
    ...v,
    name: p.name || v.name,
    tagline: p.tagline || v.tagline,
    about: p.about || v.about,
    location: p.location || v.location,
    hours: p.hours || v.hours,
    delivery: p.delivery || v.delivery,
    products: [...v.products, ...(a.products ?? [])].filter((x) => !a.hidden.includes(x.id)),
  };
}

export const unreadFor = (t: Thread, side: ChatMsg["from"]) =>
  t.messages.slice(side === "customer" ? t.readC : t.readV).filter((m) => m.from !== side).length;
