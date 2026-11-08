import assert from "node:assert/strict";
import test from "node:test";

import { handleCommerceRequest } from "./commerce.ts";

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

test("cross-origin commerce mutations are rejected before identity or database requests", async () => {
  let upstreamCalled = false;
  const response = await withFetchMock(
    async () => {
      upstreamCalled = true;
      return Response.json({});
    },
    () =>
      handleCommerceRequest(
        new Request("https://peniel.test/api/checkout", {
          method: "POST",
          headers: { origin: "https://attacker.test" },
        }),
        env,
      ),
  );

  assert.equal(response?.status, 403);
  assert.equal(upstreamCalled, false);
});

test("invalid product cookies cannot fall through to public anonymous catalog access", async () => {
  const response = await withFetchMock(
    async (input) => {
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/user`);
      return new Response(null, { status: 401 });
    },
    () =>
      handleCommerceRequest(
        new Request("https://peniel.test/api/products", {
          headers: { cookie: "peniel_access=invalid-token" },
        }),
        env,
      ),
  );

  assert.equal(response?.status, 401);
});

test("checkout refuses to create an order before payment configuration exists", async () => {
  const calls: string[] = [];
  const response = await withFetchMock(
    async (input) => {
      calls.push(String(input));
      assert.equal(String(input), `${env.SUPABASE_URL}/auth/v1/user`);
      return Response.json({ id: "customer-1", email: "customer@example.test" });
    },
    () =>
      handleCommerceRequest(
        new Request("https://peniel.test/api/checkout", {
          method: "POST",
          headers: {
            origin: "https://peniel.test",
            cookie: "peniel_access=valid-token",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            idempotencyKey: "checkout-key-123",
            items: [{ productId: "123e4567-e89b-12d3-a456-426614174000", quantity: 1 }],
            delivery: {
              fullName: "Test Customer",
              phone: "+2348000000000",
              address: "12 Example Road",
              city: "Lagos",
              state: "Lagos",
            },
          }),
        }),
        env,
      ),
  );

  assert.equal(response?.status, 503);
  assert.equal(calls.length, 1);
  assert.match(((await response?.json()) as { error: string }).error, /no order was placed/i);
});
