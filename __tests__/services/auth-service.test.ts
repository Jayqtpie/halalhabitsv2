/**
 * Auth Service Tests
 *
 * Tests all 7 behaviors: signUp (keep/fresh), signIn, signOut (non-destructive),
 * deleteAccount (full erasure), migrateGuestData.
 */

// Mock the supabase client singleton directly (avoids localStorage polyfill in Node env)
jest.mock('../../src/lib/supabase', () => {
  const mockAuth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  };
  const mockRpc = jest.fn();

  return {
    supabase: {
      auth: mockAuth,
      rpc: mockRpc,
    },
    supabaseConfigured: true,
  };
});

// Mock data-export for deleteAllUserData
jest.mock('../../src/services/data-export', () => ({
  deleteAllUserData: jest.fn(),
}));

// Mock getDb for migrateGuestData
const mockExecSync = jest.fn();
jest.mock('../../src/db/client', () => ({
  getDb: jest.fn(() => ({
    $client: {
      runSync: mockExecSync,
    },
  })),
}));

import { supabase } from '../../src/lib/supabase';
import { deleteAllUserData } from '../../src/services/data-export';
import {
  signUp,
  signIn,
  signOut,
  deleteAccount,
  migrateGuestData,
} from '../../src/services/auth-service';

const mockSignUp = supabase.auth.signUp as jest.Mock;
const mockSignIn = supabase.auth.signInWithPassword as jest.Mock;
const mockSignOut = supabase.auth.signOut as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

const SUCCESS_SIGNUP = {
  data: { session: { user: { id: 'test-uid' } }, user: { id: 'test-uid' } },
  error: null,
};

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecSync.mockReset();
    mockSignUp.mockResolvedValue(SUCCESS_SIGNUP);
    mockSignIn.mockResolvedValue(SUCCESS_SIGNUP);
    mockSignOut.mockResolvedValue({ error: null });
    mockRpc.mockResolvedValue({ error: null });
    (deleteAllUserData as jest.Mock).mockResolvedValue(undefined);
  });

  // ─── Test 1: signUp ───────────────────────────────────────────────────

  it('Test 1: signUp calls supabase.auth.signUp with email and password, returns userId', async () => {
    const result = await signUp('test@example.com', 'password123', false);
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.userId).toBe('test-uid');
    expect(result.error).toBeNull();
  });

  // ─── Test 2: signIn ───────────────────────────────────────────────────

  it('Test 2: signIn calls supabase.auth.signInWithPassword with email and password, returns userId', async () => {
    const result = await signIn('test@example.com', 'password123');
    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.userId).toBe('test-uid');
    expect(result.error).toBeNull();
  });

  // ─── Test 3: signOut ──────────────────────────────────────────────────

  it('Test 3: signOut calls supabase.auth.signOut with scope local, does NOT clear local data', async () => {
    const result = await signOut();
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(result.error).toBeNull();
    // deleteAllUserData must NOT be called during sign out
    expect(deleteAllUserData).not.toHaveBeenCalled();
  });

  // ─── Test 4: deleteAccount ────────────────────────────────────────────

  it('Test 4: deleteAccount calls supabase.rpc to delete server data, then deleteAllUserData for local cleanup', async () => {
    const result = await deleteAccount('test-uid');
    expect(mockRpc).toHaveBeenCalledWith('delete_user');
    expect(deleteAllUserData).toHaveBeenCalledWith('test-uid');
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(result.error).toBeNull();
  });

  // ─── Test 5: migrateGuestData ─────────────────────────────────────────

  it('Test 5: migrateGuestData calls UPDATE on all syncable tables to re-key default-user rows', async () => {
    await migrateGuestData('new-auth-uid');
    // Should have called runSync multiple times (users table + all FK tables)
    expect(mockExecSync).toHaveBeenCalled();
    const calls = mockExecSync.mock.calls.map((c: unknown[]) => c[0] as string);
    // users table id re-key
    const usersUpdate = calls.find((sql: string) => sql.includes('UPDATE users') && sql.includes('default-user'));
    expect(usersUpdate).toBeDefined();
    // At least one FK table re-key with user_id
    const fkUpdate = calls.find((sql: string) => sql.includes('user_id') && sql.includes('default-user'));
    expect(fkUpdate).toBeDefined();
  });

  // ─── Test 6: signUp with keepProgress triggers migrateGuestData ───────

  it('Test 6: signUp with keepProgress=true triggers migrateGuestData', async () => {
    const result = await signUp('test@example.com', 'password123', true);
    expect(result.userId).toBe('test-uid');
    // migrateGuestData should have run runSync calls
    expect(mockExecSync).toHaveBeenCalled();
  });

  // ─── Test 7: signUp with start fresh does NOT call migrateGuestData ───

  it('Test 7: signUp with keepProgress=false does NOT call migrateGuestData', async () => {
    await signUp('test@example.com', 'password123', false);
    // runSync should NOT be called (no migration)
    expect(mockExecSync).not.toHaveBeenCalled();
  });
});
