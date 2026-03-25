/**
 * Static analysis tests for buddyStore.ts wiring.
 *
 * Verifies the store's integration patterns without requiring a full
 * RN/Expo/SQLite runtime. Checks that key wiring contracts are present
 * in the source file.
 */
import * as fs from 'fs';
import * as path from 'path';

const BUDDY_STORE_PATH = path.resolve(__dirname, '../../src/stores/buddyStore.ts');

// Guard: fail fast if the file doesn't exist yet
const fileExists = fs.existsSync(BUDDY_STORE_PATH);
const storeContent = fileExists ? fs.readFileSync(BUDDY_STORE_PATH, 'utf-8') : '';

describe('buddyStore -- existence', () => {
  it('src/stores/buddyStore.ts exists', () => {
    expect(fileExists).toBe(true);
  });

  it('exports useBuddyStore as a zustand store', () => {
    expect(storeContent).toMatch(/export\s+const\s+useBuddyStore\s*=\s*create</);
  });
});

describe('buddyStore -- zustand wiring', () => {
  it('imports create from zustand', () => {
    expect(storeContent).toMatch(/import\s+\{[^}]*create[^}]*\}\s+from\s+['"]zustand['"]/);
  });

  it('does NOT use persist middleware', () => {
    // Match actual middleware call `persist(` not the word "persist" in comments
    expect(storeContent).not.toMatch(/\bpersist\s*\(/);
  });
});

describe('buddyStore -- repo wiring', () => {
  it('imports buddyRepo', () => {
    expect(storeContent).toMatch(/buddyRepo/);
  });

  it('calls buddyRepo.getAccepted for loadBuddies', () => {
    expect(storeContent).toMatch(/buddyRepo\.getAccepted/);
  });

  it('calls buddyRepo.getPending for incoming requests', () => {
    expect(storeContent).toMatch(/buddyRepo\.getPending/);
  });

  it('calls buddyRepo.getPendingOutbound for outgoing requests', () => {
    expect(storeContent).toMatch(/buddyRepo\.getPendingOutbound/);
  });

  it('calls buddyRepo.findByInviteCode in enterCode', () => {
    expect(storeContent).toMatch(/buddyRepo\.findByInviteCode/);
  });

  it('calls buddyRepo.updateStatus for accept/decline/remove/block', () => {
    expect(storeContent).toMatch(/buddyRepo\.updateStatus/);
  });

  it('calls buddyRepo.create in generateInviteCode', () => {
    expect(storeContent).toMatch(/buddyRepo\.create/);
  });
});

describe('buddyStore -- domain engine wiring', () => {
  it('imports generateInviteCode from buddy-engine', () => {
    expect(storeContent).toMatch(/generateInviteCode/);
  });

  it('imports isInviteCodeExpired from buddy-engine', () => {
    expect(storeContent).toMatch(/isInviteCodeExpired/);
  });

  it('imports canSendRequest from buddy-engine', () => {
    expect(storeContent).toMatch(/canSendRequest/);
  });

  it('imports canAddBuddy from buddy-engine', () => {
    expect(storeContent).toMatch(/canAddBuddy/);
  });

  it('imports getBlockerSide from buddy-engine', () => {
    expect(storeContent).toMatch(/getBlockerSide/);
  });
});

describe('buddyStore -- invite code lifecycle', () => {
  it('clears invite code on redemption (single-use)', () => {
    expect(storeContent).toMatch(/inviteCode:\s*null/);
  });

  it('sets placeholder userB when generating invite code', () => {
    expect(storeContent).toMatch(/userB:\s*['"]{2}/);
  });
});

describe('buddyStore -- state shape', () => {
  it('has accepted array', () => {
    expect(storeContent).toMatch(/accepted:\s*\[\]/);
  });

  it('has pendingIncoming array', () => {
    expect(storeContent).toMatch(/pendingIncoming:\s*\[\]/);
  });

  it('has pendingOutgoing array', () => {
    expect(storeContent).toMatch(/pendingOutgoing:\s*\[\]/);
  });

  it('has pendingBadgeCount field', () => {
    expect(storeContent).toMatch(/pendingBadgeCount/);
  });
});

describe('buddyStore -- EnterCodeResult values', () => {
  it('returns rate_limited result type', () => {
    expect(storeContent).toMatch(/['"]rate_limited['"]/);
  });

  it('returns max_buddies result type', () => {
    expect(storeContent).toMatch(/['"]max_buddies['"]/);
  });

  it('returns not_found result type', () => {
    expect(storeContent).toMatch(/['"]not_found['"]/);
  });

  it('returns expired result type', () => {
    expect(storeContent).toMatch(/['"]expired['"]/);
  });

  it('returns already_connected result type', () => {
    expect(storeContent).toMatch(/['"]already_connected['"]/);
  });

  it('returns blocked result type', () => {
    expect(storeContent).toMatch(/['"]blocked['"]/);
  });

  it('returns success result type', () => {
    expect(storeContent).toMatch(/['"]success['"]/);
  });
});

describe('buddyStore -- block wiring', () => {
  it('calls getBlockerSide to determine block side', () => {
    expect(storeContent).toMatch(/getBlockerSide/);
  });

  it('computes blocked_by_a or blocked_by_b dynamically', () => {
    expect(storeContent).toMatch(/`blocked_by_\$\{side\}`|blocked_by_\$\{side\}/);
  });
});
