import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function getOrigin(request: NextRequest): string {
  return request.headers.get("origin") ?? "";
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = getOrigin(request);
  if (!origin) return false;
  const url = new URL(request.url);
  const requestOrigin = url.origin;
  try {
    return new URL(origin).origin === requestOrigin;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  // CSRF protection for mutating API routes
  if (
    MUTATING_METHODS.has(request.method) &&
    request.nextUrl.pathname.startsWith("/api/") &&
    !isSameOrigin(request)
  ) {
    // Allow requests without Origin header (server-to-server, mobile apps) but log
    // Only block when origin is present AND mismatched (cross-origin form submission / CSRF)
    const origin = getOrigin(request);
    if (origin) {
      return new NextResponse("Invalid origin", { status: 403 });
    }
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options: _opts }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — extends cookie lifetime on every navigation
  await supabase.auth.getUser();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif)$).*)",
  ],
};
