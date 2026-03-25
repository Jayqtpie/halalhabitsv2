-- Phase 15: Add buddy-related columns to users table
-- is_discoverable: opt-in for username search (D-11: defaults false, privacy-first)
-- last_active_at: heartbeat for online status (D-06)
-- current_streak_count: denormalized streak for buddy profile (Pitfall #3: streaks is PRIVATE)

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_discoverable boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active_at text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_streak_count integer NOT NULL DEFAULT 0;

-- Partial index for discoverable user search (only indexes rows where is_discoverable=true)
CREATE INDEX IF NOT EXISTS idx_users_discoverable_name
  ON public.users(display_name)
  WHERE is_discoverable = true;
