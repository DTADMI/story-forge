-- Migration 012: PostgreSQL Redis Substitution Layer (StoryForge)
-- Replaces Upstash Redis for rate limiting, feature flags, caching, and
-- account lockout. PostgreSQL (already paid via Supabase) covers ~80% of
-- Redis use-cases at zero extra cost (see docs/technical/self-hosting-guide.md
-- and docs/technical/redis-to-postgres-strategy.md).
--
-- Idempotent per NF migration rules (IF NOT EXISTS / OR REPLACE).

-- 1. Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limits (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  route TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits (identifier, route, window_start);

-- 2. Feature Flags Table (source of truth; Redis was only an L1 cache)
CREATE TABLE IF NOT EXISTS feature_flags (
  name TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  type TEXT NOT NULL DEFAULT 'boolean',
  value JSONB,
  rules JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Default all flags to PostgreSQL-backed (Redis is opt-in via `redis_*` flags
-- or the REDIS_* env vars). Keeps parity with the code's `shouldUseRedis*()`
-- dispatch which defaults to PG when these are disabled.
INSERT INTO feature_flags (name, enabled, type, value) VALUES
  ('redis_rate_limit', false, 'boolean', 'false'),
  ('redis_cache', false, 'boolean', 'false'),
  ('redis_lockout', false, 'boolean', 'false'),
  ('redis_sessions', false, 'boolean', 'false'),
  ('redis_pubsub', false, 'boolean', 'false'),
  ('redis_leaderboard', false, 'boolean', 'false'),
  ('redis_feature_flags', false, 'boolean', 'false'),
  ('pg_rate_limit', true, 'boolean', 'true'),
  ('pg_cache', true, 'boolean', 'true'),
  ('pg_lockout', true, 'boolean', 'true'),
  ('pg_pubsub', true, 'boolean', 'true')
ON CONFLICT (name) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags (enabled) WHERE enabled = true;

-- 3. Application Cache Table (KV + TTL, replaces Redis cache)
CREATE TABLE IF NOT EXISTS app_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_app_cache_expires_at ON app_cache (expires_at);

-- 4. Account Lockout Table (replaces Redis lockout keys)
CREATE TABLE IF NOT EXISTS account_lockouts (
  email_hash TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 1,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts (locked_until);

-- 5. Rate Limit Check Function (atomic, service_role only)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_route TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INTEGER;
  v_allowed BOOLEAN;
  v_remaining INTEGER;
  v_oldest TIMESTAMPTZ;
  v_reset_at TIMESTAMPTZ;
BEGIN
  v_window_start := NOW() - (p_window_seconds || ' seconds')::INTERVAL;

  -- Prune expired window rows.
  DELETE FROM rate_limits
  WHERE identifier = p_identifier
    AND route = p_route
    AND window_start < v_window_start;

  -- Count rows still in the window.
  SELECT COUNT(*) INTO v_count
  FROM rate_limits
  WHERE identifier = p_identifier
    AND route = p_route
    AND window_start >= v_window_start;

  -- Only record the request if under the limit. Blocked requests do NOT insert,
  -- preventing unbounded table growth under a flood (an attacker sending 10k
  -- requests must not create 10k rows). Small race under concurrent bursts is
  -- acceptable for this app tier (Supabase also provides upstream DDoS guards).
  IF v_count < p_max_requests THEN
    INSERT INTO rate_limits (identifier, route, window_start)
    VALUES (p_identifier, p_route, NOW());
    v_count := v_count + 1;
    v_allowed := true;
  ELSE
    v_allowed := false;
  END IF;

  v_remaining := GREATEST(0, p_max_requests - v_count);

  SELECT MIN(window_start) INTO v_oldest
  FROM rate_limits
  WHERE identifier = p_identifier
    AND route = p_route
    AND window_start >= v_window_start;

  IF v_oldest IS NOT NULL THEN
    v_reset_at := v_oldest + (p_window_seconds || ' seconds')::INTERVAL;
  ELSE
    v_reset_at := NOW() + (p_window_seconds || ' seconds')::INTERVAL;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'resetAt', floor(EXTRACT(EPOCH FROM v_reset_at))
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text,text,integer,integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text,text,integer,integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text,text,integer,integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text,text,integer,integer) TO service_role;

-- 6. Cleanup Function (run via pg_cron or manual)
CREATE OR REPLACE FUNCTION cleanup_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '2 hours';
  DELETE FROM account_lockouts WHERE locked_until IS NOT NULL AND locked_until < NOW();
  DELETE FROM app_cache WHERE expires_at < NOW();
END;
$$;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;

-- 7. Account Lockout Functions
CREATE OR REPLACE FUNCTION check_account_lockout(p_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
  v_hash TEXT;
  v_lockout RECORD;
  v_max_attempts INTEGER := 5;
BEGIN
  v_hash := encode(digest(p_email, 'sha256'), 'hex');
  SELECT * INTO v_lockout FROM account_lockouts WHERE email_hash = v_hash;
  IF v_lockout.locked_until IS NOT NULL AND v_lockout.locked_until > NOW() THEN
    RETURN jsonb_build_object('locked', true, 'remainingAttempts', 0, 'lockedUntil', v_lockout.locked_until);
  END IF;
  RETURN jsonb_build_object('locked', false, 'remainingAttempts', v_max_attempts - COALESCE(v_lockout.failed_attempts, 0));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.check_account_lockout(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_account_lockout(text) TO service_role;

CREATE OR REPLACE FUNCTION record_failed_attempt(p_email TEXT, p_lockout_seconds INTEGER DEFAULT 900)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
  v_hash TEXT;
  v_attempts INTEGER;
  v_max_attempts INTEGER := 5;
  v_locked BOOLEAN;
BEGIN
  v_hash := encode(digest(p_email, 'sha256'), 'hex');
  INSERT INTO account_lockouts (email_hash, failed_attempts)
  VALUES (v_hash, 1)
  ON CONFLICT (email_hash) DO UPDATE SET failed_attempts = account_lockouts.failed_attempts + 1
  RETURNING failed_attempts INTO v_attempts;
  IF v_attempts >= v_max_attempts THEN
    UPDATE account_lockouts SET locked_until = NOW() + (p_lockout_seconds || ' seconds')::INTERVAL WHERE email_hash = v_hash;
    v_locked := true;
  ELSE
    v_locked := false;
  END IF;
  RETURN jsonb_build_object('locked', v_locked, 'attempts', v_attempts, 'remaining', GREATEST(0, v_max_attempts - v_attempts));
END;
$$;
REVOKE EXECUTE ON FUNCTION public.record_failed_attempt(text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_failed_attempt(text,integer) TO service_role;

CREATE OR REPLACE FUNCTION reset_account_lockout(p_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
AS $$
DECLARE
  v_hash TEXT;
BEGIN
  v_hash := encode(digest(p_email, 'sha256'), 'hex');
  DELETE FROM account_lockouts WHERE email_hash = v_hash;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.reset_account_lockout(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_account_lockout(text) TO service_role;

-- 8. Feature flag change notification trigger (LISTEN/NOTIFY wake-up)
CREATE OR REPLACE FUNCTION notify_feature_flag_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NOTIFY feature_flags_changed;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_feature_flags_changed ON feature_flags;
CREATE TRIGGER trg_feature_flags_changed
  AFTER INSERT OR UPDATE OR DELETE ON feature_flags
  FOR EACH STATEMENT
  EXECUTE FUNCTION notify_feature_flag_change();
