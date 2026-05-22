-- 004_create_messages_notifications.rollback.sql
-- Rollback: Removes notifications and messages tables

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
