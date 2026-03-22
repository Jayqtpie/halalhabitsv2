/**
 * Detox Store — Zustand state for Dopamine Detox Dungeon sessions.
 *
 * Orchestrates full session lifecycle:
 *   startSession -> scheduleNotification
 *   completeSession -> awardXP -> checkTitles -> cancelNotification
 *   exitEarly -> applyPenalty -> cancelNotification
 *   loadActiveSession -> auto-complete if expired
 *
 * NO persist middleware — session data lives in SQLite via detoxRepo.
 * LOCAL_ONLY: detox sessions never sync (privacy invariant).
 */
import { create } from 'zustand';
import * as Notifications from 'expo-notifications';
import {
  calculateDetoxXP,
  calculateEarlyExitPenalty,
  canStartSession,
  getSessionEndTime,
  getRemainingMs,
} from '../domain/detox-engine';
import { detoxRepo } from '../db/repos';
import { useGameStore } from './gameStore';
import { generateId } from '../utils/uuid';
import type { DetoxSession, NewDetoxSession } from '../types/database';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get midnight local time as ISO string (today's start) */
function todayStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

/** Get next midnight local time as ISO string */
function nextMidnight(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).toISOString();
}

/** Get the start of this week (Sunday midnight) as ISO string */
function thisWeekStart(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 = Sunday
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek).toISOString();
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface DetoxState {
  activeSession: DetoxSession | null;
  scheduledNotificationId: string | null;
  loading: boolean;

  loadActiveSession: (userId: string) => Promise<void>;
  startSession: (variant: 'daily' | 'deep', durationHours: number, userId: string) => Promise<boolean>;
  completeSession: (userId: string) => Promise<number>; // returns XP earned
  exitEarly: (userId: string) => Promise<number>; // returns XP penalty
  getPenaltyPreview: () => number; // current penalty if exiting now
  isDailyAvailable: (userId: string) => Promise<boolean>;
  isDeepAvailable: (userId: string) => Promise<boolean>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDetoxStore = create<DetoxState>((set, get) => ({
  activeSession: null,
  scheduledNotificationId: null,
  loading: false,

  // ─── loadActiveSession ────────────────────────────────────────────────────

  loadActiveSession: async (userId: string) => {
    set({ loading: true });
    try {
      const session = await detoxRepo.getActiveSession(userId);

      if (!session) {
        set({ activeSession: null, loading: false });
        return;
      }

      const remainingMs = getRemainingMs(session.startedAt, session.durationHours);

      if (remainingMs > 0) {
        // Session still running — restore state
        set({ activeSession: session, loading: false });
      } else {
        // Session expired while app was closed — auto-complete
        const baseXP = calculateDetoxXP(session.variant as 'daily' | 'deep', session.durationHours);
        const endedAt = getSessionEndTime(session.startedAt, session.durationHours);
        await detoxRepo.complete(session.id, baseXP, endedAt);

        // Cancel any lingering detox notifications
        try {
          await Notifications.cancelAllScheduledNotificationsAsync();
        } catch {
          // Non-fatal: notification cleanup
        }

        // Award XP for the completed session
        await useGameStore.getState().awardXP(userId, baseXP, 1.0, 'detox_completion', session.id);
        await useGameStore.getState().checkTitles(userId);

        set({ activeSession: null, scheduledNotificationId: null, loading: false });
      }
    } catch (e) {
      set({ loading: false });
      console.warn('[detoxStore] loadActiveSession error:', e);
    }
  },

  // ─── startSession ─────────────────────────────────────────────────────────

  startSession: async (variant: 'daily' | 'deep', durationHours: number, userId: string) => {
    try {
      const dayStart = todayStart();
      const dayEnd = nextMidnight();
      const weekStart = thisWeekStart();

      // Check availability for the requested variant
      let existingSessions;
      if (variant === 'daily') {
        existingSessions = await detoxRepo.getTodaySessions(userId, dayStart, dayEnd);
      } else {
        existingSessions = await detoxRepo.getThisWeekDeepSessions(userId, weekStart);
      }

      if (!canStartSession(variant, existingSessions)) {
        return false;
      }

      const startedAt = new Date().toISOString();
      const sessionId = generateId();

      const sessionData: NewDetoxSession = {
        id: sessionId,
        userId,
        variant,
        durationHours,
        status: 'active',
        xpEarned: 0,
        xpPenalty: 0,
        startedAt,
        endedAt: null,
        createdAt: startedAt,
      };

      const [created] = await detoxRepo.create(sessionData);
      const sessionEnd = getSessionEndTime(startedAt, durationHours);
      const baseXP = calculateDetoxXP(variant, durationHours);

      // Schedule push notification for session completion
      let notificationId: string | null = null;
      try {
        notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Dungeon Cleared!',
            body: `You held strong. +${baseXP} XP added to your journey.`,
            sound: true,
          },
          trigger: {
            type: 'date',
            date: new Date(sessionEnd),
          } as any,
        });
      } catch {
        // Non-fatal: notification scheduling failure
        console.warn('[detoxStore] Failed to schedule notification');
      }

      set({
        activeSession: created,
        scheduledNotificationId: notificationId,
      });

      return true;
    } catch (e) {
      console.warn('[detoxStore] startSession error:', e);
      return false;
    }
  },

  // ─── completeSession ──────────────────────────────────────────────────────

  completeSession: async (userId: string) => {
    const state = get();
    const session = state.activeSession;
    if (!session) return 0;

    try {
      const baseXP = calculateDetoxXP(session.variant as 'daily' | 'deep', session.durationHours);
      const endedAt = new Date().toISOString();

      await detoxRepo.complete(session.id, baseXP, endedAt);

      // Cancel scheduled completion notification
      if (state.scheduledNotificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(state.scheduledNotificationId);
        } catch {
          // Non-fatal: already fired or cancelled
        }
      }

      // Award XP via gameStore
      await useGameStore.getState().awardXP(userId, baseXP, 1.0, 'detox_completion', session.id);
      await useGameStore.getState().checkTitles(userId);

      set({ activeSession: null, scheduledNotificationId: null });

      return baseXP;
    } catch (e) {
      console.warn('[detoxStore] completeSession error:', e);
      return 0;
    }
  },

  // ─── exitEarly ────────────────────────────────────────────────────────────

  exitEarly: async (userId: string) => {
    const state = get();
    const session = state.activeSession;
    if (!session) return 0;

    try {
      const baseXP = calculateDetoxXP(session.variant as 'daily' | 'deep', session.durationHours);
      const now = new Date().toISOString();
      const penalty = calculateEarlyExitPenalty(
        session.startedAt,
        session.durationHours,
        baseXP,
        now,
      );

      await detoxRepo.exitEarly(session.id, penalty, now);

      // Cancel scheduled completion notification
      if (state.scheduledNotificationId) {
        try {
          await Notifications.cancelScheduledNotificationAsync(state.scheduledNotificationId);
        } catch {
          // Non-fatal: already fired or cancelled
        }
      }

      set({ activeSession: null, scheduledNotificationId: null });

      return penalty;
    } catch (e) {
      console.warn('[detoxStore] exitEarly error:', e);
      return 0;
    }
  },

  // ─── getPenaltyPreview ────────────────────────────────────────────────────

  getPenaltyPreview: () => {
    const { activeSession } = get();
    if (!activeSession) return 0;
    const baseXP = calculateDetoxXP(activeSession.variant as 'daily' | 'deep', activeSession.durationHours);
    return calculateEarlyExitPenalty(
      activeSession.startedAt,
      activeSession.durationHours,
      baseXP,
      new Date().toISOString(),
    );
  },

  // ─── isDailyAvailable ─────────────────────────────────────────────────────

  isDailyAvailable: async (userId: string) => {
    try {
      const dayStart = todayStart();
      const dayEnd = nextMidnight();
      const sessions = await detoxRepo.getTodaySessions(userId, dayStart, dayEnd);
      return canStartSession('daily', sessions);
    } catch (e) {
      console.warn('[detoxStore] isDailyAvailable error:', e);
      return false;
    }
  },

  // ─── isDeepAvailable ──────────────────────────────────────────────────────

  isDeepAvailable: async (userId: string) => {
    try {
      const weekStart = thisWeekStart();
      const sessions = await detoxRepo.getThisWeekDeepSessions(userId, weekStart);
      return canStartSession('deep', sessions);
    } catch (e) {
      console.warn('[detoxStore] isDeepAvailable error:', e);
      return false;
    }
  },
}));
