/**
 * buddyRepo tests.
 * Verifies the SYNCABLE pattern (assertSyncable + syncQueueRepo.enqueue on writes),
 * dual-owner query patterns, and the privacy invariant that buddy queries
 * never expose worship data (habit_completions, streaks, muhasabah_entries).
 */
import * as fs from 'fs';
import * as path from 'path';

// ─── Privacy Invariant Tests (source-level) ───────────────────────────────────

describe('buddyRepo privacy invariant', () => {
  let repoSource: string;
  let codeOnly: string;

  beforeAll(() => {
    repoSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/buddyRepo.ts'),
      'utf-8',
    );
    // Strip comments so test strings in comments do not trigger false positives
    codeOnly = repoSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  });

  it('never references habit_completions table', () => {
    expect(codeOnly).not.toContain('habit_completions');
  });

  it('never references streaks table', () => {
    expect(codeOnly).not.toContain('streaks');
  });

  it('never references muhasabah_entries table', () => {
    expect(codeOnly).not.toContain('muhasabah_entries');
  });

  it('calls assertSyncable at least twice (create and updateStatus)', () => {
    const matches = (codeOnly.match(/assertSyncable/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });

  it('calls syncQueueRepo.enqueue at least twice (create and updateStatus)', () => {
    const matches = (codeOnly.match(/syncQueueRepo\.enqueue/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });

  it('uses dual-owner OR query pattern', () => {
    expect(codeOnly).toContain('or(eq(buddies.userA');
  });
});

// ─── Module Exports Test ──────────────────────────────────────────────────────

describe('buddyRepo module exports', () => {
  it('exports buddyRepo with all required methods', () => {
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([]),
          }),
        }),
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      })),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn().mockResolvedValue(undefined) },
    }));
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: { from: jest.fn() },
      supabaseConfigured: false,
    }));

    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    expect(buddyRepo).toBeDefined();
    expect(typeof buddyRepo.create).toBe('function');
    expect(typeof buddyRepo.updateStatus).toBe('function');
    expect(typeof buddyRepo.getAccepted).toBe('function');
    expect(typeof buddyRepo.getPending).toBe('function');
    expect(typeof buddyRepo.getPendingOutbound).toBe('function');
    expect(typeof buddyRepo.getAcceptedCount).toBe('function');
    expect(typeof buddyRepo.findByInviteCode).toBe('function');
    expect(typeof buddyRepo.getExistingPair).toBe('function');
    expect(typeof buddyRepo.searchDiscoverable).toBe('function');
    expect(typeof buddyRepo.getBuddyProfile).toBe('function');
    expect(typeof buddyRepo.updateHeartbeat).toBe('function');
  });
});

// ─── create() Tests ───────────────────────────────────────────────────────────

describe('buddyRepo.create', () => {
  const mockRow = {
    id: 'buddy-1',
    userA: 'user-a',
    userB: 'user-b',
    status: 'pending',
    inviteCode: 'CODE123',
    createdAt: '2026-01-01T00:00:00.000Z',
    acceptedAt: null,
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('calls assertSyncable("buddies") before inserting', async () => {
    const mockAssertSyncable = jest.fn();

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: mockAssertSyncable,
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn().mockResolvedValue(undefined) },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    await buddyRepo.create(mockRow);
    expect(mockAssertSyncable).toHaveBeenCalledWith('buddies');
  });

  it('calls syncQueueRepo.enqueue after insert when authenticated', async () => {
    const mockEnqueue = jest.fn().mockResolvedValue(undefined);

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: mockEnqueue },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: true })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        insert: jest.fn().mockReturnValue({
          values: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    await buddyRepo.create(mockRow);
    expect(mockEnqueue).toHaveBeenCalledWith('buddies', mockRow.id, 'UPSERT', mockRow);
  });
});

// ─── updateStatus() Tests ─────────────────────────────────────────────────────

describe('buddyRepo.updateStatus', () => {
  const mockRow = {
    id: 'buddy-1',
    userA: 'user-a',
    userB: 'user-b',
    status: 'accepted',
    inviteCode: 'CODE123',
    createdAt: '2026-01-01T00:00:00.000Z',
    acceptedAt: '2026-01-02T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('calls assertSyncable("buddies") before updating', async () => {
    const mockAssertSyncable = jest.fn();

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: mockAssertSyncable,
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn().mockResolvedValue(undefined) },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
          }),
        }),
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    await buddyRepo.updateStatus('buddy-1', 'accepted');
    expect(mockAssertSyncable).toHaveBeenCalledWith('buddies');
  });

  it('calls syncQueueRepo.enqueue after update when authenticated', async () => {
    const mockEnqueue = jest.fn().mockResolvedValue(undefined);

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: mockEnqueue },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: true })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        update: jest.fn().mockReturnValue({
          set: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue(undefined),
          }),
        }),
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockRow]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    await buddyRepo.updateStatus('buddy-1', 'accepted');
    expect(mockEnqueue).toHaveBeenCalled();
  });
});

// ─── searchDiscoverable() Tests ───────────────────────────────────────────────

describe('buddyRepo.searchDiscoverable', () => {
  it('returns empty array when supabaseConfigured is false', async () => {
    jest.mock('../../src/db/client', () => ({ getDb: jest.fn() }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: { from: jest.fn() },
      supabaseConfigured: false,
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    const result = await buddyRepo.searchDiscoverable('ali');
    expect(result).toEqual([]);
  });

  it('returns empty array when query is too short (< 2 chars)', async () => {
    jest.mock('../../src/db/client', () => ({ getDb: jest.fn() }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: true })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: { from: jest.fn() },
      supabaseConfigured: false,
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    const result = await buddyRepo.searchDiscoverable('a');
    expect(result).toEqual([]);
  });
});

// ─── getExistingPair() Tests ──────────────────────────────────────────────────

describe('buddyRepo.getExistingPair', () => {
  it('returns null when no pair exists', async () => {
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      })),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    const result = await buddyRepo.getExistingPair('user-a', 'user-b');
    expect(result).toBeNull();
  });

  it('returns the pair when found', async () => {
    const mockPair = { id: 'buddy-1', userA: 'user-a', userB: 'user-b', status: 'accepted' };

    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockPair]),
          }),
        }),
      })),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/lib/supabase', () => ({
      supabase: {},
      supabaseConfigured: false,
    }));

    jest.resetModules();
    const { buddyRepo } = require('../../src/db/repos/buddyRepo');
    const result = await buddyRepo.getExistingPair('user-a', 'user-b');
    expect(result).toEqual(mockPair);
  });
});

// ─── getBuddyProfile select safety ───────────────────────────────────────────

describe('buddyRepo.getBuddyProfile select safety', () => {
  it('select list contains only safe public profile fields', () => {
    const repoSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/buddyRepo.ts'),
      'utf-8',
    );
    expect(repoSource).toContain('current_streak_count');
    expect(repoSource).toContain('last_active_at');
    expect(repoSource).not.toContain("'habit_completions'");
    expect(repoSource).not.toContain("'streaks'");
    expect(repoSource).not.toContain("'muhasabah_entries'");
  });
});

// ─── Index Re-export Test ─────────────────────────────────────────────────────

describe('index re-export', () => {
  it('re-exports buddyRepo from repos/index.ts', () => {
    const indexSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/index.ts'),
      'utf-8',
    );
    expect(indexSource).toContain("export { buddyRepo } from './buddyRepo'");
  });
});
