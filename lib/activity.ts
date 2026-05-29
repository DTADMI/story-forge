/**
 * Activity creation helpers.
 * Called from route handlers when significant events occur.
 */
import { prisma } from "@/lib/prisma";

export async function createActivity(params: {
  userId: string;
  type: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.activity.create({
      data: {
        userId: params.userId,
        type: params.type,
        entityId: params.entityId ?? null,
        entityType: params.entityType ?? null,
        metadata: params.metadata ?? {},
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  } catch {
    // Non-critical
  }
}

/** Fire-and-forget wrapper that doesn't block the response */
export function createActivityAsync(params: {
  userId: string;
  type: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}) {
  createActivity(params).catch(() => {});
}
