/**
 * detoxRepo tests.
 * Verifies CRUD operations and the LOCAL_ONLY data invariant
 * (never calls syncQueueRepo or assertSyncable).
 */
import * as fs from 'fs';
import * as path from 'path';

describe('detoxRepo', () => {
  describe('privacy invariant', () => {
    it('never imports or calls assertSyncable', () => {
      const repoSource = fs.readFileSync(
        path.resolve(__dirname, '../../src/db/repos/detoxRepo.ts'),
        'utf-8',
      );
      const codeOnly = repoSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      expect(codeOnly).not.toContain('assertSyncable');
    });

    it('never imports or calls syncQueueRepo', () => {
      const repoSource = fs.readFileSync(
        path.resolve(__dirname, '../../src/db/repos/detoxRepo.ts'),
        'utf-8',
      );
      const codeOnly = repoSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      expect(codeOnly).not.toContain('syncQueueRepo');
    });
  });

  describe('module exports', () => {
    it('exports detoxRepo with all required methods', () => {
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
              where: jest.fn().mockReturnValue({
                returning: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        })),
      }));

      const { detoxRepo } = require('../../src/db/repos/detoxRepo');
      expect(detoxRepo).toBeDefined();
      expect(typeof detoxRepo.create).toBe('function');
      expect(typeof detoxRepo.getActiveSession).toBe('function');
      expect(typeof detoxRepo.getTodaySessions).toBe('function');
      expect(typeof detoxRepo.getThisWeekDeepSessions).toBe('function');
      expect(typeof detoxRepo.complete).toBe('function');
      expect(typeof detoxRepo.exitEarly).toBe('function');
      expect(typeof detoxRepo.getCompletedCount).toBe('function');
    });
  });

  describe('getActiveSession', () => {
    it('returns null when no active session exists', async () => {
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
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getActiveSession('user-1');
      expect(result).toBeNull();
    });

    it('returns the active session when one exists', async () => {
      const activeSession = {
        id: 'session-1',
        userId: 'user-1',
        status: 'active',
        variant: 'daily',
        durationHours: 4,
        xpEarned: 0,
        xpPenalty: 0,
        startedAt: '2026-01-01T10:00:00.000Z',
        endedAt: null,
        createdAt: '2026-01-01T10:00:00.000Z',
      };

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([activeSession]),
            }),
          }),
        })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getActiveSession('user-1');
      expect(result).toEqual(activeSession);
    });
  });

  describe('getTodaySessions', () => {
    it('returns empty array when no sessions today', async () => {
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
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getTodaySessions(
        'user-1',
        '2026-01-01T00:00:00.000Z',
        '2026-01-02T00:00:00.000Z',
      );
      expect(result).toEqual([]);
    });

    it('returns sessions within the day boundary', async () => {
      const sessions = [
        { id: 's1', userId: 'user-1', startedAt: '2026-01-01T10:00:00.000Z', status: 'completed' },
        { id: 's2', userId: 'user-1', startedAt: '2026-01-01T15:00:00.000Z', status: 'abandoned' },
      ];

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue(sessions),
            }),
          }),
        })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getTodaySessions(
        'user-1',
        '2026-01-01T00:00:00.000Z',
        '2026-01-02T00:00:00.000Z',
      );
      expect(result).toHaveLength(2);
    });
  });

  describe('getThisWeekDeepSessions', () => {
    it('returns empty array when no deep sessions this week', async () => {
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
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getThisWeekDeepSessions(
        'user-1',
        '2026-01-19T00:00:00.000Z',
      );
      expect(result).toEqual([]);
    });
  });

  describe('complete', () => {
    it('returns updated session with completed status', async () => {
      const updated = [{ id: 's1', status: 'completed', xpEarned: 100, endedAt: '2026-01-01T14:00:00.000Z' }];

      const mockReturning = jest.fn().mockResolvedValue(updated);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({ update: mockUpdate })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.complete('s1', 100, '2026-01-01T14:00:00.000Z');
      expect(result).toEqual(updated);
    });
  });

  describe('exitEarly', () => {
    it('returns updated session with abandoned status and penalty', async () => {
      const updated = [{ id: 's1', status: 'abandoned', xpPenalty: 50, endedAt: '2026-01-01T12:00:00.000Z' }];

      const mockReturning = jest.fn().mockResolvedValue(updated);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({ update: mockUpdate })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.exitEarly('s1', 50, '2026-01-01T12:00:00.000Z');
      expect(result).toEqual(updated);
    });
  });

  describe('getCompletedCount', () => {
    it('returns 0 when no completed sessions', async () => {
      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ value: 0 }]),
            }),
          }),
        })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getCompletedCount('user-1');
      expect(result).toBe(0);
    });

    it('returns count of completed sessions', async () => {
      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockResolvedValue([{ value: 5 }]),
            }),
          }),
        })),
      }));

      jest.resetModules();
      const { detoxRepo } = require('../../src/db/repos/detoxRepo');

      const result = await detoxRepo.getCompletedCount('user-1');
      expect(result).toBe(5);
    });
  });

  describe('index re-export', () => {
    it('re-exports detoxRepo from repos/index.ts', () => {
      const indexSource = fs.readFileSync(
        path.resolve(__dirname, '../../src/db/repos/index.ts'),
        'utf-8',
      );
      expect(indexSource).toContain("export { detoxRepo } from './detoxRepo'");
    });
  });
});
