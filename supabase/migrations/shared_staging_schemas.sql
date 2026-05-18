-- Shared Staging Database: story-forge-staging
-- Supabase ref: luxjwdodinxvpfbmfzyu
-- 
-- This Supabase project hosts 3 app staging environments via Postgres schemas:
--   public          → StoryForge (default schema)
--   librakeeper     → LibraKeeper tables
--   nebulaforgeweb  → NebulaForgeWeb tables
--
-- Each project connects to the SAME Supabase URL but uses a different schema.
-- Auth (auth.users) is shared across all schemas (acceptable for staging).

-- ============================================================
-- LibraKeeper Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS librakeeper;

-- Feature flags table
CREATE TABLE IF NOT EXISTS librakeeper."FeatureFlag" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on schema tables
ALTER TABLE librakeeper."FeatureFlag" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NebulaForgeWeb Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS nebulaforgeweb;

-- Feature flags table
CREATE TABLE IF NOT EXISTS nebulaforgeweb.feature_flags (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    enabled BOOLEAN NOT NULL DEFAULT false,
    type TEXT NOT NULL DEFAULT 'boolean',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS nebulaforgeweb.site_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE nebulaforgeweb.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE nebulaforgeweb.site_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Supabase Client Configuration
-- ============================================================
-- For apps using non-public schemas, configure the Supabase client:
--
--   import { createClient } from "@supabase/supabase-js";
--   const supabase = createClient(url, anonKey, {
--     db: { schema: "librakeeper" }  // or "nebulaforgeweb"
--   });
--
-- For Prisma, set the schema in schema.prisma:
--   datasource db {
--     provider  = "postgresql"
--     url       = env("DATABASE_URL")
--     schemas   = ["librakeeper"]
--   }
