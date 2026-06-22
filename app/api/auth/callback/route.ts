import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const ALLOWED_REDIRECTS = new Set([
  "/dashboard",
  "/admin",
  "/admin/dashboard",
  "/profile",
  "/projects",
  "/world",
  "/stats",
]);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  // Validate against allowlist for sensitive redirects
  const safeNext =
    ALLOWED_REDIRECTS.has(next) || next.startsWith("/projects/") || next.startsWith("/world/")
      ? next
      : "/dashboard";

  if (code) {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_callback_error`);
}
