-- 006_add_performance_indexes.sql
-- Adds missing indexes identified in performance audit to prevent full table scans

-- Indexes for world-building entity queries by userId (prevents full table scans on world page)
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX IF NOT EXISTS idx_dialogues_user_id ON public.dialogues(user_id);

-- Indexes for stats/streak queries (sorted by timestamp within a user)
CREATE INDEX IF NOT EXISTS idx_progress_log_user_ts ON public.progress_logs(user_id, "timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- Index for project listing by userId sorted by updatedAt
CREATE INDEX IF NOT EXISTS idx_projects_user_updated ON public.projects(user_id, updated_at DESC);

-- Full-text search indexes using PostgreSQL tsvector
-- Characters: searchable on name and bio
CREATE INDEX IF NOT EXISTS idx_characters_fts ON public.characters
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(bio, '')));

-- Locations: searchable on name and description
CREATE INDEX IF NOT EXISTS idx_locations_fts ON public.locations
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Organizations: searchable on name and description
CREATE INDEX IF NOT EXISTS idx_organizations_fts ON public.organizations
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Species: searchable on name and description
CREATE INDEX IF NOT EXISTS idx_species_fts ON public.species
  USING gin (to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '')));

-- Timeline events: searchable on title and description
CREATE INDEX IF NOT EXISTS idx_timeline_events_fts ON public.timeline_events
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Encyclopedia: searchable on title and content
CREATE INDEX IF NOT EXISTS idx_encyclopedia_fts ON public.encyclopedia_entries
  USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

-- Index for feature_flags lookup by category
CREATE INDEX IF NOT EXISTS idx_feature_flags_category ON public.feature_flags(category);
