/**
 * sync-engine.test.ts
 *
 * Tests for the sync engine flush logic covering:
 * - Auth guard (unauthenticated users skip flush)
 * - Connectivity guard (offline skips flush)
 * - Successful upsert with correct payload
 * - markSynced called on success
 * - markFailed called on upsert error
 * - syncStatus state transitions (syncing -> synced / error)
 * - lastSyncedAt updated on success
 * - Privacy gate: PRIVATE table items are marked failed
 * - syncNow is a wrapper for flushQueue
 */

jest.mock('@supabase/supabase-js');
jest.mock('@react-native-community/netinfo');

// Inline factory to avoid running supabase.ts side-effect imports in test env
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  supabaseConfigured: true,
}));

jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(),
  },
}));

// Inline factory to avoid loading db/client (expo-sqlite) in test env
jest.mock('../../src/db/repos/syncQueueRepo', () => ({
  syncQueueRepo: {
    getPending: jest.fn(),
    markSynced: jest.fn(),
    markFailed: jest.fn(),
    purgeSynced: jest.fn(),
    clearAll: jest.fn(),
  },
}));

import NetInfo from '@react-native-community/netinfo';
import { flushQueue, syncNow } from '../../src/services/sync-engine';
import { useAuthStore } from '../../src/stores/authStore';
import { syncQueueRepo } from '../../src/db/repos/syncQueueRepo';
import { supabase } from '../../src/lib/supabase';

const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;
const mockSyncQueueRepo = syncQueueRepo as jest.Mocked<typeof syncQueueRepo>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

// Mock auth store state
const mockSetSyncStatus = jest.fn();
const mockSetLastSyncedAt = jest.fn();

const createAuthState = (overrides: Partial<{ isAuthenticated: boolean; userId: string }> = {}) => ({
  isAuthenticated: true,
  userId: 'test-user-id',
  session: null,
  syncStatus: 'idle' as const,
  lastSyncedAt: null,
  nudgeDismissed: false,
  setSession: jest.fn(),
  setSyncStatus: mockSetSyncStatus,
  setLastSyncedAt: mockSetLastSyncedAt,
  setNudgeDismissed: jest.fn(),
  ...overrides,
});

// Pending habit item (syncable)
const pendingHabitItem = {
  id: 'queue-item-1',
  entityType: 'habits',
  entityId: 'habit-1',
  operation: 'UPDATE',
  payload: JSON.stringify({ id: 'habit-1', name: 'Fajr Prayer', userId: 'test-user-id' }),
  createdAt: '2026-01-01T00:00:00Z',
  syncedAt: null,
  retryCount: 0,
  lastError: null,
};

// Private table item (habit_completions)
const privateTableItem = {
  id: 'queue-item-private',
  entityType: 'habit_completions',
  entityId: 'completion-1',
  operation: 'INSERT',
  payload: JSON.stringify({ id: 'completion-1', habitId: 'habit-1' }),
  createdAt: '2026-01-01T00:00:00Z',
  syncedAt: null,
  retryCount: 0,
  lastError: null,
};

beforeEach(() => {
  jest.clearAllMocks();

  // Default: authenticated
  (useAuthStore.getState as jest.Mock).mockReturnValue(createAuthState());

  // Default: online
  (mockNetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true, isInternetReachable: true });

  // Default: no pending items
  mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([]);
  mockSyncQueueRepo.markSynced = jest.fn().mockResolvedValue(undefined);
  mockSyncQueueRepo.markFailed = jest.fn().mockResolvedValue(undefined);

  // Default: supabase from returns success
  const mockFrom = {
    upsert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    }),
  };
  (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);
});

describe('flushQueue', () => {
  it('Test 1: skips when isAuthenticated is false', async () => {
    (useAuthStore.getState as jest.Mock).mockReturnValue(
      createAuthState({ isAuthenticated: false }),
    );

    await flushQueue();

    expect(mockNetInfo.fetch).not.toHaveBeenCalled();
    expect(mockSyncQueueRepo.getPending).not.toHaveBeenCalled();
    expect(mockSetSyncStatus).not.toHaveBeenCalled();
  });

  it('Test 2: skips when NetInfo.fetch returns isConnected: false', async () => {
    (mockNetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false, isInternetReachable: false });

    await flushQueue();

    expect(mockSyncQueueRepo.getPending).not.toHaveBeenCalled();
    expect(mockSetSyncStatus).not.toHaveBeenCalled();
  });

  it('Test 3: calls supabase.from(entityType).upsert with parsed payload and onConflict: id', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);

    await flushQueue();

    expect(mockSupabase.from).toHaveBeenCalledWith('habits');
    const fromResult = (mockSupabase.from as jest.Mock).mock.results[0].value;
    expect(fromResult.upsert).toHaveBeenCalledWith(
      JSON.parse(pendingHabitItem.payload),
      { onConflict: 'id' },
    );
  });

  it('Test 4: calls syncQueueRepo.markSynced after successful upsert', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);

    await flushQueue();

    expect(mockSyncQueueRepo.markSynced).toHaveBeenCalledWith(pendingHabitItem.id);
  });

  it('Test 5: calls syncQueueRepo.markFailed with error message on upsert failure', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);
    const mockFrom = {
      upsert: jest.fn().mockResolvedValue({ error: { message: 'Upsert failed' } }),
    };
    (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

    await flushQueue();

    expect(mockSyncQueueRepo.markFailed).toHaveBeenCalledWith(
      pendingHabitItem.id,
      'Upsert failed',
    );
    expect(mockSyncQueueRepo.markSynced).not.toHaveBeenCalled();
  });

  it('Test 6: sets syncStatus to syncing during flush, synced on success', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);

    await flushQueue();

    expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing');
    expect(mockSetSyncStatus).toHaveBeenCalledWith('synced');
    // Should not set error
    expect(mockSetSyncStatus).not.toHaveBeenCalledWith('error');
  });

  it('Test 6b: sets syncStatus to error when any item fails', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);
    const mockFrom = {
      upsert: jest.fn().mockResolvedValue({ error: { message: 'Network error' } }),
    };
    (mockSupabase.from as jest.Mock).mockReturnValue(mockFrom);

    await flushQueue();

    expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing');
    expect(mockSetSyncStatus).toHaveBeenCalledWith('error');
    expect(mockSetSyncStatus).not.toHaveBeenCalledWith('synced');
  });

  it('Test 7: updates lastSyncedAt with ISO timestamp on success', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);

    await flushQueue();

    expect(mockSetLastSyncedAt).toHaveBeenCalledTimes(1);
    const isoArg = mockSetLastSyncedAt.mock.calls[0][0] as string;
    expect(isoArg).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('Test 8: PRIVATE table item throws assertSyncable and is marked failed', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([privateTableItem]);

    await flushQueue();

    expect(mockSyncQueueRepo.markFailed).toHaveBeenCalledWith(
      privateTableItem.id,
      expect.stringContaining('PRIVACY VIOLATION'),
    );
    expect(mockSyncQueueRepo.markSynced).not.toHaveBeenCalled();
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});

describe('syncNow', () => {
  it('Test 9: syncNow is a convenience wrapper that calls flushQueue', async () => {
    mockSyncQueueRepo.getPending = jest.fn().mockResolvedValue([pendingHabitItem]);

    await syncNow();

    // Should exhibit same behavior as flushQueue
    expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing');
    expect(mockSetSyncStatus).toHaveBeenCalledWith('synced');
    expect(mockSyncQueueRepo.markSynced).toHaveBeenCalledWith(pendingHabitItem.id);
  });
});
