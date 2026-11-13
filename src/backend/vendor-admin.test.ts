import assert from "node:assert/strict";
import test from "node:test";

import { handleVendorRequest } from "./vendor.ts";
import { handleAdminRequest } from "./admin.ts";
import { handleMessagingRequest } from "./messaging.ts";
import { handleStorageRequest } from "./storage.ts";
import {
  sendOrderNotification,
  sendPaymentConfirmation,
  verifyWebhookChallenge,
} from "./whatsapp.ts";

const env = {
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "test-service-key",
};

async function withFetchMock<T>(mock: typeof fetch, run: () => Promise<T>): Promise<T> {
  const original = globalThis.fetch;
  globalThis.fetch = mock;
  try {
    return await run();
  } finally {
    globalThis.fetch = original;
  }
}

function authedRequest(path: string, method = "GET", body?: unknown) {
  return new Request(`https://peniel.test${path}`, {
    method,
    headers: {
      origin: "https://peniel.test",
      cookie: "peniel_access=valid-token",
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

// ── Vendor API ────────────────────────────────────────────────────────────────

test("vendor orders endpoint requires authentication", async () => {
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user")) return new Response(null, { status: 401 });
      return Response.json([]);
    },
    () =>
      handleVendorRequest(
        new Request(
          "https://peniel.test/api/vendor/orders?vendor_id=123e4567-e89b-12d3-a456-426614174000",
          {
            headers: { cookie: "peniel_access=bad-token" },
          },
        ),
        env,
      ),
  );
  assert.equal(response?.status, 401);
});

test("vendor orders endpoint rejects invalid vendor_id", async () => {
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([]);
    },
    () => handleVendorRequest(authedRequest("/api/vendor/orders?vendor_id=not-a-uuid"), env),
  );
  assert.equal(response?.status, 400);
});

test("vendor analytics returns aggregated data from ledger and orders", async () => {
  const vendorId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      if (url.includes("vendor_orders"))
        return Response.json([
          {
            status: "completed",
            subtotal_minor: 500000,
            vendor_net_minor: 490000,
            created_at: new Date().toISOString(),
          },
          {
            status: "paid",
            subtotal_minor: 200000,
            vendor_net_minor: 196000,
            created_at: new Date().toISOString(),
          },
        ]);
      if (url.includes("ledger_entries"))
        return Response.json([
          { entry_type: "sale", amount_minor: 500000, created_at: new Date().toISOString() },
          { entry_type: "commission", amount_minor: -10000, created_at: new Date().toISOString() },
        ]);
      return Response.json([]);
    },
    () => handleVendorRequest(authedRequest(`/api/vendor/analytics?vendor_id=${vendorId}`), env),
  );
  assert.equal(response?.status, 200);
  const body = (await response?.json()) as {
    ok: boolean;
    data: { totalRevenue: number; pendingOrders: number };
  };
  assert.equal(body.ok, true);
  assert.equal(body.data.totalRevenue, 500000);
  assert.equal(body.data.pendingOrders, 1);
});

test("vendor order status update rejects invalid status values", async () => {
  const orderId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([]);
    },
    () =>
      handleVendorRequest(
        authedRequest(`/api/vendor/orders/${orderId}/status`, "PATCH", { status: "paid" }),
        env,
      ),
  );
  assert.equal(response?.status, 400);
});

test("vendor order status update accepts valid status", async () => {
  const orderId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([{ id: orderId, status: "confirmed" }]);
    },
    () =>
      handleVendorRequest(
        authedRequest(`/api/vendor/orders/${orderId}/status`, "PATCH", { status: "confirmed" }),
        env,
      ),
  );
  assert.equal(response?.status, 200);
});

test("cross-origin vendor mutations are rejected", async () => {
  const response = await handleVendorRequest(
    new Request(
      "https://peniel.test/api/vendor/storefront?vendor_id=123e4567-e89b-12d3-a456-426614174000",
      {
        method: "PATCH",
        headers: { origin: "https://attacker.test", "content-type": "application/json" },
        body: JSON.stringify({ publish: true }),
      },
    ),
    env,
  );
  assert.equal(response?.status, 403);
});

// ── Admin API ─────────────────────────────────────────────────────────────────

test("admin endpoints reject non-admin users", async () => {
  const response = await withFetchMock(
    async (input) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "c@test.com" });
      if (url.includes("rpc/is_admin")) return Response.json(false);
      return Response.json([]);
    },
    () => handleAdminRequest(authedRequest("/api/admin/vendors"), env),
  );
  assert.equal(response?.status, 403);
});

test("admin vendor list returns data for admin users", async () => {
  const response = await withFetchMock(
    async (input) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "admin-1", email: "admin@test.com" });
      if (url.includes("rpc/is_admin")) return Response.json(true);
      if (url.includes("vendors"))
        return Response.json([{ id: "v-1", name: "Test Vendor", status: "active" }]);
      return Response.json([]);
    },
    () => handleAdminRequest(authedRequest("/api/admin/vendors"), env),
  );
  assert.equal(response?.status, 200);
  const body = (await response?.json()) as { ok: boolean; data: unknown[] };
  assert.equal(body.ok, true);
  assert.equal(Array.isArray(body.data), true);
});

test("admin vendor status update requires valid status", async () => {
  const vendorId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "admin-1", email: "admin@test.com" });
      if (url.includes("rpc/is_admin")) return Response.json(true);
      return Response.json([]);
    },
    () =>
      handleAdminRequest(
        authedRequest(`/api/admin/vendors/${vendorId}/status`, "PATCH", { status: "hacked" }),
        env,
      ),
  );
  assert.equal(response?.status, 400);
});

test("admin verification review rejects invalid decision", async () => {
  const appId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "admin-1", email: "admin@test.com" });
      if (url.includes("rpc/is_admin")) return Response.json(true);
      return Response.json([]);
    },
    () =>
      handleAdminRequest(
        authedRequest(`/api/admin/verification/${appId}`, "PATCH", { decision: "maybe" }),
        env,
      ),
  );
  assert.equal(response?.status, 400);
});

// ── Messaging API ─────────────────────────────────────────────────────────────

test("messaging requires authentication", async () => {
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user")) return new Response(null, { status: 401 });
      return Response.json([]);
    },
    () =>
      handleMessagingRequest(
        new Request("https://peniel.test/api/messages/conversations", {
          headers: { cookie: "peniel_access=bad-token" },
        }),
        env,
      ),
  );
  assert.equal(response?.status, 401);
});

test("send message applies chat guard and blocks contact info", async () => {
  const convId = "123e4567-e89b-12d3-a456-426614174000";
  let insertedBody = "";
  const response = await withFetchMock(
    async (input, init) => {
      const url = String(input);
      if (url.includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "c@test.com" });
      if (url.includes("messages") && init?.method === "POST") {
        const body = JSON.parse(String(init.body)) as { body: string };
        insertedBody = body.body;
        return Response.json([{ id: "msg-1", body: body.body, sender_id: "user-1" }]);
      }
      return Response.json([]);
    },
    () =>
      handleMessagingRequest(
        authedRequest(`/api/messages/conversations/${convId}/messages`, "POST", {
          body: "Call me on 08012345678 to discuss",
        }),
        env,
      ),
  );
  assert.equal(response?.status, 201);
  assert.equal(insertedBody.includes("08012345678"), false);
  assert.match(insertedBody, /hidden/);
});

test("send message blocks empty body", async () => {
  const convId = "123e4567-e89b-12d3-a456-426614174000";
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "c@test.com" });
      return Response.json([]);
    },
    () =>
      handleMessagingRequest(
        authedRequest(`/api/messages/conversations/${convId}/messages`, "POST", { body: "   " }),
        env,
      ),
  );
  assert.equal(response?.status, 400);
});

// ── Storage API ───────────────────────────────────────────────────────────────

test("storage upload URL requires R2 configuration", async () => {
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([]);
    },
    () =>
      handleStorageRequest(
        authedRequest("/api/storage/upload-url", "POST", {
          purpose: "product-image",
          contentType: "image/jpeg",
          filename: "photo.jpg",
        }),
        env, // no R2 config
      ),
  );
  assert.equal(response?.status, 503);
});

test("storage upload URL rejects disallowed content types", async () => {
  const r2Env = {
    ...env,
    R2_ACCOUNT_ID: "acc",
    R2_BUCKET_PUBLIC: "pub",
    R2_ACCESS_KEY_ID: "key",
    R2_SECRET_ACCESS_KEY: "secret",
  };
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([]);
    },
    () =>
      handleStorageRequest(
        authedRequest("/api/storage/upload-url", "POST", {
          purpose: "product-image",
          contentType: "application/javascript",
          filename: "evil.js",
        }),
        r2Env,
      ),
  );
  assert.equal(response?.status, 400);
});

test("storage upload URL rejects invalid purpose", async () => {
  const r2Env = {
    ...env,
    R2_ACCOUNT_ID: "acc",
    R2_BUCKET_PUBLIC: "pub",
    R2_ACCESS_KEY_ID: "key",
    R2_SECRET_ACCESS_KEY: "secret",
  };
  const response = await withFetchMock(
    async (input) => {
      if (String(input).includes("/auth/v1/user"))
        return Response.json({ id: "user-1", email: "v@test.com" });
      return Response.json([]);
    },
    () =>
      handleStorageRequest(
        authedRequest("/api/storage/upload-url", "POST", {
          purpose: "admin-override",
          contentType: "image/jpeg",
          filename: "photo.jpg",
        }),
        r2Env,
      ),
  );
  assert.equal(response?.status, 400);
});

// ── WhatsApp service ──────────────────────────────────────────────────────────

test("WhatsApp order notification is skipped when mode is disabled", async () => {
  const log = await sendOrderNotification(
    { WHATSAPP_MODE: "disabled" },
    {
      vendorWhatsapp: "+2348012345678",
      orderReference: "PNL-TEST001",
      customerName: "Test Customer",
      items: [{ name: "Jollof Rice", quantity: 2, unitPriceMinor: 450000 }],
      subtotalMinor: 900000,
      deliveryMinor: 150000,
      totalMinor: 1050000,
      deliveryAddress: "12 Test Street, Lagos",
      dashboardUrl: "https://peniel.test/vendor/orders",
    },
  );
  assert.equal(log.status, "skipped");
  assert.equal(log.mode, "disabled");
});

test("WhatsApp order notification logs in test mode without calling API", async () => {
  let apiCalled = false;
  const log = await withFetchMock(
    async () => {
      apiCalled = true;
      return Response.json({});
    },
    () =>
      sendOrderNotification(
        { WHATSAPP_MODE: "test" },
        {
          vendorWhatsapp: "+2348012345678",
          orderReference: "PNL-TEST002",
          customerName: "Test Customer",
          items: [{ name: "Suya", quantity: 1, unitPriceMinor: 400000 }],
          subtotalMinor: 400000,
          deliveryMinor: 150000,
          totalMinor: 550000,
          deliveryAddress: "VI, Lagos",
          dashboardUrl: "https://peniel.test/vendor/orders",
        },
      ),
  );
  assert.equal(log.status, "queued");
  assert.equal(log.mode, "test");
  assert.equal(apiCalled, false);
});

test("WhatsApp failure does not throw - returns failed log entry", async () => {
  const log = await withFetchMock(
    async () => new Response("API error", { status: 500 }),
    () =>
      sendOrderNotification(
        {
          WHATSAPP_MODE: "production",
          WHATSAPP_ACCESS_TOKEN: "token",
          WHATSAPP_PHONE_NUMBER_ID: "phone-id",
        },
        {
          vendorWhatsapp: "+2348012345678",
          orderReference: "PNL-FAIL001",
          customerName: "Test",
          items: [],
          subtotalMinor: 0,
          deliveryMinor: 0,
          totalMinor: 0,
          deliveryAddress: "Lagos",
          dashboardUrl: "https://peniel.test",
        },
      ),
  );
  assert.equal(log.status, "failed");
  assert.equal(typeof log.error, "string");
});

test("WhatsApp payment confirmation is skipped when disabled", async () => {
  const log = await sendPaymentConfirmation(
    { WHATSAPP_MODE: "disabled" },
    "+2348012345678",
    "PNL-TEST003",
    1050000,
    "FLW-REF-12345",
  );
  assert.equal(log.status, "skipped");
});

test("WhatsApp webhook challenge verification succeeds with correct token", () => {
  const env = { WHATSAPP_WEBHOOK_VERIFY_TOKEN: "my-secret-token" };
  const request = new Request(
    "https://peniel.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=my-secret-token&hub.challenge=challenge-value",
  );
  const challenge = verifyWebhookChallenge(request, env);
  assert.equal(challenge, "challenge-value");
});

test("WhatsApp webhook challenge verification fails with wrong token", () => {
  const env = { WHATSAPP_WEBHOOK_VERIFY_TOKEN: "my-secret-token" };
  const request = new Request(
    "https://peniel.test/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=challenge-value",
  );
  const challenge = verifyWebhookChallenge(request, env);
  assert.equal(challenge, null);
});
