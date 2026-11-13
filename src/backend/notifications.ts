import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";

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
  const authKey =
    serviceRole && env.SUPABASE_SERVICE_ROLE_KEY ? env.SUPABASE_SERVICE_ROLE_KEY : token;
  return fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${authKey}`,
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
  return json({ ok: false, error: "Notification service temporarily unavailable." }, 502);
}

// GET /api/notifications
async function listNotifications(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const q = new URLSearchParams({
    select: "id,event_type,payload,read_at,created_at",
    recipient_id: `eq.${identity.id}`,
    order: "created_at.desc",
    limit: url.searchParams.get("limit") ?? "50",
  });
  if (url.searchParams.get("unread") === "true") q.set("read_at", "is.null");
  const r = await db(env, `notifications?${q}`, identity.accessToken);
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);

  // Count unread
  const list = Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
  const unreadCount = list.filter((n) => !n["read_at"]).length;
  return json({ ok: true, data: { notifications: list, unreadCount } });
}

// PATCH /api/notifications/:id/read
async function markNotificationRead(env: BackendEnv, identity: Identity, notificationId: string) {
  const r = await db(
    env,
    `notifications?id=eq.${notificationId}&recipient_id=eq.${identity.id}`,
    identity.accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    },
  );
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: { read: true } });
}

// PATCH /api/notifications/read-all
async function markAllRead(env: BackendEnv, identity: Identity) {
  const r = await db(
    env,
    `notifications?recipient_id=eq.${identity.id}&read_at=is.null`,
    identity.accessToken,
    {
      method: "PATCH",
      body: JSON.stringify({ read_at: new Date().toISOString() }),
    },
  );
  const result = await p(r);
  if (!r.ok) return dbErr(r.status, result);
  return json({ ok: true, data: { markedAll: true } });
}

/**
 * Internal helper — create a notification with deduplication.
 * Called from other services (payment confirmation, order updates, etc.)
 * Uses service role to bypass RLS for server-side inserts.
 */
export async function createNotification(
  env: BackendEnv,
  recipientId: string,
  eventType: string,
  payload: Record<string, unknown>,
  dedupeKey: string,
): Promise<void> {
  try {
    const url = env.SUPABASE_URL?.replace(/\/+$/, "");
    const key = env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_ANON_KEY;
    if (!url || !key) return;
    await fetch(`${url}/rest/v1/notifications`, {
      method: "POST",
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        event_type: eventType,
        payload,
        dedupe_key: dedupeKey,
      }),
    });
  } catch (error) {
    // Notification failure must never block the calling operation
    console.error("Failed to create notification", eventType, error);
  }
}

export async function handleNotificationsRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/notifications")) return null;

  try {
    if (!isSameOriginMutation(request))
      return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    if (pathname === "/api/notifications" && request.method === "GET")
      return listNotifications(request, env, identity);
    if (pathname === "/api/notifications/read-all" && request.method === "PATCH")
      return markAllRead(env, identity);

    const readMatch = pathname.match(/^\/api\/notifications\/([0-9a-f-]{36})\/read$/i);
    if (readMatch && request.method === "PATCH")
      return markNotificationRead(env, identity, readMatch[1]!);

    return null;
  } catch (error) {
    console.error("Notifications API error", error);
    return json({ ok: false, error: "Notification service temporarily unavailable." }, 500);
  }
}
