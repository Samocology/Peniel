import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid } from "./validation.ts";

type Identity = NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>;

async function db(env: BackendEnv, path: string, token: string, init: RequestInit = {}, serviceRole = false): Promise<Response> {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase not configured.");
  const key = serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : anonKey;
  const authKey = serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : token;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: key, authorization: `Bearer ${authKey}`, "content-type": "application/json", prefer: "return=representation", ...(init.headers ?? {}) },
  });
}

async function rpc(env: BackendEnv, name: string, params: Record<string, unknown>, token: string, serviceRole = false): Promise<Response> {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error("Supabase not configured.");
  const key = serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : anonKey;
  const authKey = serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : token;
  return fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${authKey}`, "content-type": "application/json" },
    body: JSON.stringify(params),
  });
}

async function p(r: Response): Promise<unknown> {
  const t = await r.text();
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

function dbErr(status: number, body: unknown): Response {
  const code = body !== null && typeof body === "object" && "code" in body ? String((body as Record<string, unknown>)["code"]) : "";
  if (status === 401) return json({ ok: false, error: "Authentication required." }, 401);
  if (status === 403 || code === "42501") return json({ ok: false, error: "Permission denied." }, 403);
  if (status === 404 || code === "P0002") return json({ ok: false, error: "Record not found." }, 404);
  if (status === 409 || code === "23505") return json({ ok: false, error: "This time slot is no longer available." }, 409);
  if (code === "23514" || code === "22023") return json({ ok: false, error: "Invalid booking data." }, 400);
  return json({ ok: false, error: "Booking service temporarily unavailable." }, 502);
}

// POST /api/bookings — customer creates a booking
async function createBooking(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 8192);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);

  const vendorId = typeof input["vendorId"] === "string" ? input["vendorId"] : "";
  const serviceId = typeof input["serviceId"] === "string" ? input["serviceId"] : null;
  const startAt = typeof input["startAt"] === "string" ? input["startAt"] : "";
  const endAt = typeof input["endAt"] === "string" ? input["endAt"] : "";
  const notes = typeof input["notes"] === "string" ? input["notes"].trim().slice(0, 1000) : "";

  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendorId required." }, 400);
  if (!startAt || !endAt) return json({ ok: false, error: "startAt and endAt are required." }, 400);

  // Validate ISO timestamps
  const start = new Date(startAt);
  const end = new Date(endAt);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    return json({ ok: false, error: "Invalid booking time range." }, 400);
  }
  if (start < new Date()) return json({ ok: false, error: "Booking time must be in the future." }, 400);

  const customerSnapshot = {
    user_id: identity.id,
    email: identity.email,
    name: typeof input["customerName"] === "string" ? input["customerName"].trim().slice(0, 120) : "",
    phone: typeof input["customerPhone"] === "string" ? input["customerPhone"].trim().slice(0, 32) : "",
  };

  const r = await rpc(env, "create_booking", {
    p_vendor_id: vendorId,
    p_customer_id: identity.id,
    p_service_id: serviceId,
    p_start_at: start.toISOString(),
    p_end_at: end.toISOString(),
    p_notes: notes,
    p_customer_snapshot: customerSnapshot,
  }, identity.accessToken);

  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result }, 201);
}

// GET /api/bookings — customer gets their bookings
async function getCustomerBookings(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select: "id,vendor_id,service_id,start_at,end_at,status,notes,customer_snapshot,created_at,vendors(name,slug,phone)",
    customer_id: `eq.${identity.id}`,
    order: "start_at.desc",
    limit: url.searchParams.get("limit") ?? "50",
  });
  const statusFilter = url.searchParams.get("status");
  if (statusFilter) q.set("status", `eq.${statusFilter}`);
  const r = await db(env, `bookings?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

// GET /api/vendor/bookings?vendor_id=... — vendor gets their bookings
async function getVendorBookings(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,customer_id,service_id,start_at,end_at,status,notes,customer_snapshot,created_at",
    vendor_id: `eq.${vendorId}`,
    order: "start_at.asc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const statusFilter = url.searchParams.get("status");
  if (statusFilter) q.set("status", `eq.${statusFilter}`);
  const r = await db(env, `bookings?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

// PATCH /api/bookings/:id/status — vendor confirms/cancels, customer cancels
async function updateBookingStatus(request: Request, env: BackendEnv, identity: Identity, bookingId: string) {
  const input = await readJsonObject(request, 4096);
  const status = typeof input?.["status"] === "string" ? input["status"] : "";
  const allowed = ["confirmed", "cancelled", "completed", "no_show"];
  if (!allowed.includes(status)) return json({ ok: false, error: "Invalid status." }, 400);

  const r = await db(env, `bookings?id=eq.${bookingId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

// GET /api/vendor/availability?vendor_id=&date=YYYY-MM-DD
async function getAvailability(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  const date = url.searchParams.get("date") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json({ ok: false, error: "Valid date (YYYY-MM-DD) required." }, 400);

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;
  const q = new URLSearchParams({
    select: "id,start_at,end_at,status",
    vendor_id: `eq.${vendorId}`,
    start_at: `gte.${dayStart}`,
    end_at: `lte.${dayEnd}`,
    status: "in.(confirmed,pending)",
  });
  const r = await db(env, `bookings?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

export async function handleBookingsRequest(request: Request, env: BackendEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/bookings") && !pathname.startsWith("/api/vendor/bookings") && !pathname.startsWith("/api/vendor/availability")) return null;

  try {
    if (!isSameOriginMutation(request)) return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    if (pathname === "/api/bookings" && request.method === "POST") return createBooking(request, env, identity);
    if (pathname === "/api/bookings" && request.method === "GET") return getCustomerBookings(request, env, identity);
    if (pathname === "/api/vendor/bookings" && request.method === "GET") return getVendorBookings(request, env, identity);
    if (pathname === "/api/vendor/availability" && request.method === "GET") return getAvailability(request, env, identity);

    const statusMatch = pathname.match(/^\/api\/bookings\/([0-9a-f-]{36})\/status$/i);
    if (statusMatch && request.method === "PATCH") return updateBookingStatus(request, env, identity, statusMatch[1]!);

    return null;
  } catch (error) {
    console.error("Bookings API error", error);
    return json({ ok: false, error: "Booking service temporarily unavailable." }, 500);
  }
}
