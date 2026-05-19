-- 005_create_audit_and_feature_flags.sql
-- Adds audit_events table (missed from 002) and feature_flags RLS

-- Audit events table (records security-sensitive operations)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  entity_id   TEXT,
  entity_type TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Users can read their own audit events
CREATE POLICY "Users can read own audit events"
  ON public.audit_events FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own audit events (triggered by app logic)
CREATE POLICY "Users can insert own audit events"
  ON public.audit_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_audit_user_created
  ON public.audit_events(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_audit_action_created
  ON public.audit_events(action, created_at);

-- Feature flags table (if not already created by 002)
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

-- Everyone can read feature flags (needed for client-side flag checks)
CREATE POLICY "Everyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Activity table RLS (created by Prisma, needs RLS policy)
ALTER TABLE IF EXISTS public.activities ENABLE ROW LEVEL SECURITY;

-- Users can read activities of people they follow + their own
CREATE POLICY IF NOT EXISTS "Users can read own and followed activities"
  ON public.activities FOR SELECT
  USING (
    auth.uid() = user_id
    OR user_id IN (
      SELECT followee_id FROM public.follows WHERE follower_id = auth.uid()
    )
  );

-- Users can insert their own activities
CREATE POLICY IF NOT EXISTS "Users can insert own activities"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Groups RLS: members can manage, anyone can view public groups
-- (extends the minimal RLS from 002)
CREATE POLICY IF NOT EXISTS "Members can insert groups"
  ON public.groups FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Members can update owned groups"
  ON public.groups FOR UPDATE
  USING (
    id IN (
      SELECT group_id FROM public.group_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
