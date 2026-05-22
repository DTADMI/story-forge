-- 007_add_rls_for_prisma_tables.rollback.sql
-- Rollback: Drops all RLS policies added in migration 007.
-- Does NOT drop tables (those are managed by Prisma Migrate).

-- Gamification
DROP POLICY IF EXISTS "Users can read own ink pot" ON public."InkPot";
DROP POLICY IF EXISTS "Users can update own ink pot" ON public."InkPot";
DROP POLICY IF EXISTS "Users can read own ink transactions" ON public."InkTx";
DROP POLICY IF EXISTS "Users can manage own goals" ON public."Goal";
DROP POLICY IF EXISTS "Users can read own progress logs" ON public."ProgressLog";
DROP POLICY IF EXISTS "Users can insert own progress logs" ON public."ProgressLog";
DROP POLICY IF EXISTS "Badges are readable by everyone" ON public."Badge";
DROP POLICY IF EXISTS "Users can read own badges" ON public."UserBadge";

-- Social
DROP POLICY IF EXISTS "Project viewers can read comments" ON public."Comment";
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public."Comment";
DROP POLICY IF EXISTS "Comment author or project owner can delete" ON public."Comment";
DROP POLICY IF EXISTS "Comment author can update own comment" ON public."Comment";
DROP POLICY IF EXISTS "Project owners and collaborators can read versions" ON public."ProjectVersion";
DROP POLICY IF EXISTS "Project owners and collaborators can insert versions" ON public."ProjectVersion";
DROP POLICY IF EXISTS "Group members can view membership" ON public."GroupMember";
DROP POLICY IF EXISTS "Users can leave groups" ON public."GroupMember";
DROP POLICY IF EXISTS "Users can manage own blocks" ON public."UserBlock";
DROP POLICY IF EXISTS "Users can manage own favorites" ON public."ProjectFavorite";
DROP POLICY IF EXISTS "Users can manage own votes" ON public."ProjectVote";
DROP POLICY IF EXISTS "Project owners can view votes on their projects" ON public."ProjectVote";

-- World-building
DROP POLICY IF EXISTS "Users can manage own encyclopedia entries" ON public."EncyclopediaEntry";
DROP POLICY IF EXISTS "Users can manage own organizations" ON public."Organization";
DROP POLICY IF EXISTS "Users can manage own species" ON public."Species";
DROP POLICY IF EXISTS "Users can manage own calendars" ON public."Calendar";
DROP POLICY IF EXISTS "Calendar owners can manage months" ON public."CalendarMonth";
DROP POLICY IF EXISTS "Users can manage own eras" ON public."Era";
DROP POLICY IF EXISTS "Character owners can manage relationships" ON public."CharacterRelationship";
DROP POLICY IF EXISTS "Project owners can manage collaborators" ON public."ProjectCollaborator";
DROP POLICY IF EXISTS "Collaborators can view collaboration info" ON public."ProjectCollaborator";

-- Competition
DROP POLICY IF EXISTS "Competitions are readable by everyone" ON public."Competition";
DROP POLICY IF EXISTS "Users can manage own competition entries" ON public."CompetitionEntry";
DROP POLICY IF EXISTS "Competition creators can view entries" ON public."CompetitionEntry";

-- Legacy
DROP POLICY IF EXISTS "Users can read own accounts" ON public."Account";
DROP POLICY IF EXISTS "Users can read own sessions" ON public."Session";
DROP POLICY IF EXISTS "System can manage verification tokens" ON public."VerificationToken";
