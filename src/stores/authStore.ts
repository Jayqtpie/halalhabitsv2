/**
 * Auth state management for HalalHabits.
 *
 * NO persist middleware — session is managed by Supabase's own
 * localStorage persistence (via expo-sqlite localStorage polyfill).
 *
 * Guest mode: userId defaults to 'default-user' when not authenticated.
 * This allows the app to function fully offline before account creation.
 */
import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface AuthState {
  session: Session | null;
  /** Real UUID when authenticated, 'default-user' in guest mode */
  userId: string;
  isAuthenticated: boolean;
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  /** Whether the "sign in to sync" nudge has been dismissed */
  nudgeDismissed: boolean;
  setSession: (session: Session | null) => void;
  setSyncStatus: (status: SyncStatus) => void;
  setLastSyncedAt: (iso: string | null) => void;
  setNudgeDismissed: (dismissed: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  userId: 'default-user',
  isAuthenticated: false,
  syncStatus: 'idle',
  lastSyncedAt: null,
  nudgeDismissed: false,
  setSession: (session) =>
    set({
      session,
      userId: session?.user?.id ?? 'default-user',
      isAuthenticated: !!session,
    }),
  setSyncStatus: (status) => set({ syncStatus: status }),
  setLastSyncedAt: (iso) => set({ lastSyncedAt: iso }),
  setNudgeDismissed: (dismissed) => set({ nudgeDismissed: dismissed }),
}));
