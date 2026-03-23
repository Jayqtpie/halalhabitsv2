/**
 * Static analysis tests for bossStore.ts wiring.
 *
 * Verifies the store's integration patterns without requiring a full
 * RN/Expo/SQLite runtime. Checks that key wiring contracts are present
 * in the source file.
 *
 * Also verifies gameStore.ts integration for bossRepo.getDefeatedCount.
 */
import * as fs from 'fs';
import * as path from 'path';

const BOSS_STORE_PATH = path.resolve(__dirname, '../../src/stores/bossStore.ts');
const GAME_STORE_PATH = path.resolve(__dirname, '../../src/stores/gameStore.ts');

const bossStoreExists = fs.existsSync(BOSS_STORE_PATH);
const bossStoreContent = bossStoreExists ? fs.readFileSync(BOSS_STORE_PATH, 'utf-8') : '';
const gameStoreContent = fs.existsSync(GAME_STORE_PATH)
  ? fs.readFileSync(GAME_STORE_PATH, 'utf-8')
  : '';

// ─── Existence ────────────────────────────────────────────────────────────────

describe('bossStore -- existence', () => {
  it('src/stores/bossStore.ts exists', () => {
    expect(bossStoreExists).toBe(true);
  });

  it('exports useBossStore', () => {
    expect(bossStoreContent).toMatch(/export\s+const\s+useBossStore/);
  });

  it('uses create without persist middleware', () => {
    expect(bossStoreContent).toMatch(/create<BossState>/);
    expect(bossStoreContent).not.toMatch(/persist\(/);
  });
});

// ─── Repo wiring ──────────────────────────────────────────────────────────────

describe('bossStore -- bossRepo wiring', () => {
  it('imports bossRepo from db/repos/bossRepo', () => {
    expect(bossStoreContent).toMatch(/import\s+\{[^}]*bossRepo[^}]*\}\s+from/);
  });

  it('calls bossRepo.create in startBattle', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.create/);
  });

  it('calls bossRepo.getActiveBattle', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.getActiveBattle/);
  });

  it('calls bossRepo.getLastBattle', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.getLastBattle/);
  });

  it('calls bossRepo.updateDailyOutcome', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.updateDailyOutcome/);
  });

  it('calls bossRepo.defeat for defeat flow', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.defeat/);
  });

  it('calls bossRepo.escape for escape flow', () => {
    expect(bossStoreContent).toMatch(/bossRepo\.escape/);
  });
});

// ─── Domain engine wiring ─────────────────────────────────────────────────────

describe('bossStore -- boss-engine wiring', () => {
  it('imports canStartBattle from boss-engine', () => {
    expect(bossStoreContent).toMatch(/canStartBattle/);
  });

  it('imports calculateBossMaxHp from boss-engine', () => {
    expect(bossStoreContent).toMatch(/calculateBossMaxHp/);
  });

  it('imports calculateBossXpReward from boss-engine', () => {
    expect(bossStoreContent).toMatch(/calculateBossXpReward/);
  });

  it('imports calculateDailyDamage from boss-engine', () => {
    expect(bossStoreContent).toMatch(/calculateDailyDamage/);
  });

  it('imports calculateDailyHealing from boss-engine', () => {
    expect(bossStoreContent).toMatch(/calculateDailyHealing/);
  });

  it('imports applyDailyOutcome from boss-engine', () => {
    expect(bossStoreContent).toMatch(/applyDailyOutcome/);
  });

  it('imports calculatePartialXp from boss-engine for escape flow', () => {
    expect(bossStoreContent).toMatch(/calculatePartialXp/);
  });

  it('imports getMaxDays from boss-engine', () => {
    expect(bossStoreContent).toMatch(/getMaxDays/);
  });
});

// ─── gameStore wiring ─────────────────────────────────────────────────────────

describe('bossStore -- gameStore wiring', () => {
  it('calls useGameStore.getState().awardXP for defeat flow', () => {
    expect(bossStoreContent).toMatch(/useGameStore\.getState\(\)\.awardXP/);
  });

  it('calls useGameStore.getState().checkTitles after defeat', () => {
    expect(bossStoreContent).toMatch(/useGameStore\.getState\(\)\.checkTitles/);
  });

  it('uses boss_defeat as XP source type', () => {
    expect(bossStoreContent).toMatch(/'boss_defeat'/);
  });

  it('passes multiplier 1.0 to awardXP', () => {
    expect(bossStoreContent).toMatch(/1\.0/);
  });
});

// ─── Battle lifecycle state ───────────────────────────────────────────────────

describe('bossStore -- state fields', () => {
  it('has activeBattle state field', () => {
    expect(bossStoreContent).toMatch(/activeBattle/);
  });

  it('has loading state field', () => {
    expect(bossStoreContent).toMatch(/loading/);
  });

  it('has pendingDefeatCelebration state field', () => {
    expect(bossStoreContent).toMatch(/pendingDefeatCelebration/);
  });

  it('has pendingEscapeNotice state field', () => {
    expect(bossStoreContent).toMatch(/pendingEscapeNotice/);
  });
});

// ─── Lifecycle methods ────────────────────────────────────────────────────────

describe('bossStore -- lifecycle methods', () => {
  it('has loadActiveBattle method', () => {
    expect(bossStoreContent).toMatch(/loadActiveBattle/);
  });

  it('has startBattle method', () => {
    expect(bossStoreContent).toMatch(/startBattle/);
  });

  it('has processDailyOutcome method', () => {
    expect(bossStoreContent).toMatch(/processDailyOutcome/);
  });

  it('has abandonBattle method', () => {
    expect(bossStoreContent).toMatch(/abandonBattle/);
  });

  it('has canStart method', () => {
    expect(bossStoreContent).toMatch(/canStart/);
  });

  it('has clearCelebration method', () => {
    expect(bossStoreContent).toMatch(/clearCelebration/);
  });

  it('has clearEscapeNotice method', () => {
    expect(bossStoreContent).toMatch(/clearEscapeNotice/);
  });
});

// ─── Multi-day catch-up logic ─────────────────────────────────────────────────

describe('bossStore -- multi-day catch-up', () => {
  it('loadActiveBattle compares updatedAt date to detect missed days', () => {
    expect(bossStoreContent).toMatch(/daysBetween|missedDays/);
  });

  it('processes healing for missed days using calculateDailyHealing', () => {
    expect(bossStoreContent).toMatch(/calculateDailyHealing/);
  });
});

// ─── canStart level gate ──────────────────────────────────────────────────────

describe('bossStore -- canStart eligibility', () => {
  it('calls canStartBattle with level from gameStore', () => {
    expect(bossStoreContent).toMatch(/canStartBattle/);
    expect(bossStoreContent).toMatch(/useGameStore\.getState\(\)\.currentLevel/);
  });

  it('uses 3-day cooldown for canStartBattle call', () => {
    expect(bossStoreContent).toMatch(/canStartBattle.*3|3.*cooldown/s);
  });
});

// ─── gameStore.checkTitles integration ───────────────────────────────────────

describe('gameStore -- bossRepo.getDefeatedCount integration', () => {
  it('imports bossRepo in gameStore', () => {
    expect(gameStoreContent).toMatch(/bossRepo/);
  });

  it('calls bossRepo.getDefeatedCount in checkTitles', () => {
    expect(gameStoreContent).toMatch(/bossRepo\.getDefeatedCount/);
  });

  it('includes bossDefeats in the PlayerStats object', () => {
    expect(gameStoreContent).toMatch(/bossDefeats:/);
  });
});
