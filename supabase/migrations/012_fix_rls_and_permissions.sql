-- 012_fix_rls_and_permissions.sql
-- Adds missing RLS to tables created by migration 010
-- Fixes check_rate_limit RPC permissions so the anon key can use it

-- ============================================================
-- Enable RLS on tables that lack it
-- ============================================================

ALTER TABLE IF EXISTS public.rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages rate limits" ON public.rate_limits;
CREATE POLICY "Service role manages rate limits"
  ON public.rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.app_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages cache" ON public.app_cache;
CREATE POLICY "Service role manages cache"
  ON public.app_cache FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE IF EXISTS public.account_lockouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages lockouts" ON public.account_lockouts;
CREATE POLICY "Service role manages lockouts"
  ON public.account_lockouts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Grant check_rate_limit RPC access to authenticated + anon roles
-- (Migration 010 revoked from PUBLIC/anon/authenticated, breaking the PG rate-limit path)
-- ============================================================

GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO authenticated;

-- ============================================================
-- Grant check_account_lockout RPC access to authenticated role
-- ============================================================

GRANT EXECUTE ON FUNCTION public.check_account_lockout(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_account_lockout(TEXT) TO anon;
