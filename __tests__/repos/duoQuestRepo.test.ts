/**
 * duoQuestRepo tests.
 * Verifies the SYNCABLE pattern (assertSyncable + syncQueueRepo.enqueue on writes),
 * buddy-pair-scoped queries, active quest count for 3-quest-per-pair limit,
 * dual-column progress updates (userA/userB), and the privacy invariant that
 * read methods never expose individual player progress in public-facing queries.
 */
import * as fs from 'fs';
import * as path from 'path';

// ─── Privacy Invariant Tests (source-level) ──────────────────────────────────

describe('duoQuestRepo privacy invariant', () => {
  let repoSource: string;
  let codeOnly: string;

  beforeAll(() => {
    repoSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/duoQuestRepo.ts'),
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

  it('calls assertSyncable("duo_quests") at least three times (create, updateProgress, updateStatus)', () => {
    const matches = (codeOnly.match(/assertSyncable/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(3);
  });

  it('calls syncQueueRepo.enqueue at least three times (create, updateProgress, updateStatus)', () => {
    const matches = (codeOnly.match(/syncQueueRepo\.enqueue/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(3);
  });

  it('uses buddyPairId for scoping queries (not global)', () => {
    expect(codeOnly).toContain('buddyPairId');
  });

  it('updateProgress handles both userA and userB columns', () => {
    expect(codeOnly).toContain('userAProgress');
    expect(codeOnly).toContain('userBProgress');
  });

  it('getExpiredActive uses lte for expiry comparison', () => {
    expect(codeOnly).toContain('lte');
  });
});

// ─── Module Exports Test ─────────────────────────────────────────────────────

describe('duoQuestRepo module exports', () => {
  it('exports duoQuestRepo with all required methods', () => {
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

    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    expect(duoQuestRepo).toBeDefined();
    expect(typeof duoQuestRepo.create).toBe('function');
    expect(typeof duoQuestRepo.getActiveByBuddyPair).toBe('function');
    expect(typeof duoQuestRepo.getActiveCountByBuddyPair).toBe('function');
    expect(typeof duoQuestRepo.getByBuddyPair).toBe('function');
    expect(typeof duoQuestRepo.getById).toBe('function');
    expect(typeof duoQuestRepo.updateProgress).toBe('function');
    expect(typeof duoQuestRepo.updateStatus).toBe('function');
    expect(typeof duoQuestRepo.getExpiredActive).toBe('function');
  });
});

// ─── create() Tests ──────────────────────────────────────────────────────────

describe('duoQuestRepo.create', () => {
  const mockRow = {
    id: 'dq-1',
    buddyPairId: 'buddy-pair-1',
    createdByUserId: 'user-a',
    title: 'Read Together',
    description: 'Read 7 times together',
    xpRewardEach: 75,
    xpRewardBonus: 40,
    targetType: 'completion_count',
    targetValue: 7,
    userAProgress: 0,
    userBProgress: 0,
    userACompleted: false,
    userBCompleted: false,
    status: 'active',
    expiresAt: '2026-01-11T00:00:00.000Z',
    completedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('calls assertSyncable("duo_quests") before inserting', async () => {
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.create(mockRow);
    expect(mockAssertSyncable).toHaveBeenCalledWith('duo_quests');
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.create(mockRow);
    expect(mockEnqueue).toHaveBeenCalledWith('duo_quests', mockRow.id, 'UPSERT', mockRow);
  });

  it('does NOT call enqueue when not authenticated', async () => {
    const mockEnqueue = jest.fn().mockResolvedValue(undefined);

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: mockEnqueue },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.create(mockRow);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});

// ─── getActiveCountByBuddyPair() — 3-quest-per-pair limit enforcement ────────

describe('duoQuestRepo.getActiveCountByBuddyPair', () => {
  it('returns count of active quests for a pair', async () => {
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([{ value: 2 }]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    const count = await duoQuestRepo.getActiveCountByBuddyPair('buddy-pair-1');
    expect(count).toBe(2);
  });

  it('returns 0 when no active quests exist', async () => {
    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    const count = await duoQuestRepo.getActiveCountByBuddyPair('buddy-pair-1');
    expect(count).toBe(0);
  });
});

// ─── updateProgress() — dual-column progress ─────────────────────────────────

describe('duoQuestRepo.updateProgress', () => {
  const mockRow = {
    id: 'dq-1',
    buddyPairId: 'buddy-pair-1',
    status: 'active',
    userAProgress: 3,
    userBProgress: 5,
    userACompleted: false,
    userBCompleted: true,
    updatedAt: '2026-01-05T00:00:00.000Z',
  };

  it('calls assertSyncable("duo_quests") before updating progress', async () => {
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.updateProgress('dq-1', 'a', 3, false);
    expect(mockAssertSyncable).toHaveBeenCalledWith('duo_quests');
  });

  it('calls syncQueueRepo.enqueue after progress update when authenticated', async () => {
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.updateProgress('dq-1', 'b', 5, true);
    expect(mockEnqueue).toHaveBeenCalled();
  });
});

// ─── updateStatus() Tests ────────────────────────────────────────────────────

describe('duoQuestRepo.updateStatus', () => {
  const mockRow = {
    id: 'dq-1',
    status: 'completed',
    completedAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-01-08T00:00:00.000Z',
  };

  it('calls assertSyncable("duo_quests") before updating status', async () => {
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.updateStatus('dq-1', 'completed');
    expect(mockAssertSyncable).toHaveBeenCalledWith('duo_quests');
  });

  it('calls syncQueueRepo.enqueue after status update when authenticated', async () => {
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
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    await duoQuestRepo.updateStatus('dq-1', 'completed');
    expect(mockEnqueue).toHaveBeenCalled();
  });
});

// ─── getById() Tests ─────────────────────────────────────────────────────────

describe('duoQuestRepo.getById', () => {
  it('returns null when no quest found', async () => {
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

    jest.resetModules();
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    const result = await duoQuestRepo.getById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns the quest when found', async () => {
    const mockQuest = { id: 'dq-1', buddyPairId: 'buddy-pair-1', status: 'active' };

    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockQuest]),
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

    jest.resetModules();
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    const result = await duoQuestRepo.getById('dq-1');
    expect(result).toEqual(mockQuest);
  });
});

// ─── getExpiredActive() Tests ─────────────────────────────────────────────────

describe('duoQuestRepo.getExpiredActive', () => {
  it('returns active quests past expiry date', async () => {
    const expiredQuest = {
      id: 'dq-2',
      buddyPairId: 'buddy-pair-1',
      status: 'active',
      expiresAt: '2026-01-01T00:00:00.000Z',
    };

    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([expiredQuest]),
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

    jest.resetModules();
    const { duoQuestRepo } = require('../../src/db/repos/duoQuestRepo');
    const results = await duoQuestRepo.getExpiredActive('2026-01-10T00:00:00.000Z');
    expect(results).toContainEqual(expect.objectContaining({ id: 'dq-2' }));
  });
});

// ─── Index Re-export Test ─────────────────────────────────────────────────────

describe('index re-export', () => {
  it('re-exports duoQuestRepo from repos/index.ts', () => {
    const indexSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/index.ts'),
      'utf-8',
    );
    expect(indexSource).toContain("export { duoQuestRepo } from './duoQuestRepo'");
  });
});
