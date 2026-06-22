-- 013_add_missing_columns_and_tables.sql
-- Adds DB columns present in Prisma schema but missing from Supabase migrations
-- Creates junction tables for implicit many-to-many relations

-- ============================================================
-- Project additions
-- ============================================================
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS panel_count INTEGER NOT NULL DEFAULT 0;

-- ============================================================
-- Character / Location / TimelineEvent / Organization / Species — shared content
-- ============================================================
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.characters ADD COLUMN IF NOT EXISTS shared_from_project_id TEXT;

ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS shared_from_project_id TEXT;

ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS shared_from_project_id TEXT;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS era_id TEXT;
ALTER TABLE public.timeline_events ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS shared_from_project_id TEXT;

ALTER TABLE public.species ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.species ADD COLUMN IF NOT EXISTS shared_from_project_id TEXT;

-- ============================================================
-- Notification — entity_type
-- ============================================================
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;

-- ============================================================
-- TimelineEvent ↔ Character junction table
-- ============================================================
CREATE TABLE IF NOT EXISTS public._TimelineEventToCharacter (
  "A" TEXT NOT NULL REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);

ALTER TABLE public._TimelineEventToCharacter ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage timeline-character links"
  ON public._TimelineEventToCharacter FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.timeline_events WHERE id = "A" AND user_id = auth.uid())
  );

-- ============================================================
-- TimelineEvent ↔ Location junction table
-- ============================================================
CREATE TABLE IF NOT EXISTS public._TimelineEventToLocation (
  "A" TEXT NOT NULL REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  "B" TEXT NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  PRIMARY KEY ("A", "B")
);

ALTER TABLE public._TimelineEventToLocation ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage timeline-location links"
  ON public._TimelineEventToLocation FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.timeline_events WHERE id = "A" AND user_id = auth.uid())
  );
