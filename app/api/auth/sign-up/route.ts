import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, RateLimitTiers } from "@/lib/rate-limit";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  username: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
    const rateKey = `${RateLimitTiers.AUTH.keyPrefix}:${ip}`;
    const { allowed } = await checkRateLimit(rateKey, RateLimitTiers.AUTH.maxRequests);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
    }

    const body = await request.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, name, username } = parsed.data;

    const admin = createAdminClient();

    // Check if user already exists
    const { data: existingUsers } = await admin.auth.admin.listUsers();
    const existing = existingUsers?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    // Create auth user via Admin API
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: name || email.split("@")[0],
        username: username || null,
      },
    });

    if (createError || !newUser?.user) {
      return NextResponse.json(
        { error: createError?.message ?? "Failed to create user" },
        { status: 500 }
      );
    }

    const authUser = newUser.user;

    // Ensure database User record exists (trigger should have created it, but confirm)
    try {
      await prisma.user.upsert({
        where: { id: authUser.id },
        create: {
          id: authUser.id,
          email: authUser.email,
          emailVerified: authUser.email_confirmed_at
            ? new Date(authUser.email_confirmed_at)
            : undefined,
          name: name || authUser.email?.split("@")[0],
          username: username || null,
          role: "reader",
          subscriptionTier: "free",
        },
        update: {
          email: authUser.email,
          emailVerified: authUser.email_confirmed_at
            ? new Date(authUser.email_confirmed_at)
            : undefined,
          name: name || authUser.email?.split("@")[0],
        },
      });
    } catch (dbError) {
      // User record might already exist from trigger — non-critical
      console.warn("[signup] DB user upsert warning:", dbError);
    }

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: authUser.id, email: authUser.email },
    });
  } catch (error) {
    console.error("[signup] Error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
