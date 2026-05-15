import { NextRequest, NextResponse } from "next/server";
import { updateSession, createMiddlewareClient } from "@/lib/supabase/middleware";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|signin|signup|about|faq|pricing|feed|offline|download|billing|components-demo|api).*)",
  ],
};
