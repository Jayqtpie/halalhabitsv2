-- Phase 7: Supabase schema for syncable tables
-- Mirrors local SQLite schema for 7 SYNCABLE tables
-- PRIVATE tables (habit_completions, streaks, muhasabah_entries, niyyah) are NEVER created here
-- LOCAL_ONLY tables (sync_queue, _zustand_store) are device-only infrastructure

CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  active_title_id text,
  current_level integer NOT NULL DEFAULT 1,
  total_xp integer NOT NULL DEFAULT 0,
  expo_push_token text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.habits (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  preset_key text,
  category text NOT NULL,
  frequency text NOT NULL,
  frequency_days text,
  time_window_start text,
  time_window_end text,
  difficulty_tier text NOT NULL DEFAULT 'medium',
  base_xp integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 0,
  icon text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  source_type text NOT NULL,
  source_id text,
  earned_at text NOT NULL,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.titles (
  id text PRIMARY KEY,
  name text NOT NULL UNIQUE,
  rarity text NOT NULL,
  unlock_type text NOT NULL,
  unlock_value integer NOT NULL,
  unlock_habit_type text,
  flavor_text text NOT NULL,
  sort_order integer NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_titles (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title_id text NOT NULL REFERENCES public.titles(id),
  earned_at text NOT NULL,
  UNIQUE(user_id, title_id)
);

CREATE TABLE IF NOT EXISTS public.quests (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  description text NOT NULL,
  xp_reward integer NOT NULL,
  target_type text NOT NULL,
  target_value integer NOT NULL,
  target_habit_id text,
  template_id text,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'available',
  expires_at text NOT NULL,
  completed_at text,
  created_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prayer_calc_method text NOT NULL DEFAULT 'ISNA',
  location_lat real,
  location_lng real,
  location_name text,
  isha_end_time text NOT NULL DEFAULT 'midnight',
  notification_prayers boolean NOT NULL DEFAULT true,
  notification_muhasabah boolean NOT NULL DEFAULT true,
  notification_quests boolean NOT NULL DEFAULT false,
  notification_titles boolean NOT NULL DEFAULT true,
  muhasabah_reminder_time text NOT NULL DEFAULT '21:00',
  dark_mode text NOT NULL DEFAULT 'auto',
  sound_enabled boolean NOT NULL DEFAULT true,
  haptic_enabled boolean NOT NULL DEFAULT true,
  updated_at text NOT NULL,
  UNIQUE(user_id)
);

-- Push notifications queue table — server-side only
-- Used by database webhook to trigger Edge Function for Expo push delivery
CREATE TABLE IF NOT EXISTS public.push_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_habits_user_status ON public.habits(user_id, status);
CREATE INDEX IF NOT EXISTS idx_xp_user_date ON public.xp_ledger(user_id, earned_at);
CREATE INDEX IF NOT EXISTS idx_quests_user_status ON public.quests(user_id, status);
CREATE INDEX IF NOT EXISTS idx_push_user ON public.push_notifications(user_id);
