-- Phase 11: Supabase schema for v2.0 SYNCABLE tables
-- Only SYNCABLE tables get Supabase mirrors
-- PRIVATE (boss_battles) and LOCAL_ONLY (detox_sessions) stay device-only

CREATE TABLE IF NOT EXISTS public.buddies (
  id text PRIMARY KEY,
  user_a text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_b text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  invite_code text,
  created_at text NOT NULL,
  accepted_at text,
  updated_at text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_buddy_invite_code ON public.buddies(invite_code);
CREATE INDEX IF NOT EXISTS idx_buddy_user_a ON public.buddies(user_a);
CREATE INDEX IF NOT EXISTS idx_buddy_user_b ON public.buddies(user_b);

CREATE TABLE IF NOT EXISTS public.messages (
  id text PRIMARY KEY,
  buddy_pair_id text NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  created_at text NOT NULL,
  synced_at text
);

CREATE INDEX IF NOT EXISTS idx_message_pair_created ON public.messages(buddy_pair_id, created_at);
CREATE INDEX IF NOT EXISTS idx_message_sender ON public.messages(sender_id);

CREATE TABLE IF NOT EXISTS public.shared_habits (
  id text PRIMARY KEY,
  buddy_pair_id text NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  created_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  habit_type text NOT NULL,
  name text NOT NULL,
  target_frequency text NOT NULL DEFAULT 'daily',
  status text NOT NULL DEFAULT 'active',
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_habit_pair ON public.shared_habits(buddy_pair_id);
CREATE INDEX IF NOT EXISTS idx_shared_habit_creator ON public.shared_habits(created_by_user_id);

CREATE TABLE IF NOT EXISTS public.duo_quests (
  id text PRIMARY KEY,
  buddy_pair_id text NOT NULL REFERENCES public.buddies(id) ON DELETE CASCADE,
  created_by_user_id text NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  xp_reward_each integer NOT NULL,
  xp_reward_bonus integer NOT NULL DEFAULT 0,
  target_type text NOT NULL,
  target_value integer NOT NULL,
  user_a_progress integer NOT NULL DEFAULT 0,
  user_b_progress integer NOT NULL DEFAULT 0,
  user_a_completed boolean NOT NULL DEFAULT false,
  user_b_completed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  expires_at text NOT NULL,
  completed_at text,
  created_at text NOT NULL,
  updated_at text NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_duo_quest_pair_status ON public.duo_quests(buddy_pair_id, status);
CREATE INDEX IF NOT EXISTS idx_duo_quest_expires ON public.duo_quests(expires_at);
