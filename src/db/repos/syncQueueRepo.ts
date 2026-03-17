/**
 * Sync queue repository — typed data access for the sync_queue table.
 *
 * Handles enqueuing local changes for cloud sync, marking items as synced
 * or failed, and purging completed entries.
 *
 * Privacy: sync_queue itself is LOCAL_ONLY (infrastructure).
 * The entities IT references may be SYNCABLE or PRIVATE — the sync engine
 * must call assertSyncable() before processing each item.
 *
 * Pure TypeScript, no React imports.
 */
import { eq, isNull, asc, sql } from 'drizzle-orm';
import { getDb } from '../client';
import { syncQueue } from '../schema';
import { generateId } from '../../utils/uuid';

export type SyncQueueItem = {
  id: string;
  entityType: string;
  entityId: string;
  operation: string;
  payload: string;
  createdAt: string;
  syncedAt: string | null;
  retryCount: number;
  lastError: string | null;
};

export const syncQueueRepo = {
  /** Get all pending (unsynced) items ordered by createdAt ASC for causal ordering */
  async getPending(): Promise<SyncQueueItem[]> {
    const db = getDb();
    return db
      .select()
      .from(syncQueue)
      .where(isNull(syncQueue.syncedAt))
      .orderBy(asc(syncQueue.createdAt)) as Promise<SyncQueueItem[]>;
  },

  /** Enqueue a new sync operation */
  async enqueue(
    entityType: string,
    entityId: string,
    operation: string,
    payload: object,
  ): Promise<void> {
    const db = getDb();
    await db.insert(syncQueue).values({
      id: generateId(),
      entityType,
      entityId,
      operation,
      payload: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    });
  },

  /** Mark a queue item as successfully synced */
  async markSynced(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(syncQueue)
      .set({ syncedAt: new Date().toISOString() })
      .where(eq(syncQueue.id, id));
  },

  /** Record a failed sync attempt — increment retryCount, set lastError */
  async markFailed(id: string, errorMessage: string): Promise<void> {
    const db = getDb();
    const items = await db
      .select()
      .from(syncQueue)
      .where(eq(syncQueue.id, id));
    const currentRetry = (items[0] as SyncQueueItem | undefined)?.retryCount ?? 0;
    await db
      .update(syncQueue)
      .set({ retryCount: currentRetry + 1, lastError: errorMessage })
      .where(eq(syncQueue.id, id));
  },

  /** Delete all synced items (cleanup) */
  async purgeSynced(): Promise<void> {
    const db = getDb();
    await db.delete(syncQueue).where(sql`${syncQueue.syncedAt} IS NOT NULL`);
  },

  /** Clear all queue items (used during account deletion) */
  async clearAll(): Promise<void> {
    const db = getDb();
    await db.delete(syncQueue);
  },
};
