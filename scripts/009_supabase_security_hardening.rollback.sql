-- 009_supabase_security_hardening.rollback.sql
-- Restores direct execution on the signup trigger helper.

DO $$
BEGIN
  IF to_regprocedure('public.handle_new_user()') IS NULL THEN
    RETURN;
  END IF;

  GRANT EXECUTE ON FUNCTION public.handle_new_user() TO PUBLIC;
END $$;
