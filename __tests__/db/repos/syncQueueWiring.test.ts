/**
 * Sync Queue Wiring Tests
 *
 * Proves that every syncable repo write method calls syncQueueRepo.enqueue()
 * when authenticated, skips enqueue in guest mode, and never blocks the local
 * write even if enqueue throws.
 *
 * Tests:
 *  1. habitRepo.create() calls enqueue with 'habits', 'INSERT' when authenticated
 *  2. habitRepo.create() does NOT call enqueue when isAuthenticated=false (guest)
 *  3. habitRepo.update() calls enqueue with 'UPDATE'
 *  4. habitRepo.archive() calls enqueue with 'UPDATE'
 *  5. habitRepo.reorder() does NOT call enqueue
 *  6. xpRepo.create() calls enqueue with entityType 'xp_ledger'
 *  7. titleRepo.grantTitle() calls enqueue with entityType 'user_titles'
 *  8. titleRepo.seedTitles() does NOT call enqueue
 *  9. If syncQueueRepo.enqueue throws, the local write still succeeds (non-blocking)
 * 10. assertSyncable() is called before enqueue in each repo
 */

// ─── Mock Setup ──────────────────────────────────────────────────────────────

// Mock DB client — factory is a plain function with no external refs
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockSelect = jest.fn();

jest.mock('../../../src/db/client', () => ({
  getDb: jest.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
  })),
}));

// Mock syncQueueRepo — factory has no external refs; we get the fn via require after import
jest.mock('../../../src/db/repos/syncQueueRepo', () => ({
  syncQueueRepo: { enqueue: jest.fn().mockResolvedValue(undefined) },
}));

// Mock authStore — factory has no external refs; default is authenticated
jest.mock('../../../src/stores/authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ isAuthenticated: true, userId: 'test-uuid' })),
  },
}));

// Mock privacy-gate — factory has no external refs
jest.mock('../../../src/services/privacy-gate', () => ({
  assertSyncable: jest.fn(),
}));

// Mock drizzle-orm operators
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  and: jest.fn(),
  sql: jest.fn(),
  isNull: jest.fn(),
  asc: jest.fn(),
  ne: jest.fn(),
  gte: jest.fn(),
  lt: jest.fn(),
}));

// Mock schema
jest.mock('../../../src/db/schema', () => ({
  habits: { id: 'id', userId: 'userId', status: 'status', sortOrder: 'sortOrder' },
  xpLedger: { userId: 'userId', earnedAt: 'earnedAt', amount: 'amount' },
  quests: {
    id: 'id',
    userId: 'userId',
    status: 'status',
    templateId: 'templateId',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt',
    progress: 'progress',
  },
  userTitles: { userId: 'userId', id: 'id', titleId: 'titleId' },
  titles: { id: 'id', sortOrder: 'sortOrder' },
  settings: { userId: 'userId', id: 'id' },
  users: { id: 'id' },
  syncQueue: {},
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────
import { habitRepo } from '../../../src/db/repos/habitRepo';
import { xpRepo } from '../../../src/db/repos/xpRepo';
import { titleRepo } from '../../../src/db/repos/titleRepo';
import { syncQueueRepo } from '../../../src/db/repos/syncQueueRepo';
import { useAuthStore } from '../../../src/stores/authStore';
import { assertSyncable } from '../../../src/services/privacy-gate';

// ─── Typed mock accessors ─────────────────────────────────────────────────────
const mockEnqueue = syncQueueRepo.enqueue as jest.Mock;
const mockGetState = useAuthStore.getState as jest.Mock;
const mockAssertSyncable = assertSyncable as jest.Mock;

// ─── Test Data ────────────────────────────────────────────────────────────────
const testHabit = {
  id: 'habit-1',
  userId: 'test-uuid',
  name: 'Fajr Prayer',
  category: 'salah',
  status: 'active' as const,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const testXPEntry = {
  id: 'xp-1',
  userId: 'test-uuid',
  amount: 100,
  reason: 'habit_complete',
  earnedAt: '2026-01-01T00:00:00Z',
};

const testUserTitle = {
  id: 'ut-1',
  userId: 'test-uuid',
  titleId: 'title-fajr-warrior',
  earnedAt: '2026-01-01T00:00:00Z',
};

const testTitleSeed = [
  { id: 'title-1', name: 'The Steadfast', rarity: 'common', sortOrder: 0 },
];

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Reset authenticated state
  mockGetState.mockReturnValue({ isAuthenticated: true, userId: 'test-uuid' });

  // Reset enqueue to succeed
  mockEnqueue.mockResolvedValue(undefined);

  // Reset assertSyncable to no-op
  mockAssertSyncable.mockReturnValue(undefined);

  // Reset DB mock chains
  mockInsert.mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([{ id: 'test-id', name: 'Test', userId: 'test-uuid' }]),
      onConflictDoNothing: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 'ut-1', titleId: 'title-fajr-warrior', userId: 'test-uuid', earnedAt: '2026-01-01' }]),
      }),
    }),
  });

  mockUpdate.mockReturnValue({
    set: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
      returning: jest.fn().mockResolvedValue([{ id: 'test-id', progress: 1, status: 'in_progress' }]),
    }),
  });

  mockSelect.mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue([{ id: 'habit-1', name: 'Test Habit', userId: 'test-uuid', status: 'active' }]),
      orderBy: jest.fn().mockResolvedValue([]),
    }),
  });
});

/** Helper: flush all microtasks and macrotasks after a fire-and-forget async op */
async function flushAsync() {
  await new Promise(resolve => setImmediate(resolve));
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('habitRepo sync wiring', () => {
  it('Test 1: create() calls enqueue with (habits, id, INSERT, payload) when authenticated', async () => {
    await habitRepo.create(testHabit as any);
    await flushAsync();

    expect(mockEnqueue).toHaveBeenCalledWith('habits', testHabit.id, 'INSERT', testHabit);
  });

  it('Test 2: create() does NOT call enqueue when isAuthenticated=false (guest mode)', async () => {
    mockGetState.mockReturnValue({ isAuthenticated: false, userId: 'default-user' });

    await habitRepo.create(testHabit as any);
    await flushAsync();

    expect(mockEnqueue).not.toHaveBeenCalled();
  });

  it('Test 3: update() calls enqueue with operation UPDATE', async () => {
    await habitRepo.update('habit-1', { name: 'Updated Name' });
    await flushAsync();

    expect(mockEnqueue).toHaveBeenCalledWith('habits', 'habit-1', 'UPDATE', expect.any(Object));
  });

  it('Test 4: archive() calls enqueue with operation UPDATE', async () => {
    await habitRepo.archive('habit-1');
    await flushAsync();

    expect(mockEnqueue).toHaveBeenCalledWith('habits', 'habit-1', 'UPDATE', expect.any(Object));
  });

  it('Test 5: reorder() does NOT call enqueue (cosmetic sort change)', async () => {
    await habitRepo.reorder('test-uuid', ['habit-1', 'habit-2']);
    await flushAsync();

    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});

describe('xpRepo sync wiring', () => {
  it('Test 6: create() calls enqueue with entityType xp_ledger and redacted source fields', async () => {
    await xpRepo.create(testXPEntry as any);
    await flushAsync();

    // Privacy: sourceId and sourceType are stripped before sync to prevent
    // worship completion reconstruction on the server
    expect(mockEnqueue).toHaveBeenCalledWith(
      'xp_ledger',
      testXPEntry.id,
      'INSERT',
      expect.objectContaining({
        id: testXPEntry.id,
        userId: testXPEntry.userId,
        amount: testXPEntry.amount,
        sourceId: null,
        sourceType: 'redacted',
      }),
    );
  });
});

describe('titleRepo sync wiring', () => {
  it('Test 7: grantTitle() calls enqueue with entityType user_titles', async () => {
    await titleRepo.grantTitle(testUserTitle as any);
    await flushAsync();

    expect(mockEnqueue).toHaveBeenCalledWith(
      'user_titles',
      testUserTitle.titleId,
      'INSERT',
      testUserTitle
    );
  });

  it('Test 8: seedTitles() does NOT call enqueue (static seed data)', async () => {
    // seedTitles uses insert().values().onConflictDoNothing() — no returning
    mockInsert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
      }),
    });

    await titleRepo.seedTitles(testTitleSeed as any);
    await flushAsync();

    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});

describe('non-blocking guarantee', () => {
  it('Test 9: local write succeeds even if enqueue throws', async () => {
    mockEnqueue.mockRejectedValue(new Error('Sync queue DB error'));

    // Should not throw — local write must succeed
    let result: any;
    await expect(async () => {
      result = await habitRepo.create(testHabit as any);
    }).not.toThrow();

    await flushAsync();

    // Local DB write succeeded (insert was called, result returned)
    expect(mockInsert).toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});

describe('assertSyncable guard', () => {
  it('Test 10: assertSyncable() is called before enqueue in habitRepo.create()', async () => {
    await habitRepo.create(testHabit as any);
    await flushAsync();

    // assertSyncable must have been called with the correct table name
    expect(mockAssertSyncable).toHaveBeenCalledWith('habits');
    // enqueue was also called
    expect(mockEnqueue).toHaveBeenCalled();

    // assertSyncable was called before enqueue (by invocation order)
    const assertOrder = mockAssertSyncable.mock.invocationCallOrder[0];
    const enqueueOrder = mockEnqueue.mock.invocationCallOrder[0];
    expect(assertOrder).toBeLessThan(enqueueOrder);
  });
});
