-- 002_create_app_tables.rollback.sql
-- Rollback: Removes core application tables and updated_at trigger

DROP FUNCTION IF EXISTS public.set_updated_at() CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;
DROP TABLE IF EXISTS public.groups CASCADE;
DROP TABLE IF EXISTS public.follows CASCADE;
DROP TABLE IF EXISTS public.dialogues CASCADE;
DROP TABLE IF EXISTS public.timeline_events CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;
DROP TABLE IF EXISTS public.characters CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
