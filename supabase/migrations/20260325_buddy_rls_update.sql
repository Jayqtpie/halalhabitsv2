-- Phase 15: RLS updates for buddy profile reads and discoverable search
--
-- Gap: Current users SELECT policy only allows reading own row (id = auth.uid()).
-- Buddy profiles (BUDY-06) need to read another user's public fields.
-- Discoverable search (BUDY-03) needs to find users who opted in.
--
-- Solution: Two new SELECT policies (PostgreSQL ORs multiple SELECT policies).

-- Allow reading a buddy's public profile if you have an accepted connection
CREATE POLICY "Users: select buddy profiles" ON public.users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.buddies b
      WHERE b.status = 'accepted'
        AND (
          ((select auth.uid())::text = b.user_a AND users.id = b.user_b) OR
          ((select auth.uid())::text = b.user_b AND users.id = b.user_a)
        )
    )
  );

-- Allow searching discoverable users by display_name (BUDY-03)
-- Safe: users explicitly opted in; only public columns are queryable
CREATE POLICY "Users: search discoverable" ON public.users
  FOR SELECT TO authenticated
  USING (is_discoverable = true);
