import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/lib/email";
import { createOptionalAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const admin = createOptionalAdminClient();
    if (admin) {
      const { data } = await admin.auth.admin.listUsers();
      const targetUser = data?.users?.find((u) => u.email === email);
      if (targetUser) {
        await admin.auth.admin.updateUserById(targetUser.id, {
          user_metadata: {
            ...targetUser.user_metadata,
            verification_token: token,
          },
        });
      }
    }

    await sendVerificationEmail(email, token);

    return NextResponse.json({ message: "Verification email sent" });
  } catch {
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }
}
