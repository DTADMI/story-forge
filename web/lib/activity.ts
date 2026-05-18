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
    await prisma.activity.create({ data: params });
  } catch {
    // Non-critical — activity logging failures should not break the main operation
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
