import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";

type Identity = NonNullable<Awaited<ReturnType<typeof getRequestIdentity>>>;

const MAX_PRODUCT_PRICE_MINOR = 10_000_000_000;

function supabaseConfig(env: BackendEnv) {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

function serviceConfig(env: BackendEnv) {
  const config = supabaseConfig(env);
  return config && env.SUPABASE_SERVICE_ROLE_KEY
    ? { ...config, key: env.SUPABASE_SERVICE_ROLE_KEY }
    : null;
}

async function databaseRequest(
  env: BackendEnv,
  path: string,
  token: string,
  init: RequestInit = {},
  serviceRole = false,
) {
  const config = supabaseConfig(env);
  if (!config) throw new Error("Supabase database API is not configured.");
  const key = serviceRole ? serviceConfig(env)?.key : config.key;
  if (!key) throw new Error("Supabase service role is not configured for this operation.");

  return fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      authorization: `Bearer ${serviceRole ? key : token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function databasePayload(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function errorFromDatabase(status: number, payload: unknown) {
  const code =
    payload !== null && typeof payload === "object" && "code" in payload
      ? String(payload.code)
      : "";
  const message =
    payload !== null && typeof payload === "object" && "message" in payload
      ? String(payload.message)
      : "";
  if (status === 401) return json({ ok: false, error: "Please sign in to continue." }, 401);
  if (status === 403 || code === "42501")
    return json({ ok: false, error: "You do not have permission to perform this action." }, 403);
  if (status === 404 || code === "P0002")
    return json({ ok: false, error: "The requested record was not found or is unavailable." }, 404);
  if (status === 409 || code === "23505")
    return json({ ok: false, error: "This request conflicts with an existing record." }, 409);
  if (code === "23514" || code === "22023")
    return json({ ok: false, error: "The supplied data is invalid or unavailable." }, 400);
  console.error("Supabase data operation failed", { status, code, message });
  return json({ ok: false, error: "The data service is temporarily unavailable." }, 502);
}

async function requireIdentity(request: Request, env: BackendEnv) {
  try {
    const identity = await getRequestIdentity(request, env);
    if (!identity) return { response: json({ ok: false, error: "Authentication required." }, 401) };
    return { identity };
  } catch (error) {
    console.error("Could not validate request identity", error);
    return { response: json({ ok: false, error: "Authentication service is unavailable." }, 502) };
  }
}

function moneyToMinor(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const input = String(value).trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(input)) return null;
  const [whole = "0", fraction = ""] = input.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount >= 0 && amount <= MAX_PRODUCT_PRICE_MINOR
    ? amount
    : null;
}

function normalizeProductInput(input: Record<string, unknown>, vendorId: string) {
  const name = typeof input["name"] === "string" ? input["name"].trim() : "";
  const description = typeof input["description"] === "string" ? input["description"].trim() : "";
  const groupName = typeof input["group"] === "string" ? input["group"].trim() : "General";
  const priceMinor = moneyToMinor(input["price"]);
  const stock = input["stockQuantity"];

  if (!name || name.length > 160 || description.length > 4000 || groupName.length > 80) {
    return { error: "Enter a product name, valid description and category." } as const;
  }
  if (priceMinor === null || priceMinor <= 0) {
    return { error: "Enter a valid product price greater than zero." } as const;
  }
  if (
    stock !== undefined &&
    stock !== null &&
    (!Number.isInteger(stock) || Number(stock) < 0 || Number(stock) > 2_000_000_000)
  ) {
    return { error: "Stock quantity must be a non-negative whole number." } as const;
  }

  return {
    value: {
      vendor_id: vendorId,
      name,
      description,
      group_name: groupName || "General",
      price_minor: priceMinor,
      stock_quantity: stock === undefined ? null : stock,
      published: input["published"] === true,
      attributes:
        input["attributes"] !== null &&
        typeof input["attributes"] === "object" &&
        !Array.isArray(input["attributes"])
          ? input["attributes"]
          : {},
    },
  } as const;
}

async function getPublicVendors(request: Request, env: BackendEnv) {
  const config = supabaseConfig(env);
  if (!config) return json({ ok: false, error: "Marketplace data is not configured." }, 503);
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug")?.trim().toLowerCase();
  const select =
    "id,slug,name,description,business_type,location,phone,fulfilment,categories(slug,name),storefronts(template_id,layout,theme,logo_object_key,cover_object_key),products(id,name,description,group_name,price_minor,currency,attributes)";
  const queryParams = new URLSearchParams({
    select,
    status: "eq.active",
    order: "created_at.desc",
    limit: slug ? "1" : "50",
  });
  if (slug) queryParams.set("slug", `eq.${slug}`);
  const response = await fetch(`${config.url}/rest/v1/vendors?${queryParams}`, {
    headers: { apikey: config.key, authorization: `Bearer ${config.key}` },
  });
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);

  const query = url.searchParams.get("q")?.trim().toLowerCase();
  const location = url.searchParams.get("location")?.trim().toLowerCase();
  const vendors = Array.isArray(payload) ? payload : [];
  const filtered = vendors.filter((item) => {
    if (item === null || typeof item !== "object") return false;
    const vendor = item as Record<string, unknown>;
    const text = [vendor["name"], vendor["description"], vendor["business_type"]]
      .filter((part): part is string => typeof part === "string")
      .join(" ")
      .toLowerCase();
    return (
      (!slug || vendor["slug"] === slug) &&
      (!query || text.includes(query)) &&
      (!location ||
        (typeof vendor["location"] === "string" &&
          vendor["location"].toLowerCase().includes(location)))
    );
  });
  return json({ ok: true, data: filtered });
}

async function getOwnedVendors(env: BackendEnv, identity: Identity) {
  const query = new URLSearchParams({
    select:
      "id,slug,name,description,business_type,location,phone,fulfilment,status,categories(slug,name)",
    owner_id: `eq.${identity.id}`,
    order: "created_at.desc",
    limit: "50",
  });
  const response = await databaseRequest(env, `vendors?${query}`, identity.accessToken);
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload });
}

async function createVendor(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 32_000);
  if (!input) return json({ ok: false, error: "A valid JSON request is required." }, 400);
  const name = typeof input["name"] === "string" ? input["name"].trim() : "";
  const slug = typeof input["slug"] === "string" ? input["slug"].trim().toLowerCase() : "";
  const category = typeof input["categorySlug"] === "string" ? input["categorySlug"].trim() : "";
  const businessType =
    typeof input["businessType"] === "string" ? input["businessType"].trim() : "";
  const fulfilment = input["fulfilment"];
  if (
    !name ||
    name.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
    slug.length > 80 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category) ||
    !businessType ||
    businessType.length > 80 ||
    (fulfilment !== "order" && fulfilment !== "booking" && fulfilment !== "reservation")
  ) {
    return json(
      { ok: false, error: "Business name, unique URL, category and business type are required." },
      400,
    );
  }

  const response = await databaseRequest(env, "rpc/create_vendor", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({
      p_name: name,
      p_slug: slug,
      p_description: typeof input["description"] === "string" ? input["description"] : "",
      p_business_type: businessType,
      p_category_slug: category,
      p_location: typeof input["location"] === "string" ? input["location"] : "",
      p_address: typeof input["address"] === "string" ? input["address"] : "",
      p_fulfilment: fulfilment,
      p_template_id: typeof input["templateId"] === "string" ? input["templateId"] : "cinematic",
      p_layout: typeof input["layout"] === "string" ? input["layout"] : "grid",
    }),
  });
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: { vendorId: payload, status: "pending_review" } }, 201);
}

async function getVendorProducts(request: Request, env: BackendEnv, identity?: Identity) {
  const config = supabaseConfig(env);
  if (!config) return json({ ok: false, error: "Catalog data is not configured." }, 503);
  const url = new URL(request.url);
  const vendorId = url.searchParams.get("vendor_id");
  if (!vendorId || !/^[0-9a-f-]{36}$/i.test(vendorId)) {
    return json({ ok: false, error: "A valid vendor_id is required." }, 400);
  }
  const query = new URLSearchParams({
    select:
      "id,vendor_id,name,description,group_name,price_minor,currency,stock_quantity,published,attributes,created_at",
    vendor_id: `eq.${vendorId}`,
    archived_at: "is.null",
    order: "created_at.desc",
    limit: "100",
  });
  if (!identity) query.set("published", "eq.true");
  const response = await fetch(`${config.url}/rest/v1/products?${query}`, {
    headers: {
      apikey: config.key,
      authorization: `Bearer ${identity?.accessToken ?? config.key}`,
    },
  });
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload });
}

async function createProduct(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request, 40_000);
  if (!input) return json({ ok: false, error: "A valid JSON request is required." }, 400);
  const vendorId = typeof input["vendorId"] === "string" ? input["vendorId"] : "";
  if (!/^[0-9a-f-]{36}$/i.test(vendorId)) {
    return json({ ok: false, error: "A valid vendorId is required." }, 400);
  }
  const normalized = normalizeProductInput(input, vendorId);
  if ("error" in normalized) return json({ ok: false, error: normalized.error }, 400);
  const response = await databaseRequest(
    env,
    "products?select=id,vendor_id,name,description,group_name,price_minor,stock_quantity,published",
    identity.accessToken,
    {
      method: "POST",
      headers: { prefer: "return=representation" },
      body: JSON.stringify(normalized.value),
    },
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload }, 201);
}

function parseFlutterwaveAmount(amountMinor: number) {
  return (amountMinor / 100).toFixed(2);
}

async function initializeFlutterwave(
  env: BackendEnv,
  identity: Identity,
  order: { order_id: string; reference: string; amount_minor: number },
  email: string,
  idempotencyKey: string,
) {
  const secret = env.FLUTTERWAVE_SECRET_KEY;
  const appUrl = env.APP_BASE_URL;
  if (!secret || !appUrl) {
    return json(
      { ok: false, error: "Payments are not configured. Your cart has not been charged." },
      503,
    );
  }
  const paymentKey = `payment:${idempotencyKey}`;
  const paymentInit = await databaseRequest(
    env,
    "rpc/initialize_flutterwave_payment",
    identity.accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        p_order_id: order.order_id,
        p_idempotency_key: paymentKey,
        p_reference: order.reference,
      }),
    },
  );
  const payment = await databasePayload(paymentInit);
  if (!paymentInit.ok || payment === null || typeof payment !== "object") {
    return errorFromDatabase(paymentInit.status, payment);
  }
  const paymentData = payment as {
    reference?: unknown;
    amount_minor?: unknown;
    checkout_url?: unknown;
  };
  if (typeof paymentData.reference !== "string" || typeof paymentData.amount_minor !== "number") {
    return json({ ok: false, error: "Could not prepare a secure payment." }, 502);
  }

  if (typeof paymentData.checkout_url === "string") {
    return json({
      ok: true,
      data: {
        orderId: order.order_id,
        reference: paymentData.reference,
        paymentUrl: paymentData.checkout_url,
      },
    });
  }

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: paymentData.reference,
      amount: parseFlutterwaveAmount(paymentData.amount_minor),
      currency: "NGN",
      redirect_url: `${appUrl.replace(/\/+$/, "")}/payment`,
      customer: { email },
      customizations: { title: "Peniel checkout", description: `Order ${paymentData.reference}` },
    }),
  });
  const flutterwaveResult = (await databasePayload(response)) as {
    status?: string;
    message?: string;
    data?: { link?: string };
  } | null;
  const link = flutterwaveResult?.data?.link;
  if (!response.ok || flutterwaveResult?.status !== "success" || typeof link !== "string") {
    console.error("Flutterwave payment initialization failed", {
      status: response.status,
      message: flutterwaveResult?.message,
    });
    return json({ ok: false, error: "Could not initialize payment. Please retry checkout." }, 502);
  }

  const persistUrl = await databaseRequest(
    env,
    "rpc/set_flutterwave_checkout_url",
    identity.accessToken,
    {
      method: "POST",
      body: JSON.stringify({ p_reference: paymentData.reference, p_checkout_url: link }),
    },
  );
  if (!persistUrl.ok) {
    const payload = await databasePayload(persistUrl);
    console.error("Could not persist Flutterwave checkout URL", persistUrl.status, payload);
    return json(
      {
        ok: false,
        error:
          "Payment was initialized but could not be linked to the order. Contact support before retrying.",
      },
      502,
    );
  }
  return json({
    ok: true,
    data: { orderId: order.order_id, reference: paymentData.reference, paymentUrl: link },
  });
}

async function checkout(request: Request, env: BackendEnv, identity: Identity) {
  if (!env.FLUTTERWAVE_SECRET_KEY || !env.APP_BASE_URL) {
    return json(
      {
        ok: false,
        error: "Payments are not configured. Checkout is unavailable and no order was placed.",
      },
      503,
    );
  }
  const input = await readJsonObject(request, 40_000);
  if (!input) return json({ ok: false, error: "A valid JSON request is required." }, 400);
  const key = typeof input["idempotencyKey"] === "string" ? input["idempotencyKey"] : "";
  const lines = input["items"];
  if (
    !/^[a-zA-Z0-9:_-]{8,120}$/.test(key) ||
    !Array.isArray(lines) ||
    !lines.length ||
    lines.length > 100
  ) {
    return json({ ok: false, error: "Checkout details are missing or invalid." }, 400);
  }
  const items = [];
  for (const line of lines) {
    if (line === null || typeof line !== "object") {
      return json({ ok: false, error: "One or more cart items are invalid." }, 400);
    }
    const entry = line as Record<string, unknown>;
    if (
      typeof entry["productId"] !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(entry["productId"]) ||
      !Number.isInteger(entry["quantity"]) ||
      Number(entry["quantity"]) < 1 ||
      Number(entry["quantity"]) > 100
    ) {
      return json({ ok: false, error: "One or more cart items are invalid." }, 400);
    }
    items.push({ product_id: entry["productId"], quantity: entry["quantity"] });
  }
  const delivery = input["delivery"];
  const deliveryInput =
    delivery !== null && typeof delivery === "object" && !Array.isArray(delivery)
      ? (delivery as Record<string, unknown>)
      : null;
  const fullName = deliveryInput?.["fullName"];
  const phone = deliveryInput?.["phone"];
  const address = deliveryInput?.["address"];
  const city = deliveryInput?.["city"];
  const state = deliveryInput?.["state"];
  if (
    typeof fullName !== "string" ||
    fullName.trim().length < 2 ||
    fullName.length > 120 ||
    typeof phone !== "string" ||
    phone.trim().length < 7 ||
    phone.length > 32 ||
    typeof address !== "string" ||
    address.trim().length < 5 ||
    address.length > 500 ||
    typeof city !== "string" ||
    !city.trim() ||
    city.length > 120 ||
    typeof state !== "string" ||
    !state.trim() ||
    state.length > 120
  ) {
    return json({ ok: false, error: "Enter valid customer and delivery details." }, 400);
  }
  const deliverySnapshot = {
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    landmark:
      typeof deliveryInput?.["landmark"] === "string"
        ? deliveryInput["landmark"].trim().slice(0, 200)
        : "",
    note:
      typeof deliveryInput?.["note"] === "string"
        ? deliveryInput["note"].trim().slice(0, 1000)
        : "",
  };
  const created = await databaseRequest(env, "rpc/create_checkout", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({
      p_items: items,
      p_idempotency_key: key,
      p_customer_snapshot: { user_id: identity.id, email: identity.email },
      p_delivery_snapshot: deliverySnapshot,
    }),
  });
  const result = await databasePayload(created);
  if (!created.ok || result === null || typeof result !== "object") {
    return errorFromDatabase(created.status, result);
  }
  const order = result as { order_id?: unknown; reference?: unknown; amount_minor?: unknown };
  if (
    typeof order.order_id !== "string" ||
    typeof order.reference !== "string" ||
    typeof order.amount_minor !== "number"
  ) {
    return json({ ok: false, error: "Checkout could not create a valid order." }, 502);
  }
  return initializeFlutterwave(
    env,
    identity,
    order as { order_id: string; reference: string; amount_minor: number },
    identity.email,
    key,
  );
}

async function getOrders(request: Request, env: BackendEnv, identity: Identity) {
  const response = await databaseRequest(
    env,
    "orders?select=id,reference,status,currency,subtotal_minor,delivery_minor,discount_minor,platform_fee_minor,total_minor,created_at,vendor_orders(id,vendor_id,status,subtotal_minor,delivery_minor,commission_minor,vendor_net_minor,order_items(id,product_snapshot,quantity,unit_price_minor,line_total_minor),vendors(name,slug))&order=created_at.desc&limit=50",
    identity.accessToken,
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload });
}

async function verifyPayment(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request);
  const reference = typeof input?.["reference"] === "string" ? input["reference"] : "";
  const transactionId = typeof input?.["transactionId"] === "string" ? input["transactionId"] : "";
  if (!reference || reference.length > 120 || !transactionId || transactionId.length > 120) {
    return json({ ok: false, error: "Payment reference and transaction ID are required." }, 400);
  }
  if (!env.FLUTTERWAVE_SECRET_KEY || !serviceConfig(env)) {
    return json({ ok: false, error: "Payment verification is not configured." }, 503);
  }

  const ownedPayment = await databaseRequest(
    env,
    `payments?select=id,reference,amount_minor,currency,status,orders!inner(customer_id)&reference=eq.${encodeURIComponent(reference)}&orders.customer_id=eq.${identity.id}&limit=1`,
    identity.accessToken,
  );
  const paymentPayload = await databasePayload(ownedPayment);
  if (!ownedPayment.ok) return errorFromDatabase(ownedPayment.status, paymentPayload);
  if (!Array.isArray(paymentPayload) || !paymentPayload[0]) {
    return json({ ok: false, error: "Payment not found." }, 404);
  }
  const payment = paymentPayload[0] as { amount_minor: number; currency: string; status: string };
  const verifyResponse = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
    { headers: { authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}` } },
  );
  const verification = (await databasePayload(verifyResponse)) as {
    status?: string;
    data?: { status?: string; tx_ref?: string; amount?: number; currency?: string; id?: number };
  } | null;
  const verified = verification?.data;
  if (
    !verifyResponse.ok ||
    verification?.status !== "success" ||
    verified?.status !== "successful" ||
    String(verified.id) !== transactionId ||
    verified.tx_ref !== reference ||
    verified.currency !== payment.currency ||
    moneyToMinor(verified.amount) !== payment.amount_minor
  ) {
    return json(
      { ok: false, error: "Flutterwave could not verify a matching successful payment." },
      409,
    );
  }
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(
      `${reference}:${transactionId}:${payment.amount_minor}:${payment.currency}`,
    ),
  );
  const payloadDigest = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const result = await databaseRequest(
    env,
    "rpc/confirm_flutterwave_payment",
    "",
    {
      method: "POST",
      body: JSON.stringify({
        p_event_id: `return:${transactionId}`,
        p_reference: reference,
        p_transaction_id: transactionId,
        p_amount_minor: payment.amount_minor,
        p_currency: payment.currency,
        p_payload_digest: payloadDigest,
      }),
    },
    true,
  );
  const confirmation = await databasePayload(result);
  if (!result.ok) return errorFromDatabase(result.status, confirmation);
  return json({ ok: true, data: { verified: true, reference, status: "successful" } });
}

function constantTimeEqual(left: string, right: string) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index]! ^ b[index]!;
  return difference === 0;
}

async function flutterwaveWebhook(request: Request, env: BackendEnv) {
  const secret = env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  const service = serviceConfig(env);
  if (!env.FLUTTERWAVE_SECRET_KEY) {
    return json({ ok: false, error: "Payment verification is not configured." }, 503);
  }
  const signature = request.headers.get("verif-hash");
  if (!secret || !service) {
    return json({ ok: false, error: "Payment webhook is not configured." }, 503);
  }
  if (!signature || !constantTimeEqual(signature, secret)) {
    return json({ ok: false, error: "Invalid webhook signature." }, 401);
  }
  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).byteLength > 64_000) {
    return json({ ok: false, error: "Webhook payload is too large." }, 413);
  }
  let payload: { id?: number | string; data?: { id?: number | string; tx_ref?: string } };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return json({ ok: false, error: "Invalid webhook payload." }, 400);
  }
  const transactionId = String(payload.data?.id ?? payload.id ?? "");
  const reference = payload.data?.tx_ref ?? "";
  if (!transactionId || !reference)
    return json({ ok: false, error: "Webhook is missing transaction details." }, 400);

  const verifyResponse = await fetch(
    `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`,
    { headers: { authorization: `Bearer ${env.FLUTTERWAVE_SECRET_KEY}` } },
  );
  const verifiedPayload = (await databasePayload(verifyResponse)) as {
    status?: string;
    data?: { status?: string; tx_ref?: string; amount?: number; currency?: string; id?: number };
  } | null;
  const paymentData = verifiedPayload?.data;
  if (
    !verifyResponse.ok ||
    verifiedPayload?.status !== "success" ||
    paymentData?.status !== "successful" ||
    String(paymentData.id) !== transactionId ||
    paymentData.tx_ref !== reference ||
    typeof paymentData.amount !== "number" ||
    typeof paymentData.currency !== "string"
  ) {
    return json({ ok: false, error: "Provider transaction verification failed." }, 409);
  }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawBody));
  const payloadDigest = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const confirmation = await fetch(`${service.url}/rest/v1/rpc/confirm_flutterwave_payment`, {
    method: "POST",
    headers: {
      apikey: service.key,
      authorization: `Bearer ${service.key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      p_event_id: `flutterwave:${transactionId}`,
      p_reference: reference,
      p_transaction_id: transactionId,
      p_amount_minor: moneyToMinor(paymentData.amount),
      p_currency: paymentData.currency,
      p_payload_digest: payloadDigest,
    }),
  });
  const result = await databasePayload(confirmation);
  if (!confirmation.ok) return errorFromDatabase(confirmation.status, result);
  return json({ ok: true, data: { accepted: true } });
}

async function getCustomerProfile(env: BackendEnv, identity: Identity) {
  const response = await databaseRequest(
    env,
    `profiles?select=id,full_name,phone,role,notification_preferences&id=eq.${encodeURIComponent(identity.id)}`,
    identity.accessToken,
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  if (!Array.isArray(payload) || !payload[0]) {
    return json({ ok: false, error: "Profile not found." }, 404);
  }
  return json({
    ok: true,
    data: {
      id: identity.id,
      email: identity.email,
      ...(payload[0] as Record<string, unknown>),
    },
  });
}

async function updateCustomerProfile(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request);
  const fullName =
    typeof input?.["full_name"] === "string" ? String(input["full_name"]).trim() : "";
  const phone =
    typeof input?.["phone"] === "string" && String(input["phone"]).trim().length > 0
      ? String(input["phone"]).trim()
      : null;
  if (!fullName || fullName.length > 120) {
    return json({ ok: false, error: "Enter a valid name." }, 400);
  }
  const response = await databaseRequest(
    env,
    `profiles?full_name=eq.${encodeURIComponent(fullName)}&phone=eq.${encodeURIComponent(
      phone ?? "",
    )}&id=eq.${encodeURIComponent(identity.id)}`,
    identity.accessToken,
    { method: "PATCH" },
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: { updated: true } });
}

async function getCustomerWallet(env: BackendEnv, identity: Identity) {
  const response = await databaseRequest(
    env,
    `payments?select=amount_minor&orders!inner(customer_id)=eq.${encodeURIComponent(
      identity.id,
    )}&status=eq.successful`,
    identity.accessToken,
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  const balance = Array.isArray(payload)
    ? payload.reduce(
        (sum: number, row: { amount_minor?: number }) => sum + Number(row?.amount_minor ?? 0),
        0,
      )
    : 0;
  return json({ ok: true, data: { balanceMinor: balance, currency: "NGN" } });
}

async function getCustomerAddresses(env: BackendEnv, identity: Identity) {
  const response = await databaseRequest(
    env,
    "customer_addresses?select=id,label,address,city,state,delivery_instructions,created_at&order=created_at.desc",
    identity.accessToken,
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload });
}

async function createCustomerAddress(request: Request, env: BackendEnv, identity: Identity) {
  const input = await readJsonObject(request);
  const label = typeof input?.["label"] === "string" ? String(input["label"]).trim() : "";
  const address = typeof input?.["address"] === "string" ? String(input["address"]).trim() : "";
  const city = typeof input?.["city"] === "string" ? String(input["city"]).trim() : "";
  const state = typeof input?.["state"] === "string" ? String(input["state"]).trim() : "";
  const instructions =
    typeof input?.["delivery_instructions"] === "string"
      ? String(input["delivery_instructions"]).trim()
      : "";
  if (!label || !address || !city || !state) {
    return json({ ok: false, error: "Label, address, city and state are required." }, 400);
  }
  const response = await databaseRequest(env, "customer_addresses", identity.accessToken, {
    method: "POST",
    body: JSON.stringify({
      customer_id: identity.id,
      label,
      address,
      city,
      state,
      delivery_instructions: instructions,
    }),
  });
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({
    ok: true,
    data: { created: true, address: Array.isArray(payload) ? payload[0] : null },
  });
}

async function deleteCustomerAddress(request: Request, env: BackendEnv, identity: Identity) {
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop() ?? "";
  if (!id) {
    return json({ ok: false, error: "Address id is required." }, 400);
  }
  const response = await databaseRequest(
    env,
    `customer_addresses?id=eq.${encodeURIComponent(id)}`,
    identity.accessToken,
    { method: "DELETE" },
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: { deleted: true } });
}

async function getCustomerReviews(env: BackendEnv, identity: Identity) {
  const response = await databaseRequest(
    env,
    `reviews?select=id,rating,body,moderation_status,created_at,vendor_order_id,vendor_id&customer_id=eq.${encodeURIComponent(identity.id)}&order=created_at.desc`,
    identity.accessToken,
  );
  const payload = await databasePayload(response);
  if (!response.ok) return errorFromDatabase(response.status, payload);
  return json({ ok: true, data: payload ?? [] });
}

export async function handleCommerceRequest(
  request: Request,
  env: BackendEnv,
): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  try {
    if (path === "/api/webhooks/flutterwave" && request.method === "POST") {
      return flutterwaveWebhook(request, env);
    }
    if (!isSameOriginMutation(request)) {
      return json({ ok: false, error: "Cross-origin mutation rejected." }, 403);
    }
    if (path === "/api/vendors/mine" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getOwnedVendors(env, auth.identity);
    }
    if (path === "/api/vendors" && request.method === "GET") return getPublicVendors(request, env);
    if (path === "/api/vendors" && request.method === "POST") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return createVendor(request, env, auth.identity);
    }
    if (path === "/api/products" && request.method === "GET") {
      let identity: Identity | undefined;
      if (request.headers.has("cookie")) {
        const auth = await requireIdentity(request, env);
        if ("response" in auth) return auth.response;
        identity = auth.identity;
      }
      return getVendorProducts(request, env, identity);
    }
    if (path === "/api/products" && request.method === "POST") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return createProduct(request, env, auth.identity);
    }
    if (path === "/api/checkout" && request.method === "POST") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return checkout(request, env, auth.identity);
    }
    if (path === "/api/orders" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getOrders(request, env, auth.identity);
    }
    if (path === "/api/payments/verify" && request.method === "POST") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return verifyPayment(request, env, auth.identity);
    }
    if (path === "/api/customer/profile" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getCustomerProfile(env, auth.identity);
    }
    if (path === "/api/customer/profile" && request.method === "PATCH") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return updateCustomerProfile(request, env, auth.identity);
    }
    if (path === "/api/customer/wallet" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getCustomerWallet(env, auth.identity);
    }
    if (path === "/api/customer/addresses" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getCustomerAddresses(env, auth.identity);
    }
    if (path === "/api/customer/addresses" && request.method === "POST") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return createCustomerAddress(request, env, auth.identity);
    }
    if (path.startsWith("/api/customer/addresses/") && request.method === "DELETE") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return deleteCustomerAddress(request, env, auth.identity);
    }
    if (path === "/api/customer/reviews" && request.method === "GET") {
      const auth = await requireIdentity(request, env);
      if ("response" in auth) return auth.response;
      return getCustomerReviews(env, auth.identity);
    }
    if (path.startsWith("/api/") && path !== "/api/health" && !path.startsWith("/api/auth/")) {
      return json({ ok: false, error: "API endpoint not found." }, 404);
    }
    return null;
  } catch (error) {
    console.error("Commerce API request failed", error);
    return json({ ok: false, error: "The commerce service is temporarily unavailable." }, 500);
  }
}
