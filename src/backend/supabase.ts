/**
 * Supabase client wrapper for the Cloudflare Workers runtime.
 * Uses the REST API (PostgREST) directly so there is no Node-only dependency.
 * The service-role key is NEVER exposed to the browser.
 */

import type { BackendEnv } from "./auth.ts";

export type SupabaseClient = {
  url: string;
  anonKey: string;
  serviceKey: string | undefined;
  /** Execute a PostgREST RPC function. */
  rpc: (name: string, params: Record<string, unknown>, useServiceRole?: boolean) => Promise<unknown>;
  /** Select rows from a table. */
  select: (table: string, query: URLSearchParams, useServiceRole?: boolean) => Promise<unknown[]>;
  /** Insert a single row, returning representation. */
  insert: (table: string, row: Record<string, unknown>, useServiceRole?: boolean) => Promise<unknown>;
  /** Update rows matching a filter. */
  update: (table: string, filter: URLSearchParams, row: Record<string, unknown>, useServiceRole?: boolean) => Promise<unknown>;
};

export function createSupabaseClient(env: BackendEnv): SupabaseClient | null {
  const url = env.SUPABASE_URL?.replace(/\/+$/, "");
  const anonKey = env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return {
    url,
    anonKey,
    serviceKey: env.SUPABASE_SERVICE_ROLE_KEY,
    rpc: (name, params, useServiceRole = false) => rpcImpl(url, anonKey, env.SUPABASE_SERVICE_ROLE_KEY, name, params, useServiceRole),
    select: (table, query, useServiceRole = false) => selectImpl(url, anonKey, env.SUPABASE_SERVICE_ROLE_KEY, table, query, useServiceRole),
    insert: (table, row, useServiceRole = false) => insertImpl(url, anonKey, env.SUPABASE_SERVICE_ROLE_KEY, table, row, useServiceRole),
    update: (table, filter, row, useServiceRole = false) => updateImpl(url, anonKey, env.SUPABASE_SERVICE_ROLE_KEY, table, filter, row, useServiceRole),
  };
}

async function rpcImpl(
  url: string,
  anonKey: string,
  serviceKey: string | undefined,
  name: string,
  params: Record<string, unknown>,
  useServiceRole: boolean,
): Promise<unknown> {
  const key = useServiceRole && serviceKey ? serviceKey : anonKey;
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(params),
  });
  return parseResponse(response);
}

async function selectImpl(
  url: string,
  anonKey: string,
  serviceKey: string | undefined,
  table: string,
  query: URLSearchParams,
  useServiceRole: boolean,
): Promise<unknown[]> {
  const key = useServiceRole && serviceKey ? serviceKey : anonKey;
  const response = await fetch(`${url}/rest/v1/${table}?${query.toString()}`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  const payload = await parseResponse(response);
 return Array.isArray(payload) ? payload : [];
}

async function insertImpl(
  url: string,
  anonKey: string,
  serviceKey: string | undefined,
  table: string,
  row: Record<string, unknown>,
  useServiceRole: boolean,
): Promise<unknown> {
  const key = useServiceRole && serviceKey ? serviceKey : anonKey;
  const response = await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  return parseResponse(response);
}

async function updateImpl(
  url: string,
  anonKey: string,
  serviceKey: string | undefined,
  table: string,
  filter: URLSearchParams,
  row: Record<string, unknown>,
  useServiceRole: boolean,
): Promise<unknown> {
  const key = useServiceRole && serviceKey ? serviceKey : anonKey;
  const response = await fetch(`${url}/rest/v1/${table}?${filter.toString()}`, {
    method: "PATCH",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify(row),
  });
  return parseResponse(response);
}

export async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function dbError(status: number, payload: unknown): { status: number; code: string; message: string } {
  const isRecord = (v: unknown): v is Record<string, unknown> =>
    v !== null && typeof v === "object" && !Array.isArray(v);
  const code = isRecord(payload) && typeof payload["code"] === "string" ? payload["code"] : "";
  const message = isRecord(payload) && typeof payload["message"] === "string" ? payload["message"] : "";
  if (status === 401) return { status: 401, code: "AUTHENTICATION_ERROR", message: "Please sign in to continue." };
  if (status === 403 || code === "42501") return { status: 403, code: "AUTHORIZATION_ERROR", message: "You do not have permission to perform this action." };
  if (status === 404 || code === "P0002") return { status: 404, code: "NOT_FOUND", message: "The requested record was not found or is unavailable." };
  if (status === 409 || code === "23505") return { status: 409, code: "CONFLICT", message: "This request conflicts with an existing record." };
  if (code === "23514" || code === "22023") return { status: 400, code: "VALIDATION_ERROR", message: "The supplied data is invalid or unavailable." };
  return { status: 502, code: "EXTERNAL_SERVICE_ERROR", message: "The data service is temporarily unavailable." };
}