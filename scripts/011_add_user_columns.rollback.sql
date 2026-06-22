-- 011_add_user_columns.rollback.sql
-- Rollback migration 011

\set ON_ERROR_STOP on

\echo '=== Rolling BACK migration 011: add_user_columns ==='

BEGIN;

-- Restore the original handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, name, image, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL),
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$;

-- Drop columns added by this migration (optional — commented out for safety)
-- ALTER TABLE public.users DROP COLUMN IF EXISTS email;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS email_verified;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS password_hash;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS role;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_tier;
-- ALTER TABLE public.users DROP COLUMN IF EXISTS subscription_expires_at;

\echo '=== Migration 011 rollback complete ==='

COMMIT;
