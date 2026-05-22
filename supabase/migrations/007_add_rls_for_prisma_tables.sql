-- 007_add_rls_for_prisma_tables.sql
-- Adds RLS policies for tables created by Prisma Migrate that lack Supabase RLS.
-- Uses IF EXISTS / IF NOT EXISTS to be idempotent.

-- ============================================================
-- Gamification tables
-- ============================================================

-- InkPot: one-to-one with User
ALTER TABLE IF EXISTS public."InkPot" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own ink pot"
  ON public."InkPot" FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY IF NOT EXISTS "Users can update own ink pot"
  ON public."InkPot" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- InkTx: user's transaction history
ALTER TABLE IF EXISTS public."InkTx" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own ink transactions"
  ON public."InkTx" FOR SELECT
  USING (auth.uid()::text = "userId");

-- Goal: user's writing goals
ALTER TABLE IF EXISTS public."Goal" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own goals"
  ON public."Goal" FOR ALL
  USING (auth.uid()::text = "userId");

-- ProgressLog: user's writing progress
ALTER TABLE IF EXISTS public."ProgressLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own progress logs"
  ON public."ProgressLog" FOR SELECT
  USING (auth.uid()::text = "userId");
CREATE POLICY IF NOT EXISTS "Users can insert own progress logs"
  ON public."ProgressLog" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- Badge: system-defined, readable by everyone
ALTER TABLE IF EXISTS public."Badge" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Badges are readable by everyone"
  ON public."Badge" FOR SELECT
  USING (true);

-- UserBadge: user's earned badges
ALTER TABLE IF EXISTS public."UserBadge" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own badges"
  ON public."UserBadge" FOR SELECT
  USING (auth.uid()::text = "userId");

-- ============================================================
-- Social tables
-- ============================================================

-- Comment: project-scoped, threaded
ALTER TABLE IF EXISTS public."Comment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Project viewers can read comments"
  ON public."Comment" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "Comment"."projectId"
      AND ("isPublic" = true OR "defaultScope" = 'PUBLIC_ANYONE' OR "userId" = auth.uid()::text)
    )
  );
CREATE POLICY IF NOT EXISTS "Authenticated users can insert comments"
  ON public."Comment" FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");
CREATE POLICY IF NOT EXISTS "Comment author or project owner can delete"
  ON public."Comment" FOR DELETE
  USING (
    auth.uid()::text = "userId"
    OR EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "Comment"."projectId" AND "userId" = auth.uid()::text
    )
  );
CREATE POLICY IF NOT EXISTS "Comment author can update own comment"
  ON public."Comment" FOR UPDATE
  USING (auth.uid()::text = "userId");

-- ProjectVersion: project version history
ALTER TABLE IF EXISTS public."ProjectVersion" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Project owners and collaborators can read versions"
  ON public."ProjectVersion" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "ProjectVersion"."projectId"
      AND ("userId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public."ProjectCollaborator"
          WHERE "projectId" = "ProjectVersion"."projectId" AND "userId" = auth.uid()::text
        ))
    )
  );
CREATE POLICY IF NOT EXISTS "Project owners and collaborators can insert versions"
  ON public."ProjectVersion" FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "ProjectVersion"."projectId"
      AND ("userId" = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public."ProjectCollaborator"
          WHERE "projectId" = "ProjectVersion"."projectId" AND "userId" = auth.uid()::text
        ))
    )
  );

-- GroupMember: group membership
ALTER TABLE IF EXISTS public."GroupMember" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Group members can view membership"
  ON public."GroupMember" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."GroupMember" gm
      WHERE gm."groupId" = "GroupMember"."groupId" AND gm."userId" = auth.uid()::text
    )
  );
CREATE POLICY IF NOT EXISTS "Users can leave groups"
  ON public."GroupMember" FOR DELETE
  USING ("userId" = auth.uid()::text);

-- UserBlock: user blocking
ALTER TABLE IF EXISTS public."UserBlock" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own blocks"
  ON public."UserBlock" FOR ALL
  USING (auth.uid()::text = "blockerId");

-- ProjectFavorite: project bookmarks
ALTER TABLE IF EXISTS public."ProjectFavorite" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own favorites"
  ON public."ProjectFavorite" FOR ALL
  USING (auth.uid()::text = "userId");

-- ProjectVote: project voting
ALTER TABLE IF EXISTS public."ProjectVote" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own votes"
  ON public."ProjectVote" FOR ALL
  USING (auth.uid()::text = "userId");
CREATE POLICY IF NOT EXISTS "Project owners can view votes on their projects"
  ON public."ProjectVote" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "ProjectVote"."projectId" AND "userId" = auth.uid()::text
    )
  );

-- ============================================================
-- World-building tables
-- ============================================================

-- EncyclopediaEntry: world encyclopedia
ALTER TABLE IF EXISTS public."EncyclopediaEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own encyclopedia entries"
  ON public."EncyclopediaEntry" FOR ALL
  USING (auth.uid()::text = "userId");

-- Organization: factions/organizations
ALTER TABLE IF EXISTS public."Organization" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own organizations"
  ON public."Organization" FOR ALL
  USING (auth.uid()::text = "userId");

-- Species: races/species
ALTER TABLE IF EXISTS public."Species" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own species"
  ON public."Species" FOR ALL
  USING (auth.uid()::text = "userId");

-- Calendar: custom calendar systems
ALTER TABLE IF EXISTS public."Calendar" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own calendars"
  ON public."Calendar" FOR ALL
  USING (auth.uid()::text = "userId");

-- CalendarMonth: months within a calendar
ALTER TABLE IF EXISTS public."CalendarMonth" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Calendar owners can manage months"
  ON public."CalendarMonth" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."Calendar"
      WHERE id = "CalendarMonth"."calendarId" AND "userId" = auth.uid()::text
    )
  );

-- Era: timeline eras/periods
ALTER TABLE IF EXISTS public."Era" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own eras"
  ON public."Era" FOR ALL
  USING (auth.uid()::text = "userId");

-- CharacterRelationship: typed character connections
ALTER TABLE IF EXISTS public."CharacterRelationship" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Character owners can manage relationships"
  ON public."CharacterRelationship" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."Character"
      WHERE id = "CharacterRelationship"."characterId" AND "userId" = auth.uid()::text
    )
  );

-- ProjectCollaborator: project collaboration
ALTER TABLE IF EXISTS public."ProjectCollaborator" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Project owners can manage collaborators"
  ON public."ProjectCollaborator" FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public."Project"
      WHERE id = "ProjectCollaborator"."projectId" AND "userId" = auth.uid()::text
    )
  );
CREATE POLICY IF NOT EXISTS "Collaborators can view collaboration info"
  ON public."ProjectCollaborator" FOR SELECT
  USING ("userId" = auth.uid()::text);

-- ============================================================
-- Competition tables
-- ============================================================

-- Competition: writing competitions
ALTER TABLE IF EXISTS public."Competition" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Competitions are readable by everyone"
  ON public."Competition" FOR SELECT
  USING (true);

-- CompetitionEntry: competition submissions
ALTER TABLE IF EXISTS public."CompetitionEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can manage own competition entries"
  ON public."CompetitionEntry" FOR ALL
  USING ("userId" = auth.uid()::text);
CREATE POLICY IF NOT EXISTS "Competition creators can view entries"
  ON public."CompetitionEntry" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."Competition"
      WHERE id = "CompetitionEntry"."competitionId" AND "createdBy" = auth.uid()::text
    )
  );

-- ============================================================
-- Legacy NextAuth tables (read-only for data compatibility)
-- ============================================================

ALTER TABLE IF EXISTS public."Account" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own accounts"
  ON public."Account" FOR SELECT
  USING ("userId" = auth.uid()::text);

ALTER TABLE IF EXISTS public."Session" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can read own sessions"
  ON public."Session" FOR SELECT
  USING ("userId" = auth.uid()::text);

ALTER TABLE IF EXISTS public."VerificationToken" ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "System can manage verification tokens"
  ON public."VerificationToken" FOR ALL
  USING (true);

-- Note: Activities and GroupMember tables are covered by migration 005.
-- If tables were created by Prisma with different casing, use CREATE POLICY IF NOT EXISTS.
