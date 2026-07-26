-- 006_add_performance_indexes.rollout.sql
-- Rollout: Adds performance indexes and full-text search indexes

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_user_id ON public.dialogues(user_id);

CREATE INDEX IF NOT EXISTS idx_progress_log_user_ts ON public.progress_logs(user_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON public.projects(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_characters_fts ON public.characters
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio, '')));

CREATE INDEX IF NOT EXISTS idx_locations_fts ON public.locations
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_organizations_fts ON public.organizations
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_species_fts ON public.species
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_timeline_events_fts ON public.timeline_events
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

CREATE INDEX IF NOT EXISTS idx_encyclopedia_fts ON public.encyclopedia_entries
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON public.feature_flags(category);