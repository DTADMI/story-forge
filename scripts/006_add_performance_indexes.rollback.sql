-- 006_add_performance_indexes.rollback.sql
-- Rollback: Drops performance indexes added in 006

DROP INDEX IF EXISTS idx_characters_user_id;
DROP INDEX IF EXISTS idx_locations_user_id;
DROP INDEX IF EXISTS idx_timeline_events_user_id;
DROP INDEX IF EXISTS idx_dialogues_user_id;
DROP INDEX IF EXISTS idx_progress_log_user_ts;
DROP INDEX IF EXISTS idx_goals_user_id;
DROP INDEX IF EXISTS idx_user_badges_user_id;
DROP INDEX IF EXISTS idx_projects_user_updated;
DROP INDEX IF EXISTS idx_characters_fts;
DROP INDEX IF EXISTS idx_locations_fts;
DROP INDEX IF EXISTS idx_organizations_fts;
DROP INDEX IF EXISTS idx_species_fts;
DROP INDEX IF EXISTS idx_timeline_events_fts;
DROP INDEX IF EXISTS idx_encyclopedia_fts;
DROP INDEX IF EXISTS idx_feature_flags_category;
