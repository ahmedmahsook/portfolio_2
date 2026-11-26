-- ==============================================================================
-- INCREMENTAL MIGRATION: ADD SOURCE_TYPE & RATE LIMITING
-- File: supabase-migration-incremental.sql
-- Applies cleanly to an existing Supabase database without dropping tables
-- ==============================================================================

-- 1. Add source_type column to public.portfolio_videos if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'portfolio_videos' 
          AND column_name = 'source_type'
    ) THEN
        ALTER TABLE public.portfolio_videos 
        ADD COLUMN source_type TEXT NOT NULL DEFAULT 'cloudinary' 
        CHECK (source_type IN ('cloudinary', 'local'));
    END IF;
END $$;

-- 2. Backfill existing records:
-- 15 Cloudinary records -> 'cloudinary'
-- 6 Local records -> 'local'
UPDATE public.portfolio_videos
SET source_type = 'local'
WHERE cloudinary_public_id LIKE 'local/%' 
   OR video_url LIKE '/video/%';

UPDATE public.portfolio_videos
SET source_type = 'cloudinary'
WHERE cloudinary_public_id LIKE 'portfolio/%'
  AND source_type != 'cloudinary';

-- 3. Document synthetic identifiers for local assets:
COMMENT ON COLUMN public.portfolio_videos.cloudinary_public_id IS 
'Unique identifier for the video asset. For Cloudinary-hosted assets, this is the actual Cloudinary public_id (e.g., portfolio/new1). For locally hosted assets, this contains a synthetic namespace prefix (local/<filename>) used solely as an internal unique key; it must NEVER be passed to Cloudinary Admin or Delivery APIs.';

COMMENT ON COLUMN public.portfolio_videos.source_type IS 
'Identifies whether the video is hosted on Cloudinary (cloudinary) or locally inside /public/video/ (local). Must be checked before performing storage or CDN operations.';

-- 4. Create table for atomic server-side rate limiting
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    ip_hash TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 1,
    locked_until TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for automatic or periodic cleanup of expired rate-limit records
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_cleanup 
    ON public.auth_rate_limits (last_attempt_at);

-- RLS: Only service_role can read/write auth_rate_limits
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on auth_rate_limits" ON public.auth_rate_limits;
CREATE POLICY "Service role full access on auth_rate_limits"
    ON public.auth_rate_limits
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Atomic PostgreSQL Function (RPC) for login attempt check and record
-- Prevents race conditions under concurrent requests via pg_advisory_xact_lock
-- Uses fixed search_path = public, pg_temp to prevent search_path hijacking
CREATE OR REPLACE FUNCTION public.check_and_record_login_attempt(
    p_ip_hash TEXT,
    p_max_attempts INTEGER DEFAULT 5,
    p_lockout_seconds INTEGER DEFAULT 900
)
RETURNS TABLE (
    allowed BOOLEAN,
    wait_seconds INTEGER,
    attempts INTEGER,
    locked BOOLEAN
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_record public.auth_rate_limits%ROWTYPE;
    v_now TIMESTAMPTZ := clock_timestamp();
    v_wait_sec INTEGER := 0;
    v_lock_key BIGINT;
BEGIN
    -- Transaction-level advisory lock on the 64-bit integer hash of the ip_hash string.
    -- This guarantees that even if the row does not yet exist, concurrent calls
    -- for the same IP hash are serialized before the first INSERT or SELECT.
    v_lock_key := ('x' || substr(md5(p_ip_hash), 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- Perform opportunistic cleanup of records older than 24 hours
    DELETE FROM public.auth_rate_limits
    WHERE last_attempt_at < (v_now - INTERVAL '24 hours');

    -- Select existing record
    SELECT * INTO v_record
    FROM public.auth_rate_limits
    WHERE ip_hash = p_ip_hash;

    IF NOT FOUND THEN
        -- First recorded failed attempt
        INSERT INTO public.auth_rate_limits (ip_hash, attempts, locked_until, last_attempt_at)
        VALUES (p_ip_hash, 1, NULL, v_now);

        RETURN QUERY SELECT true, 0, 1, false;
        RETURN;
    END IF;

    -- If currently locked out
    IF v_record.locked_until IS NOT NULL AND v_record.locked_until > v_now THEN
        v_wait_sec := CEIL(EXTRACT(EPOCH FROM (v_record.locked_until - v_now)))::INTEGER;
        RETURN QUERY SELECT false, v_wait_sec, v_record.attempts, true;
        RETURN;
    END IF;

    -- If previous lockout has expired or 15 mins passed since last attempt, reset counter
    IF (v_record.locked_until IS NOT NULL AND v_record.locked_until <= v_now) 
       OR (v_record.last_attempt_at < (v_now - (p_lockout_seconds || ' seconds')::INTERVAL)) THEN
        UPDATE public.auth_rate_limits
        SET attempts = 1,
            locked_until = NULL,
            last_attempt_at = v_now
        WHERE ip_hash = p_ip_hash;

        RETURN QUERY SELECT true, 0, 1, false;
        RETURN;
    END IF;

    -- Increment attempt counter
    IF v_record.attempts + 1 >= p_max_attempts THEN
        -- Trigger lockout
        UPDATE public.auth_rate_limits
        SET attempts = v_record.attempts + 1,
            locked_until = v_now + (p_lockout_seconds || ' seconds')::INTERVAL,
            last_attempt_at = v_now
        WHERE ip_hash = p_ip_hash;

        RETURN QUERY SELECT false, p_lockout_seconds, v_record.attempts + 1, true;
        RETURN;
    ELSE
        UPDATE public.auth_rate_limits
        SET attempts = v_record.attempts + 1,
            last_attempt_at = v_now
        WHERE ip_hash = p_ip_hash;

        RETURN QUERY SELECT true, 0, v_record.attempts + 1, false;
        RETURN;
    END IF;
END;
$$;

-- 6. Function to clear rate limit record on successful login
CREATE OR REPLACE FUNCTION public.clear_login_rate_limit(p_ip_hash TEXT)
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_lock_key BIGINT;
BEGIN
    v_lock_key := ('x' || substr(md5(p_ip_hash), 1, 16))::bit(64)::bigint;
    PERFORM pg_advisory_xact_lock(v_lock_key);
    DELETE FROM public.auth_rate_limits WHERE ip_hash = p_ip_hash;
END;
$$;

-- 7. Secure Function Execution Privileges
-- Revoke all default execution permissions from public, anon, and authenticated roles
REVOKE ALL ON FUNCTION public.check_and_record_login_attempt(TEXT, INTEGER, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_and_record_login_attempt(TEXT, INTEGER, INTEGER) FROM anon;
REVOKE ALL ON FUNCTION public.check_and_record_login_attempt(TEXT, INTEGER, INTEGER) FROM authenticated;

REVOKE ALL ON FUNCTION public.clear_login_rate_limit(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_login_rate_limit(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.clear_login_rate_limit(TEXT) FROM authenticated;

-- Grant execution exclusively to service_role (used by server-side Next.js APIs)
GRANT EXECUTE ON FUNCTION public.check_and_record_login_attempt(TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_login_rate_limit(TEXT) TO service_role;
