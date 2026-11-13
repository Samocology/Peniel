import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid } from "./validation.ts";

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
  const key =
    serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : anonKey;
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
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

function dbErr(status: number, body: unknown): Response {
  const code =
    body !== null && typeof body === "object" && "code" in body
      ? String((body as Record<string, unknown>)["code"])
      : "";
  if (status === 401) return json({ ok: false, error: "Authentication required." }, 401);
  if (status === 403 || code === "42501")
    return json({ ok: false, error: "Permission denied." }, 403);
  if (status === 404 || code === "P0002")
    return json({ ok: false, error: "Record not found." }, 404);
  if (status === 409 || code === "23505")
    return json({ ok: false, error: "Conflict with existing record." }, 409);
  return json({ ok: false, error: "Data service temporarily unavailable." }, 502);
}

async function requireAdmin(
  request: Request,
  env: BackendEnv,
): Promise<{ response: Response } | { identity: Identity }> {
  const identity = await getRequestIdentity(request, env);
  if (!identity) return { response: json({ ok: false, error: "Authentication required." }, 401) };
  // Verify admin role via Supabase RPC
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) return { response: json({ ok: false, error: "Service not configured." }, 503) };
  const r = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${identity.accessToken}`,
      "content-type": "application/json",
    },
    body: "{}",
  });
  const isAdmin = (await r.json()) as boolean;
  if (!isAdmin)
    return { response: json({ ok: false, error: "Administrator access required." }, 403) };
  return { identity };
}

async function writeAuditLog(
  env: BackendEnv,
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  details: Record<string, unknown> = {},
) {
  try {
    const url = env.SUPABASE_URL?.replace(/\/+$/, "");
    const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY;
    if (!url || !key) return;
    await fetch(`${url}/rest/v1/admin_audit_logs`, {
      method: "POST",
      headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        actor_id: actorId,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      }),
    });
  } catch {
    /* audit log failure must not block the operation */
  }
}

// GET /api/admin/vendors
async function listVendors(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? "";
  const q = new URLSearchParams({
    select:
      "id,slug,name,business_type,location,status,created_at,updated_at,profiles!vendors_owner_id_fkey(full_name,phone)",
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  if (status) q.set("status", `eq.${status}`);
  const r = await db(env, `vendors?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/admin/vendors/:id/status
async function setVendorStatus(
  request: Request,
  env: BackendEnv,
  identity: Identity,
  vendorId: string,
) {
  const input = await readJsonObject(request, 4096);
  const status = typeof input?.["status"] === "string" ? input["status"] : "";
  const allowed = ["active", "rejected", "suspended", "pending_review", "draft"];
  if (!allowed.includes(status)) return json({ ok: false, error: "Invalid status." }, 400);
  const note = typeof input?.["note"] === "string" ? input["note"].trim().slice(0, 1000) : "";
  const r = await db(env, `vendors?id=eq.${vendorId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  await writeAuditLog(env, identity.id, `vendor_status_${status}`, "vendor", vendorId, { note });
  return json({ ok: true, data: p });
}

// GET /api/admin/customers
async function listCustomers(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select: "id,full_name,phone,role,suspended_at,created_at",
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const r = await db(env, `profiles?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// GET /api/admin/orders
async function listOrders(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select:
      "id,reference,status,currency,total_minor,created_at,profiles!orders_customer_id_fkey(full_name)",
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const statusFilter = url.searchParams.get("status");
  if (statusFilter) q.set("status", `eq.${statusFilter}`);
  const r = await db(env, `orders?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// GET /api/admin/transactions
async function listTransactions(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select:
      "id,reference,provider_transaction_id,amount_minor,currency,status,verified_at,created_at",
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const r = await db(env, `payments?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// GET /api/admin/verification
async function listVerificationApplications(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select:
      "id,status,submitted_at,reviewed_at,review_note,vendors(id,slug,name,business_type),profiles!vendor_applications_owner_id_fkey(full_name)",
    order: "submitted_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const statusFilter = url.searchParams.get("status");
  if (statusFilter) q.set("status", `eq.${statusFilter}`);
  const r = await db(env, `vendor_applications?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/admin/verification/:id
async function reviewVerificationApplication(
  request: Request,
  env: BackendEnv,
  identity: Identity,
  appId: string,
) {
  const input = await readJsonObject(request, 4096);
  const decision = typeof input?.["decision"] === "string" ? input["decision"] : "";
  if (decision !== "approved" && decision !== "rejected")
    return json({ ok: false, error: "Decision must be 'approved' or 'rejected'." }, 400);
  const note = typeof input?.["note"] === "string" ? input["note"].trim().slice(0, 1000) : "";
  const r = await db(env, `vendor_applications?id=eq.${appId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: identity.id,
      review_note: note,
    }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  await writeAuditLog(env, identity.id, `verification_${decision}`, "vendor_application", appId, {
    note,
  });
  return json({ ok: true, data: p });
}

// GET /api/admin/reviews
async function listReviews(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select:
      "id,rating,body,moderation_status,created_at,vendors(name),profiles!reviews_customer_id_fkey(full_name)",
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "100",
  });
  const r = await db(env, `reviews?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/admin/reviews/:id
async function moderateReview(
  request: Request,
  env: BackendEnv,
  identity: Identity,
  reviewId: string,
) {
  const input = await readJsonObject(request, 4096);
  const status = typeof input?.["status"] === "string" ? input["status"] : "";
  if (!["published", "hidden", "pending"].includes(status))
    return json({ ok: false, error: "Invalid moderation status." }, 400);
  const r = await db(env, `reviews?id=eq.${reviewId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ moderation_status: status }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  await writeAuditLog(env, identity.id, `review_${status}`, "review", reviewId, {});
  return json({ ok: true, data: p });
}

// GET /api/admin/categories
async function listCategories(request: Request, env: BackendEnv, identity: Identity) {
  const r = await db(
    env,
    "categories?select=id,slug,name,active,sort_order&order=sort_order.asc",
    identity.accessToken,
  );
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// GET /api/admin/analytics
async function getPlatformAnalytics(request: Request, env: BackendEnv, identity: Identity) {
  const [vendorsR, customersR, ordersR, paymentsR] = await Promise.all([
    db(env, "vendors?select=id,status", identity.accessToken),
    db(env, "profiles?select=id,role", identity.accessToken),
    db(
      env,
      "orders?select=id,status,total_minor&order=created_at.desc&limit=1000",
      identity.accessToken,
    ),
    db(
      env,
      "payments?select=id,status,amount_minor&order=created_at.desc&limit=1000",
      identity.accessToken,
    ),
  ]);
  const [vendors, customers, orders, payments] = await Promise.all([
    payload(vendorsR),
    payload(customersR),
    payload(ordersR),
    payload(paymentsR),
  ]);
  if (!vendorsR.ok) return dbErr(vendorsR.status, vendors);
  const vendorList = Array.isArray(vendors) ? (vendors as Record<string, unknown>[]) : [];
  const customerList = Array.isArray(customers) ? (customers as Record<string, unknown>[]) : [];
  const orderList = Array.isArray(orders) ? (orders as Record<string, unknown>[]) : [];
  const paymentList = Array.isArray(payments) ? (payments as Record<string, unknown>[]) : [];
  const gmv = paymentList
    .filter((p) => p["status"] === "successful")
    .reduce((s, p) => s + Number(p["amount_minor"] ?? 0), 0);
  return json({
    ok: true,
    data: {
      totalVendors: vendorList.length,
      activeVendors: vendorList.filter((v) => v["status"] === "active").length,
      totalCustomers: customerList.filter((c) => c["role"] === "customer").length,
      totalOrders: orderList.length,
      completedOrders: orderList.filter((o) =>
        ["delivered", "completed"].includes(String(o["status"])),
      ).length,
      gmvMinor: gmv,
    },
  });
}

// GET /api/admin/settings
async function getPlatformSettings(request: Request, env: BackendEnv, identity: Identity) {
  const r = await db(env, "platform_settings?select=key,value,updated_at", identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// PATCH /api/admin/settings/:key
async function updatePlatformSetting(
  request: Request,
  env: BackendEnv,
  identity: Identity,
  key: string,
) {
  const input = await readJsonObject(request, 8192);
  if (!input || !("value" in input))
    return json({ ok: false, error: "value field required." }, 400);
  const r = await db(
    env,
    `platform_settings?key=eq.${encodeURIComponent(key)}`,
    identity.accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({
        value: input["value"],
        updated_at: new Date().toISOString(),
        updated_by: identity.id,
      }),
    },
  );
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  await writeAuditLog(env, identity.id, "platform_setting_updated", "platform_settings", key, {
    value: input["value"],
  });
  return json({ ok: true, data: p });
}

export async function handleAdminRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/admin/")) return null;

  try {
    if (!isSameOriginMutation(request))
      return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const auth = await requireAdmin(request, env);
    if ("response" in auth) return auth.response;
    const { identity } = auth;

    if (pathname === "/api/admin/vendors" && request.method === "GET")
      return listVendors(request, env, identity);
    if (pathname === "/api/admin/customers" && request.method === "GET")
      return listCustomers(request, env, identity);
    if (pathname === "/api/admin/orders" && request.method === "GET")
      return listOrders(request, env, identity);
    if (pathname === "/api/admin/transactions" && request.method === "GET")
      return listTransactions(request, env, identity);
    if (pathname === "/api/admin/verification" && request.method === "GET")
      return listVerificationApplications(request, env, identity);
    if (pathname === "/api/admin/reviews" && request.method === "GET")
      return listReviews(request, env, identity);
    if (pathname === "/api/admin/categories" && request.method === "GET")
      return listCategories(request, env, identity);
    if (pathname === "/api/admin/analytics" && request.method === "GET")
      return getPlatformAnalytics(request, env, identity);
    if (pathname === "/api/admin/settings" && request.method === "GET")
      return getPlatformSettings(request, env, identity);

    const vendorStatusMatch = pathname.match(/^\/api\/admin\/vendors\/([0-9a-f-]{36})\/status$/i);
    if (vendorStatusMatch && request.method === "PATCH")
      return setVendorStatus(request, env, identity, vendorStatusMatch[1]!);

    const verificationMatch = pathname.match(/^\/api\/admin\/verification\/([0-9a-f-]{36})$/i);
    if (verificationMatch && request.method === "PATCH")
      return reviewVerificationApplication(request, env, identity, verificationMatch[1]!);

    const reviewMatch = pathname.match(/^\/api\/admin\/reviews\/([0-9a-f-]{36})$/i);
    if (reviewMatch && request.method === "PATCH")
      return moderateReview(request, env, identity, reviewMatch[1]!);

    const settingMatch = pathname.match(/^\/api\/admin\/settings\/(.+)$/);
    if (settingMatch && request.method === "PATCH")
      return updatePlatformSetting(request, env, identity, settingMatch[1]!);

    // Disputes
    if (pathname === "/api/admin/disputes" && request.method === "GET") {
      const url = new URL(request.url);
      const q = new URLSearchParams({
        select: "id,status,subject,body,created_at,resolved_at,vendors(name,slug)",
        order: "created_at.desc",
        limit: url.searchParams.get("limit") ?? "100",
      });
      const sf = url.searchParams.get("status");
      if (sf) q.set("status", `eq.${sf}`);
      const r = await db(env, `disputes?${q}`, identity.accessToken);
      const p = await payload(r);
      if (!r.ok) return dbErr(r.status, p);
      return json({ ok: true, data: p });
    }
    const disputeMatch = pathname.match(/^\/api\/admin\/disputes\/([0-9a-f-]{36})$/i);
    if (disputeMatch && request.method === "PATCH") {
      const input = await readJsonObject(request, 4096);
      const status = typeof input?.["status"] === "string" ? input["status"] : "";
      if (!["open", "investigating", "resolved", "closed"].includes(status))
        return json({ ok: false, error: "Invalid dispute status." }, 400);
      const r = await db(env, `disputes?id=eq.${disputeMatch[1]}`, identity.accessToken, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          resolved_at: ["resolved", "closed"].includes(status) ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        }),
      });
      const p = await payload(r);
      if (!r.ok) return dbErr(r.status, p);
      await writeAuditLog(env, identity.id, `dispute_${status}`, "dispute", disputeMatch[1]!, {});
      return json({ ok: true, data: p });
    }

    // Admin promotions
    if (pathname === "/api/admin/promotions" && request.method === "GET") {
      const url = new URL(request.url);
      const q = new URLSearchParams({
        select:
          "id,code,discount_type,discount_value,max_uses,current_uses,expires_at,active,created_at,vendors(name,slug)",
        order: "created_at.desc",
        limit: url.searchParams.get("limit") ?? "100",
      });
      const r = await db(env, `promotions?${q}`, identity.accessToken);
      const p = await payload(r);
      if (!r.ok) return dbErr(r.status, p);
      return json({ ok: true, data: p });
    }

    return null;
  } catch (error) {
    console.error("Admin API error", error);
    return json({ ok: false, error: "Admin service temporarily unavailable." }, 500);
  }
}
