import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Protect all routes under (main) layout group
    "/((?!_next/static|_next/image|favicon.ico|signin|signup|about|faq|pricing|feed|offline|download|billing|components-demo|api).*)",
  ],
};
