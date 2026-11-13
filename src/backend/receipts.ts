/**
 * PDF receipt generation for Peniel orders.
 * Uses a minimal hand-built PDF structure — no external libraries, no paid services.
 * Compatible with the Cloudflare Workers runtime.
 */

export type ReceiptData = {
  receiptNumber: string;
  orderReference: string;
  flutterwaveRef: string;
  paymentDate: string;
  customerName: string;
  customerEmail: string;
  deliveryAddress: string;
  items: { name: string; quantity: number; unitPriceMinor: number; lineTotalMinor: number }[];
  subtotalMinor: number;
  deliveryMinor: number;
  discountMinor: number;
  platformFeeMinor: number;
  totalMinor: number;
  currency: string;
  vendorName: string;
};

function naira(minor: number): string {
  return "NGN " + (minor / 100).toFixed(2);
}

function escPdf(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

/**
 * Builds a minimal valid PDF/1.4 document as a Uint8Array.
 * Uses only standard PDF operators — no fonts embedded, uses Helvetica (built-in).
 */
export function buildReceiptPdf(data: ReceiptData): Uint8Array {
  const lines: string[] = [];

  // Header
  lines.push("PENIEL PAYMENT RECEIPT");
  lines.push("=".repeat(50));
  lines.push(`Receipt No: ${data.receiptNumber}`);
  lines.push(`Order Ref:  ${data.orderReference}`);
  lines.push(`FLW Ref:    ${data.flutterwaveRef}`);
  lines.push(`Date:       ${data.paymentDate}`);
  lines.push("");
  lines.push("CUSTOMER");
  lines.push(`Name:    ${data.customerName}`);
  lines.push(`Email:   ${data.customerEmail}`);
  lines.push(`Address: ${data.deliveryAddress}`);
  lines.push("");
  lines.push("VENDOR");
  lines.push(`Store: ${data.vendorName}`);
  lines.push("");
  lines.push("ITEMS");
  lines.push("-".repeat(50));
  for (const item of data.items) {
    const line =
      `${item.quantity}x ${item.name}`.padEnd(36) + naira(item.lineTotalMinor).padStart(14);
    lines.push(line);
    lines.push(`   @ ${naira(item.unitPriceMinor)} each`);
  }
  lines.push("-".repeat(50));
  lines.push(`${"Subtotal".padEnd(36)}${naira(data.subtotalMinor).padStart(14)}`);
  if (data.discountMinor > 0) {
    lines.push(`${"Discount".padEnd(36)}-${naira(data.discountMinor).padStart(13)}`);
  }
  lines.push(`${"Delivery".padEnd(36)}${naira(data.deliveryMinor).padStart(14)}`);
  lines.push(`${"Platform fee".padEnd(36)}${naira(data.platformFeeMinor).padStart(14)}`);
  lines.push("=".repeat(50));
  lines.push(`${"TOTAL".padEnd(36)}${naira(data.totalMinor).padStart(14)}`);
  lines.push("");
  lines.push("Payment verified by Flutterwave.");
  lines.push("This is an official Peniel receipt.");
  lines.push("peniel.com.ng");

  const textContent = lines.join("\n");

  // Build minimal PDF
  const objects: string[] = [];
  const offsets: number[] = [];
  let pos = 0;

  const enc = new TextEncoder();

  function addObj(content: string): number {
    const n = objects.length + 1;
    offsets.push(pos);
    const obj = `${n} 0 obj\n${content}\nendobj\n`;
    objects.push(obj);
    pos += enc.encode(obj).length;
    return n;
  }

  const header = "%PDF-1.4\n";
  pos = enc.encode(header).length;

  // Font
  const fontN = addObj(`<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>`);

  // Page content stream
  const escapedLines = lines.map((l) => escPdf(l));
  let streamContent = "BT\n/F1 9 Tf\n50 780 Td\n12 TL\n";
  for (const l of escapedLines) {
    streamContent += `(${l}) Tj T*\n`;
  }
  streamContent += "ET\n";
  const streamBytes = enc.encode(streamContent).length;
  const streamN = addObj(`<< /Length ${streamBytes} >>\nstream\n${streamContent}endstream`);

  // Page
  const pageN = addObj(
    `<< /Type /Page /Parent 4 0 R /MediaBox [0 0 595 842] /Contents ${streamN} 0 R /Resources << /Font << /F1 ${fontN} 0 R >> >> >>`,
  );

  // Pages (placeholder — will be obj 4)
  const pagesN = addObj(`<< /Type /Pages /Kids [${pageN} 0 R] /Count 1 >>`);

  // Catalog
  const catalogN = addObj(`<< /Type /Catalog /Pages ${pagesN} 0 R >>`);

  // Cross-reference table
  const xrefOffset = pos;
  const xrefLines = [`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`];
  for (const off of offsets) {
    xrefLines.push(String(off).padStart(10, "0") + " 00000 n \n");
  }
  const xref = xrefLines.join("");
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root ${catalogN} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  // Assemble
  const parts = [header, ...objects, xref, trailer];
  const totalBytes = parts.reduce((s, part) => s + enc.encode(part).length, 0);
  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const part of parts) {
    const bytes = enc.encode(part);
    result.set(bytes, offset);
    offset += bytes.length;
  }
  return result;
}

/**
 * Generate a receipt number from order reference and timestamp.
 */
export function generateReceiptNumber(orderReference: string): string {
  const suffix = Date.now().toString(36).toUpperCase().slice(-6);
  return `RCP-${orderReference
    .replace(/[^A-Z0-9]/gi, "")
    .slice(0, 8)
    .toUpperCase()}-${suffix}`;
}

/**
 * Worker handler: GET /api/receipts/:orderReference
 * Returns the PDF receipt for a verified, paid order.
 */
import { getRequestIdentity } from "./auth.ts";
import { json } from "./http.ts";
import type { BackendEnv } from "./auth.ts";

async function db(env: BackendEnv, path: string, token: string): Promise<Response> {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase not configured.");
  return fetch(`${url}/rest/v1/${path}`, {
    headers: { apikey: key, authorization: `Bearer ${token}` },
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

export async function handleReceiptsRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  const match = pathname.match(/^\/api\/receipts\/([A-Z0-9-]{4,80})$/i);
  if (!match || request.method !== "GET") return null;

  try {
    const identity = await getRequestIdentity(request, env);
    if (!identity) return json({ ok: false, error: "Authentication required." }, 401);

    const orderRef = match[1]!.toUpperCase();

    // Fetch order + payment + items — customer must own the order
    const q = new URLSearchParams({
      select:
        "id,reference,status,subtotal_minor,delivery_minor,discount_minor,platform_fee_minor,total_minor,customer_snapshot,delivery_snapshot,created_at,vendor_orders(vendor_id,subtotal_minor,order_items(product_snapshot,quantity,unit_price_minor,line_total_minor),vendors(name)),payments(reference,provider_transaction_id,verified_at,status)",
      reference: `eq.${orderRef}`,
      customer_id: `eq.${identity.id}`,
      limit: "1",
    });

    const r = await db(env, `orders?${q}`, identity.accessToken);
    const result = await p(r);
    if (!r.ok) return json({ ok: false, error: "Could not retrieve order." }, 502);

    const orders = Array.isArray(result) ? (result as Record<string, unknown>[]) : [];
    const order = orders[0];
    if (!order) return json({ ok: false, error: "Order not found." }, 404);

    // Only generate receipt for paid orders
    const status = String(order["status"] ?? "");
    if (
      ![
        "paid",
        "confirmed",
        "preparing",
        "ready_for_pickup",
        "shipped",
        "out_for_delivery",
        "delivered",
        "completed",
      ].includes(status)
    ) {
      return json({ ok: false, error: "Receipt is only available for paid orders." }, 409);
    }

    const payments = Array.isArray(order["payments"])
      ? (order["payments"] as Record<string, unknown>[])
      : [];
    const payment = payments.find((p) => p["status"] === "successful") ?? payments[0];
    const flutterwaveRef = payment
      ? String(payment["provider_transaction_id"] ?? payment["reference"] ?? "")
      : "";

    const customerSnapshot = (order["customer_snapshot"] ?? {}) as Record<string, unknown>;
    const deliverySnapshot = (order["delivery_snapshot"] ?? {}) as Record<string, unknown>;

    const vendorOrders = Array.isArray(order["vendor_orders"])
      ? (order["vendor_orders"] as Record<string, unknown>[])
      : [];
    const vendorName =
      vendorOrders
        .map((vo) => {
          const v = vo["vendors"] as Record<string, unknown> | undefined;
          return typeof v?.["name"] === "string" ? v["name"] : "";
        })
        .filter(Boolean)
        .join(", ") || "Peniel Vendor";

    const allItems: ReceiptData["items"] = [];
    for (const vo of vendorOrders) {
      const items = Array.isArray(vo["order_items"])
        ? (vo["order_items"] as Record<string, unknown>[])
        : [];
      for (const item of items) {
        const snap = (item["product_snapshot"] ?? {}) as Record<string, unknown>;
        allItems.push({
          name: String(snap["name"] ?? "Item"),
          quantity: Number(item["quantity"] ?? 1),
          unitPriceMinor: Number(item["unit_price_minor"] ?? 0),
          lineTotalMinor: Number(item["line_total_minor"] ?? 0),
        });
      }
    }

    const receiptData: ReceiptData = {
      receiptNumber: generateReceiptNumber(orderRef),
      orderReference: orderRef,
      flutterwaveRef,
      paymentDate: payment
        ? String(payment["verified_at"] ?? order["created_at"] ?? "")
        : String(order["created_at"] ?? ""),
      customerName: String(
        customerSnapshot["name"] ?? deliverySnapshot["fullName"] ?? identity.email,
      ),
      customerEmail: identity.email,
      deliveryAddress: [
        deliverySnapshot["address"],
        deliverySnapshot["city"],
        deliverySnapshot["state"],
      ]
        .filter(Boolean)
        .join(", "),
      items: allItems,
      subtotalMinor: Number(order["subtotal_minor"] ?? 0),
      deliveryMinor: Number(order["delivery_minor"] ?? 0),
      discountMinor: Number(order["discount_minor"] ?? 0),
      platformFeeMinor: Number(order["platform_fee_minor"] ?? 0),
      totalMinor: Number(order["total_minor"] ?? 0),
      currency: "NGN",
      vendorName,
    };

    const pdfBytes = buildReceiptPdf(receiptData);
    const responseBody = Uint8Array.from(pdfBytes).buffer;
    return new Response(responseBody, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="peniel-receipt-${orderRef}.pdf"`,
        "cache-control": "private, max-age=3600",
        "content-length": String(pdfBytes.length),
      },
    });
  } catch (error) {
    console.error("Receipt generation error", error);
    return json({ ok: false, error: "Could not generate receipt." }, 500);
  }
}
