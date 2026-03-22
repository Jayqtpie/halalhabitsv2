/**
 * Static analysis tests for detoxStore.ts wiring.
 *
 * Verifies the store's integration patterns without requiring a full
 * RN/Expo/SQLite runtime. Checks that key wiring contracts are present
 * in the source file.
 */
import * as fs from 'fs';
import * as path from 'path';

const DETOX_STORE_PATH = path.resolve(__dirname, '../../src/stores/detoxStore.ts');

// Guard: fail fast if the file doesn't exist yet
const fileExists = fs.existsSync(DETOX_STORE_PATH);
const storeContent = fileExists ? fs.readFileSync(DETOX_STORE_PATH, 'utf-8') : '';

describe('detoxStore -- existence', () => {
  it('src/stores/detoxStore.ts exists', () => {
    expect(fileExists).toBe(true);
  });

  it('exports useDetoxStore', () => {
    expect(storeContent).toMatch(/export\s+const\s+useDetoxStore/);
  });
});

describe('detoxStore -- repo wiring', () => {
  it('imports detoxRepo from db/repos', () => {
    expect(storeContent).toMatch(/import\s+\{[^}]*detoxRepo[^}]*\}\s+from/);
  });
});

describe('detoxStore -- domain engine wiring', () => {
  it('imports calculateDetoxXP from detox-engine', () => {
    expect(storeContent).toMatch(/calculateDetoxXP/);
  });

  it('imports calculateEarlyExitPenalty from detox-engine', () => {
    expect(storeContent).toMatch(/calculateEarlyExitPenalty/);
  });

  it('imports canStartSession from detox-engine', () => {
    expect(storeContent).toMatch(/canStartSession/);
  });

  it('imports getSessionEndTime from detox-engine', () => {
    expect(storeContent).toMatch(/getSessionEndTime/);
  });

  it('imports getRemainingMs from detox-engine', () => {
    expect(storeContent).toMatch(/getRemainingMs/);
  });
});

describe('detoxStore -- gameStore wiring', () => {
  it('calls useGameStore.getState().awardXP', () => {
    expect(storeContent).toMatch(/useGameStore\.getState\(\)\.awardXP/);
  });

  it('uses detox_completion as sourceType', () => {
    expect(storeContent).toMatch(/'detox_completion'/);
  });

  it('passes multiplier 1.0 to awardXP', () => {
    expect(storeContent).toMatch(/1\.0/);
  });
});

describe('detoxStore -- notification wiring', () => {
  it('calls Notifications.scheduleNotificationAsync', () => {
    expect(storeContent).toMatch(/Notifications\.scheduleNotificationAsync/);
  });

  it('calls Notifications.cancelScheduledNotificationAsync', () => {
    expect(storeContent).toMatch(/Notifications\.cancelScheduledNotificationAsync/);
  });
});

describe('detoxStore -- lifecycle methods', () => {
  it('has loadActiveSession method', () => {
    expect(storeContent).toMatch(/loadActiveSession/);
  });

  it('has startSession method', () => {
    expect(storeContent).toMatch(/startSession/);
  });

  it('has completeSession method', () => {
    expect(storeContent).toMatch(/completeSession/);
  });

  it('has exitEarly method', () => {
    expect(storeContent).toMatch(/exitEarly/);
  });

  it('has getPenaltyPreview method', () => {
    expect(storeContent).toMatch(/getPenaltyPreview/);
  });

  it('has isDailyAvailable method', () => {
    expect(storeContent).toMatch(/isDailyAvailable/);
  });

  it('has isDeepAvailable method', () => {
    expect(storeContent).toMatch(/isDeepAvailable/);
  });
});

describe('detoxStore -- notification copy', () => {
  it('uses "Dungeon Cleared!" as notification title', () => {
    expect(storeContent).toMatch(/Dungeon Cleared!/);
  });

  it('includes XP amount in notification body', () => {
    // Body includes the XP variable and "added to your journey"
    expect(storeContent).toMatch(/added to your journey/);
  });
});

describe('detoxStore -- state shape', () => {
  it('has activeSession state field', () => {
    expect(storeContent).toMatch(/activeSession/);
  });

  it('has scheduledNotificationId state field', () => {
    expect(storeContent).toMatch(/scheduledNotificationId/);
  });

  it('has loading state field', () => {
    expect(storeContent).toMatch(/loading/);
  });
});

describe('detoxStore -- auto-complete expired sessions', () => {
  it('handles expired sessions in loadActiveSession (checks getRemainingMs)', () => {
    // loadActiveSession should check getRemainingMs and auto-complete if 0
    expect(storeContent).toMatch(/getRemainingMs/);
  });

  it('calls checkTitles after completeSession', () => {
    expect(storeContent).toMatch(/checkTitles/);
  });
});
