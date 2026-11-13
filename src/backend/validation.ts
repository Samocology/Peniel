/**
 * Shared validation and coercion helpers used across backend services.
 * Money is always handled in integer minor units (kobo) to avoid float drift.
 */

export const MAX_PRICE_MINOR = 10_000_000_000; // ₦100,000,000.00 in kobo
export const NGN_CURRENCY = "NGN" as const;

export function moneyToMinor(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    const minor = Math.round(value * 100);
    return Number.isSafeInteger(minor) && minor >= 0 && minor <= MAX_PRICE_MINOR ? minor : null;
  }
  if (typeof value !== "string") return null;
  const input = value.trim();
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(input)) return null;
  const [whole = "0", fraction = ""] = input.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return Number.isSafeInteger(amount) && amount >= 0 && amount <= MAX_PRICE_MINOR ? amount : null;
}

export function minorToMajor(value: number): string {
  return (value / 100).toFixed(2);
}

export function formatNairaMinor(value: number): string {
  return (
    "₦" +
    (value / 100).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  // Normalize to E.164-ish: ensure leading + for Nigerian numbers
  if (digits.startsWith("234")) return "+" + digits;
  if (digits.startsWith("0")) return "+234" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9"))
    return "+234" + digits;
  if (digits.startsWith("+")) return "+" + digits.slice(1);
  return "+" + digits;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) return null;
  return email;
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isValidSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length >= 2 && value.length <= 80;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;
  let difference = 0;
  for (let index = 0; index < a.length; index += 1) difference |= a[index]! ^ b[index]!;
  return difference === 0;
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function pick<T extends object, K extends keyof T>(
  object: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in object) Object.assign(result, { [key]: object[key] });
  }
  return result;
}
