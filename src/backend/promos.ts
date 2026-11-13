import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid } from "./validation.ts";

type Identity = NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>;

async function db(
  env: BackendEnv,
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase not configured.");
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
}

async function p(r: Response): Promise<unknown> {
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
    return json({ ok: false, error: "Promo code not found." }, 404);
  if (status === 409 || code === "23505")
    return json({ ok: false, error: "Promo code already exists." }, 409);
  return json({ ok: false, error: "Promo service temporarily unavailable." }, 502);
}

// POST /api/promos/validate — customer validates a promo code before checkout
async function validatePromo(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 4096);
  const code = typeof input?.["code"] === "string" ? input["code"].trim().toUpperCase() : "";
  const vendorId = typeof input?.["vendorId"] === "string" ? input["vendorId"] : null;
  const subtotalMinor = typeof input?.["subtotalMinor"] === "number" ? input["subtotalMinor"] : 0;

  if (!code || code.length > 50)
    return json({ ok: false, error: "Valid promo code required." }, 400);

  const q = new URLSearchParams({
    select:
      "id,code,discount_type,discount_value,min_order_minor,max_uses,current_uses,expires_at,vendor_id,active",
    code: `eq.${code}`,
    active: "eq.true",
    limit: "1",
  });
  const r = await db(env, `promotions?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);

  const promos = Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
  const promo = promos[0];
  if (!promo)
    return json({ ok: false, error: "This promo code is not valid or has expired." }, 404);

  // Check expiry
  if (promo["expires_at"] && new Date(String(promo["expires_at"])) < new Date()) {
    return json({ ok: false, error: "This promo code has expired." }, 409);
  }

  // Check usage limit
  const maxUses = Number(promo["max_uses"] ?? 0);
  const currentUses = Number(promo["current_uses"] ?? 0);
  if (maxUses > 0 && currentUses >= maxUses) {
    return json({ ok: false, error: "This promo code has reached its usage limit." }, 409);
  }

  // Check vendor scope
  if (promo["vendor_id"] && vendorId && promo["vendor_id"] !== vendorId) {
    return json({ ok: false, error: "This promo code is not valid for this store." }, 409);
  }

  // Check minimum order
  const minOrder = Number(promo["min_order_minor"] ?? 0);
  if (subtotalMinor < minOrder) {
    return json(
      {
        ok: false,
        error: `Minimum order of ₦${(minOrder / 100).toFixed(2)} required for this code.`,
      },
      409,
    );
  }

  // Calculate discount
  const discountType = String(promo["discount_type"] ?? "percentage");
  const discountValue = Number(promo["discount_value"] ?? 0);
  let discountMinor = 0;
  if (discountType === "percentage") {
    discountMinor = Math.round(subtotalMinor * (discountValue / 100));
  } else if (discountType === "fixed") {
    discountMinor = Math.min(discountValue, subtotalMinor);
  }

  return json({
    ok: true,
    data: {
      promoId: promo["id"],
      code,
      discountType,
      discountValue,
      discountMinor,
      description: `${discountType === "percentage" ? `${discountValue}% off` : `₦${(discountValue / 100).toFixed(2)} off`}`,
    },
  });
}

// GET /api/vendor/promos?vendor_id= — vendor lists their promo codes
async function getVendorPromos(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select:
      "id,code,discount_type,discount_value,min_order_minor,max_uses,current_uses,expires_at,active,created_at",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: "100",
  });
  const r = await db(env, `promotions?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

// POST /api/vendor/promos — vendor creates a promo code
async function createPromo(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 8192);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);

  const vendorId = typeof input["vendorId"] === "string" ? input["vendorId"] : "";
  const code =
    typeof input["code"] === "string"
      ? input["code"]
          .trim()
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
      : "";
  const discountType = typeof input["discountType"] === "string" ? input["discountType"] : "";
  const discountValue = typeof input["discountValue"] === "number" ? input["discountValue"] : 0;
  const maxUses = typeof input["maxUses"] === "number" ? Math.round(input["maxUses"]) : 0;
  const expiresAt = typeof input["expiresAt"] === "string" ? input["expiresAt"] : null;
  const minOrderMinor =
    typeof input["minOrderMinor"] === "number" ? Math.round(input["minOrderMinor"]) : 0;

  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendorId required." }, 400);
  if (!code || code.length < 3 || code.length > 50)
    return json({ ok: false, error: "Code must be 3-50 alphanumeric characters." }, 400);
  if (!["percentage", "fixed"].includes(discountType))
    return json({ ok: false, error: "discountType must be 'percentage' or 'fixed'." }, 400);
  if (discountType === "percentage" && (discountValue <= 0 || discountValue > 100))
    return json({ ok: false, error: "Percentage discount must be 1-100." }, 400);
  if (discountType === "fixed" && discountValue <= 0)
    return json({ ok: false, error: "Fixed discount must be greater than zero." }, 400);
  if (expiresAt && isNaN(new Date(expiresAt).getTime()))
    return json({ ok: false, error: "Invalid expiry date." }, 400);

  const r = await db(env, "promotions", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({
      vendor_id: vendorId,
      code,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_minor: minOrderMinor,
      max_uses: maxUses > 0 ? maxUses : null,
      current_uses: 0,
      expires_at: expiresAt ?? null,
      active: true,
    }),
  });
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result }, 201);
}

// PATCH /api/vendor/promos/:id — toggle active state
async function updatePromo(request: Request, env: BackendEnv, identity: Identity, promoId: string) {
  const input = await readJsonObject(request, 4096);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);
  const patch: Record<string, unknown> = {};
  if (typeof input["active"] === "boolean") patch["active"] = input["active"];
  if (typeof input["maxUses"] === "number") patch["max_uses"] = Math.round(input["maxUses"]);
  if (typeof input["expiresAt"] === "string") patch["expires_at"] = input["expiresAt"];
  if (Object.keys(patch).length === 0)
    return json({ ok: false, error: "No valid fields to update." }, 400);
  const r = await db(env, `promotions?id=eq.${promoId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

export async function handlePromosRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/promos") && !pathname.startsWith("/api/vendor/promos"))
    return null;

  try {
    if (!isSameOriginMutation(request))
      return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    if (pathname === "/api/promos/validate" && request.method === "POST")
      return validatePromo(request, env, identity);
    if (pathname === "/api/vendor/promos" && request.method === "GET")
      return getVendorPromos(request, env, identity);
    if (pathname === "/api/vendor/promos" && request.method === "POST")
      return createPromo(request, env, identity);

    const promoMatch = pathname.match(/^\/api\/vendor\/promos\/([0-9a-f-]{36})$/i);
    if (promoMatch && request.method === "PATCH")
      return updatePromo(request, env, identity, promoMatch[1]!);

    return null;
  } catch (error) {
    console.error("Promos API error", error);
    return json({ ok: false, error: "Promo service temporarily unavailable." }, 500);
  }
}
