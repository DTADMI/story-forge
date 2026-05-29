import { prisma } from "./prisma";

export async function auditLog(params: {
  userId: string;
  action: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  try {
    await prisma.auditEvent.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityId: params.entityId ?? null,
        entityType: params.entityType ?? null,
        metadata: params.metadata ?? {},
        ip: params.ip ?? null,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch {
    if (process.env.NODE_ENV === "development") {
      console.error("[AUDIT] Failed to persist audit event:", params.action);
    }
  }
}
