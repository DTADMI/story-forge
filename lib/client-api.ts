"use client";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function buildHeaders(init?: RequestInit) {
  const headers = new Headers(init?.headers);

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function parseResponseBody(response: Response) {
  const contentType =
    response.headers && typeof response.headers.get === "function"
      ? (response.headers.get("content-type") ?? "")
      : "";

  if (contentType.includes("application/json") || typeof response.json === "function") {
    try {
      return await response.json();
    } catch {
      if (contentType.includes("application/json")) {
        return null;
      }
    }
  }

  try {
    return await response.text();
  } catch {
    return null;
  }
}

function getPayloadMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.error ?? record.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return null;
}

export async function fetchJson<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    headers: buildHeaders(init),
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(
      getPayloadMessage(payload) ?? `Request failed (${response.status})`,
      response.status,
      payload
    );
  }

  return payload as T;
}

export async function fetchVoid(input: string, init?: RequestInit) {
  await fetchJson<null>(input, init);
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
