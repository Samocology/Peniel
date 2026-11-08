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
  if (status === 409 || code === "23505") return json({ ok: false, error: "Conflict with existing record." }, 409);
  return json({ ok: false, error: "Payout service temporarily unavailable." }, 502);
}

// GET /api/vendor/payouts/balance?vendor_id=
// Derives available balance from ledger entries
async function getVendorBalance(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);

  const [ledgerR, payoutsR] = await Promise.all([
    db(env, `ledger_entries?select=entry_type,amount_minor&vendor_id=eq.${vendorId}`, identity.accessToken),
    db(env, `payouts?select=amount_minor,status&vendor_id=eq.${vendorId}&status=in.(pending,processing,completed)`, identity.accessToken),
  ]);

  const [ledger, payouts] = await Promise.all([p(ledgerR), p(payoutsR)]);
  if (!ledgerR.ok) return dbErr(ledgerR.status, ledger);
  if (!payoutsR.ok) return dbErr(payoutsR.status, payouts);

  const ledgerList = Array.isArray(ledger) ? ledger as Record<string, unknown>[] : [];
  const payoutList = Array.isArray(payouts) ? payouts as Record<string, unknown>[] : [];

  // Gross = sum of all sale entries
  const grossMinor = ledgerList
    .filter(e => e["entry_type"] === "sale")
    .reduce((s, e) => s + Number(e["amount_minor"] ?? 0), 0);

  // Deductions = commissions + refunds
  const deductionsMinor = ledgerList
    .filter(e => e["entry_type"] === "commission" || e["entry_type"] === "refund")
    .reduce((s, e) => s + Math.abs(Number(e["amount_minor"] ?? 0)), 0);

  // Already paid out or pending payout
  const paidOutMinor = payoutList
    .filter(p => p["status"] === "completed")
    .reduce((s, p) => s + Number(p["amount_minor"] ?? 0), 0);

  const pendingPayoutMinor = payoutList
    .filter(p => p["status"] === "pending" || p["status"] === "processing")
    .reduce((s, p) => s + Number(p["amount_minor"] ?? 0), 0);

  const netEarnedMinor = grossMinor - deductionsMinor;
  const availableMinor = Math.max(0, netEarnedMinor - paidOutMinor - pendingPayoutMinor);

  return json({ ok: true, data: {
    grossMinor,
    deductionsMinor,
    netEarnedMinor,
    paidOutMinor,
    pendingPayoutMinor,
    availableMinor,
    currency: "NGN",
  }});
}

// GET /api/vendor/payouts?vendor_id=
async function getPayoutHistory(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id") ?? "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendor_id required." }, 400);
  const q = new URLSearchParams({
    select: "id,amount_minor,currency,status,bank_name,account_last4,idempotency_key,created_at,updated_at",
    vendor_id: `eq.${vendorId}`,
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "50",
  });
  const r = await db(env, `payouts?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

// POST /api/vendor/payouts — request a payout
async function requestPayout(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 8192);
  if (!input) return json({ ok: false, error: "Valid JSON required." }, 400);

  const vendorId = typeof input["vendorId"] === "string" ? input["vendorId"] : "";
  const amountMinor = typeof input["amountMinor"] === "number" ? Math.round(input["amountMinor"]) : 0;
  const bankName = typeof input["bankName"] === "string" ? input["bankName"].trim().slice(0, 120) : "";
  const accountNumber = typeof input["accountNumber"] === "string" ? input["accountNumber"].replace(/\s/g, "") : "";
  const accountName = typeof input["accountName"] === "string" ? input["accountName"].trim().slice(0, 120) : "";
  const idempotencyKey = typeof input["idempotencyKey"] === "string" ? input["idempotencyKey"] : "";

  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendorId required." }, 400);
  if (amountMinor < 100_00) return json({ ok: false, error: "Minimum payout is ₦100." }, 400); // 10000 kobo = ₦100
  if (!bankName || !/^\d{10}$/.test(accountNumber) || !accountName) {
    return json({ ok: false, error: "Valid bank name, 10-digit account number and account name required." }, 400);
  }
  if (!/^[a-zA-Z0-9:_-]{8,120}$/.test(idempotencyKey)) {
    return json({ ok: false, error: "Valid idempotency key required." }, 400);
  }

  // Verify available balance before creating payout
  const balanceReq = new Request(`${new URL(request.url).origin}/api/vendor/payouts/balance?vendor_id=${vendorId}`, {
    headers: request.headers,
  });
  const balanceResp = await getVendorBalance(balanceReq, env, identity);
  const balanceBody = await balanceResp.json() as { ok: boolean; data?: { availableMinor: number } };
  if (!balanceResp.ok || !balanceBody.ok) return json({ ok: false, error: "Could not verify available balance." }, 502);
  if ((balanceBody.data?.availableMinor ?? 0) < amountMinor) {
    return json({ ok: false, error: "Requested amount exceeds available balance." }, 409);
  }

  const r = await db(env, "payouts", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({
      vendor_id: vendorId,
      amount_minor: amountMinor,
      currency: "NGN",
      status: "pending",
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      account_last4: accountNumber.slice(-4),
      idempotency_key: idempotencyKey,
    }),
  });
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);

  // Record ledger debit
  const payout = Array.isArray(result) ? result[0] : result;
  if (payout && typeof (payout as Record<string, unknown>)["id"] === "string") {
    await db(env, "ledger_entries", identity.accessToken, {
      method: "POST",
      body: JSON.stringify({
        vendor_id: vendorId,
        entry_type: "payout",
        amount_minor: -amountMinor,
        currency: "NGN",
        source_reference: idempotencyKey,
      }),
    });
  }

  return json({ ok: true, data: payout }, 201);
}

// PATCH /api/admin/payouts/:id — admin processes payout
async function adminUpdatePayout(request: Request, env: BackendEnv, identity: Identity, payoutId: string) {
  const input = await readJsonObject(request, 4096);
  const status = typeof input?.["status"] === "string" ? input["status"] : "";
  if (!["processing", "completed", "failed"].includes(status)) {
    return json({ ok: false, error: "Invalid payout status." }, 400);
  }
  const r = await db(env, `payouts?id=eq.${payoutId}`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: result });
}

export async function handlePayoutsRequest(request: Request, env: BackendEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  const isVendorPayout = pathname.startsWith("/api/vendor/payouts");
  const isAdminPayout = pathname.startsWith("/api/admin/payouts");
  if (!isVendorPayout && !isAdminPayout) return null;

  try {
    if (!isSameOriginMutation(request)) return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    if (pathname === "/api/vendor/payouts/balance" && request.method === "GET") return getVendorBalance(request, env, identity);
    if (pathname === "/api/vendor/payouts" && request.method === "GET") return getPayoutHistory(request, env, identity);
    if (pathname === "/api/vendor/payouts" && request.method === "POST") return requestPayout(request, env, identity);

    const adminPayoutMatch = pathname.match(/^\/api\/admin\/payouts\/([0-9a-f-]{36})$/i);
    if (adminPayoutMatch && request.method === "PATCH") return adminUpdatePayout(request, env, identity, adminPayoutMatch[1]!);

    if (pathname === "/api/admin/payouts" && request.method === "GET") {
      const url = new URL(request.url);
      const q = new URLSearchParams({
        select: "id,vendor_id,amount_minor,currency,status,bank_name,account_last4,created_at,vendors(name,slug)",
        order: "created_at.desc",
        limit: url.searchParams.get("limit") ?? "100",
      });
      const statusFilter = url.searchParams.get("status");
      if (statusFilter) q.set("status", `eq.${statusFilter}`);
      const r = await db(env, `payouts?${q}`, identity.accessToken);
      const result = await p(r);
      if (!r.ok) return dbErr(r.status, result);
      return json({ ok: true, data: result });
    }

    return null;
  } catch (error) {
    console.error("Payouts API error", error);
    return json({ ok: false, error: "Payout service temporarily unavailable." }, 500);
  }
}
