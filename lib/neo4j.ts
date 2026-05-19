import neo4j, { Driver, auth } from "neo4j-driver";

let driver: Driver | null = null;

export function getNeo4jDriver(): Driver | null {
  if (driver) return driver;
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USER;
  const password = process.env.NEO4J_PASSWORD;
  if (!uri || !user || !password) {
    if (process.env.NODE_ENV === "development")
      console.warn("Neo4j not configured. Graph features disabled.");
    return null;
  }
  driver = neo4j.driver(uri, auth.basic(user, password));
  return driver;
}

export async function neo4jQuery<T = any>(
  cypher: string,
  params?: Record<string, any>
): Promise<T[]> {
  const d = getNeo4jDriver();
  if (!d) return [];
  const session = d.session();
  try {
    const result = await session.run(cypher, params);
    return result.records.map((r) => {
      const obj: any = {};
      r.keys.forEach((k) => {
        obj[k] = r.get(k);
      });
      return obj as T;
    });
  } finally {
    await session.close();
  }
}
