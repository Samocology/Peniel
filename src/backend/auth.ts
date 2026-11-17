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
): Promise<{ ok: boolean; messageId?: string }> {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) {
    console.error(
      "Brevo email skipped: missing BREVO_API_KEY or BREVO_SENDER_EMAIL secret on the worker.",
    );
    return { ok: false };
  }
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
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error(
        `Brevo rejected email to ${toEmail}: ${response.status} ${detail.slice(0, 300)}`,
      );
      return { ok: false };
    }
    // Brevo returns 201 with a messageId on acceptance. If the email still doesn't
    // arrive, look this messageId up under Brevo > Transactional > Logs to see whether
    // it was delivered, bounced, blocked, or dropped (often an unverified sender or an
    // unactivated account that can only send to the account owner's address).
    let messageId: string | undefined;
    try {
      const body = (await response.json()) as { messageId?: string };
      messageId = body.messageId;
    } catch {
      // ignore body parse failures
    }
    console.log(`Brevo accepted email to ${toEmail} (messageId=${messageId ?? "unknown"})`);
    return { ok: true, ...(messageId ? { messageId } : {}) };
  } catch (error) {
    console.error(`Brevo email request to ${toEmail} failed`, error);
    return { ok: false };
  }
}

async function storeOtp(
  env: BackendEnv,
  config: { url: string; key: string },
  table: "signup_otps" | "password_reset_otps",
  email: string,
  code: string,
): Promise<{ ok: boolean; status?: number }> {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.error("storeOtp skipped: missing SUPABASE_SERVICE_ROLE_KEY secret on the worker.");
    return { ok: false };
  }
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
  // Invalidate any older unused codes for this email so only the newest code is valid.
  const cleanup = await fetch(
    `${config.url}/rest/v1/${table}?email=eq.${encodeURIComponent(email)}&used=eq.false`,
    {
      method: "DELETE",
      headers: {
        ...restAuthHeaders(env, config),
      },
    },
  );
  await drain(cleanup);
  const response = await fetch(`${config.url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...restAuthHeaders(env, config),
      "content-type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ email, code_hash: code, expires_at: expiresAt }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const jwtHint =
      response.status === 401 && /JWT/i.test(detail)
        ? " — the SUPABASE_SERVICE_ROLE_KEY is a new sb_secret_ key; this code now sends it as the apikey, so this should not recur."
        : "";
    console.error(
      `storeOtp insert into ${table} failed: ${response.status} ${detail.slice(0, 300)}${jwtHint}`,
    );
    await drain(response);
    return { ok: false, status: response.status };
  }
  await drain(response);
  return { ok: true };
}

type OtpIssueResult = { ok: true } | { ok: false; reason: "store" | "brevo"; status?: number };

/**
 * Renders a branded, responsive HTML email for one-time passcodes. Uses table-based
 * layout and inline styles so it renders consistently across email clients (Gmail,
 * Outlook, Apple Mail, mobile). No external assets — everything is inline so there is
 * nothing to block or load.
 */
function renderOtpEmail(opts: {
  title: string;
  intro: string;
  code: string;
  footnote: string;
}): string {
  const { title, intro, code, footnote } = opts;
  const year = new Date().getUTCFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="light">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#EEF1EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EEF1EC;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:460px;background-color:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 2px 10px rgba(23,41,31,0.06);">

          <!-- Header -->
          <tr>
            <td style="background-color:#17291F;padding:26px 30px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="display:inline-block;width:34px;height:34px;line-height:34px;text-align:center;border-radius:9px;background-color:#294331;color:#ffffff;font-weight:700;font-size:16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">P</span>
                  </td>
                  <td style="vertical-align:middle;padding-left:11px;">
                    <span style="color:#ffffff;font-weight:600;font-size:17px;letter-spacing:-0.2px;">Peniel</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent bar -->
          <tr>
            <td style="height:3px;line-height:3px;font-size:0;background-color:#A7B99E;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px;">
              <h1 style="margin:0 0 10px;color:#17291F;font-size:21px;font-weight:700;letter-spacing:-0.3px;line-height:28px;">${title}</h1>
              <p style="margin:0 0 22px;color:#5A655C;font-size:14px;line-height:22px;">${intro}</p>

              <!-- Code box -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#F3F6F0;border:1px solid #E2E7DF;border-radius:12px;padding:20px;text-align:center;">
                    <p style="margin:0 0 8px;color:#7A857C;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Your code</p>
                    <p style="margin:0;color:#17291F;font-size:34px;font-weight:800;letter-spacing:8px;font-family:'SF Mono',Menlo,Consolas,'Liberation Mono',monospace;">${code}</p>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;color:#8A938B;font-size:12px;line-height:18px;">
                This code expires in <strong style="color:#5A655C;">${OTP_EXPIRY_MINUTES} minutes</strong>.
                ${footnote}
              </p>

              <p style="margin:24px 0 0;color:#5A655C;font-size:14px;line-height:22px;">
                Thanks,<br>
                <strong style="color:#17291F;">The Peniel team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 30px;background-color:#FAFBF9;border-top:1px solid #EEF1EC;">
              <p style="margin:0;color:#9AA29B;font-size:11px;line-height:16px;">
                Peniel &middot; Your neighbourhood marketplace.<br>
                &copy; ${year} Peniel. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function issueSignupOtp(
  env: BackendEnv,
  config: { url: string; key: string },
  email: string,
): Promise<OtpIssueResult> {
  const code = generateOtpCode();
  const stored = await storeOtp(env, config, "signup_otps", email, code);
  if (!stored.ok) {
    console.error(
      "Signup OTP not sent: could not store the code. Likely the signup_otps table is missing — apply supabase/migrations/20261117000000_peniel_signup_otps.sql.",
    );
    return { ok: false, reason: "store", ...(stored.status ? { status: stored.status } : {}) };
  }
  const sent = await sendBrevoEmail(
    env,
    email,
    "Your Peniel verification code",
    renderOtpEmail({
      title: "Verify your email",
      intro:
        "Welcome to Peniel. Enter the code below to confirm your email and activate your account.",
      code,
      footnote: "If you didn't create a Peniel account, you can safely ignore this email.",
    }),
  );
  if (!sent.ok) {
    console.error(
      "Signup OTP not sent: Brevo rejected or is not configured (check BREVO_API_KEY / BREVO_SENDER_EMAIL and sender verification).",
    );
    return { ok: false, reason: "brevo" };
  }
  return { ok: true };
}

async function createSupabaseUser(
  env: BackendEnv,
  config: { url: string; key: string },
  email: string,
  password: string,
  name: string,
  intentRole: unknown,
): Promise<
  { ok: true; user: SupabaseUser } | { ok: false; status: number; error: string; code?: string }
> {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return { ok: false, status: 503, error: "Signup is not configured on this deployment." };
  }
  const response = await fetch(`${config.url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: name,
        signup_intent: intentRole === "vendor" ? "vendor" : "customer",
      },
    }),
  });
  const payload = await parseSupabaseBody(response);
  if (!response.ok) {
    await drain(response);
    const raw = String(payload["msg"] ?? payload["message"] ?? payload["error_description"] ?? "");
    // Supabase rejects the admin call with 401/403 when the service role key is missing/invalid.
    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        status: 502,
        error:
          "Signups are temporarily unavailable because the server's Supabase service role key is not configured correctly.",
      };
    }
    const error = supabaseErrorMessage(payload, "Could not create the account.");
    const code = /already registered|already been registered/i.test(raw)
      ? "EMAIL_EXISTS"
      : undefined;
    return {
      ok: false,
      status: response.status === 422 ? 409 : response.status,
      error,
      ...(code ? { code } : {}),
    };
  }
  await drain(response);
  const userValue = payload["user"] ?? payload;
  const user =
    userValue !== null &&
    typeof userValue === "object" &&
    typeof (userValue as Record<string, unknown>)["id"] === "string"
      ? (userValue as SupabaseUser)
      : undefined;
  if (!user?.id) {
    return { ok: false, status: 502, error: "Authentication response was incomplete." };
  }
  return { ok: true, user };
}

async function deleteSupabaseUser(
  env: BackendEnv,
  config: { url: string; key: string },
  userId: string,
): Promise<void> {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) return;
  try {
    const response = await fetch(`${config.url}/auth/v1/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    await drain(response);
  } catch (error) {
    console.error("Failed to roll back Supabase user after signup failure", error);
  }
}

function authConfig(env: BackendEnv) {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

/**
 * PostgREST (the /rest/v1 REST API) determines the caller's role from a JWT in the
 * Authorization header. Supabase now offers two key formats:
 *  - Legacy JWT keys (eyJ...) — three dot-separated parts. Use anon as apikey and the
 *    service_role JWT as the Bearer token.
 *  - New secret keys (sb_secret_...) — NOT a JWT. PostgREST accepts these via the
 *    `apikey` header directly and treats them as service_role.
 * Sending a non-JWT sb_secret_ key as `Bearer` triggers 401 PGRST301
 * ("Expected 3 parts in JWT; got 1"), which is exactly what this helper avoids.
 */
function isJwt(token: string | undefined): boolean {
  return typeof token === "string" && token.split(".").length === 3;
}

function restAuthHeaders(env: BackendEnv, config: { key: string }): Record<string, string> {
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey && !isJwt(serviceRoleKey)) {
    // New sb_secret_ format: pass it as the apikey, no Authorization Bearer.
    return { apikey: serviceRoleKey };
  }
  return {
    apikey: config.key,
    ...(serviceRoleKey ? { Authorization: `Bearer ${serviceRoleKey}` } : {}),
  };
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

async function drain(response: Response): Promise<void> {
  try {
    await response.body?.cancel();
  } catch {
    // Body may already be consumed or locked; nothing left to drain.
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

async function handleSignup(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
) {
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

  // Create the Supabase user WITHOUT sending Supabase's own email. The verification
  // code is generated locally and delivered through Brevo so every OTP is logged there.
  const created = await createSupabaseUser(env, config, email, password, name, intentRole);
  if (!created.ok) {
    return json(
      { ok: false, error: created.error, ...(created.code ? { code: created.code } : {}) },
      created.status,
    );
  }
  const otp = await issueSignupOtp(env, config, email);
  if (!otp.ok) {
    // Roll back the half-created account so the customer can retry cleanly instead of
    // being stuck on a verify screen with no code.
    await deleteSupabaseUser(env, config, created.user.id);
    return json(
      {
        ok: false,
        error:
          otp.reason === "store"
            ? "We couldn't prepare your verification code. Please try again shortly."
            : "We couldn't email your verification code right now. Please try again shortly.",
        reason: otp.reason,
        ...(otp.status ? { detail: `store status ${otp.status}` } : {}),
      },
      502,
    );
  }

  return json(
    {
      ok: true,
      data: {
        authenticated: false,
        needsOtp: true,
        codeSent: true,
        user: userResponse(created.user),
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
      ...restAuthHeaders(env, config),
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
    renderOtpEmail({
      title: "Reset your password",
      intro:
        "We received a request to reset your Peniel password. Enter the code below to choose a new one.",
      code,
      footnote:
        "If you didn't request a password reset, you can safely ignore this email — your password won't change.",
    }),
  );

  return json({
    ok: true,
    data: { accepted: true, codeSent: sent.ok },
  });
}

async function handleResendSignupOtp(
  request: Request,
  config: { url: string; key: string },
  env: BackendEnv,
): Promise<Response> {
  const input = await readJsonObject(request, MAX_AUTH_BODY_BYTES);
  const email = typeof input?.["email"] === "string" ? input["email"].trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Enter a valid email address." }, 400);
  }

  const otp = await issueSignupOtp(env, config, email);
  if (!otp.ok) {
    return json(
      {
        ok: false,
        error:
          otp.reason === "store"
            ? "Could not prepare a verification code. Please try again."
            : "Could not send the verification email. Please try again.",
        reason: otp.reason,
      },
      502,
    );
  }

  return json({ ok: true, data: { accepted: true, codeSent: true } });
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
  const expectedCodeLength = OTP_CODE_LENGTH;
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

  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return json(
      { ok: false, error: "Email verification is not configured on this deployment." },
      503,
    );
  }

  const table = type === "signup" ? "signup_otps" : "password_reset_otps";

  // Fetch every code on file for this email (no server-side filter) so we can validate
  // used/expiry in code and log exactly why a code was rejected.
  const selectResponse = await fetch(
    `${config.url}/rest/v1/${table}?email=eq.${encodeURIComponent(email)}&order=created_at.desc`,
    {
      headers: {
        ...restAuthHeaders(env, config),
      },
    },
  );
  if (!selectResponse.ok) {
    const detail = await selectResponse.text().catch(() => "");
    console.error(
      `verify select from ${table} failed: ${selectResponse.status} ${detail.slice(0, 300)}`,
    );
    await drain(selectResponse);
    return json({ ok: false, error: "Could not verify the code. Try again later." }, 502);
  }
  const rows = (await selectResponse.json()) as Array<{
    id: string;
    code_hash: string;
    used: boolean;
    expires_at: string;
  }>;
  await drain(selectResponse);

  const nowMs = Date.now();
  const validRows = rows.filter((o) => !o.used && new Date(o.expires_at).getTime() > nowMs);
  const otp = validRows.find((o) => o.code_hash === code);
  if (!otp) {
    console.error(
      `verify ${type} failed for ${email}: ${rows.length} row(s) on file, ${validRows.length} valid, none matched. Rows: ${JSON.stringify(
        rows.map((o) => ({ used: o.used, expires_at: o.expires_at })),
      )}`,
    );
    // Distinguish the failure so the customer knows what to do next.
    if (rows.length === 0) {
      return json(
        {
          ok: false,
          error: "We couldn't find a verification code for this email. Please request a new one.",
          reason: "not_found",
        },
        400,
      );
    }
    if (validRows.length === 0) {
      return json(
        {
          ok: false,
          error: "This code has expired. Please request a new one.",
          reason: "expired",
        },
        400,
      );
    }
    return json(
      { ok: false, error: "That code doesn't match. Please try again.", reason: "mismatch" },
      400,
    );
  }

  if (type === "signup") {
    // Mark the signup OTP as used, then confirm the user's email via the admin API.
    const markResponse = await fetch(`${config.url}/rest/v1/${table}?id=eq.${otp.id}`, {
      method: "PATCH",
      headers: {
        ...restAuthHeaders(env, config),
        "content-type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ used: true }),
    });
    if (!markResponse.ok) {
      await drain(markResponse);
      return json({ ok: false, error: "Could not mark code as used. Try again later." }, 502);
    }
    await drain(markResponse);

    const usersResponse = await fetch(
      `${config.url}/auth/v1/admin/users?email=eq.${encodeURIComponent(email)}`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      },
    );
    if (!usersResponse.ok) {
      await drain(usersResponse);
      return json({ ok: false, error: "Could not look up account. Try again later." }, 502);
    }
    const users = (await usersResponse.json()) as Array<{ id: string }>;
    await drain(usersResponse);

    const user = users[0];
    if (!user) {
      return json({ ok: false, error: "No account found for this email." }, 400);
    }

    const confirmResponse = await fetch(`${config.url}/auth/v1/admin/users/${user.id}`, {
      method: "PUT",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ email_confirm: true }),
    });
    if (!confirmResponse.ok) {
      await drain(confirmResponse);
      return json({ ok: false, error: "Could not verify the email. Try again later." }, 502);
    }
    await drain(confirmResponse);

    return json({ ok: true, data: { email, type: "signup" } });
  }

  const markResponse = await fetch(`${config.url}/rest/v1/password_reset_otps?id=eq.${otp.id}`, {
    method: "PATCH",
    headers: {
      ...restAuthHeaders(env, config),
      "content-type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ used: true, reset_token: crypto.randomUUID() }),
  });
  if (!markResponse.ok) {
    await drain(markResponse);
    return json({ ok: false, error: "Could not mark code as used. Try again later." }, 502);
  }
  await drain(markResponse);

  // Fetch the row to return the reset token and email.
  const tokenResponse = await fetch(
    `${config.url}/rest/v1/password_reset_otps?id=eq.${otp.id}&select=reset_token`,
    {
      headers: {
        ...restAuthHeaders(env, config),
      },
    },
  );
  if (!tokenResponse.ok) {
    await drain(tokenResponse);
    return json({ ok: false, error: "Could not issue reset token. Try again later." }, 502);
  }
  const tokenRows = (await tokenResponse.json()) as Array<{ reset_token: string }>;
  await drain(tokenResponse);

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
        ...restAuthHeaders(env, config),
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
        apikey: serviceRoleKey,
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
      apikey: serviceRoleKey,
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
        ...restAuthHeaders(env, config),
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
      return await handleSignup(request, config, env);
    if (path === "/api/auth/login" && request.method === "POST")
      return await handleLogin(request, config);
    if (path === "/api/auth/password/reset" && request.method === "POST")
      return await handlePasswordReset(request, config);
    if (path === "/api/auth/forgot-password" && request.method === "POST")
      return await handleForgotPassword(request, config, env);
    if (path === "/api/auth/resend-signup-otp" && request.method === "POST")
      return await handleResendSignupOtp(request, config, env);
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
