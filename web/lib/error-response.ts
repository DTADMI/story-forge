/**
 * Standardized API error responses for StoryForge.
 * Follows the same pattern as QuestHunt's error-response.ts.
 */
import { NextResponse } from "next/server";

export type ApiErrorPayload = {
  error: string;
  detail?: string;
  code?: string;
};

export function errorResponse(error: string, status = 500, detail?: string, code?: string) {
  const payload: ApiErrorPayload = { error };
  if (detail) payload.detail = detail;
  if (code) payload.code = code;
  return NextResponse.json(payload, { status });
}

export function unauthorized(message = "Unauthorized") {
  return errorResponse(message, 401);
}

export function forbidden(message = "Forbidden") {
  return errorResponse(message, 403);
}

export function notFound(message = "Not found") {
  return errorResponse(message, 404);
}

export function validationError(detail: string) {
  return errorResponse("Validation failed", 400, detail, "VALIDATION_ERROR");
}

export function rateLimited(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests", retryAfter },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, retryAfter)) },
    }
  );
}
