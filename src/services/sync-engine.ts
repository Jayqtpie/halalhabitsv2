/**
 * Sync engine — flushes offline-queued changes to Supabase.
 *
 * Guards:
 * 1. Auth check: skips if user is not authenticated (guest mode)
 * 2. Connectivity check: skips if device is offline
 * 3. Privacy gate: calls assertSyncable() before each upsert — PRIVATE
 *    table items are caught and marked failed with a PRIVACY VIOLATION message.
 * 4. Retry limit: items with retryCount >= MAX_RETRIES are skipped silently.
 *
 * Sync status flow: idle -> syncing -> synced (all ok) / error (any failure)
 *
 * Pure TypeScript, no React imports.
 */
import NetInfo from '@react-native-community/netinfo';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';
import { syncQueueRepo } from '../db/repos/syncQueueRepo';
import { assertSyncable } from './privacy-gate';

const MAX_RETRIES = 5;

/**
 * Flush all pending sync queue items to Supabase.
 *
 * Called on: app foreground, settings changes, manual "Sync Now" button.
 * No-ops silently if not authenticated or if offline.
 */
export async function flushQueue(): Promise<void> {
  if (!supabaseConfigured) return;

  const { isAuthenticated } = useAuthStore.getState();
  if (!isAuthenticated) return;

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return;

  useAuthStore.getState().setSyncStatus('syncing');

  try {
    const pending = await syncQueueRepo.getPending();
    let hasError = false;

    for (const item of pending) {
      // Skip items that have permanently failed (hit retry ceiling)
      if (item.retryCount >= MAX_RETRIES) continue;

      try {
        // Privacy gate — throws for PRIVATE or LOCAL_ONLY tables
        assertSyncable(item.entityType);
        const payload = JSON.parse(item.payload);

        if (item.operation === 'DELETE') {
          const { error } = await supabase
            .from(item.entityType)
            .delete()
            .eq('id', item.entityId);
          if (error) throw new Error(error.message ?? String(error));
        } else {
          const { error } = await supabase
            .from(item.entityType)
            .upsert(payload, { onConflict: 'id' });
          if (error) throw new Error(error.message ?? String(error));
        }

        await syncQueueRepo.markSynced(item.id);
      } catch (err: unknown) {
        hasError = true;
        const message = err instanceof Error ? err.message : String(err ?? 'Unknown error');
        await syncQueueRepo.markFailed(item.id, message);
      }
    }

    if (hasError) {
      useAuthStore.getState().setSyncStatus('error');
    } else {
      useAuthStore.getState().setSyncStatus('synced');
      useAuthStore.getState().setLastSyncedAt(new Date().toISOString());
    }
  } catch {
    useAuthStore.getState().setSyncStatus('error');
  }
}

/**
 * Convenience wrapper for manual "Sync Now" button in Settings.
 * Identical to flushQueue — separated for semantic clarity at call sites.
 */
export async function syncNow(): Promise<void> {
  return flushQueue();
}

/**
 * Remove all successfully-synced entries from the queue.
 * Call periodically (e.g., on app launch) to keep the queue lean.
 */
export async function purgeCompleted(): Promise<void> {
  await syncQueueRepo.purgeSynced();
}
