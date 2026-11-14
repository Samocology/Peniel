import { isSameOriginMutation, json, readJsonObject } from "./http.ts";

export type BackendEnv = {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  APP_BASE_URL?: string;
  FLUTTERWAVE_SECRET_KEY?: string;
  FLUTTERWAVE_WEBHOOK_SECRET_HASH?: string;
  BREVO_API_KEY?: string;
  BREVO_SENDER_EMAIL?: string;
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
const OAUTH_VERIFIER_COOKIE = "peniel_oauth_verifier";
const MAX_AUTH_BODY_BYTES = 16_384;
const OTP_CODE_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createPkcePair(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64UrlEncode(new Uint8Array(digest)) };
}

function generateOtpCode(): string {
  let code = "";
  for (let i = 0; i < OTP_CODE_LENGTH; i++) code += String(Math.floor(Math.random() * 10));
  return code;
}

async function sendBrevoEmail(
  env: BackendEnv,
  toEmail: string,
  subject: string,
  htmlContent: string,
): Promise<boolean> {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) return false;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Peniel", email: env.BREVO_SENDER_EMAIL },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

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
    const raw = String(payload["msg"] ?? payload["message"] ?? payload["error_description"] ?? "");
    const error = supabaseErrorMessage(payload, "Could not create the account.");
    const code = /already registered|already been registered/i.test(raw)
      ? "EMAIL_EXISTS"
      : undefined;
    return json(
      { ok: false, error, ...(code ? { code } : {}) },
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

  return json(
    {
      ok: true,
      data: {
        authenticated: false,
        needsOtp: true,
        user: userResponse(session?.user ?? signupUser),
      },
    },
    201,
  );
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

async function handleForgotPassword(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
): Promise<Response> {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const email = typeof input?.["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Enter a valid email address." }, 400);
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return json({ ok: false, error: "Password reset is not configured on this deployment." }, 503);
  }

  const insertResponse = await fetch(`${config.url}/rest/v1/password_reset_otps`, {
    method: "POST",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ email, code_hash: code, expires_at: expiresAt }),
  });
  if (!insertResponse.ok) {
    await insertResponse.body?.cancel();
    return json({ ok: false, error: "Could not create reset code. Try again later." }, 502);
  }
  await insertResponse.body?.cancel();

  const sent = await sendBrevoEmail(
    env,
    email,
    "Your Peniel password reset code",
    `<p>Your password reset code is <strong>${code}</strong>.</p>
     <p>It expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request this, you can ignore this email.</p>`,
  );

  return json({
    ok: true,
    data: { accepted: true, codeSent: sent },
  });
}

async function handleResendSignupOtp(
  request: Request,
  config: { url: string; key: string },
): Promise<Response> {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const email = typeof input?.["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Enter a valid email address." }, 400);
  }

  const response = await supabaseRequest(config, "resend", {
    method: "POST",
    body: JSON.stringify({ email, type: "signup" }),
  });
  const payload = await parseSupabaseBody(response);
  if (!response.ok) {
    return json(
      { ok: false, error: supabaseErrorMessage(payload, "Could not resend verification code.") },
      response.status,
    );
  }

  return json({ ok: true, data: { accepted: true } });
}

async function handleVerifyOtp(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
): Promise<Response> {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const email = typeof input?.["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  const code = typeof input?.["code"] === "string" ? input["code"] : "";
  const type = typeof input?.["type"] === "string" ? input["type"] : "reset";
  const expectedCodeLength = type === "signup" ? 8 : 6;
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !["signup", "reset"].includes(type) ||
    !new RegExp(`^\\d{${expectedCodeLength}}$`).test(code)
  ) {
    return json(
      { ok: false, error: `Enter a valid email and ${expectedCodeLength}-digit code.` },
      400,
    );
  }

  if (type === "signup") {
    const response = await supabaseRequest(config, "verify", {
      method: "POST",
      body: JSON.stringify({ email, token: code, type: "signup" }),
    });
    const payload = await parseSupabaseBody(response);
    if (!response.ok) {
      return json(
        { ok: false, error: supabaseErrorMessage(payload, "Invalid or expired code.") },
        response.status,
      );
    }

    return json({ ok: true, data: { email, type: "signup" } });
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return json({ ok: false, error: "Password reset is not configured on this deployment." }, 503);
  }

  const now = new Date().toISOString();
  const selectResponse = await fetch(
    `${config.url}/rest/v1/password_reset_otps?email=eq.${encodeURIComponent(email)}&used=eq.false&expires_at=gt.${encodeURIComponent(now)}&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!selectResponse.ok) {
    await selectResponse.body?.cancel();
    return json({ ok: false, error: "Could not verify the code. Try again later." }, 502);
  }
  const otps = (await selectResponse.json()) as Array<{ id: string; code_hash: string }>;
  await selectResponse.body?.cancel();

  const otp = otps.find((o) => o.code_hash === code);
  if (!otp) {
    return json({ ok: false, error: "Invalid or expired code." }, 400);
  }

  const markResponse = await fetch(`${config.url}/rest/v1/password_reset_otps?id=eq.${otp.id}`, {
    method: "PATCH",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ used: true, reset_token: crypto.randomUUID() }),
  });
  if (!markResponse.ok) {
    await markResponse.body?.cancel();
    return json({ ok: false, error: "Could not mark code as used. Try again later." }, 502);
  }
  await markResponse.body?.cancel();

  // Fetch the row to return the reset token and email.
  const tokenResponse = await fetch(
    `${config.url}/rest/v1/password_reset_otps?id=eq.${otp.id}&select=reset_token`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!tokenResponse.ok) {
    await tokenResponse.body?.cancel();
    return json({ ok: false, error: "Could not issue reset token. Try again later." }, 502);
  }
  const tokenRows = (await tokenResponse.json()) as Array<{ reset_token: string }>;
  await tokenResponse.body?.cancel();

  const resetToken = tokenRows[0]?.reset_token ?? "";
  return json({
    ok: true,
    data: { resetToken, email, type },
  });
}

async function handleResetPassword(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
): Promise<Response> {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const resetToken = typeof input?.["resetToken"] === "string" ? input["resetToken"] : "";
  const password = typeof input?.["password"] === "string" ? input["password"] : "";
  if (!resetToken || password.length < 8) {
    return json({ ok: false, error: "A valid reset token and password are required." }, 400);
  }

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return json({ ok: false, error: "Password reset is not configured on this deployment." }, 503);
  }

  // Look up the reset session by token.
  const sessionResponse = await fetch(
    `${config.url}/rest/v1/password_reset_otps?reset_token=eq.${encodeURIComponent(resetToken)}&used=eq.true&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&limit=1`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!sessionResponse.ok) {
    await sessionResponse.body?.cancel();
    return json({ ok: false, error: "Invalid or expired reset token." }, 400);
  }
  const sessions = (await sessionResponse.json()) as Array<{ email: string }>;
  await sessionResponse.body?.cancel();

  const session = sessions[0];
  if (!session) {
    return json({ ok: false, error: "Invalid or expired reset token." }, 400);
  }

  // Look up the Supabase user by email via the admin API.
  const usersResponse = await fetch(
    `${config.url}/auth/v1/admin/users?email=eq.${encodeURIComponent(session.email)}`,
    {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!usersResponse.ok) {
    await usersResponse.body?.cancel();
    return json({ ok: false, error: "Could not look up account. Try again later." }, 502);
  }
  const users = (await usersResponse.json()) as Array<{ id: string }>;
  await usersResponse.body?.cancel();

  const user = users[0];
  if (!user) {
    return json({ ok: false, error: "No account found for this reset token." }, 400);
  }

  // Update the user's password via the Supabase admin API.
  const updateResponse = await fetch(`${config.url}/auth/v1/admin/users/${user.id}`, {
    method: "PUT",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  if (!updateResponse.ok) {
    await updateResponse.body?.cancel();
    return json({ ok: false, error: "Could not update the password. Try again later." }, 502);
  }
  await updateResponse.body?.cancel();

  // Invalidate the reset token.
  await fetch(
    `${config.url}/rest/v1/password_reset_otps?reset_token=eq.${encodeURIComponent(resetToken)}`,
    {
      method: "DELETE",
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );

  return json({ ok: true, data: { passwordUpdated: true } });
}

async function handleGoogleOAuth(
  request: Request,
  config: { url: string; key: string },
  role: string = "customer",
): Promise<Response> {
  const { verifier, challenge } = await createPkcePair();
  const redirectTo = `${new URL(request.url).origin}/api/auth/oauth/callback`;

  const authorizeUrl = new URL(`${config.url}/auth/v1/authorize`);
  authorizeUrl.searchParams.set("provider", "google");
  authorizeUrl.searchParams.set("redirect_to", redirectTo);
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "s256");

  const headers = new Headers();
  headers.set("Location", authorizeUrl.toString());
  headers.append("Set-Cookie", cookie(OAUTH_VERIFIER_COOKIE, verifier, request, 600));
  headers.append("Set-Cookie", cookie("peniel_oauth_role", role, request, 600));

  return new Response(null, {
    status: 302,
    headers,
  });
}

async function handleOAuthCallback(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const verifier = parseCookies(request).get(OAUTH_VERIFIER_COOKIE);
  const oauthRole = parseCookies(request).get("peniel_oauth_role") ?? "customer";
  const clearVerifierCookie = cookie(OAUTH_VERIFIER_COOKIE, "", request, 0);
  const clearRoleCookie = cookie("peniel_oauth_role", "", request, 0);

  if (error) {
    const base = env.APP_BASE_URL ?? new URL(request.url).origin;
    const response = new Response(null, {
      status: 302,
      headers: { Location: `${base}/auth?error=oauth_failed` },
    });
    response.headers.append("Set-Cookie", clearVerifierCookie);
    response.headers.append("Set-Cookie", clearRoleCookie);
    return response;
  }

  if (!code) {
    const response = json({ ok: false, error: "No authorization code received." }, 400);
    response.headers.append("Set-Cookie", clearVerifierCookie);
    response.headers.append("Set-Cookie", clearRoleCookie);
    return response;
  }
  if (!verifier) {
    const response = json(
      { ok: false, error: "OAuth verification expired. Please try again." },
      400,
    );
    response.headers.append("Set-Cookie", clearVerifierCookie);
    response.headers.append("Set-Cookie", clearRoleCookie);
    return response;
  }

  const tokenResponse = await supabaseRequest(config, "token?grant_type=pkce", {
    method: "POST",
    body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
  });
  if (!tokenResponse.ok) {
    await tokenResponse.body?.cancel();
    const response = json({ ok: false, error: "Could not exchange authorization code." }, 400);
    response.headers.append("Set-Cookie", clearVerifierCookie);
    response.headers.append("Set-Cookie", clearRoleCookie);
    return response;
  }
  const payload = await parseSupabaseBody(tokenResponse);

  if (!isSupabaseSession(payload) || !payload.user?.id) {
    const response = json({ ok: false, error: "Authentication response was incomplete." }, 502);
    response.headers.append("Set-Cookie", clearVerifierCookie);
    response.headers.append("Set-Cookie", clearRoleCookie);
    return response;
  }
  const session = payload;

  const base = env.APP_BASE_URL ?? new URL(request.url).origin;
  const callbackUrl = new URL(`${base}/auth/oauth/callback`);
  callbackUrl.searchParams.set("role", oauthRole);
  const response = new Response(null, {
    status: 302,
    headers: { Location: callbackUrl.toString() },
  });
  response.headers.append("Set-Cookie", clearVerifierCookie);
  response.headers.append("Set-Cookie", clearRoleCookie);
  response.headers.append(
    "Set-Cookie",
    cookie(ACCESS_COOKIE, session.access_token, request, Math.max(60, session.expires_in ?? 3600)),
  );
  response.headers.append(
    "Set-Cookie",
    cookie(REFRESH_COOKIE, session.refresh_token, request, 60 * 60 * 24 * 30),
  );
  return response;
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
    if (path === "/api/auth/forgot-password" && request.method === "POST")
      return await handleForgotPassword(request, config, env);
    if (path === "/api/auth/resend-signup-otp" && request.method === "POST")
      return await handleResendSignupOtp(request, config);
    if (path === "/api/auth/verify-otp" && request.method === "POST")
      return await handleVerifyOtp(request, config, env);
    if (path === "/api/auth/reset-password" && request.method === "POST")
      return await handleResetPassword(request, config, env);
    if (path === "/api/auth/session" && request.method === "GET")
      return await handleSession(request, config);
    if (path === "/api/auth/oauth/google" && request.method === "GET") {
      const requestUrl = new URL(request.url);
      const role = requestUrl.searchParams.get("role") ?? "customer";
      return await handleGoogleOAuth(request, config, role);
    }
    if (path === "/api/auth/oauth/callback" && request.method === "GET")
      return await handleOAuthCallback(request, config, env);
    return json({ ok: false, error: "Method not allowed." }, 405, { allow: "GET, POST" });
  } catch (error) {
    console.error("Supabase authentication request failed", error);
    return json({ ok: false, error: "Authentication service is temporarily unavailable." }, 502);
  }
}
