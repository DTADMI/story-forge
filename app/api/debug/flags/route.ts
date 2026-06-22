import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth";
import { getFlagsSync } from "@/lib/flags";

export async function GET() {
  const user = await requireUser();
  const admin = await isAdmin(user.id);
  if (!admin) {
    return new NextResponse("Not found", { status: 404 });
  }

  const env = process.env.NODE_ENV || "development";
  return NextResponse.json({ env, flags: getFlagsSync() });
}
