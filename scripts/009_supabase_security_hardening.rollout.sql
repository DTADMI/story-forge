-- 009_supabase_security_hardening.rollout.sql
-- Tightens public SECURITY DEFINER exposure for trigger-only helpers.

DO $$
DECLARE
  fn_signature TEXT;
BEGIN
  FOREACH fn_signature IN ARRAY ARRAY[
    'public.handle_new_user()'
  ]
  LOOP
    IF to_regprocedure(fn_signature) IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn_signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', fn_signature);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', fn_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', fn_signature);
  END LOOP;
END $$;
