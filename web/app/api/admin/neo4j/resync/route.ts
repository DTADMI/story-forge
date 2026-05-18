import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { fullResync } from "@/lib/neo4j-sync";
import { getNeo4jDriver } from "@/lib/neo4j";

export async function POST() {
  await requireAdmin();

  const driver = getNeo4jDriver();
  if (!driver) {
    return NextResponse.json({ error: "Neo4j is not configured" }, { status: 400 });
  }

  let nodeCount = 0;
  let relationshipCount = 0;

  try {
    await fullResync();

    const session = driver.session();
    try {
      const nodeResult = await session.run(`MATCH (n) RETURN count(n) AS count`);
      nodeCount = nodeResult.records[0]?.get("count")?.toNumber() ?? 0;

      const relResult = await session.run(`MATCH ()-[r]->() RETURN count(r) AS count`);
      relationshipCount = relResult.records[0]?.get("count")?.toNumber() ?? 0;
    } finally {
      await session.close();
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Resync failed", detail: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, nodeCount, relationshipCount });
}
