-- Shared Staging Database Upgrade: story-forge-staging
-- Supabase ref: luxjwdodinxvpfbmfzyu
--
-- This file adds the missing app schemas to make story-forge-staging the
-- consolidated shared staging host for all staging-only Nebula Forge apps.
--
-- See: docs/technical/portfolio-staging-and-promotion-runbook.md
-- See: docs/technical/portfolio-staging-migration-backlog.md

-- ============================================================
-- Current schemas (already exist):
--   public          → StoryForge (default/host)
--   librakeeper     → LibraKeeper
--   nebulaforgeweb  → NebulaForgeWeb
-- ============================================================

-- ============================================================
-- Velvet Galaxy Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS velvetgalaxy;

GRANT USAGE ON SCHEMA velvetgalaxy TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA velvetgalaxy TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA velvetgalaxy TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA velvetgalaxy GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA velvetgalaxy GRANT ALL ON SEQUENCES TO anon, authenticated;

COMMENT ON SCHEMA velvetgalaxy IS 'Velvet Galaxy staging tables';

-- ============================================================
-- CollectoMetal Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS collectometal;

GRANT USAGE ON SCHEMA collectometal TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA collectometal TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA collectometal TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collectometal GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA collectometal GRANT ALL ON SEQUENCES TO anon, authenticated;

COMMENT ON SCHEMA collectometal IS 'CollectoMetal staging tables';

-- ============================================================
-- GameHub Schema
-- ============================================================
CREATE SCHEMA IF NOT EXISTS gamehub;

GRANT USAGE ON SCHEMA gamehub TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA gamehub TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA gamehub TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gamehub GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA gamehub GRANT ALL ON SEQUENCES TO anon, authenticated;

COMMENT ON SCHEMA gamehub IS 'GameHub staging tables';

-- ============================================================
-- Guardrails
-- ============================================================

-- Private schema for admin-only views (shared across all apps)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
COMMENT ON SCHEMA private IS 'Admin-only views — not exposed to Data API';

-- ============================================================
-- App Schemas Summary
-- ============================================================
-- After applying this migration, the schemas are:
--
--   public          → StoryForge (host)
--   librakeeper     → LibraKeeper
--   nebulaforgeweb  → NebulaForgeWeb
--   velvetgalaxy    → Velvet Galaxy
--   collectometal   → CollectoMetal
--   gamehub         → GameHub
--   private         → Admin-only views (shared)
--
-- Apps connecting to non-public schemas must configure:
--
--   const supabase = createClient(url, anonKey, {
--     db: { schema: "<app-schema>" }
--   });
--
-- The following remain project-wide (not schema-isolated):
--   auth.users, Auth config, redirect URLs, email templates,
--   project API keys, storage service, Edge Functions
