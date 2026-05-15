# Database & Backend Architecture Analysis

> May 14, 2026 — Comparative analysis for Nebula Forge portfolio

---

## Executive Summary

| Project | Recommended | Runner-up | Why |
|---|---|---|---|
| **QuestHunt** | Supabase (current) | SpacetimeDB | Supabase RLS + Auth are critical for tiered mobile access. Already ship on it. |
| **StoryForge** | Supabase + Neo4j (hybrid) | Supabase only | Relational core (projects, users) stays on Supabase/Prisma. Character/event graphs on Neo4j. |
| **VelvetGalaxy** | Neo4j | Supabase | Social graph is the product. Native graph DB is the correct abstraction. |
| **LibraKeeper** | Supabase | Convex | Financial ledgers need ACID + audit. Postgres is proven for this. |

---

## 1. Supabase (PostgreSQL)

### Architecture
```
Next.js App → @supabase/ssr (cookies) → Supabase Auth
             → @supabase/supabase-js (REST/Realtime/Storage)
             → pg driver (raw SQL via node-postgres or Prisma)
```

### Pros
- **Mature ecosystem**: 15 years of Postgres, 5 years of Supabase. Battle-tested.
- **RLS (Row-Level Security)**: Database-enforced access control. Impossible to bypass.
- **Auth built-in**: 20+ OAuth providers, email/password, magic links. All cookie-based via `@supabase/ssr`.
- **Storage**: S3-compatible with CDN, image transforms. Public + private buckets.
- **Realtime**: WebSocket subscriptions on DB changes. Presence + broadcast channels.
- **Edge Functions**: Deno/TypeScript serverless. Global distribution.
- **pgvector**: Vector embeddings alongside transactional data. AI-ready.
- **Open source**: Self-hostable. No vendor lock-in. Portable Postgres.
- **Prisma compatible**: Use Prisma ORM with `@prisma/adapter-pg` on Supabase Postgres.
- **Free tier**: Generous (500MB DB, 2 projects, 50K MAU auth).

### Cons
- **No native graph traversal**: JOINs for recursive queries are slow and verbose compared to Cypher.
- **No built-in reactivity**: Realtime requires explicit subscription setup. Not automatic like Convex.
- **RLS debugging**: Harder to debug than application-level guards.
- **Migration complexity**: Custom SQL migrations can drift. Prisma migrates separately from Supabase.
- **No native pub/sub at scale**: Realtime has limits (500 concurrent channels on free tier).

### Best For
- Multi-tenant apps with tiered access (admin, creator, player, anonymous)
- Content platforms with complex relational data
- Apps needing auth + DB + storage + realtime in one platform
- Teams already familiar with SQL/Postgres

---

## 2. Convex

### Architecture
```
Next.js App → useQuery/useMutation hooks → Convex Client
                                           → Convex Server (reactive functions)
                                           → Convex DB (document store)
```

### Pros
- **Reactive by default**: Every query automatically re-runs when data changes. No WebSocket setup.
- **TypeScript-native**: Schemas, queries, mutations, actions all in TS. Full end-to-end types.
- **Built-in scheduling**: Cron jobs, background tasks.
- **No infrastructure**: No servers, no connection pools, no Redis setup needed.
- **Optimistic updates**: Built into `useMutation` with automatic rollback.
- **File storage**: Built-in file upload API.
- **80+ OAuth providers**: Via built-in auth or Clerk integration.

### Cons
- **Proprietary**: Not open source. Vendor lock-in. Cannot self-host (open-source version exists but limited).
- **Document model**: Not relational. Complex JOINs are unnatural. No SQL.
- **No RLS equivalent**: Access control is application-level only.
- **Pricing at scale**: Per-document-read pricing. Can be unpredictable for high-read apps.
- **No native graph queries**: Document DB, not graph DB.
- **Smaller ecosystem**: Fewer integrations, less community knowledge.

### Best For
- Real-time collaborative apps (Figma-likes, chat, multiplayer docs)
- Single-tenant or simple multi-tenant apps
- Teams wanting zero-infrastructure backend
- Prototypes and MVPs needing fast iteration

---

## 3. Neo4j (Graph Database)

### Architecture
```
Next.js App → neo4j-driver (Bolt protocol) → Neo4j AuraDB (cloud)
             or → @neo4j/graphql-js → GraphQL API
             or → Cypher queries directly
```

### Pros
- **Native graph traversal**: Cypher queries traverse relationships in O(1) per hop. 1000x faster than SQL JOINs for deep graphs.
- **Flexible schema**: Nodes and relationships can have arbitrary properties. No migrations for new relationship types.
- **Visual exploration**: Neo4j Bloom for non-technical data browsing.
- **Graph algorithms**: Shortest path, PageRank, community detection, centrality — built-in.
- **Cypher query language**: Expressive, readable. `MATCH (c:Character)-[r:ALLY_OF]->(ally) RETURN c, r, ally`.
- **GraphQL integration**: `@neo4j/graphql-js` auto-generates GraphQL API from type definitions.

### Cons
- **Not a general-purpose DB**: Overkill for simple CRUD. Expensive for non-graph data.
- **Cost**: AuraDB Professional starts at $65/month. No generous free tier.
- **No built-in auth**: Requires separate auth provider (Clerk, Auth0, Supabase Auth).
- **No built-in storage**: Need S3/Supabase Storage for file uploads.
- **Learning curve**: Cypher is different from SQL. Team needs to learn graph thinking.
- **Operational complexity**: Different backup/restore/monitoring from Postgres.

### Best For
- Social networks (follows, friends, blocks — all graph-native)
- Recommendation engines ("people who liked X also liked Y")
- Character/event relationship visualization
- Knowledge graphs and semantic search
- Fraud detection, network analysis

### Code Example (Character Relationships)
```cypher
// Find all characters connected to "Alice" within 3 hops
MATCH path = (c:Character {name: "Alice"})-[*1..3]-(connected)
RETURN path

// Find the shortest path between two characters
MATCH path = shortestPath(
  (a:Character {name: "Alice"})-[*]-(b:Character {name: "Bob"})
)
RETURN path

// Find characters with the most connections (centrality)
MATCH (c:Character)-[r]->()
RETURN c.name, count(r) as connections
ORDER BY connections DESC LIMIT 10
```

---

## 4. SpacetimeDB

### Architecture
```
Client SDK (Rust/TS/C#) → WebSocket → SpacetimeDB module (Rust/C#)
                                       → In-memory DB with ACID
                                       → Automatic client sync
```

### Pros
- **Extreme performance**: 300K+ transactions/sec. In-memory execution. No network round-trips for server logic.
- **Automatic sync**: Clients subscribe to tables. Changes pushed automatically. No polling, no WebSocket setup.
- **Single binary**: Database + server + realtime sync in one process. Deploy with one command.
- **ACID**: Full transactional guarantees at in-memory speed.
- **Open source**: MIT licensed. Self-hostable.
- **Designed for multiplayer**: Built by game developers for BitCraft MMORPG.

### Cons
- **Very new**: v2.2. Ecosystem is tiny. Few production deployments outside gaming.
- **Rust-first**: Module logic must be written in Rust or C#. No TypeScript server-side (yet).
- **No managed cloud**: Must self-host on your own infrastructure. No Supabase/Convex-style dashboard.
- **No built-in auth**: Must implement authentication yourself within modules.
- **No SQL**: Uses its own query language (SpacetimeSQL, SQL-inspired but different).
- **Not for traditional web apps**: Optimized for game-like workloads (high-frequency updates, multiplayer state).
- **Limited ecosystem**: No Prisma, no ORMs, no migration tools.

### Best For
- Real-time multiplayer games (Minecraft-likes, MMOs, FPS)
- Collaborative editors with sub-100ms latency requirements
- Applications where 10K+ concurrent real-time users need shared state
- Game development teams comfortable with Rust

---

## 5. Comparative Matrix

| Dimension | Supabase | Convex | Neo4j | SpacetimeDB |
|---|---|---|---|---|
| **DB type** | Relational (SQL) | Document | Graph | Relational (in-memory) |
| **Query language** | SQL | TypeScript | Cypher | SpacetimeSQL |
| **Real-time** | Subscription-based | Automatic | Via plugins | Built-in sync |
| **Auth** | Built-in (20+ OAuth) | Built-in (80+ OAuth) | None (needs external) | None (DIY) |
| **Storage** | Built-in (S3) | Built-in | None | None |
| **Maturity** | High (5 years) | Medium (3 years) | Very High (15 years) | Low (2 years) |
| **Open source** | Yes (MIT) | Partial | Yes (Community Ed.) | Yes (MIT) |
| **Free tier** | Yes (generous) | Yes (limited) | Limited | Self-host only |
| **Managed cloud** | Yes | Yes | Yes (AuraDB) | No |
| **RLS / access control** | Yes (native) | Application-level | Application-level | Module-level |
| **Graph traversal speed** | O(n) per hop | O(n) per hop | O(1) per hop | O(n) per hop |
| **Relational data** | Excellent | Good | Poor (not designed for) | Good |
| **File uploads** | Native | Native | No | No |
| **Edge functions** | Yes (Deno) | Yes (TS actions) | No | Modules (Rust/C#) |
| **Best for** | General-purpose SaaS | Real-time collab apps | Graph-heavy apps | Multiplayer games |

---

## 6. Per-Project Recommendations

### QuestHunt — Supabase (Keep)
**Rationale:** QH has 207 tables, 442 RLS policies, mobile clients with anonymous access, GPS verification functions, and AR features. The RLS-first architecture with Postgres functions (SECURITY DEFINER with explicit search_path) is the correct design for this use case. SpacetimeDB could handle the real-time game state better but would require rewriting all auth, authorization, and 500+ queries. Not worth it.

### StoryForge — Supabase + Neo4j (Hybrid, Recommended)
**Rationale:** SF has two distinct data domains:
1. **Relational core** (projects, users, subscriptions, comments, messages, gamification): Best on Supabase/Prisma. ACID, SQL, RLS, auth, storage all needed.
2. **Graph core** (character relationships, event connections, family trees, interconnected galaxy visualization): Best on Neo4j. Native graph traversal, Cypher, Bloom, graph algorithms.

The hybrid approach: Supabase for everything except the character/event relationship graph. A `CharacterRelationship` table in Supabase syncs to Neo4j nodes via a simple ETL. The galaxy visualization queries Neo4j directly. All other features stay on Supabase.

### VelvetGalaxy — Neo4j (Primary)
**Rationale:** The social graph IS the product. Follows, friends, blocks, content recommendations, similarity scores, community detection — all graph-native. Neo4j's Cypher queries for "friends of friends who liked X" are 100x simpler than SQL recursive CTEs. Supabase could handle auth + storage but the core data belongs in a graph DB.

### LibraKeeper — Supabase (Keep)
**Rationale:** Financial ledgers need ACID, audit trails, double-entry accounting, and regulatory compliance. Postgres is the gold standard for this. Neo4j can't do financial-grade ACID at the same level. Convex's document model would make financial queries painful. SpacetimeDB is too immature for financial data.

---

## 7. Migration Recommendations

### StoryForge: Supabase → Supabase + Neo4j
- **What changes:** Add Neo4j for character/event relationship graph. Everything else stays on Supabase/Prisma.
- **What doesn't change:** Auth, projects, comments, messages, gamification, storage, admin — all unchanged.
- **New dependency:** `neo4j-driver` (~200KB). Neo4j AuraDB free tier (50K nodes, 175K relationships) is sufficient for launch.
- **Sync strategy:** When a CharacterRelationship is created/deleted in Prisma, fire a background job to upsert the corresponding Neo4j node/relationship. Simple, eventual consistency.

### Code Example: Hybrid Query
```typescript
// Supabase: Get a project with its characters
const project = await prisma.project.findFirst({
  where: { id },
  include: { characters: true }
});

// Neo4j: Get the relationship graph for those characters
const result = await neo4jSession.run(`
  MATCH (c:Character)-[r]->(related:Character)
  WHERE c.projectId = $projectId
  RETURN c, r, related
`, { projectId: id });

// Combine: Project data from Supabase + graph data from Neo4j
const graphData = transformNeo4jResult(result);
```

---

## 8. Architecture Diagram (SF Recommended)

```
┌──────────────────────────────────────────────────────────┐
│                    Next.js 16 (Vercel)                    │
│                                                          │
│  Server Components / Route Handlers / Client Pages       │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  Prisma Client   │  │  neo4j-driver    │             │
│  │  (Relational)    │  │  (Graph)         │             │
│  └────────┬─────────┘  └────────┬─────────┘             │
│           │                     │                        │
│  ┌────────┴─────────┐  ┌────────┴─────────┐             │
│  │ @supabase/ssr    │  │ Cypher queries   │             │
│  │ (Auth, Storage,  │  │ (relationships,  │             │
│  │  Realtime)       │  │  galaxy viz)     │             │
│  └────────┬─────────┘  └────────┬─────────┘             │
└───────────┼─────────────────────┼───────────────────────┘
            │                     │
   ┌────────┴────────┐   ┌────────┴────────┐
   │   Supabase      │   │  Neo4j AuraDB   │
   │  - Auth         │   │  - Characters   │
   │  - Users/Projects│   │  - Relationships│
   │  - Comments/Msgs │   │  - Graph viz    │
   │  - Gamification  │   │  - Cypher       │
   │  - Storage       │   │  - Bloom        │
   │  - RLS           │   │                 │
   └─────────────────┘   └─────────────────┘
```
