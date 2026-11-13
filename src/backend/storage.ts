/**
 * Cloudflare R2 storage service.
 * Uses the S3-compatible API with HMAC-SHA256 request signing.
 * Never exposes R2 credentials to the browser.
 * All uploads go directly from browser to R2 via short-lived presigned URLs.
 */

import { getRequestIdentity, type BackendEnv } from "./auth.ts";
import { isSameOriginMutation, json, readJsonObject } from "./http.ts";
import { isUuid } from "./validation.ts";

export type R2Env = BackendEnv & {
  R2_ACCOUNT_ID?: string;
  R2_BUCKET_PUBLIC?: string;
  R2_BUCKET_PRIVATE?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_PUBLIC_MEDIA_URL?: string;
};

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const MAX_PUBLIC_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_PRIVATE_BYTES = 10 * 1024 * 1024; // 10 MB
const URL_EXPIRY_SECONDS = 300; // 5 minutes

function isR2Configured(env: R2Env): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID && env.R2_BUCKET_PUBLIC && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY,
  );
}

async function hmacSha256(key: BufferSource, data: string): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(data));
}

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(data: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(data));
  return hex(digest);
}

async function buildPresignedUrl(
  env: R2Env,
  bucket: string,
  objectKey: string,
  contentType: string,
  expirySeconds: number,
): Promise<string> {
  const accountId = env.R2_ACCOUNT_ID!;
  const accessKeyId = env.R2_ACCESS_KEY_ID!;
  const secretKey = env.R2_SECRET_ACCESS_KEY!;
  const region = "auto";
  const service = "s3";
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const endpoint = `https://${host}/${bucket}/${objectKey}`;

  const now = new Date();
  const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const amzDate = now.toISOString().replace(/[:-]/g, "").slice(0, 15) + "Z";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const credential = `${accessKeyId}/${credentialScope}`;

  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expirySeconds),
    "X-Amz-SignedHeaders": "content-type;host",
  });
  queryParams.sort();

  const canonicalRequest = [
    "PUT",
    `/${bucket}/${objectKey}`,
    queryParams.toString(),
    `content-type:${contentType}\nhost:${host}\n`,
    "content-type;host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const encoder = new TextEncoder();
  const kDate = await hmacSha256(encoder.encode(`AWS4${secretKey}`), dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = hex(await hmacSha256(kSigning, stringToSign));

  return `${endpoint}?${queryParams.toString()}&X-Amz-Signature=${signature}`;
}

function safeObjectKey(ownerId: string, purpose: string, filename: string): string {
  const ext =
    filename
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") ?? "bin";
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${purpose}/${ownerId.slice(0, 8)}/${random}.${ext}`;
}

// POST /api/storage/upload-url
async function requestUploadUrl(request: Request, env: R2Env): Promise<Response> {
  if (!isSameOriginMutation(request))
    return json({ ok: false, error: "Cross-origin request rejected." }, 403);
  const identity = await getRequestIdentity(request, env);
  if (!identity) return json({ ok: false, error: "Authentication required." }, 401);
  if (!isR2Configured(env))
    return json({ ok: false, error: "File storage is not configured." }, 503);

  const input = await readJsonObject(request, 4096);
  const purpose = typeof input?.["purpose"] === "string" ? input["purpose"] : "";
  const contentType = typeof input?.["contentType"] === "string" ? input["contentType"] : "";
  const filename = typeof input?.["filename"] === "string" ? input["filename"] : "upload";
  const vendorId = typeof input?.["vendorId"] === "string" ? input["vendorId"] : null;

  const allowedPurposes = [
    "product-image",
    "store-logo",
    "store-cover",
    "store-banner",
    "verification-doc",
    "message-attachment",
  ];
  if (!allowedPurposes.includes(purpose))
    return json({ ok: false, error: "Invalid upload purpose." }, 400);
  if (!ALLOWED_CONTENT_TYPES.has(contentType))
    return json({ ok: false, error: "File type not allowed." }, 400);
  if (vendorId && !isUuid(vendorId)) return json({ ok: false, error: "Invalid vendorId." }, 400);

  const isPrivate = purpose === "verification-doc";
  const bucket = isPrivate
    ? (env.R2_BUCKET_PRIVATE ?? env.R2_BUCKET_PUBLIC!)
    : env.R2_BUCKET_PUBLIC!;
  const maxBytes = isPrivate ? MAX_PRIVATE_BYTES : MAX_PUBLIC_BYTES;
  const objectKey = safeObjectKey(identity.id, purpose, filename);

  const uploadUrl = await buildPresignedUrl(
    env,
    bucket,
    objectKey,
    contentType,
    URL_EXPIRY_SECONDS,
  );
  const publicUrl =
    !isPrivate && env.R2_PUBLIC_MEDIA_URL
      ? `${env.R2_PUBLIC_MEDIA_URL.replace(/\/+$/, "")}/${objectKey}`
      : null;

  return json({
    ok: true,
    data: {
      uploadUrl,
      objectKey,
      publicUrl,
      expiresInSeconds: URL_EXPIRY_SECONDS,
      maxBytes,
      contentType,
    },
  });
}

export async function handleStorageRequest(request: Request, env: R2Env): Promise<Response | null> {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith("/api/storage/")) return null;
  try {
    if (pathname === "/api/storage/upload-url" && request.method === "POST") {
      return requestUploadUrl(request, env);
    }
    return null;
  } catch (error) {
    console.error("Storage API error", error);
    return json({ ok: false, error: "Storage service temporarily unavailable." }, 500);
  }
}
