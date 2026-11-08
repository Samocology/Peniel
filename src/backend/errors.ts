/**
 * Centralized typed error handling for the Peniel Cloudflare Workers backend.
 * Every service throws these domain errors; the router maps them to HTTP
 * responses with safe, non-leaking bodies.
 */

export class PenielError extends Error {
  readonly _tag = "PenielError";
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "PenielError";
  }
}

export class ValidationError extends PenielError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends PenielError {
  constructor(message: string = "Authentication required.") {
    super(message, "AUTHENTICATION_ERROR", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends PenielError {
  constructor(message: string = "You do not have permission to perform this action.") {
    super(message, "AUTHORIZATION_ERROR", 403);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends PenielError {
  constructor(message: string = "The requested record was not found or is unavailable.") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends PenielError {
  constructor(message: string = "This request conflicts with an existing record.") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class PaymentError extends PenielError {
  constructor(message: string = "Payment could not be completed.") {
    super(message, "PAYMENT_ERROR", 409);
    this.name = "PaymentError";
  }
}

export class ExternalServiceError extends PenielError {
  constructor(message: string = "An external service is temporarily unavailable.") {
    super(message, "EXTERNAL_SERVICE_ERROR", 502);
    this.name = "ExternalServiceError";
  }
}

export class RateLimitError extends PenielError {
  constructor(message: string = "Too many requests. Please try again later.") {
    super(message, "RATE_LIMITED", 429);
    this.name = "RateLimitError";
  }
}

export class QuotaExhaustedError extends PenielError {
  constructor(message: string = "A service resource limit has been reached.") {
    super(message, "QUOTA_EXHAUSTED", 503);
    this.name = "QuotaExhaustedError";
  }
}

export class IdempotencyConflictError extends PenielError {
  constructor(message: string = "A duplicate request was detected.") {
    super(message, "IDEMPOTENCY_CONFLICT", 409);
    this.name = "IdempotencyConflictError";
  }
}

export function toErrorResponse(error: unknown): { body: Record<string, unknown>; status: number } {
  if (error instanceof PenielError) {
    const body: Record<string, unknown> = { ok: false, error: error.message, code: error.code };
    if (error.details && Object.keys(error.details).length > 0) body["details"] = error.details;
    return { body, status: error.status };
  }
  if (error instanceof Error) {
    console.error("Unhandled backend error", error);
    return { body: { ok: false, error: "The service is temporarily unavailable.", code: "INTERNAL_ERROR" }, status: 500 };
  }
  console.error("Unhandled non-error thrown", error);
  return { body: { ok: false, error: "The service is temporarily unavailable.", code: "INTERNAL_ERROR" }, status: 500 };
}