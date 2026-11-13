/**
 * WhatsApp Business Cloud API integration.
 * Defaults to disabled mode - no chargeable messages are sent without
 * explicit WHATSAPP_MODE=production configuration.
 */

export type WhatsAppEnv = {
  WHATSAPP_MODE?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  WHATSAPP_BUSINESS_ACCOUNT_ID?: string;
  WHATSAPP_WEBHOOK_VERIFY_TOKEN?: string;
  WHATSAPP_APP_SECRET?: string;
};

export type WhatsAppMode = "disabled" | "test" | "production";

export type OrderNotificationPayload = {
  vendorWhatsapp: string;
  orderReference: string;
  customerName: string;
  items: { name: string; quantity: number; unitPriceMinor: number }[];
  subtotalMinor: number;
  deliveryMinor: number;
  totalMinor: number;
  deliveryAddress: string;
  dashboardUrl: string;
};

export type MessageLog = {
  to: string;
  type: string;
  mode: WhatsAppMode;
  status: "queued" | "sent" | "failed" | "skipped";
  providerMessageId?: string;
  error?: string;
  timestamp: string;
};

function getMode(env: WhatsAppEnv): WhatsAppMode {
  const mode = (env.WHATSAPP_MODE ?? "disabled").toLowerCase();
  if (mode === "production") return "production";
  if (mode === "test") return "test";
  return "disabled";
}

function naira(minor: number): string {
  return "₦" + (minor / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

function buildOrderText(payload: OrderNotificationPayload): string {
  const itemLines = payload.items
    .map((i) => `• ${i.quantity}× ${i.name} — ${naira(i.unitPriceMinor * i.quantity)}`)
    .join("\n");
  return [
    `🛍️ *New Order — Peniel*`,
    ``,
    `Order: *${payload.orderReference}*`,
    `Customer: ${payload.customerName}`,
    ``,
    `*Items:*`,
    itemLines,
    ``,
    `Subtotal: ${naira(payload.subtotalMinor)}`,
    `Delivery: ${naira(payload.deliveryMinor)}`,
    `*Total: ${naira(payload.totalMinor)}*`,
    ``,
    `Delivery to: ${payload.deliveryAddress}`,
    ``,
    `Manage order: ${payload.dashboardUrl}`,
  ].join("\n");
}

async function sendTextMessage(
  env: WhatsAppEnv,
  to: string,
  text: string,
): Promise<{ messageId?: string; error?: string }> {
  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return { error: "WhatsApp credentials not configured." };

  const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text, preview_url: false },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { error: `WhatsApp API error ${response.status}: ${body.slice(0, 200)}` };
  }

  const result = (await response.json()) as { messages?: { id?: string }[] };
  const messageId = result.messages?.[0]?.id;
  if (messageId === undefined) return {};
  return { messageId };
}

export async function sendOrderNotification(
  env: WhatsAppEnv,
  payload: OrderNotificationPayload,
): Promise<MessageLog> {
  const mode = getMode(env);
  const timestamp = new Date().toISOString();

  if (mode === "disabled") {
    return {
      to: payload.vendorWhatsapp,
      type: "order_notification",
      mode,
      status: "skipped",
      timestamp,
    };
  }

  const text = buildOrderText(payload);

  if (mode === "test") {
    console.log("[WhatsApp TEST] Would send to", payload.vendorWhatsapp, "\n", text);
    return {
      to: payload.vendorWhatsapp,
      type: "order_notification",
      mode,
      status: "queued",
      timestamp,
    };
  }

  // production
  try {
    const result = await sendTextMessage(env, payload.vendorWhatsapp, text);
    if (result.error) {
      console.error("[WhatsApp] Order notification failed:", result.error);
      return {
        to: payload.vendorWhatsapp,
        type: "order_notification",
        mode,
        status: "failed",
        error: result.error,
        timestamp,
      };
    }
    if (result.messageId !== undefined) {
      return {
        to: payload.vendorWhatsapp,
        type: "order_notification",
        mode,
        status: "sent",
        providerMessageId: result.messageId,
        timestamp,
      };
    }
    return {
      to: payload.vendorWhatsapp,
      type: "order_notification",
      mode,
      status: "sent",
      timestamp,
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[WhatsApp] Order notification exception:", msg);
    // WhatsApp failure MUST NOT affect order/payment state
    return {
      to: payload.vendorWhatsapp,
      type: "order_notification",
      mode,
      status: "failed",
      error: msg,
      timestamp,
    };
  }
}

export async function sendPaymentConfirmation(
  env: WhatsAppEnv,
  to: string,
  orderReference: string,
  amountMinor: number,
  flutterwaveRef: string,
): Promise<MessageLog> {
  const mode = getMode(env);
  const timestamp = new Date().toISOString();

  if (mode === "disabled") {
    return { to, type: "payment_confirmation", mode, status: "skipped", timestamp };
  }

  const text = [
    `✅ *Payment Confirmed — Peniel*`,
    ``,
    `Order: *${orderReference}*`,
    `Amount: *${naira(amountMinor)}*`,
    `Reference: ${flutterwaveRef}`,
    ``,
    `Your payment has been verified and the order is confirmed.`,
  ].join("\n");

  if (mode === "test") {
    console.log("[WhatsApp TEST] Payment confirmation to", to, "\n", text);
    return { to, type: "payment_confirmation", mode, status: "queued", timestamp };
  }

  try {
    const result = await sendTextMessage(env, to, text);
    if (result.error) {
      return {
        to,
        type: "payment_confirmation",
        mode,
        status: "failed",
        error: result.error,
        timestamp,
      };
    }
    if (result.messageId !== undefined) {
      return {
        to,
        type: "payment_confirmation",
        mode,
        status: "sent",
        providerMessageId: result.messageId,
        timestamp,
      };
    }
    return { to, type: "payment_confirmation", mode, status: "sent", timestamp };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { to, type: "payment_confirmation", mode, status: "failed", error: msg, timestamp };
  }
}

/**
 * Verify an incoming WhatsApp webhook challenge.
 * Returns the hub.challenge value if valid, null otherwise.
 */
export function verifyWebhookChallenge(request: Request, env: WhatsAppEnv): string | null {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === env.WHATSAPP_WEBHOOK_VERIFY_TOKEN && challenge) {
    return challenge;
  }
  return null;
}
