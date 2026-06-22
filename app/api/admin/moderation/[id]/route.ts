import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { withErrorHandler } from "@/lib/api-handler";

export const POST = withErrorHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const adminId = user?.id || "unknown";

    const { id } = await params;
    const { action, entityType, reason } = (await request.json()) as {
      action: string;
      entityType?: string;
      reason?: string;
    };

    const validActions = ["approve", "flag", "delete", "warn"];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const type = entityType || "project";

    if (action === "delete") {
      if (type === "project") {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.project.delete({ where: { id } });
      } else if (type === "character") {
        const character = await prisma.character.findUnique({ where: { id } });
        if (!character) return NextResponse.json({ error: "Not found" }, { status: 404 });
        await prisma.character.delete({ where: { id } });
      }
    }

    await auditLog({
      userId: adminId,
      action: `moderation.${action}`,
      entityId: id,
      entityType: type,
      metadata: { reason: reason || "No reason provided", moderatorId: adminId },
    });

    return NextResponse.json({
      success: true,
      action,
      entityId: id,
      message: action === "delete" ? `${type} has been deleted` : `${type} has been ${action}ed`,
    });
  }
);
