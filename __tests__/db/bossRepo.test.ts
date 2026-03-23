/**
 * bossRepo tests.
 * Verifies the PRIVATE privacy invariant and all required module exports.
 *
 * Privacy invariant (BOSS-08): boss_battles is PRIVATE — nafs archetype
 * data reveals personal struggle and must NEVER be synced. The repo must
 * not reference syncQueueRepo, assertSyncable, or enqueueSync.
 */
import * as fs from 'fs';
import * as path from 'path';

describe('bossRepo', () => {
  describe('privacy invariant', () => {
    let repoSource: string;
    let codeOnly: string;

    beforeAll(() => {
      repoSource = fs.readFileSync(
        path.resolve(__dirname, '../../src/db/repos/bossRepo.ts'),
        'utf-8',
      );
      // Strip comments so test strings in comments don't trigger false positives
      codeOnly = repoSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
    });

    it('never imports or calls assertSyncable', () => {
      expect(codeOnly).not.toContain('assertSyncable');
    });

    it('never imports or calls syncQueueRepo', () => {
      expect(codeOnly).not.toContain('syncQueueRepo');
    });

    it('never calls enqueueSync', () => {
      expect(codeOnly).not.toContain('enqueueSync');
    });
  });

  describe('module exports', () => {
    it('exports bossRepo with all required methods', () => {
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
          selectDistinct: jest.fn().mockReturnValue({
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

      const { bossRepo } = require('../../src/db/repos/bossRepo');
      expect(bossRepo).toBeDefined();
      expect(typeof bossRepo.create).toBe('function');
      expect(typeof bossRepo.getActiveBattle).toBe('function');
      expect(typeof bossRepo.getLastBattle).toBe('function');
      expect(typeof bossRepo.getAllBattles).toBe('function');
      expect(typeof bossRepo.updateDailyOutcome).toBe('function');
      expect(typeof bossRepo.defeat).toBe('function');
      expect(typeof bossRepo.escape).toBe('function');
      expect(typeof bossRepo.getDefeatedCount).toBe('function');
      expect(typeof bossRepo.getDefeatedArchetypes).toBe('function');
    });
  });
});
