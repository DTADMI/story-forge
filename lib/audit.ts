export async function auditLog(params: {
  userId: string;
  action: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
}) {
  const entry = { ...params, timestamp: new Date().toISOString() };
  if (process.env.NODE_ENV === "development") {
    console.log("[AUDIT]", JSON.stringify(entry));
  }
  return entry;
}
