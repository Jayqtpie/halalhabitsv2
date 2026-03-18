-- Phase 7: Row-Level Security for all syncable tables
-- Every table requires RLS enabled + CRUD policies bound to auth.uid()
-- Performance: (select auth.uid()) caches the call per query (up to 99% faster than auth.uid() direct)
-- Users table uses id = auth.uid()::text; all other user tables use user_id = auth.uid()::text

-- ── users ──────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: select own profile" ON public.users
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = id);

CREATE POLICY "Users: insert own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = id);

CREATE POLICY "Users: update own profile" ON public.users
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = id)
  WITH CHECK ((select auth.uid())::text = id);

CREATE POLICY "Users: delete own profile" ON public.users
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = id);

-- ── habits ─────────────────────────────────────────────────────────────
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Habits: select own" ON public.habits
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Habits: insert own" ON public.habits
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Habits: update own" ON public.habits
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Habits: delete own" ON public.habits
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ── xp_ledger ──────────────────────────────────────────────────────────
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "XP Ledger: select own" ON public.xp_ledger
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "XP Ledger: insert own" ON public.xp_ledger
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "XP Ledger: update own" ON public.xp_ledger
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "XP Ledger: delete own" ON public.xp_ledger
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ── titles (seed data — permissive SELECT for all authenticated) ───────
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Titles: all authenticated can read" ON public.titles
  FOR SELECT TO authenticated
  USING (true);

-- INSERT/UPDATE/DELETE restricted to service role only (no policy = denied for authenticated role)

-- ── user_titles ────────────────────────────────────────────────────────
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User Titles: select own" ON public.user_titles
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "User Titles: insert own" ON public.user_titles
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "User Titles: update own" ON public.user_titles
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "User Titles: delete own" ON public.user_titles
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ── quests ─────────────────────────────────────────────────────────────
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Quests: select own" ON public.quests
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Quests: insert own" ON public.quests
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Quests: update own" ON public.quests
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Quests: delete own" ON public.quests
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ── settings ───────────────────────────────────────────────────────────
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings: select own" ON public.settings
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

CREATE POLICY "Settings: insert own" ON public.settings
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Settings: update own" ON public.settings
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = user_id)
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Settings: delete own" ON public.settings
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = user_id);

-- ── push_notifications ─────────────────────────────────────────────────
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Push: insert for own user" ON public.push_notifications
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_id);

CREATE POLICY "Push: select own" ON public.push_notifications
  FOR SELECT TO authenticated
  USING ((select auth.uid())::text = user_id);

-- Service role bypasses RLS for Edge Function reads (service role key set in Edge Function env)

-- ── delete_user RPC (for account deletion) ─────────────────────────────
-- SECURITY DEFINER runs as the function owner (postgres role), bypassing RLS
-- This allows deletion cascade across all user tables in a single call
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  DELETE FROM public.push_notifications WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.user_titles WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.xp_ledger WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.quests WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.settings WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.habits WHERE user_id = (select auth.uid())::text;
  DELETE FROM public.users WHERE id = (select auth.uid())::text;
$$;
