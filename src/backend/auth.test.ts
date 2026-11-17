import assert from "node:assert/strict";
import test from "node:test";

import { handleAuthRequest } from "./auth.ts";

const env = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
  BREVO_API_KEY: "test-brevo-key",
  BREVO_SENDER_EMAIL: "no-reply@peniel.test",
};

async function withFetchMock<T>(mock: typeof fetch, run: () => Promise<T>): Promise<T> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function request(path: string, method: string, body?: unknown, origin = "https://peniel.test") {
  return new Request(`https://peniel.test${path}`, {
    method,
    headers: {
      origin,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test("login proxies credentials and keeps Supabase tokens in HttpOnly cookies", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/token?grant_type=password`);
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: "customer@example.com",
        password: "correct-horse",
      });
      return Response.json({
        access_token: "access-token-value",
        refresh_token: "refresh-token-value",
        expires_in: 1800,
        user: {
          id: "user-1",
          email: "customer@example.com",
          user_metadata: { full_name: "Customer" },
        },
      });
    },
    () =>
      handleAuthRequest(
        request("/api/auth/login", "POST", {
          email: "customer@example.com",
          password: "correct-horse",
        }),
        env,
      ),
  );

  assert.equal(response.status, 200);
  const body = await response.text();
  assert.equal(body.includes("access-token-value"), false);
  assert.equal(body.includes("refresh-token-value"), false);
  const cookies = response.headers.get("set-cookie") ?? "";
  assert.match(cookies, /peniel_access=access-token-value/);
  assert.match(cookies, /peniel_refresh=refresh-token-value/);
  assert.match(cookies, /HttpOnly/);
  assert.match(cookies, /SameSite=Lax/);
});

test("cross-origin authentication mutations are rejected before contacting Supabase", async () => {
  let upstreamCalled = false;
  const response = await withFetchMock(
    async () => {
      upstreamCalled = true;
      return Response.json({});
    },
    () =>
      handleAuthRequest(
        request(
          "/api/auth/login",
          "POST",
          { email: "customer@example.com", password: "password" },
          "https://attacker.test",
        ),
        env,
      ),
  );

  assert.equal(response.status, 403);
  assert.equal(upstreamCalled, false);
});

test("invalid registration input is rejected without sending credentials upstream", async () => {
  let upstreamCalled = false;
  const response = await withFetchMock(
    async () => {
      upstreamCalled = true;
      return Response.json({});
    },
    () =>
      handleAuthRequest(
        request("/api/auth/signup", "POST", {
          name: "A",
          email: "not-an-email",
          password: "short",
          intentRole: "admin",
        }),
        env,
      ),
  );

  assert.equal(response.status, 400);
  assert.equal(upstreamCalled, false);
});

test("signup role input is stored only as non-privileged intent metadata", async () => {
  let createUserBody: Record<string, unknown> | null = null;
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      if (url === `${env.SUPABASE_URL}/auth/v1/admin/users`) {
        createUserBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return Response.json({ id: "user-3", email: "person@example.com" });
      }
      if (url.startsWith("https://api.brevo.com")) {
        return new Response(null, { status: 204 });
      }
      if (url === `${env.SUPABASE_URL}/rest/v1/signup_otps`) {
        return new Response(null, { status: 201 });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    },
    () =>
      handleAuthRequest(
        request("/api/auth/signup", "POST", {
          name: "Person",
          email: "person@example.com",
          password: "correct-horse",
          intentRole: "admin",
        }),
        env,
      ),
  );

  const metadata = (createUserBody as { user_metadata?: { signup_intent?: string } } | null)
    ?.user_metadata;
  assert.equal(metadata?.signup_intent, "customer");
  assert.equal((createUserBody as { email_confirm?: boolean } | null)?.email_confirm, false);
  assert.equal(response.status, 201);
  const body = (await response.json()) as {
    ok: boolean;
    data: { authenticated: boolean; needsOtp: boolean; user: { id: string } };
  };
  assert.deepEqual(body, {
    ok: true,
    data: {
      authenticated: false,
      needsOtp: true,
      codeSent: true,
      user: { id: "user-3", email: "person@example.com", name: "" },
    },
  });
  assert.equal(response.headers.has("set-cookie"), false);
});

test("signup with an existing email returns EMAIL_EXISTS instead of a 502", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      if (url === `${env.SUPABASE_URL}/auth/v1/admin/users`) {
        // Supabase admin rejects duplicate emails with 422 and a message body.
        return Response.json(
          { msg: "A user with this email address has already been registered" },
          { status: 422 },
        );
      }
      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    },
    () =>
      handleAuthRequest(
        request("/api/auth/signup", "POST", {
          name: "Person",
          email: "person@example.com",
          password: "correct-horse",
          intentRole: "customer",
        }),
        env,
      ),
  );

  assert.equal(response.status, 409);
  const body = (await response.json()) as { ok: boolean; error: string; code?: string };
  assert.equal(body.ok, false);
  assert.equal(body.code, "EMAIL_EXISTS");
});

test("signup reports a clear error when Supabase rejects the service role key", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      if (url === `${env.SUPABASE_URL}/auth/v1/admin/users`) {
        // The admin call must authenticate with the service role key as both apikey and bearer.
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("apikey"), env.SUPABASE_SERVICE_ROLE_KEY);
        assert.equal(headers.get("authorization"), `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
        return Response.json({ message: "Invalid API key" }, { status: 403 });
      }
      throw new Error(`Unexpected fetch: ${url} ${init?.method ?? "GET"}`);
    },
    () =>
      handleAuthRequest(
        request("/api/auth/signup", "POST", {
          name: "Person",
          email: "person@example.com",
          password: "correct-horse",
          intentRole: "customer",
        }),
        env,
      ),
  );

  assert.equal(response.status, 502);
  const body = (await response.json()) as { ok: boolean; error: string };
  assert.match(body.error, /service role key is not configured correctly/);
});

test("signup OTP verification checks the local code and confirms the email", async () => {
  const calls: string[] = [];
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      calls.push(`${init?.method ?? "GET"} ${url}`);
      if (
        url ===
        `${env.SUPABASE_URL}/rest/v1/signup_otps?email=eq.person%40example.com&used=eq.false&expires_at=gt.${encodeURIComponent(new Date().toISOString())}&order=created_at.desc&limit=1`
      ) {
        // Note: expires_at is dynamic, so match by prefix instead below.
      }
      if (url.startsWith(`${env.SUPABASE_URL}/rest/v1/signup_otps?`)) {
        if ((init?.method ?? "GET") === "GET") {
          return Response.json([{ id: "otp-1", code_hash: "012345" }]);
        }
        return new Response(null, { status: 204 });
      }
      if (url === `${env.SUPABASE_URL}/auth/v1/admin/users?email=eq.person%40example.com`) {
        return Response.json([{ id: "user-5" }]);
      }
      if (url === `${env.SUPABASE_URL}/auth/v1/admin/users/user-5`) {
        const body = JSON.parse(String(init?.body)) as { email_confirm?: boolean };
        assert.equal(body.email_confirm, true);
        return Response.json({ id: "user-5" });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    },
    () =>
      handleAuthRequest(
        request("/api/auth/verify-otp", "POST", {
          email: "person@example.com",
          code: "012345",
          type: "signup",
        }),
        env,
      ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    data: { email: "person@example.com", type: "signup" },
  });
  // Confirmed via admin API, never via Supabase's /verify endpoint.
  assert.equal(
    calls.some((c) => c.includes("/auth/v1/verify")),
    false,
  );
  assert.ok(calls.some((c) => c.startsWith("PUT ") && c.endsWith("/auth/v1/admin/users/user-5")));
});

test("signup OTP resend issues a fresh code and sends it through Brevo", async () => {
  let brevoBody: Record<string, unknown> | null = null;
  let storedOtp: Record<string, unknown> | null = null;
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      if (url === `${env.SUPABASE_URL}/rest/v1/signup_otps`) {
        storedOtp = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(null, { status: 201 });
      }
      if (url === "https://api.brevo.com/v3/smtp/email") {
        brevoBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(null, { status: 204 });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    },
    () =>
      handleAuthRequest(
        request("/api/auth/resend-signup-otp", "POST", { email: "person@example.com" }),
        env,
      ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    data: { accepted: true, codeSent: true },
  });
  // The code is stored locally and delivered via Brevo (not Supabase's /resend).
  assert.ok(storedOtp);
  assert.match(String((storedOtp as { code_hash?: string }).code_hash), /^\d{6}$/);
  assert.ok(brevoBody);
  assert.equal(
    (brevoBody as { to?: Array<{ email: string }> }).to?.[0]?.email,
    "person@example.com",
  );
});

test("session endpoint validates the cookie with Supabase rather than trusting its contents", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/user`);
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer opaque-cookie-value");
      return Response.json({ id: "user-2", email: "person@example.com" });
    },
    () =>
      handleAuthRequest(
        new Request("https://peniel.test/api/auth/session", {
          headers: { cookie: "peniel_access=opaque-cookie-value" },
        }),
        env,
      ),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    data: {
      authenticated: true,
      user: { id: "user-2", email: "person@example.com", name: "" },
    },
  });
});

test("session endpoint rotates cookies after an expired access token", async () => {
  let upstreamCalls = 0;
  const response = await withFetchMock(
    async (input) => {
      upstreamCalls += 1;
      if (String(input).endsWith("/auth/v1/user")) {
        return Response.json({ message: "expired" }, { status: 401 });
      }
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`);
      return Response.json({
        access_token: "rotated-access-token",
        refresh_token: "rotated-refresh-token",
        expires_in: 3600,
        user: { id: "user-4", email: "person@example.com" },
      });
    },
    () =>
      handleAuthRequest(
        new Request("https://peniel.test/api/auth/session", {
          headers: {
            cookie: "peniel_access=expired-token; peniel_refresh=refresh-token",
          },
        }),
        env,
      ),
  );

  assert.equal(upstreamCalls, 2);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie") ?? "", /rotated-access-token/);
  assert.match(response.headers.get("set-cookie") ?? "", /rotated-refresh-token/);
});

test("logout revokes the Supabase session and clears both cookies", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/logout?scope=local`);
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer access-token");
      return new Response(null, { status: 204 });
    },
    () =>
      handleAuthRequest(
        new Request("https://peniel.test/api/auth/logout", {
          method: "POST",
          headers: {
            origin: "https://peniel.test",
            cookie: "peniel_access=access-token; peniel_refresh=refresh-token",
          },
        }),
        env,
      ),
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie")?.includes("Max-Age=0"), true);
  assert.deepEqual(await response.json(), {
    ok: true,
    data: { signedOut: true, providerSessionRevoked: true },
  });
});

test("Google OAuth starts PKCE and exchanges its callback code server-side", async () => {
  const startResponse = await handleAuthRequest(request("/api/auth/oauth/google", "GET"), env);
  assert.equal(startResponse.status, 302);

  const authorizeUrl = new URL(startResponse.headers.get("location") ?? "");
  assert.equal(authorizeUrl.origin, env.SUPABASE_URL);
  assert.equal(authorizeUrl.pathname, "/auth/v1/authorize");
  assert.equal(authorizeUrl.searchParams.get("provider"), "google");
  assert.equal(authorizeUrl.searchParams.get("code_challenge_method"), "s256");
  assert.match(authorizeUrl.searchParams.get("code_challenge") ?? "", /^[A-Za-z0-9_-]{43}$/);

  const verifier = startResponse.headers
    .get("set-cookie")
    ?.match(/peniel_oauth_verifier=([^;]+)/)?.[1];
  assert.ok(verifier);

  const callbackResponse = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/token?grant_type=pkce`);
      assert.deepEqual(JSON.parse(String(init?.body)), {
        auth_code: "authorization-code",
        code_verifier: verifier,
      });
      return Response.json({
        access_token: "oauth-access-token",
        refresh_token: "oauth-refresh-token",
        expires_in: 3600,
        user: { id: "oauth-user", email: "person@example.com" },
      });
    },
    () =>
      handleAuthRequest(
        new Request("https://peniel.test/api/auth/oauth/callback?code=authorization-code", {
          headers: { cookie: `peniel_oauth_verifier=${verifier}` },
        }),
        env,
      ),
  );

  assert.equal(callbackResponse.status, 302);
  const location = new URL(callbackResponse.headers.get("location") ?? "");
  assert.equal(location.origin, "https://peniel.test");
  assert.equal(location.pathname, "/auth/oauth/callback");
  assert.equal(location.searchParams.get("role"), "customer");
  const cookies = callbackResponse.headers.get("set-cookie") ?? "";
  assert.match(cookies, /peniel_access=oauth-access-token/);
  assert.match(cookies, /peniel_refresh=oauth-refresh-token/);
  assert.match(cookies, /peniel_oauth_verifier=;.*Max-Age=0/);
});

test("OAuth callback rejects a missing PKCE verifier without contacting Supabase", async () => {
  let upstreamCalled = false;
  const response = await withFetchMock(
    async () => {
      upstreamCalled = true;
      return Response.json({});
    },
    () =>
      handleAuthRequest(
        new Request("https://peniel.test/api/auth/oauth/callback?code=authorization-code"),
        env,
      ),
  );

  assert.equal(response.status, 400);
  assert.equal(upstreamCalled, false);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: "OAuth verification expired. Please try again.",
  });
  assert.match(response.headers.get("set-cookie") ?? "", /peniel_oauth_verifier=;.*Max-Age=0/);
});
