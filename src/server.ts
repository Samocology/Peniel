import "./lib/error-capture";

import { handleAuthRequest, type BackendEnv } from "./backend/auth";
import { handleCommerceRequest } from "./backend/commerce";
import { handleVendorRequest } from "./backend/vendor";
import { handleAdminRequest } from "./backend/admin";
import { handleMessagingRequest } from "./backend/messaging";
import { handleStorageRequest } from "./backend/storage";
import { handleBookingsRequest } from "./backend/bookings";
import { handlePayoutsRequest } from "./backend/payouts";
import { handlePromosRequest } from "./backend/promos";
import { handleNotificationsRequest } from "./backend/notifications";
import { handleReceiptsRequest } from "./backend/receipts";
import { verifyWebhookChallenge } from "./backend/whatsapp";
import { json } from "./backend/http";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (module) => (module.default ?? module) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function handleApiRequest(request: Request, env: BackendEnv): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/")) return null;

  if (pathname === "/api/health" && request.method === "GET") {
    return json({
      ok: true,
      service: "peniel-worker",
      authenticationConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
    });
  }

  if (pathname.startsWith("/api/auth/")) return handleAuthRequest(request, env);

  // WhatsApp webhook challenge (GET, no auth required)
  if (pathname === "/api/webhooks/whatsapp" && request.method === "GET") {
    const challenge = verifyWebhookChallenge(request, env as BackendEnv & { WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string });
    if (challenge) return new Response(challenge, { status: 200 });
    return json({ ok: false, error: "Webhook verification failed." }, 403);
  }

  const bookingsResponse = await handleBookingsRequest(request, env as BackendEnv);
  if (bookingsResponse) return bookingsResponse;

  const payoutsResponse = await handlePayoutsRequest(request, env as BackendEnv);
  if (payoutsResponse) return payoutsResponse;

  const promosResponse = await handlePromosRequest(request, env as BackendEnv);
  if (promosResponse) return promosResponse;

  const notificationsResponse = await handleNotificationsRequest(request, env as BackendEnv);
  if (notificationsResponse) return notificationsResponse;

  const receiptsResponse = await handleReceiptsRequest(request, env as BackendEnv);
  if (receiptsResponse) return receiptsResponse;

  const vendorResponse = await handleVendorRequest(request, env as BackendEnv);
  if (vendorResponse) return vendorResponse;

  const adminResponse = await handleAdminRequest(request, env as BackendEnv);
  if (adminResponse) return adminResponse;

  const messagingResponse = await handleMessagingRequest(request, env as BackendEnv);
  if (messagingResponse) return messagingResponse;

  const storageResponse = await handleStorageRequest(request, env as BackendEnv & { R2_ACCOUNT_ID?: string; R2_BUCKET_PUBLIC?: string; R2_BUCKET_PRIVATE?: string; R2_ACCESS_KEY_ID?: string; R2_SECRET_ACCESS_KEY?: string; R2_PUBLIC_MEDIA_URL?: string });
  if (storageResponse) return storageResponse;

  return handleCommerceRequest(request, env as BackendEnv);
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRequest(request, env as BackendEnv);
      if (apiResponse) return apiResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      if (new URL(request.url).pathname.startsWith("/api/")) {
        return json({ ok: false, error: "The service is temporarily unavailable." }, 500);
      }
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
