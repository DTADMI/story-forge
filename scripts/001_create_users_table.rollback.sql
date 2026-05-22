-- 001_create_users_table.rollback.sql
-- Rollback: Removes the public.users table and associated trigger/function

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.users CASCADE;
