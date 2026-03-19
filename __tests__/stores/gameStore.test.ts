/**
 * Static analysis tests for gameStore.ts integration wiring.
 *
 * These tests verify the source file contains correct wiring patterns
 * without needing to mock the full Zustand/RN pipeline.
 *
 * Covers the 3 integration gaps in gameStore.ts identified in the v1.0
 * milestone audit:
 *   1. mercyRecoveries wired to streakRepo.getAllForUser (not hardcoded 0)
 *   2. muhasabahStreak wired to muhasabahRepo.getStreak (not hardcoded 0)
 *   3. updateQuestProgress partial branch writes newProgress (not targetValue)
 */
import * as fs from 'fs';
import * as path from 'path';

const GAME_STORE_PATH = path.resolve(__dirname, '../../src/stores/gameStore.ts');
const gameStoreContent = fs.readFileSync(GAME_STORE_PATH, 'utf-8');

describe('checkTitles -- PlayerStats wiring', () => {
  it('imports streakRepo from repos', () => {
    expect(gameStoreContent).toMatch(/import\s+\{[^}]*streakRepo[^}]*\}\s+from/);
  });

  it('imports muhasabahRepo from repos', () => {
    expect(gameStoreContent).toMatch(/import\s+\{[^}]*muhasabahRepo[^}]*\}\s+from/);
  });

  it('calls streakRepo.getAllForUser for mercyRecoveries', () => {
    expect(gameStoreContent).toMatch(/streakRepo\.getAllForUser/);
  });

  it('calls muhasabahRepo.getStreak for muhasabahStreak', () => {
    expect(gameStoreContent).toMatch(/muhasabahRepo\.getStreak/);
  });

  it('does not hardcode mercyRecoveries: 0', () => {
    expect(gameStoreContent).not.toMatch(/mercyRecoveries:\s*0/);
  });

  it('does not hardcode muhasabahStreak: 0', () => {
    expect(gameStoreContent).not.toMatch(/muhasabahStreak:\s*0/);
  });
});

describe('updateQuestProgress -- partial progress fix', () => {
  it('partial branch uses newProgress not quest.targetValue', () => {
    // Find the else branch (partial progress) and verify it uses newProgress.
    // The completed branch correctly uses quest.targetValue; the partial else block must use newProgress.
    const partialBranchMatch = gameStoreContent.match(
      /\/\/ Partial progress[\s\S]*?updateProgressAtomic\(quest\.id,\s*([\w.]+)\)/
    );
    expect(partialBranchMatch).not.toBeNull();
    expect(partialBranchMatch![1]).toBe('newProgress');
  });
});
