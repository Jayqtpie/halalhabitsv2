/**
 * muhasabahRepo tests.
 * Verifies CRUD operations and the PRIVATE data invariant
 * (never calls assertSyncable).
 */
import * as fs from 'fs';
import * as path from 'path';

describe('muhasabahRepo', () => {
  describe('privacy invariant', () => {
    it('never imports or calls assertSyncable', () => {
      const repoSource = fs.readFileSync(
        path.resolve(__dirname, '../../src/db/repos/muhasabahRepo.ts'),
        'utf-8',
      );
      // Strip comments before checking — the word may appear in doc comments
      const codeOnly = repoSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      expect(codeOnly).not.toContain('assertSyncable');
    });
  });

  describe('module exports', () => {
    it('exports muhasabahRepo with expected methods', () => {
      // Dynamic require to avoid triggering db initialization
      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          insert: jest.fn().mockReturnValue({
            values: jest.fn().mockReturnValue({
              returning: jest.fn().mockResolvedValue([]),
            }),
          }),
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue([]),
                }),
              }),
            }),
          }),
        })),
      }));

      const { muhasabahRepo } = require('../../src/db/repos/muhasabahRepo');
      expect(muhasabahRepo).toBeDefined();
      expect(typeof muhasabahRepo.create).toBe('function');
      expect(typeof muhasabahRepo.getByUserId).toBe('function');
      expect(typeof muhasabahRepo.getTodayEntry).toBe('function');
      expect(typeof muhasabahRepo.getStreak).toBe('function');
    });
  });

  describe('getTodayEntry', () => {
    it('returns null when no entry matches today', async () => {
      const mockLimit = jest.fn().mockResolvedValue([
        { createdAt: '2026-03-14T21:00:00.000Z', userId: 'u1' },
      ]);

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: mockLimit,
                }),
              }),
            }),
          }),
        })),
      }));

      // Clear module cache to pick up fresh mock
      jest.resetModules();
      const { muhasabahRepo } = require('../../src/db/repos/muhasabahRepo');

      const result = await muhasabahRepo.getTodayEntry('u1', '2026-03-15');
      expect(result).toBeNull();
    });

    it('returns entry when createdAt starts with today date string', async () => {
      const todayEntry = { createdAt: '2026-03-15T21:30:00.000Z', userId: 'u1' };
      const mockLimit = jest.fn().mockResolvedValue([todayEntry]);

      jest.mock('../../src/db/client', () => ({
        getDb: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            from: jest.fn().mockReturnValue({
              where: jest.fn().mockReturnValue({
                orderBy: jest.fn().mockReturnValue({
                  limit: mockLimit,
                }),
              }),
            }),
          }),
        })),
      }));

      jest.resetModules();
      const { muhasabahRepo } = require('../../src/db/repos/muhasabahRepo');

      const result = await muhasabahRepo.getTodayEntry('u1', '2026-03-15');
      expect(result).toEqual(todayEntry);
    });
  });
});
