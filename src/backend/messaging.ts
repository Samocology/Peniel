import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid } from "./validation.ts";
import { sanitizeChat } from "../lib/chat-guard.ts";

type Identity = NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>;

async function db(env: BackendEnv, path: string, token: string, init: RequestInit = {}): Promise<Response> {
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
  return json({ ok: false, error: "Data service temporarily unavailable." }, 502);
}

// GET /api/messages/conversations
async function listConversations(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id");
  const q = new URLSearchParams({
    select: "id,vendor_id,customer_id,created_at,vendors(name,slug),profiles!conversations_customer_id_fkey(full_name)",
    order: "created_at.desc",
    limit: "100",
  });
  if (vendorId && isUuid(vendorId)) {
    q.set("vendor_id", `eq.${vendorId}`);
  } else {
    q.set("customer_id", `eq.${identity.id}`);
  }
  const r = await db(env, `conversations?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// POST /api/messages/conversations
async function openConversation(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 4096);
  const vendorId = typeof input?.["vendorId"] === "string" ? input["vendorId"] : "";
  if (!isUuid(vendorId)) return json({ ok: false, error: "Valid vendorId required." }, 400);
  // Upsert conversation (unique vendor_id + customer_id)
  const r = await db(env, "conversations", identity.accessToken, {
    method: "POST",
    headers: { prefer: "return=representation,resolution=merge-duplicates" },
    body: JSON.stringify({ vendor_id: vendorId, customer_id: identity.id }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  const conv = Array.isArray(p) ? p[0] : p;
  return json({ ok: true, data: conv }, 201);
}

// GET /api/messages/conversations/:id/messages
async function getMessages(request: Request, env: BackendEnv, identity: Identity, conversationId: string) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select: "id,sender_id,body,created_at,read_at,profiles!messages_sender_id_fkey(full_name)",
    conversation_id: `eq.${conversationId}`,
    order: "created_at.asc",
    limit: url.searchParams.get("limit") ?? "200",
  });
  const r = await db(env, `messages?${q}`, identity.accessToken);
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: p });
}

// POST /api/messages/conversations/:id/messages
async function sendMessage(request: Request, env: BackendEnv, identity: Identity, conversationId: string) {
  const input = await readJsonObject(request, 8192);
  const rawBody = typeof input?.["body"] === "string" ? input["body"] : "";
  if (!rawBody.trim()) return json({ ok: false, error: "Message body is required." }, 400);
  if (rawBody.length > 4000) return json({ ok: false, error: "Message is too long." }, 400);

  // Apply chat guard - strip contact info
  const { text, blocked } = sanitizeChat(rawBody);
  if (!text.trim()) return json({ ok: false, error: "Message body is required." }, 400);

  const r = await db(env, "messages", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({ conversation_id: conversationId, sender_id: identity.id, body: text }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  const msg = Array.isArray(p) ? p[0] : p;
  return json({ ok: true, data: { ...(msg as Record<string,unknown>), blocked } }, 201);
}

// PATCH /api/messages/conversations/:id/read
async function markRead(request: Request, env: BackendEnv, identity: Identity, conversationId: string) {
  const now = new Date().toISOString();
  const r = await db(env, `messages?conversation_id=eq.${conversationId}&sender_id=neq.${identity.id}&read_at=is.null`, identity.accessToken, {
    method: "PATCH",
    body: JSON.stringify({ read_at: now }),
  });
  const p = await payload(r);
  if (!r.ok) return dbErr(r.status, p);
  return json({ ok: true, data: { markedRead: true } });
}

export async function handleMessagingRequest(request: Request, env: BackendEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/messages/")) return null;

  try {
    if (!isSameOriginMutation(request)) return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    if (pathname === "/api/messages/conversations" && request.method === "GET") return listConversations(request, env, identity);
    if (pathname === "/api/messages/conversations" && request.method === "POST") return openConversation(request, env, identity);

    const convMatch = pathname.match(/^\/api\/messages\/conversations\/([0-9a-f-]{36})\/messages$/i);
    if (convMatch && request.method === "GET") return getMessages(request, env, identity, convMatch[1]!);
    if (convMatch && request.method === "POST") return sendMessage(request, env, identity, convMatch[1]!);

    const readMatch = pathname.match(/^\/api\/messages\/conversations\/([0-9a-f-]{36})\/read$/i);
    if (readMatch && request.method === "PATCH") return markRead(request, env, identity, readMatch[1]!);

    return null;
  } catch (error) {
    console.error("Messaging API error", error);
    return json({ ok: false, error: "Messaging service temporarily unavailable." }, 500);
  }
}
