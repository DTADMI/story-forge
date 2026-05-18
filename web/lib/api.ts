/**
 * Simple API fetch helper for StoryForge.
 * Uses cookie-based Supabase Auth — no JWT signing needed.
 *
 * For server components: use `prisma` from `@/lib/prisma` directly.
 * For client components: use this wrapper which forwards cookies.
 */
import { cookies } from "next/headers";

export async function apiFetch(input: string, init: RequestInit = {}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const headers = new Headers(init.headers as HeadersInit);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (cookieHeader) headers.set("Cookie", cookieHeader);

  const url = input.startsWith("http")
    ? input
    : `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${input.startsWith("/") ? "" : "/"}${input}`;

  return fetch(url, { ...init, headers });
}
