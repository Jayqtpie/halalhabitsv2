/**
 * Tests for completionRepo data access layer.
 *
 * Mocks getDb() since expo-sqlite is not available in test environment.
 * Tests verify that repo methods call the correct Drizzle query patterns.
 */

// Mock expo-sqlite before any imports
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
  })),
}));

// Build mock chain for Drizzle query builder
// The chain object is thenable (has .then) so it works both as a chainable
// builder AND as a Promise when awaited directly.
function createMockChain(returnValue: unknown = []) {
  let _resolveValue = returnValue;
  const chain: Record<string, jest.Mock> = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.from = jest.fn().mockReturnValue(chain);
  chain.where = jest.fn().mockReturnValue(chain);
  chain.innerJoin = jest.fn().mockReturnValue(chain);
  chain.limit = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.values = jest.fn().mockReturnValue(chain);
  chain.returning = jest.fn().mockResolvedValue(returnValue);
  chain.orderBy = jest.fn().mockReturnValue(chain);
  // Make the chain thenable so `await db.select().from().where()` works
  chain.then = jest.fn().mockImplementation((resolve: (v: unknown) => void) => {
    return Promise.resolve(_resolveValue).then(resolve);
  });
  // Allow tests to set the resolve value for the next await
  (chain as any)._setResolveValue = (val: unknown) => { _resolveValue = val; };
  return chain;
}

// Mock the db client
const mockChain = createMockChain();
jest.mock('../../src/db/client', () => ({
  getDb: jest.fn(() => mockChain),
  db: {},
}));

import { completionRepo } from '../../src/db/repos/completionRepo';

describe('completionRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset resolve value to default empty array
    (mockChain as any)._setResolveValue([]);
  });

  describe('create', () => {
    it('returns created completion with id', async () => {
      const mockCompletion = {
        id: 'comp-1',
        habitId: 'habit-1',
        completedAt: '2026-03-09T10:00:00.000Z',
        xpEarned: 0,
        streakMultiplier: 1.0,
        createdAt: '2026-03-09T10:00:00.000Z',
      };
      mockChain.returning.mockResolvedValueOnce([mockCompletion]);

      const result = await completionRepo.create({
        id: 'comp-1',
        habitId: 'habit-1',
        completedAt: '2026-03-09T10:00:00.000Z',
        xpEarned: 0,
        streakMultiplier: 1.0,
        createdAt: '2026-03-09T10:00:00.000Z',
      });

      expect(result).toEqual([mockCompletion]);
      expect(mockChain.insert).toHaveBeenCalled();
      expect(mockChain.values).toHaveBeenCalled();
      expect(mockChain.returning).toHaveBeenCalled();
    });
  });

  describe('getForDate', () => {
    it('filters completions by habit id and date range', async () => {
      const mockCompletions = [
        {
          id: 'comp-1',
          habitId: 'habit-1',
          completedAt: '2026-03-09T10:00:00.000Z',
          xpEarned: 0,
          streakMultiplier: 1.0,
          createdAt: '2026-03-09T10:00:00.000Z',
        },
      ];
      (mockChain as any)._setResolveValue(mockCompletions);

      const result = await completionRepo.getForDate(
        'habit-1',
        '2026-03-09T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
      );

      expect(result).toEqual(mockCompletions);
      expect(mockChain.select).toHaveBeenCalled();
      expect(mockChain.from).toHaveBeenCalled();
      expect(mockChain.where).toHaveBeenCalled();
    });

    it('returns empty array when no completions in range', async () => {
      (mockChain as any)._setResolveValue([]);

      const result = await completionRepo.getForDate(
        'habit-1',
        '2026-03-08T00:00:00.000Z',
        '2026-03-09T00:00:00.000Z',
      );

      expect(result).toEqual([]);
    });
  });

  describe('hasCompletionToday', () => {
    it('returns true when completion exists for today', async () => {
      (mockChain as any)._setResolveValue([{ id: 'comp-1' }]);

      const result = await completionRepo.hasCompletionToday(
        'habit-1',
        '2026-03-09T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
      );

      expect(result).toBe(true);
    });

    it('returns false when no completion exists for today', async () => {
      (mockChain as any)._setResolveValue([]);

      const result = await completionRepo.hasCompletionToday(
        'habit-1',
        '2026-03-09T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
      );

      expect(result).toBe(false);
    });
  });

  describe('getAllForDate', () => {
    it('returns completions across habits for a user', async () => {
      const mockCompletions = [
        {
          id: 'comp-1',
          habitId: 'habit-1',
          completedAt: '2026-03-09T10:00:00.000Z',
          xpEarned: 0,
          streakMultiplier: 1.0,
          createdAt: '2026-03-09T10:00:00.000Z',
        },
        {
          id: 'comp-2',
          habitId: 'habit-2',
          completedAt: '2026-03-09T14:00:00.000Z',
          xpEarned: 0,
          streakMultiplier: 1.5,
          createdAt: '2026-03-09T14:00:00.000Z',
        },
      ];
      (mockChain as any)._setResolveValue(mockCompletions);

      const result = await completionRepo.getAllForDate(
        'user-1',
        '2026-03-09T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
      );

      expect(result).toEqual(mockCompletions);
      expect(result).toHaveLength(2);
      expect(mockChain.innerJoin).toHaveBeenCalled();
    });

    it('returns empty array when user has no completions for date', async () => {
      (mockChain as any)._setResolveValue([]);

      const result = await completionRepo.getAllForDate(
        'user-1',
        '2026-03-09T00:00:00.000Z',
        '2026-03-10T00:00:00.000Z',
      );

      expect(result).toEqual([]);
    });
  });
});
