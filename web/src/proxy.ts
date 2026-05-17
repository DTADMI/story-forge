import { NextRequest, NextResponse } from "next/server";
import { updateSession, createMiddlewareClient } from "@/lib/supabase/proxy";
import { prisma } from "@/lib/prisma";

export async function proxy(request: NextRequest) {
  // Basic security headers for all routes
  const response = await updateSession(request);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "0");
  // Minimal CSP; refined later. Allows next/image and same-origin.
  const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'strict-dynamic' 'unsafe-inline'",
    "connect-src 'self'",
    "font-src 'self' data:",
    "frame-ancestors 'none'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", csp);

  // Role-based protection for /admin/* routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const supabase = createMiddlewareClient(request, response);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const signInUrl = new URL("/signin", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      });
      if (!dbUser || dbUser.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
