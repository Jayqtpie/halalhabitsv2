-- Phase 11: Row-Level Security for v2.0 SYNCABLE tables
-- buddies uses dual-owner pattern: user_a OR user_b
-- messages, shared_habits, duo_quests use buddy-pair membership via EXISTS subquery
-- Performance: (select auth.uid()) caches the call per query

-- ── buddies ──────────────────────────────────────────────────────────
ALTER TABLE public.buddies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buddies: select own pairs" ON public.buddies
  FOR SELECT TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );

CREATE POLICY "Buddies: insert as inviter" ON public.buddies
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())::text = user_a);

CREATE POLICY "Buddies: update own pairs" ON public.buddies
  FOR UPDATE TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );

CREATE POLICY "Buddies: delete own pairs" ON public.buddies
  FOR DELETE TO authenticated
  USING (
    (select auth.uid())::text = user_a OR
    (select auth.uid())::text = user_b
  );

-- ── messages ─────────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages: select own buddy messages" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Messages: insert as sender in buddy pair" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid())::text = sender_id
    AND EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Messages: update own messages" ON public.messages
  FOR UPDATE TO authenticated
  USING ((select auth.uid())::text = sender_id);

CREATE POLICY "Messages: delete own messages" ON public.messages
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = sender_id);

-- ── shared_habits ────────────────────────────────────────────────────
ALTER TABLE public.shared_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Shared Habits: select own buddy shared habits" ON public.shared_habits
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Shared Habits: insert in own buddy pair" ON public.shared_habits
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid())::text = created_by_user_id
    AND EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Shared Habits: update in own buddy pair" ON public.shared_habits
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Shared Habits: delete own created" ON public.shared_habits
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = created_by_user_id);

-- ── duo_quests ───────────────────────────────────────────────────────
ALTER TABLE public.duo_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Duo Quests: select own buddy quests" ON public.duo_quests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Duo Quests: insert in own buddy pair" ON public.duo_quests
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid())::text = created_by_user_id
    AND EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Duo Quests: update in own buddy pair" ON public.duo_quests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.id = buddy_pair_id
        AND (
          (select auth.uid())::text = b.user_a OR
          (select auth.uid())::text = b.user_b
        )
    )
  );

CREATE POLICY "Duo Quests: delete own created" ON public.duo_quests
  FOR DELETE TO authenticated
  USING ((select auth.uid())::text = created_by_user_id);
