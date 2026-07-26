-- 011_add_user_columns.rollout.sql
-- Apply migration 011

\set ON_ERROR_STOP on

\echo '=== Rolling OUT migration 011: add_user_columns ==='

BEGIN;

\i supabase/migrations/011_add_user_columns.sql

\echo '=== Migration 011 rollout complete ==='

COMMIT;