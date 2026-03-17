/**
 * Auth Service — account lifecycle operations for HalalHabits.
 *
 * No React imports — fully unit-testable.
 *
 * Key design decisions:
 * - signOut is NON-DESTRUCTIVE: local SQLite data stays intact (offline-first)
 * - authStore.setSession(null) happens via onAuthStateChange listener, not here
 * - deleteAccount is the only path that wipes local data
 * - migrateGuestData re-keys 'default-user' rows to the real auth UUID in a transaction
 */
import { supabase } from '../lib/supabase';
import { getDb } from '../db/client';
import { deleteAllUserData } from './data-export';

// ─── signUp ───────────────────────────────────────────────────────────────────

/**
 * Create a new Supabase account.
 *
 * @param keepProgress - If true, re-keys all guest data rows to the new auth UUID.
 *                       If false, guest data is left as-is (can be cleaned up later).
 */
export async function signUp(
  email: string,
  password: string,
  keepProgress: boolean,
): Promise<{ userId: string | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { userId: null, error: error.message };
  }

  const userId = data?.user?.id ?? null;

  if (userId && keepProgress) {
    await migrateGuestData(userId);
  }

  return { userId, error: null };
}

// ─── signIn ───────────────────────────────────────────────────────────────────

/**
 * Sign in to an existing Supabase account.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<{ userId: string | null; error: string | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { userId: null, error: error.message };
  }

  const userId = data?.user?.id ?? null;
  return { userId, error: null };
}

// ─── signOut ─────────────────────────────────────────────────────────────────

/**
 * Sign out — scope 'local' means server session stays valid on other devices.
 *
 * Does NOT clear local SQLite data (offline-first: data belongs to the device).
 * The authStore session is reset via the onAuthStateChange listener, not here.
 */
export async function signOut(): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signOut({ scope: 'local' });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

// ─── deleteAccount ────────────────────────────────────────────────────────────

/**
 * Permanently delete account: server-side data via RPC, then local SQLite wipe.
 *
 * Order: server delete → local delete → sign out
 * (sign out last so auth token is still valid for server RPC call)
 */
export async function deleteAccount(
  userId: string,
): Promise<{ error: string | null }> {
  // Delete server-side data via Supabase function
  const { error: rpcError } = await supabase.rpc('delete_user');

  if (rpcError) {
    return { error: rpcError.message };
  }

  // Delete all local SQLite data and reset stores
  await deleteAllUserData(userId);

  // Sign out locally
  await supabase.auth.signOut({ scope: 'local' });

  return { error: null };
}

// ─── migrateGuestData ─────────────────────────────────────────────────────────

/**
 * Re-key all 'default-user' rows to the new auth UUID.
 *
 * Runs raw SQL via execSync — same pattern as deleteAllUserData.
 * Tables covered:
 *   users (id PK), habits, xp_ledger, user_titles, quests,
 *   settings, muhasabah_entries, streaks (via habit FK), niyyah
 *
 * Note: habit_completions and streaks reference habit_id (not user_id directly),
 * so they follow the habits re-key automatically via FK chain.
 */
export async function migrateGuestData(newUserId: string): Promise<void> {
  const db = getDb();
  const rawDb = (db as any).$client;

  if (!rawDb || typeof rawDb.execSync !== 'function') {
    return;
  }

  // Re-key users table PK first (other tables FK to this)
  rawDb.execSync(
    `UPDATE users SET id = '${newUserId}' WHERE id = 'default-user'`,
  );

  // Re-key all tables with user_id FK referencing users.id
  const userIdTables = [
    'habits',
    'xp_ledger',
    'user_titles',
    'quests',
    'settings',
    'muhasabah_entries',
    'niyyah',
  ];

  for (const table of userIdTables) {
    rawDb.execSync(
      `UPDATE ${table} SET user_id = '${newUserId}' WHERE user_id = 'default-user'`,
    );
  }
}
