import { NextRequest, NextResponse } from "next/server";
import { createOptionalAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/dashboard?verify_error=missing_token`);
  }

  try {
    const admin = createOptionalAdminClient();
    if (admin) {
      const { data } = await admin.auth.admin.listUsers();
      const targetUser = data?.users?.find((u) => u.user_metadata?.verification_token === token);

      if (targetUser) {
        await admin.auth.admin.updateUserById(targetUser.id, {
          email_confirm: true,
          user_metadata: {
            ...targetUser.user_metadata,
            verification_token: null,
          },
        });
      }
    }
  } catch {
    // Token verification failed silently, still redirect
  }

  const redirectUrl = new URL("/dashboard", siteUrl);
  redirectUrl.searchParams.set("verified", "1");

  return NextResponse.redirect(redirectUrl.toString());
}
