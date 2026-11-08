import { isSameOriginMutation, json, readJsonObject } from "./http.ts";

export type BackendEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_BASE_URL?: string;
  FLUTTERWAVE_SECRET_KEY?: string;
  FLUTTERWAVE_WEBHOOK_SECRET_HASH?: string;
};

type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: SupabaseUser;
};

const ACCESS_COOKIE = "peniel_access";
const REFRESH_COOKIE = "peniel_refresh";
const MAX_AUTH_BODY_BYTES = 16_384;

function authConfig(env: BackendEnv) {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

function parseCookies(request: Request): Map<string, string> {
  const values = new Map<string, string>();
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const separator = part.indexOf("=");
    if (separator < 1) continue;

    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (name && value) values.set(name, value);
  }
  return values;
}

function cookie(name: string, value: string, request: Request, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function clearCookies(request: Request): string[] {
  return [cookie(ACCESS_COOKIE, "", request, 0), cookie(REFRESH_COOKIE, "", request, 0)];
}

function withSessionCookies(response: Response, session: SupabaseSession, request: Request) {
  const headers = new Headers(response.headers);
  headers.append(
    "Set-Cookie",
    cookie(ACCESS_COOKIE, session.access_token, request, Math.max(60, session.expires_in ?? 3600)),
  );
  headers.append(
    "Set-Cookie",
    cookie(REFRESH_COOKIE, session.refresh_token, request, 60 * 60 * 24 * 30),
  );
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function clearSessionCookies(response: Response, request: Request) {
  const headers = new Headers(response.headers);
  for (const value of clearCookies(request)) headers.append("Set-Cookie", value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function supabaseRequest(
  config: { url: string; key: string },
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  return fetch(`${config.url}/auth/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.key,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

function userResponse(user: SupabaseUser | undefined) {
  if (!user?.id) return null;
  const metadataName = user.user_metadata?.["full_name"];
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof metadataName === "string" ? metadataName : "",
  };
}

function isSupabaseSession(
  value: Record<string, unknown>,
): value is Record<string, unknown> & SupabaseSession {
  return (
    typeof value["access_token"] === "string" &&
    typeof value["refresh_token"] === "string" &&
    value["access_token"].length > 0 &&
    value["refresh_token"].length > 0
  );
}

async function parseSupabaseBody(response: Response): Promise<Record<string, unknown>> {
  try {
    const value: unknown = await response.json();
    return value !== null && typeof value === "object" ? (value as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

function supabaseErrorMessage(payload: Record<string, unknown>, fallback: string): string {
  const message = payload["msg"] ?? payload["message"] ?? payload["error_description"];
  if (typeof message !== "string") return fallback;
  if (/invalid login credentials/i.test(message)) return "Email or password is incorrect.";
  if (/email not confirmed/i.test(message)) return "Please verify your email before signing in.";
  if (/already registered|already been registered/i.test(message))
    return "An account with this email already exists.";
  if (/password/i.test(message)) return "The password does not meet the requirements.";
  return fallback;
}

async function handleSignup(request: Request, config: { url: string; key: string }) {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  if (!input) return json({ ok: false, error: "A valid JSON request is required." }, 400);

  const email = typeof input["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  const password = typeof input["password"] === "string" ? input["password"] : "";
  const name = typeof input["name"] === "string" ? input["name"].trim() : "";
  const intentRole = input["intentRole"];

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8 || name.length < 2) {
    return json(
      { ok: false, error: "Enter a valid name, email and password of at least 8 characters." },
      400,
    );
  }
  if (name.length > 120 || email.length > 320 || password.length > 1024) {
    return json({ ok: false, error: "One or more fields exceed the allowed length." }, 400);
  }

  const response = await supabaseRequest(config, "signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: {
        full_name: name,
        signup_intent: intentRole === "vendor" ? "vendor" : "customer",
      },
    }),
  });
  const payload = await parseSupabaseBody(response);
  if (!response.ok) {
    return json(
      { ok: false, error: supabaseErrorMessage(payload, "Could not create the account.") },
      response.status === 422 ? 409 : response.status,
    );
  }

  const session = isSupabaseSession(payload) ? payload : null;
  if (session && !session.user?.id) {
    return json({ ok: false, error: "Authentication response was incomplete." }, 502);
  }
  const signupUserValue = payload["user"];
  const signupUser =
    signupUserValue !== null &&
    typeof signupUserValue === "object" &&
    typeof (signupUserValue as Record<string, unknown>)["id"] === "string"
      ? (signupUserValue as SupabaseUser)
      : undefined;
  const result = json(
    {
      ok: true,
      data: {
        authenticated: session !== null,
        user: userResponse(session?.user ?? signupUser),
      },
    },
    201,
  );

  return session ? withSessionCookies(result, session, request) : result;
}

async function handleLogin(request: Request, config: { url: string; key: string }) {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  if (!input) return json({ ok: false, error: "A valid JSON request is required." }, 400);

  const email = typeof input["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  const password = typeof input["password"] === "string" ? input["password"] : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length > 1024) {
    return json({ ok: false, error: "Enter a valid email address and password." }, 400);
  }

  const response = await supabaseRequest(config, "token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const payload = await parseSupabaseBody(response);
  if (!response.ok) {
    return json(
      { ok: false, error: supabaseErrorMessage(payload, "Could not sign in.") },
      response.status === 400 ? 401 : response.status,
    );
  }

  if (!isSupabaseSession(payload) || !payload.user?.id) {
    return json({ ok: false, error: "Authentication response was incomplete." }, 502);
  }
  const session = payload;

  return withSessionCookies(
    json({ ok: true, data: { authenticated: true, user: userResponse(session.user) } }),
    session,
    request,
  );
}

async function fetchCurrentUser(
  config: { url: string; key: string },
  accessToken: string,
): Promise<SupabaseUser | null> {
  const response = await supabaseRequest(config, "user", {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) return null;
    throw new Error(`Supabase user validation failed with status ${response.status}.`);
  }
  const payload: unknown = await response.json();
  if (payload === null || typeof payload !== "object") return null;
  const user = payload as SupabaseUser;
  return typeof user.id === "string" && user.id ? user : null;
}

export async function getRequestIdentity(
  request: Request,
  env: BackendEnv,
): Promise<{ id: string; email: string; accessToken: string } | null> {
  const config = authConfig(env);
  const accessToken = parseCookies(request).get(ACCESS_COOKIE);
  if (!config || !accessToken) return null;

  const user = await fetchCurrentUser(config, accessToken);
  if (!user) return null;
  return { id: user.id, email: user.email ?? "", accessToken };
}

async function refreshSession(
  config: { url: string; key: string },
  refreshToken: string,
): Promise<SupabaseSession | null> {
  const response = await supabaseRequest(config, "token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!response.ok) {
    if (response.status === 400 || response.status === 401 || response.status === 403) return null;
    throw new Error(`Supabase session refresh failed with status ${response.status}.`);
  }
  const payload = await parseSupabaseBody(response);
  return isSupabaseSession(payload) && payload.user?.id ? payload : null;
}

async function handleLogout(request: Request, config?: { url: string; key: string }) {
  const accessToken = parseCookies(request).get(ACCESS_COOKIE);
  let providerSessionRevoked = !accessToken;

  if (config && accessToken) {
    try {
      const response = await supabaseRequest(config, "logout?scope=local", {
        method: "POST",
        headers: { authorization: `Bearer ${accessToken}` },
      });
      providerSessionRevoked = response.ok;
      await response.body?.cancel();
      if (!providerSessionRevoked) {
        console.error("Supabase did not revoke the session during logout.");
      }
    } catch (error) {
      console.error("Supabase session revocation failed during logout", error);
    }
  }

  const warning = providerSessionRevoked
    ? undefined
    : "The browser session was cleared, but Supabase did not confirm token revocation.";
  return clearSessionCookies(
    json({
      ok: true,
      data: { signedOut: true, providerSessionRevoked },
      ...(warning ? { warning } : {}),
    }),
    request,
  );
}

async function handleSession(request: Request, config: { url: string; key: string }) {
  const cookies = parseCookies(request);
  const accessToken = cookies.get(ACCESS_COOKIE);
  const refreshToken = cookies.get(REFRESH_COOKIE);
  if (!accessToken && !refreshToken) {
    return json({ ok: true, data: { authenticated: false, user: null } });
  }

  if (accessToken) {
    const user = await fetchCurrentUser(config, accessToken);
    if (user) {
      return json({ ok: true, data: { authenticated: true, user: userResponse(user) } });
    }
  }

  if (refreshToken) {
    const session = await refreshSession(config, refreshToken);
    if (session?.access_token && session.refresh_token && session.user) {
      return withSessionCookies(
        json({ ok: true, data: { authenticated: true, user: userResponse(session.user) } }),
        session,
        request,
      );
    }
  }

  return clearSessionCookies(
    json({ ok: true, data: { authenticated: false, user: null } }),
    request,
  );
}

async function handlePasswordReset(request: Request, config: { url: string; key: string }) {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const email = typeof input?.["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Enter a valid email address." }, 400);
  }

  const response = await supabaseRequest(config, "recover", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    await response.body?.cancel();
    return json({ ok: false, error: "Could not start password recovery. Try again later." }, 502);
  }
  await response.body?.cancel();
  return json({ ok: true, data: { accepted: true } });
}

export async function handleAuthRequest(request: Request, env: BackendEnv): Promise<Response> {
  const path = new URL(request.url).pathname;
  if (!isSameOriginMutation(request)) {
    return json({ ok: false, error: "Cross-origin request rejected." }, 403);
  }

  const config = authConfig(env);
  if (path === "/api/auth/logout" && request.method === "POST") {
    return handleLogout(request, config ?? undefined);
  }
  if (!config) {
    return json({ ok: false, error: "Authentication is not configured on this deployment." }, 503);
  }

  try {
    if (path === "/api/auth/signup" && request.method === "POST")
      return await handleSignup(request, config);
    if (path === "/api/auth/login" && request.method === "POST")
      return await handleLogin(request, config);
    if (path === "/api/auth/password/reset" && request.method === "POST")
      return await handlePasswordReset(request, config);
    if (path === "/api/auth/session" && request.method === "GET")
      return await handleSession(request, config);
    return json({ ok: false, error: "Method not allowed." }, 405, { allow: "GET, POST" });
  } catch (error) {
    console.error("Supabase authentication request failed", error);
    return json({ ok: false, error: "Authentication service is temporarily unavailable." }, 502);
  }
}