-- 002_create_app_tables.sql
-- Core application tables for StoryForge

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  content       TEXT,
  genre         TEXT,
  is_public     BOOLEAN NOT NULL DEFAULT false,
  word_count    INTEGER NOT NULL DEFAULT 0,
  default_scope TEXT NOT NULL DEFAULT 'PRIVATE',
  settings      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Public projects are viewable"
  ON public.projects FOR SELECT
  USING (is_public = true OR default_scope = 'PUBLIC_ANYONE');

-- Characters
CREATE TABLE IF NOT EXISTS public.characters (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id  TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  bio         TEXT,
  traits      TEXT,
  quirks      TEXT,
  image_url   TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own characters"
  ON public.characters FOR ALL
  USING (auth.uid() = user_id);

-- Locations
CREATE TABLE IF NOT EXISTS public.locations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id  TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  description TEXT,
  map_url     TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own locations"
  ON public.locations FOR ALL
  USING (auth.uid() = user_id);

-- Timeline Events
CREATE TABLE IF NOT EXISTS public.timeline_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id  TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  date        TEXT,
  description TEXT,
  dialogue_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own timeline events"
  ON public.timeline_events FOR ALL
  USING (auth.uid() = user_id);

-- Dialogues
CREATE TABLE IF NOT EXISTS public.dialogues (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  project_id  TEXT REFERENCES public.projects(id) ON DELETE SET NULL,
  title       TEXT,
  content     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dialogues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dialogues"
  ON public.dialogues FOR ALL
  USING (auth.uid() = user_id);

-- Follows
CREATE TABLE IF NOT EXISTS public.follows (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  follower_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  followee_id  UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, followee_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own follows"
  ON public.follows FOR ALL
  USING (auth.uid() = follower_id);

CREATE POLICY "Users can see who follows them"
  ON public.follows FOR SELECT
  USING (auth.uid() = followee_id);

-- Groups
CREATE TABLE IF NOT EXISTS public.groups (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  description TEXT,
  is_private  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can see public groups"
  ON public.groups FOR SELECT
  USING (is_private = false);

-- Feature flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  type        TEXT NOT NULL DEFAULT 'boolean',
  enabled     BOOLEAN NOT NULL DEFAULT false,
  value       JSONB NOT NULL DEFAULT 'false'::jsonb,
  category    TEXT NOT NULL DEFAULT 'core',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Feature flags are readable by everyone"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to all tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'feature_flags'
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      tbl
    );
  END LOOP;
END $$;
