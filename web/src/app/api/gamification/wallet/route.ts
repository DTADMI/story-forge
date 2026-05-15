import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireUser();
  let wallet = await prisma.inkPot.findUnique({ where: { userId: user.id } });
  if (!wallet) {
    wallet = await prisma.inkPot.create({ data: { userId: user.id, balance: 0 } });
  }
  return NextResponse.json(wallet);
}
