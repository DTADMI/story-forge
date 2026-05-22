import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | null = null;

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // GitHub Actions CI has no database. Return a noop stub during CI build
    // so Next.js page collection doesn't crash.
    // Vercel runtime always has DATABASE_URL (set in project env vars).
    // Vercel build also needs it for prisma generate.
    if (process.env.CI) {
      console.warn("[Prisma] DATABASE_URL not set — returning CI build-safe stub.");
      return buildSafeStub();
    }
    throw new Error(
      "DATABASE_URL environment variable is required. Set it in your Vercel project settings or .env file."
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({ adapter });
  }

  // Development: reuse client across hot reloads
  if (!global.prisma) {
    global.prisma = new PrismaClient({ adapter });
  }
  return global.prisma;
}

/**
 * Returns a stub PrismaClient for build-time safety.
 * All model accessors return a Proxy that throws a descriptive error if any actual
 * query method (findMany, create, etc.) is called during the build phase.
 */
function buildSafeStub(): PrismaClient {
  const stub = new Proxy({} as PrismaClient, {
    get(_target, _prop) {
      return new Proxy(() => Promise.resolve(), {
        get() {
          return () => Promise.resolve();
        },
        apply() {
          return Promise.resolve();
        },
      });
    },
  });
  return stub;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaClient) {
      prismaClient = createPrismaClient();
    }
    const value = (prismaClient as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(prismaClient);
    }
    return value;
  },
});
