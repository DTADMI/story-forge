# Supabase + Prisma + Neo4j — Hybrid Architecture for StoryForge

> May 14, 2026

## Why This Trio?

Each tool serves a distinct, non-overlapping purpose:

| Layer | Tool | Purpose |
|---|---|---|
| **Platform** | Supabase | Auth, Storage, Realtime, RLS, Edge Functions |
| **Relational Data** | Prisma (on Supabase Postgres) | Projects, Users, Comments, Messages, Gamification, Subscriptions |
| **Graph Data** | Neo4j | Character relationships, event connections, galaxy visualization, graph traversal |

**Prisma is pertinent because:**
- Type-safe queries with autocompletion for 30+ models
- Declarative schema as source of truth (285 lines vs 18,714 lines of raw SQL)
- Migration management via `prisma migrate`
- Relation traversal: `prisma.project.characters[0].timelineEvents` in one line
- Deep `include` chains: 1 query instead of 5+ round-trips
- Works with Supabase Postgres via `@prisma/adapter-pg`

**Prisma does NOT overlap with Neo4j because:**
- Prisma handles structured CRUD (create project, update user, list comments)
- Neo4j handles graph traversal (shortest path between characters, centrality, clustering)
- They serve different query patterns on different data shapes

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Next.js 16 (Vercel)                       │
│                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐ │
│  │  Prisma Client │  │  Neo4j Driver  │  │ Supabase Client│ │
│  │  (Relational)  │  │  (Graph Data)  │  │(Auth/Storage/  │ │
│  │                │  │                │  │ Realtime)      │ │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘ │
│          │                   │                   │           │
│  ┌───────┴────────┐  ┌───────┴────────┐  ┌───────┴────────┐ │
│  │ @prisma/      │  │ neo4j-driver   │  │ @supabase/ssr  │ │
│  │ adapter-pg    │  │ (Bolt protocol)│  │ @supabase/     │ │
│  │               │  │                │  │ supabase-js    │ │
│  └───────┬────────┘  └───────┬────────┘  └───────┬────────┘ │
└──────────┼───────────────────┼───────────────────┼──────────┘
           │                   │                   │
    ┌──────┴──────┐    ┌───────┴───────┐   ┌───────┴───────┐
    │  Supabase   │    │  Neo4j AuraDB │   │  Supabase     │
    │  Postgres   │    │  (Graph DB)   │   │  Auth/Storage │
    │  (via pg)   │    │               │   │  /Realtime    │
    └─────────────┘    └───────────────┘   └───────────────┘
```

## Data Flow

### Write Path (create relationship)
```
1. User creates CharacterRelationship via API
2. Prisma writes to Supabase Postgres (source of truth)
3. Sync function upserts mirrored node/relationship in Neo4j
4. Galaxy visualization queries Neo4j for real-time graph data
```

### Read Path (galaxy viz)
```
1. User opens /world/galaxy
2. API queries Neo4j: MATCH (c:Character)-[r]->(related) RETURN c, r, related
3. Transformed to nodes+edges format
4. Canvas force graph renders
```

### Read Path (project page)
```
1. User opens /projects/[id]
2. Prisma queries Supabase: include characters, timelineEvents, comments
3. Single query with deep includes. No Neo4j needed.
```

## Sync Strategy

**Pattern: Write-through with eventual consistency**

```typescript
// lib/neo4j-sync.ts
import neo4j from "neo4j-driver";

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
);

export async function syncCharacterToNeo4j(character: { id: string; name: string; projectId?: string }) {
  const session = driver.session();
  try {
    await session.run(`
      MERGE (c:Character {id: $id})
      SET c.name = $name, c.projectId = $projectId, c.updatedAt = datetime()
    `, { id: character.id, name: character.name, projectId: character.projectId || null });
  } finally {
    await session.close();
  }
}

export async function syncRelationshipToNeo4j(rel: { characterId: string; relatedId: string; type: string }) {
  const session = driver.session();
  try {
    await session.run(`
      MATCH (c1:Character {id: $charId}), (c2:Character {id: $relId})
      MERGE (c1)-[r:RELATES_TO {type: $type}]->(c2)
    `, { charId: rel.characterId, relId: rel.relatedId, type: rel.type });
  } finally {
    await session.close();
  }
}

export async function deleteRelationshipFromNeo4j(relId: string, charId: string, relatedId: string) {
  const session = driver.session();
  try {
    await session.run(`
      MATCH (c1:Character {id: $charId})-[r]-(c2:Character {id: $relId})
      DELETE r
    `, { charId, relId: relatedId });
  } finally {
    await session.close();
  }
}
```

## Cost

| Service | Free Tier | Launch Sufficient? |
|---|---|---|
| Supabase | 500MB DB, 2 projects, 50K MAU | Yes |
| Neo4j AuraDB Free | 50K nodes, 175K relationships | Yes (for 1000s of characters/relationships) |
| Vercel | 100GB bandwidth, 1M edge requests | Yes |

Total monthly cost at launch: **$0** (all free tiers). Neo4j AuraDB Professional ($65/mo) needed when exceeding 50K nodes.

## Comparison: Prisma vs Raw SQL vs Neo4j for Graph Queries

**"Find all characters connected to Alice within 3 hops":**

| Approach | Code | Round-trips | Performance |
|---|---|---|---|
| **Prisma (SQL)** | `prisma.characterRelationship.findMany({ where: { OR: [{ characterId }, { relatedId }] }, include: {...} })` then recursive JS function | 1 query + JS recursion | O(n²) worst case |
| **Raw SQL (CTE)** | `WITH RECURSIVE connected AS (SELECT ... UNION SELECT ...) SELECT * FROM connected` | 1 query | O(n) per hop |
| **Neo4j (Cypher)** | `MATCH path = (c:Character {name:"Alice"})-[*1..3]-(connected) RETURN path` | 1 query | O(1) per hop |

For 1000 characters with 10 relationships each, Neo4j is ~100x faster for 3-hop queries.
