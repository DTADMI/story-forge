import { PrismaClient } from ".prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let _prisma: PrismaClient | null = null;

function getPrismaInstance(): PrismaClient {
  if (_prisma) return _prisma;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    if (process.env.CI) {
      console.warn("[Prisma] DATABASE_URL not set — returning CI build-safe stub.");
      return new PrismaClient();
    }
    throw new Error(
      "DATABASE_URL environment variable is required. Set it in your Vercel project settings or .env file."
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV === "production") {
    _prisma = new PrismaClient({ adapter });
    return _prisma;
  }

  if (!global.__prisma) {
    global.__prisma = new PrismaClient({ adapter });
  }
  _prisma = global.__prisma;
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaInstance();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
