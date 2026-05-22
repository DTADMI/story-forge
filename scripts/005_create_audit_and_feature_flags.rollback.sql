-- 005_create_audit_and_feature_flags.rollback.sql
-- Rollback: Removes audit events, activity/group RLS policies

DROP POLICY IF EXISTS "Users can read own audit events" ON public.audit_events;
DROP POLICY IF EXISTS "Users can insert own audit events" ON public.audit_events;
DROP POLICY IF EXISTS "Users can read own and followed activities" ON public.activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON public.activities;
DROP POLICY IF EXISTS "Members can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Members can update owned groups" ON public.groups;
DROP TABLE IF EXISTS public.audit_events CASCADE;
