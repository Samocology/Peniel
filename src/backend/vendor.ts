import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid, moneyToMinor, normalizePhone } from "./validation.ts";

type Identity = NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>;

async function db(
  env: BackendEnv,
  path: string,
  token: string,
  init: RequestInit = {},
  serviceRole = false,
): Promise<Response> {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase not configured.");
  const key = serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : anonKey;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : token}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
}

async function payload(r: Response): Promise<unknown> {
  const t = await r.text();
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

function dbErr(status: number, body: unknown): Response {
  const code = body !== null && typeof body === "object" && "code" in body ? String((body as Record<string,unknown>)["code"]) : "";
  if (status === 401) return json({ ok: false, error: "Authentication required." }, 401);
  if (status === 403 || code === "42501") return json({ ok: false, error: "Permission denied." }, 403);
  if (status === 404 || code === "P0002") return json({ ok: false, error: "Record not found." }, 404);
  if (status === 409 || code === "23505") return json({ ok: false, error: "Conflict with existing record." }, 409);
  if (code === "23514" || code === "22023") return json({ ok: false, error: "Invalid data supplied." }, 400);
  return json({ ok: false, error: "Data service temporarily unavailable." }, 502);
}

async function requireIdentity(request: Request, env: BackendEnv) {
  const identity = await getRequestIdentity(request, env);
  if (!identity) return { response: json({ ok: false, error: "Authentication required." }, 401) };
  return { identity };
}

// GET /api/vendor/orders?vendor_id=...
async function getVendorOrders(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,order_id,status,subtotal_minor,delivery_minor,commission_minor,vendor_net_minor,created_at,updated_at,order_items(id,product_snapshot,quantity,unit_price_minor,line_total_minor),orders(reference,status,delivery_snapshot,customer_snapshot,created_at)",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "50",
  });
  const r = await db(env, `vendor_orders?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/vendor/orders/:id/status
async function updateVendorOrderStatus(request: Request, env: BackendEnv, identity: Identity, orderId: string) {
  const input = await readJsonObject(request, 4096);
  const status = typeof input?.["status"] === "string" ? input["status"] : "";
  const allowed = ["confirmed","preparing","ready_for_pickup","shipped","out_for_delivery","delivered","completed","cancelled"];
  if (!allowed.includes(status)) return json({ ok: false, error: "Invalid status value." }, 400);
  const r = await db(env, `vendor_orders?id=eq.${orderId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/vendor/products/:id
async function updateProduct(request: Request, env: BackendEnv, identity: Identity, productId: string) {
  const input = await readJsonObject(request, 40_000);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input["name"] === "string" && input["name"].trim()) patch["name"] = input["name"].trim().slice(0, 160);
  if (typeof input["description"] === "string") patch["description"] = input["description"].trim().slice(0, 4000);
  if (typeof input["group"] === "string") patch["group_name"] = input["group"].trim().slice(0, 80) || "General";
  if (input["price"] !== undefined) {
    const minor = moneyToMinor(input["price"]);
    if (minor === null || minor <= 0) return json({ ok: false, error: "Invalid price." }, 400);
    patch["price_minor"] = minor;
  }
  if (input["published"] !== undefined) patch["published"] = input["published"] === true;
  if (input["stockQuantity"] !== undefined) {
    const s = input["stockQuantity"];
    if (s !== null && (!Number.isInteger(s) || Number(s) < 0)) return json({ ok: false, error: "Invalid stock quantity." }, 400);
    patch["stock_quantity"] = s;
  }
  if (input["attributes"] !== null && typeof input["attributes"] === "object" && !Array.isArray(input["attributes"])) {
    patch["attributes"] = input["attributes"];
  }
  const r = await db(env, `products?id=eq.${productId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// DELETE /api/vendor/products/:id (soft archive)
async function archiveProduct(env: BackendEnv, identity: Identity, productId: string) {
  const r = await db(env, `products?id=eq.${productId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ archived_at: new Date().toISOString(), published: false, updated_at: new Date().toISOString() }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: { archived: true } });
}

// GET /api/vendor/analytics?vendor_id=...
async function getVendorAnalytics(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const [ordersR, ledgerR] = await Promise.all([
    db(env, `vendor_orders?select=status,subtotal_minor,vendor_net_minor,created_at&vendor_id=eq.${vendorId}&order=created_at.desc&limit=500`, identity.accessToken),
    db(env, `ledger_entries?select=entry_type,amount_minor,created_at&vendor_id=eq.${vendorId}&order=created_at.desc&limit=500`, identity.accessToken),
  ]);
  const [orders, ledger] = await Promise.all([payload(ordersR), payload(ledgerR)]);
  if (!ordersR.ok) return dbErr(ordersR.status, orders);
  if (!ledgerR.ok) return dbErr(ledgerR.status, ledger);
  const orderList = Array.isArray(orders) ? orders as Record<string,unknown>[] : [];
  const ledgerList = Array.isArray(ledger) ? ledger as Record<string,unknown>[] : [];
  const totalRevenue = ledgerList.filter(e => e["entry_type"] === "sale").reduce((s, e) => s + Number(e["amount_minor"] ?? 0), 0);
  const totalCommission = ledgerList.filter(e => e["entry_type"] === "commission").reduce((s, e) => s + Math.abs(Number(e["amount_minor"] ?? 0)), 0);
  const pendingOrders = orderList.filter(o => ["paid","confirmed","preparing","ready_for_pickup","shipped","out_for_delivery"].includes(String(o["status"]))).length;
  const completedOrders = orderList.filter(o => ["delivered","completed"].includes(String(o["status"]))).length;
  return json({ ok: true, data: { totalRevenue, totalCommission, netRevenue: totalRevenue - totalCommission, pendingOrders, completedOrders, totalOrders: orderList.length } });
}

// GET /api/vendor/ledger?vendor_id=...
async function getVendorLedger(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,entry_type,amount_minor,currency,source_reference,created_at",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const r = await db(env, `ledger_entries?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/vendor/storefront?vendor_id=...
async function updateStorefront(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const input = await readJsonObject(request, 32_000);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input["templateId"] === "string") patch["template_id"] = input["templateId"].slice(0, 80);
  if (typeof input["layout"] === "string") patch["layout"] = input["layout"].slice(0, 80);
  if (input["theme"] !== null && typeof input["theme"] === "object") patch["theme"] = input["theme"];
  if (input["openingHours"] !== null && typeof input["openingHours"] === "object") patch["opening_hours"] = input["openingHours"];
  if (input["deliverySettings"] !== null && typeof input["deliverySettings"] === "object") patch["delivery_settings"] = input["deliverySettings"];
  if (input["seo"] !== null && typeof input["seo"] === "object") patch["seo"] = input["seo"];
  if (input["publish"] === true) patch["published_at"] = new Date().toISOString();
  if (input["publish"] === false) patch["published_at"] = null;
  const r = await db(env, `storefronts?vendor_id=eq.${vendorId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/vendor/profile?vendor_id=...
async function updateVendorProfile(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const input = await readJsonObject(request, 16_000);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof input["name"] === "string" && input["name"].trim().length >= 2) patch["name"] = input["name"].trim().slice(0, 120);
  if (typeof input["description"] === "string") patch["description"] = input["description"].trim().slice(0, 4000);
  if (typeof input["location"] === "string") patch["location"] = input["location"].trim().slice(0, 160);
  if (typeof input["address"] === "string") patch["address"] = input["address"].trim().slice(0, 500);
  if (typeof input["phone"] === "string") {
    const normalized = normalizePhone(input["phone"]);
    if (normalized) patch["phone"] = normalized;
  }
  if (typeof input["whatsappNumber"] === "string") {
    const normalized = normalizePhone(input["whatsappNumber"]);
    if (normalized) patch["whatsapp_number"] = normalized;
  }
  const r = await db(env, `vendors?id=eq.${vendorId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// GET /api/vendor/reviews?vendor_id=...
async function getVendorReviews(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,rating,body,moderation_status,created_at,profiles(full_name)",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: "100",
  });
  const r = await db(env, `reviews?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// POST /api/vendor/reviews (customer submits review)
async function submitReview(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 8192);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);
  const vendorOrderId = typeof input["vendorOrderId"] === "string" ? input["vendorOrderId"] : "";
  const vendorId = typeof input["vendorId"] === "string" ? input["vendorId"] : "";
  const rating = typeof input["rating"] === "number" ? Math.round(input["rating"]) : 0;
  const body = typeof input["body"] === "string" ? input["body"].trim().slice(0, 2000) : "";
  if (!isUuid(vendorOrderId) || !isUuid(vendorId) || rating < 1 || rating > 5) {
    return json({ ok: false, error: "Valid vendorOrderId, vendorId and rating (1-5) required." }, 400);
  }
  const r = await db(env, "reviews", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({ customer_id: identity.id, vendor_order_id: vendorOrderId, vendor_id: vendorId, rating, body }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p }, 201);
}

// GET /api/vendor/customers?vendor_id=...
async function getVendorCustomers(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,order_id,status,created_at,orders(customer_snapshot,reference)",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: "200",
  });
  const r = await db(env, `vendor_orders?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

export async function handleVendorRequest(request: Request, env: BackendEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/vendor/")) return null;

  try {
    if (!isSameOriginMutation(request)) return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const auth = await requireIdentity(request, env);
    if ("response" in auth) return auth.response;
    const { identity } = auth;

    if (pathname === "/api/vendor/orders" && request.method === "GET") return getVendorOrders(request, env, identity);
    if (pathname === "/api/vendor/analytics" && request.method === "GET") return getVendorAnalytics(request, env, identity);
    if (pathname === "/api/vendor/ledger" && request.method === "GET") return getVendorLedger(request, env, identity);
    if (pathname === "/api/vendor/storefront" && request.method === "PATCH") return updateStorefront(request, env, identity);
    if (pathname === "/api/vendor/profile" && request.method === "PATCH") return updateVendorProfile(request, env, identity);
    if (pathname === "/api/vendor/reviews" && request.method === "GET") return getVendorReviews(request, env, identity);
    if (pathname === "/api/vendor/reviews" && request.method === "POST") return submitReview(request, env, identity);
    if (pathname === "/api/vendor/customers" && request.method === "GET") return getVendorCustomers(request, env, identity);

    const orderStatusMatch = pathname.match(/^\/api\/vendor\/orders\/([0-9a-f-]{36})\/status$/i);
    if (orderStatusMatch && request.method === "PATCH") return updateVendorOrderStatus(request, env, identity, orderStatusMatch[1]!);

    const productUpdateMatch = pathname.match(/^\/api\/vendor\/products\/([0-9a-f-]{36})$/i);
    if (productUpdateMatch && request.method === "PATCH") return updateProduct(request, env, identity, productUpdateMatch[1]!);
    if (productUpdateMatch && request.method === "DELETE") return archiveProduct(env, identity, productUpdateMatch[1]!);

    return null;
  } catch (error) {
    console.error("Vendor API error", error);
    return json({ ok: false, error: "Vendor service temporarily unavailable." }, 500);
  }
}