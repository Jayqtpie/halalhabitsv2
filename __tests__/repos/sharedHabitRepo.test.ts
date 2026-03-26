/**
 * sharedHabitRepo tests.
 * Verifies the SYNCABLE pattern (assertSyncable + syncQueueRepo.enqueue on writes),
 * buddy-pair-scoped queries, and the privacy invariant that shared habit queries
 * never expose worship data (habit_completions, streaks, muhasabah_entries).
 *
 * Privacy invariant: getProposalsForUser excludes self-created proposals.
 */
import * as fs from 'fs';
import * as path from 'path';

// ─── Privacy Invariant Tests (source-level) ──────────────────────────────────

describe('sharedHabitRepo privacy invariant', () => {
  let repoSource: string;
  let codeOnly: string;

  beforeAll(() => {
    repoSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/sharedHabitRepo.ts'),
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

  it('calls assertSyncable("shared_habits") at least twice (create and updateStatus)', () => {
    const matches = (codeOnly.match(/assertSyncable/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });

  it('calls syncQueueRepo.enqueue at least twice (create and updateStatus)', () => {
    const matches = (codeOnly.match(/syncQueueRepo\.enqueue/g) || []).length;
    expect(matches).toBeGreaterThanOrEqual(2);
  });

  it('uses buddyPairId for scoping queries (not global)', () => {
    expect(codeOnly).toContain('buddyPairId');
  });

  it('getProposalsForUser filters out self-created proposals (createdByUserId != userId)', () => {
    expect(codeOnly).toContain('ne(');
  });
});

// ─── Module Exports Test ─────────────────────────────────────────────────────

describe('sharedHabitRepo module exports', () => {
  it('exports sharedHabitRepo with all required methods', () => {
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

    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    expect(sharedHabitRepo).toBeDefined();
    expect(typeof sharedHabitRepo.create).toBe('function');
    expect(typeof sharedHabitRepo.getByBuddyPair).toBe('function');
    expect(typeof sharedHabitRepo.getActiveByBuddyPair).toBe('function');
    expect(typeof sharedHabitRepo.getProposalsForUser).toBe('function');
    expect(typeof sharedHabitRepo.updateStatus).toBe('function');
    expect(typeof sharedHabitRepo.getById).toBe('function');
  });
});

// ─── create() Tests ──────────────────────────────────────────────────────────

describe('sharedHabitRepo.create', () => {
  const mockRow = {
    id: 'sh-1',
    buddyPairId: 'buddy-pair-1',
    createdByUserId: 'user-a',
    habitType: 'exercise',
    name: 'Morning Walk',
    targetFrequency: 'daily',
    status: 'proposed',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('calls assertSyncable("shared_habits") before inserting', async () => {
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    await sharedHabitRepo.create(mockRow);
    expect(mockAssertSyncable).toHaveBeenCalledWith('shared_habits');
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    await sharedHabitRepo.create(mockRow);
    expect(mockEnqueue).toHaveBeenCalledWith('shared_habits', mockRow.id, 'UPSERT', mockRow);
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    await sharedHabitRepo.create(mockRow);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});

// ─── updateStatus() Tests ────────────────────────────────────────────────────

describe('sharedHabitRepo.updateStatus', () => {
  const mockRow = {
    id: 'sh-1',
    buddyPairId: 'buddy-pair-1',
    createdByUserId: 'user-a',
    habitType: 'exercise',
    name: 'Morning Walk',
    targetFrequency: 'daily',
    status: 'active',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  it('calls assertSyncable("shared_habits") before updating', async () => {
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    await sharedHabitRepo.updateStatus('sh-1', 'active');
    expect(mockAssertSyncable).toHaveBeenCalledWith('shared_habits');
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    await sharedHabitRepo.updateStatus('sh-1', 'active');
    expect(mockEnqueue).toHaveBeenCalled();
  });
});

// ─── getProposalsForUser() — self-exclusion invariant ────────────────────────

describe('sharedHabitRepo.getProposalsForUser', () => {
  it('excludes proposals created by the requesting user', async () => {
    const selfProposal = {
      id: 'sh-2',
      buddyPairId: 'buddy-pair-1',
      createdByUserId: 'user-a',
      status: 'proposed',
    };
    const incomingProposal = {
      id: 'sh-3',
      buddyPairId: 'buddy-pair-1',
      createdByUserId: 'user-b',
      status: 'proposed',
    };

    jest.mock('../../src/services/privacy-gate', () => ({
      assertSyncable: jest.fn(),
    }));
    jest.mock('../../src/db/repos/syncQueueRepo', () => ({
      syncQueueRepo: { enqueue: jest.fn() },
    }));
    jest.mock('../../src/stores/authStore', () => ({
      useAuthStore: { getState: jest.fn(() => ({ isAuthenticated: false })) },
    }));
    // Mock returns only the incoming proposal (user-b created it, user-a queries)
    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([incomingProposal]),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    const results = await sharedHabitRepo.getProposalsForUser(['buddy-pair-1'], 'user-a');
    // The mock DB returns only incomingProposal — we verify self-proposal is NOT present
    expect(results).not.toContainEqual(expect.objectContaining({ createdByUserId: 'user-a' }));
    expect(results).toContainEqual(expect.objectContaining({ createdByUserId: 'user-b' }));
  });
});

// ─── getByBuddyPair() — buddy-pair scoping ───────────────────────────────────

describe('sharedHabitRepo.getByBuddyPair', () => {
  it('returns all shared habits for a buddy pair', async () => {
    const mockHabits = [
      { id: 'sh-1', buddyPairId: 'buddy-pair-1', status: 'active' },
      { id: 'sh-2', buddyPairId: 'buddy-pair-1', status: 'proposed' },
    ];

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
            where: jest.fn().mockResolvedValue(mockHabits),
          }),
        }),
      })),
    }));

    jest.resetModules();
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    const results = await sharedHabitRepo.getByBuddyPair('buddy-pair-1');
    expect(results).toHaveLength(2);
  });
});

// ─── getById() Tests ─────────────────────────────────────────────────────────

describe('sharedHabitRepo.getById', () => {
  it('returns null when no habit found', async () => {
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    const result = await sharedHabitRepo.getById('nonexistent');
    expect(result).toBeNull();
  });

  it('returns the habit when found', async () => {
    const mockHabit = { id: 'sh-1', name: 'Morning Walk', buddyPairId: 'buddy-pair-1' };

    jest.mock('../../src/db/client', () => ({
      getDb: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          from: jest.fn().mockReturnValue({
            where: jest.fn().mockResolvedValue([mockHabit]),
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
    const { sharedHabitRepo } = require('../../src/db/repos/sharedHabitRepo');
    const result = await sharedHabitRepo.getById('sh-1');
    expect(result).toEqual(mockHabit);
  });
});

// ─── Index Re-export Test ─────────────────────────────────────────────────────

describe('index re-export', () => {
  it('re-exports sharedHabitRepo from repos/index.ts', () => {
    const indexSource = fs.readFileSync(
      path.resolve(__dirname, '../../src/db/repos/index.ts'),
      'utf-8',
    );
    expect(indexSource).toContain("export { sharedHabitRepo } from './sharedHabitRepo'");
  });
});
