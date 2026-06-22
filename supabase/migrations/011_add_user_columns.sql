-- 011_add_user_columns.sql
-- Adds missing columns to public.users to align with Prisma User model

-- Auth-related columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Role and subscription
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'reader';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Ensure uniqueness constraint on email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_email_key'
  ) THEN
    CREATE UNIQUE INDEX users_email_key ON public.users(email) WHERE email IS NOT NULL;
  END IF;
END $$;

-- Update handle_new_user trigger to populate new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    name,
    email,
    email_verified,
    image,
    role,
    subscription_tier,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email),
    NEW.email,
    NEW.email_confirmed_at,
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NULL),
    'reader',
    'free',
    NEW.created_at,
    NEW.created_at
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Security: revoke public execute, grant to service_role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
