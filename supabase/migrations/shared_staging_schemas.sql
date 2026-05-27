-- Shared Staging Database: story-forge-staging (CONSOLIDATED)
-- Supabase ref: luxjwdodinxvpfbmfzyu
--
-- This Supabase project is the consolidated shared staging host for all
-- staging-only Nebula Forge apps. See shared_staging_schemas_upgrade.sql
-- for the full list of app schemas.
--
-- App schemas:
--   public          → StoryForge (host app)
--   librakeeper     → LibraKeeper
--   nebulaforgeweb  → NebulaForgeWeb
--   velvetgalaxy    → Velvet Galaxy
--   collectometal   → CollectoMetal
--   gamehub         → GameHub
--   private         → Admin-only views (shared, not exposed to Data API)
--
-- Each app connects to the SAME Supabase URL but uses a different schema.
-- Auth (auth.users) is shared across all schemas (acceptable for staging).
--
-- Supabase client configuration for non-public schemas:
--
--   import { createClient } from "@supabase/supabase-js";
--   const supabase = createClient(url, anonKey, {
--     db: { schema: "<app-schema>" }
--   });
--
-- For Prisma, set the schema in schema.prisma:
--   datasource db {
--     provider  = "postgresql"
--     url       = env("DATABASE_URL")
--     schemas   = ["<app-schema>"]
--   }
--
-- See: docs/technical/portfolio-staging-and-promotion-runbook.md
-- See: docs/technical/portfolio-staging-migration-backlog.md

-- ============================================================
-- LibraKeeper Schema (seed tables for Supabase-managed objects)
-- ============================================================
CREATE SCHEMA IF NOT EXISTS librakeeper;

-- Feature flags table (seed structure for Supabase-based flags)
CREATE TABLE IF NOT EXISTS librakeeper."FeatureFlag" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE librakeeper."FeatureFlag" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- NebulaForgeWeb Schema (seed tables for Supabase-managed objects)
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
