import assert from "node:assert/strict";
import test from "node:test";

import { handleAuthRequest } from "./auth.ts";

const env = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "test-publishable-key",
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
  const response = await withFetchMock(
    async (_input, init) => {
      const requestBody = JSON.parse(String(init?.body)) as {
        data?: { signup_intent?: string };
      };
      assert.equal(requestBody.data?.signup_intent, "customer");
      return Response.json({
        user: { id: "user-3", email: "person@example.com" },
      });
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

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    ok: true,
    data: {
      authenticated: false,
      needsOtp: true,
      user: { id: "user-3", email: "person@example.com", name: "" },
    },
  });
  assert.equal(response.headers.has("set-cookie"), false);
});

test("signup OTP verification sends the eight-digit code to Supabase", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/verify`);
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: "person@example.com",
        token: "01234567",
        type: "signup",
      });
      return Response.json({
        access_token: "verification-access-token",
        refresh_token: "verification-refresh-token",
        user: { id: "user-5", email: "person@example.com" },
      });
    },
    () =>
      handleAuthRequest(
        request("/api/auth/verify-otp", "POST", {
          email: "person@example.com",
          code: "01234567",
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
});

test("signup OTP resend asks Supabase to resend the signup confirmation", async () => {
  const response = await withFetchMock(
    async (input, init) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/resend`);
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: "person@example.com",
        type: "signup",
      });
      return Response.json({});
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
    data: { accepted: true },
  });
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