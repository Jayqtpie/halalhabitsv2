/**
 * Game/XP domain state management.
 *
 * Orchestrates the full post-completion game flow:
 *   awardXP -> checkTitles -> updateQuestProgress -> pendingCelebrations queue
 *
 * NO persist middleware - game data lives in SQLite via repository layer.
 *
 * Usage with useShallow for multi-field selectors:
 *   const { currentLevel, totalXP } = useGameStore(useShallow(s => ({ currentLevel: s.currentLevel, totalXP: s.totalXP })));
 */
import { create } from 'zustand';
import { calculateXP, levelForXP, xpToNextLevel } from '../domain/xp-engine';
import { checkTitleUnlocks } from '../domain/title-engine';
import { selectQuestTemplates, evaluateQuestProgress } from '../domain/quest-engine';
import { getLevelUpCopy } from '../domain/level-copy';
import { TITLE_SEED_DATA } from '../domain/title-seed-data';
import { QUEST_TEMPLATES, ALKAHF_TEMPLATE } from '../domain/quest-templates';
import { isFriday, getAlKahfExpiry } from '../domain/friday-engine';
import { getPrayerWindows } from '../services/prayer-times';
import { useSettingsStore } from './settingsStore';
import { xpRepo, titleRepo, questRepo, userRepo, habitRepo, streakRepo, muhasabahRepo, detoxRepo } from '../db/repos';
import { getHabitStoreState } from './bridge';
import { generateId } from '../utils/uuid';
import type { Title, UserTitle, Quest } from '../types/database';
import type { PlayerStats } from '../domain/title-engine';
import type { QuestProgressEvent } from '../domain/quest-engine';
import * as Haptics from 'expo-haptics';

// ─── Celebration Types ────────────────────────────────────────────────────────

export interface LevelUpCelebration {
  type: 'level_up';
  level: number;
  copy: string;
  unlockedTitles: string[];
}

export interface TitleUnlockCelebration {
  type: 'title_unlock';
  titleId: string;
  title: Title;
}

export type Celebration = LevelUpCelebration | TitleUnlockCelebration;

// ─── Store Interface ──────────────────────────────────────────────────────────

interface GameState {
  currentLevel: number;
  totalXP: number;
  xpToNext: number;
  currentMultiplier: number;
  titles: UserTitle[];
  activeTitle: Title | null;
  quests: Quest[];
  pendingCelebrations: Celebration[];
  loading: boolean;

  // Legacy setters (kept for backward compatibility)
  setLevel: (level: number) => void;
  setTotalXP: (xp: number) => void;
  setMultiplier: (multiplier: number) => void;
  setTitles: (titles: UserTitle[]) => void;
  setActiveTitle: (title: Title | null) => void;

  // Orchestration actions
  loadGame: (userId: string) => Promise<void>;
  awardXP: (
    userId: string,
    baseXP: number,
    multiplier: number,
    sourceType: string,
    sourceId?: string,
  ) => Promise<import('../domain/xp-engine').XPResult | null>;
  checkTitles: (userId: string) => Promise<void>;
  updateQuestProgress: (userId: string, event: QuestProgressEvent) => Promise<void>;
  generateQuests: (userId: string) => Promise<void>;
  consumeCelebration: () => Celebration | null;
  equipTitle: (userId: string, titleId: string) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get the start of today (midnight local) as ISO string */
function todayStart(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

/** Get the ISO date string for "today" (YYYY-MM-DD) */
function todayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Get next midnight local time as ISO string */
function nextMidnight(): string {
  const d = new Date();
  const next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  return next.toISOString();
}

/** Get the start of this week (Sunday midnight) as ISO string */
function thisWeekStart(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 = Sunday
  const sunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dayOfWeek);
  return sunday.toISOString();
}

/** Get next Sunday midnight as ISO string */
function nextSundayMidnight(): string {
  const d = new Date();
  const dayOfWeek = d.getDay(); // 0 = Sunday
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const nextSunday = new Date(d.getFullYear(), d.getMonth(), d.getDate() + daysUntilSunday);
  return nextSunday.toISOString();
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useGameStore = create<GameState>((set, get) => ({
  currentLevel: 1,
  totalXP: 0,
  xpToNext: 40, // xpToNextLevel(1)
  currentMultiplier: 1.0,
  titles: [],
  activeTitle: null,
  quests: [],
  pendingCelebrations: [],
  loading: false,

  // ─── Legacy setters ──────────────────────────────────────────────────────

  setLevel: (level) => set({ currentLevel: level }),
  setTotalXP: (xp) => set({ totalXP: xp }),
  setMultiplier: (multiplier) => set({ currentMultiplier: multiplier }),
  setTitles: (titles) => set({ titles }),
  setActiveTitle: (title) => set({ activeTitle: title }),

  // ─── loadGame ─────────────────────────────────────────────────────────────

  loadGame: async (userId: string) => {
    set({ loading: true });
    try {
      // 1. Load or create user record
      let user = await userRepo.getById(userId);
      if (!user) {
        try {
          const now = new Date().toISOString();
          const [created] = await userRepo.create({
            id: userId,
            displayName: 'Player',
            totalXp: 0,
            currentLevel: 1,
            activeTitleId: null,
            createdAt: now,
            updatedAt: now,
          });
          user = created;
        } catch {
          // Race condition: another call may have created the user
          user = await userRepo.getById(userId);
        }
      }
      const totalXP = user?.totalXp ?? 0;
      const currentLevel = user?.currentLevel ?? levelForXP(totalXP);
      const xpToNext = xpToNextLevel(currentLevel);

      // 2. Seed titles if table is empty (idempotent)
      const titleCount = await titleRepo.count();
      if (titleCount === 0) {
        await titleRepo.seedTitles(
          TITLE_SEED_DATA.map(t => ({
            id: t.id,
            name: t.name,
            rarity: t.rarity,
            unlockType: t.unlockType,
            unlockValue: t.unlockValue,
            unlockHabitType: t.unlockHabitType,
            flavorText: t.flavorText,
            sortOrder: t.sortOrder,
          }))
        );
      }

      // 3. Load user titles
      const userTitlesData = await titleRepo.getUserTitles(userId);

      // 4. Load active title
      let activeTitle: Title | null = null;
      if (user?.activeTitleId) {
        const allTitles = await titleRepo.getAll();
        activeTitle = allTitles.find(t => t.id === user.activeTitleId) ?? null;
      }

      // 5. Load active quests
      const activeQuests = await questRepo.getActive(userId);

      set({
        currentLevel,
        totalXP,
        xpToNext,
        titles: userTitlesData,
        activeTitle,
        quests: activeQuests,
        loading: false,
      });

      // 6. Generate quests if needed (after state is set)
      await get().generateQuests(userId);
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  // ─── awardXP ──────────────────────────────────────────────────────────────

  awardXP: async (
    userId: string,
    baseXP: number,
    multiplier: number,
    sourceType: string,
    sourceId?: string,
  ) => {
    try {
      const state = get();
      const now = new Date().toISOString();
      const todayStr = todayDateString();

      // Get daily total so far
      const dailyTotal = await xpRepo.getDailyTotal(userId, todayStr);

      // Calculate XP result using pure engine
      const xpResult = calculateXP(baseXP, multiplier, state.totalXP, dailyTotal);

      // Write to xp_ledger
      await xpRepo.create({
        id: generateId(),
        userId,
        amount: xpResult.cappedXP,
        sourceType,
        sourceId: sourceId ?? null,
        earnedAt: now,
        createdAt: now,
      });

      // Update user's denormalized XP and level
      await userRepo.updateXP(userId, xpResult.newTotalXP, xpResult.newLevel);

      // Update local state
      set({
        totalXP: xpResult.newTotalXP,
        currentLevel: xpResult.newLevel,
        xpToNext: xpToNextLevel(xpResult.newLevel),
      });

      // Queue level-up celebration if needed
      if (xpResult.didLevelUp) {
        const celebration: LevelUpCelebration = {
          type: 'level_up',
          level: xpResult.newLevel,
          copy: getLevelUpCopy(xpResult.newLevel),
          unlockedTitles: [], // Will be populated by checkTitles if called next
        };
        set((s) => ({
          pendingCelebrations: [...s.pendingCelebrations, celebration],
        }));
      }

      return xpResult;
    } catch (e) {
      return null;
    }
  },

  // ─── checkTitles ──────────────────────────────────────────────────────────

  checkTitles: async (userId: string) => {
    try {
      const state = get();

      // Build alreadyUnlocked set from local state
      const alreadyUnlocked = new Set(state.titles.map(t => t.titleId));

      // Load all title definitions for conditions
      const allTitlesData = await titleRepo.getAll();
      const conditions = allTitlesData.map(t => ({
        id: t.id,
        unlockType: t.unlockType as Parameters<typeof checkTitleUnlocks>[0][0]['unlockType'],
        unlockValue: t.unlockValue,
        unlockHabitType: t.unlockHabitType,
      }));

      // Build PlayerStats from current state
      const habitStreakMap: Record<string, number> = {};
      const habitTypeMap: Record<string, string> = {};

      // Load habits for type mapping
      const userHabits = await habitRepo.getActive(userId);
      for (const habit of userHabits) {
        habitTypeMap[habit.id] = habit.type;
      }

      // Get streak data from habitStore via bridge (avoids circular dependency)
      const habitStoreState = getHabitStoreState();
      for (const [habitId, streakState] of Object.entries(habitStoreState.streaks)) {
        habitStreakMap[habitId] = streakState.currentCount;
      }

      // Compute simultaneous streaks counts
      const streakValues = Object.values(habitStreakMap);
      const simultaneousStreaks14 = streakValues.filter(s => s >= 14).length;
      const simultaneousStreaks90 = streakValues.filter(s => s >= 90).length;

      // Quest completions count from DB
      const completedQuests = await questRepo.getCompleted(userId);
      const questCompletions = completedQuests.length;

      // Query real mercy recoveries, muhasabah streak, and detox completions in parallel
      const [allUserStreaks, muhasabahStreak, detoxCompletedCount] = await Promise.all([
        streakRepo.getAllForUser(userId),
        muhasabahRepo.getStreak(userId),
        detoxRepo.getCompletedCount(userId),
      ]);
      const mercyRecoveries = allUserStreaks.filter(s => s.isRebuilt).length;

      const stats: PlayerStats = {
        currentLevel: state.currentLevel,
        habitStreaks: habitStreakMap,
        habitTypes: habitTypeMap,
        totalCompletions: Object.values(habitStoreState.completions).filter(Boolean).length,
        questCompletions,
        mercyRecoveries,
        muhasabahStreak,
        activeHabitCount: userHabits.length,
        simultaneousStreaks14,
        simultaneousStreaks90,
        detoxCompletions: detoxCompletedCount,
      };

      // Run title unlock check
      const newlyUnlockedIds = checkTitleUnlocks(conditions, alreadyUnlocked, stats);

      if (newlyUnlockedIds.length === 0) return;

      const now = new Date().toISOString();

      // Grant each new title
      const grantedUserTitles: UserTitle[] = [];
      for (const titleId of newlyUnlockedIds) {
        const rows = await titleRepo.grantTitle({
          id: generateId(),
          userId,
          titleId,
          earnedAt: now,
        });
        if (rows.length > 0) {
          grantedUserTitles.push(rows[0]);
        }
      }

      if (grantedUserTitles.length === 0) return;

      // Update local titles state
      set((s) => ({
        titles: [...s.titles, ...grantedUserTitles],
      }));

      // Queue celebrations
      // If there's a pending level_up celebration, bundle titles into it
      const pendingCelebrations = [...get().pendingCelebrations];
      const levelUpIdx = pendingCelebrations.findIndex(c => c.type === 'level_up');

      if (levelUpIdx >= 0) {
        const levelUp = pendingCelebrations[levelUpIdx] as LevelUpCelebration;
        pendingCelebrations[levelUpIdx] = {
          ...levelUp,
          unlockedTitles: [...levelUp.unlockedTitles, ...newlyUnlockedIds],
        };
        set({ pendingCelebrations });
      } else {
        // Add individual title unlock celebrations
        const allTitles = await titleRepo.getAll();
        const titleMap = new Map(allTitles.map(t => [t.id, t]));

        for (const titleId of newlyUnlockedIds) {
          const titleData = titleMap.get(titleId);
          if (titleData) {
            set((s) => ({
              pendingCelebrations: [
                ...s.pendingCelebrations,
                {
                  type: 'title_unlock' as const,
                  titleId,
                  title: titleData,
                },
              ],
            }));
          }
        }
      }
    } catch (e) {
      // Non-fatal: title check failure should not break habit completion
      console.warn('[gameStore] checkTitles error:', e);
    }
  },

  // ─── updateQuestProgress ──────────────────────────────────────────────────

  updateQuestProgress: async (userId: string, event: QuestProgressEvent) => {
    try {
      const state = get();
      const activeQuests = state.quests.filter(
        q => q.status === 'available' || q.status === 'in_progress'
      );

      for (const quest of activeQuests) {
        const newProgress = evaluateQuestProgress(
          {
            targetType: quest.targetType,
            targetValue: quest.targetValue,
            targetHabitType: quest.targetHabitId ?? undefined, // targetHabitId stores the habit type string
            progress: quest.progress,
          },
          event,
        );

        if (newProgress <= quest.progress) continue; // No change

        if (newProgress >= quest.targetValue) {
          // Quest complete -- set progress to target then mark complete
          await questRepo.setProgress(quest.id, quest.targetValue, quest.targetValue);
          await questRepo.complete(quest.id);

          // Award quest XP — 1.0 intentional — quest XP excluded from Friday multiplier (D-13, FRDY-01)
          await get().awardXP(userId, quest.xpReward, 1.0, 'quest', quest.id);

          // HUD-04: Haptic feedback on quest completion (Medium)
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

          // Update local state
          set((s) => ({
            quests: s.quests.map(q =>
              q.id === quest.id
                ? { ...q, progress: quest.targetValue, status: 'completed', completedAt: new Date().toISOString() }
                : q
            ),
          }));
        } else {
          // Partial progress
          await questRepo.setProgress(quest.id, newProgress, quest.targetValue);

          // Update local state
          set((s) => ({
            quests: s.quests.map(q =>
              q.id === quest.id
                ? { ...q, progress: newProgress, status: 'in_progress' }
                : q
            ),
          }));
        }
      }
    } catch (e) {
      // Non-fatal: quest progress failure should not break habit completion
      console.warn('[gameStore] updateQuestProgress error:', e);
    }
  },

  // ─── generateQuests ───────────────────────────────────────────────────────

  generateQuests: async (userId: string) => {
    try {
      const state = get();

      // Expire old quests first
      await questRepo.expireOld();

      // Reload active quests after expiry
      const currentQuests = await questRepo.getActive(userId);

      const now = new Date().toISOString();
      const weekStart = thisWeekStart();

      // Check which quest types already have active entries
      const hasDailyQuests = currentQuests.some(
        q => q.type === 'daily' && q.createdAt >= todayStart()
      );
      const hasWeeklyQuests = currentQuests.some(
        q => q.type === 'weekly' && q.createdAt >= weekStart
      );
      const hasStretchQuests = currentQuests.some(
        q => q.type === 'stretch' && q.createdAt >= weekStart
      );

      if (hasDailyQuests && hasWeeklyQuests && hasStretchQuests) {
        // All quest types are covered -- update local state and return
        set({ quests: currentQuests });
        return;
      }

      // Get recently used template IDs for no-repeat tracking
      const recentIds = await questRepo.getRecentTemplateIds(userId, 7);
      const recentlyUsedIds = new Set(recentIds);

      // Get active habit types for relevance filtering
      const userHabits = await habitRepo.getActive(userId);
      const activeHabitTypes = new Set(userHabits.map(h => h.type));

      const playerLevel = state.currentLevel;
      const newQuests: Quest[] = [];

      // Generate daily quests (3 active per day)
      if (!hasDailyQuests) {
        const dailyTemplates = selectQuestTemplates(
          QUEST_TEMPLATES,
          'daily',
          3,
          playerLevel,
          activeHabitTypes,
          recentlyUsedIds,
        );

        for (const template of dailyTemplates) {
          const [created] = await questRepo.create({
            id: generateId(),
            userId,
            type: template.type,
            description: template.description,
            xpReward: template.xpReward,
            targetType: template.targetType,
            targetValue: template.targetValue,
            targetHabitId: template.targetHabitType ?? null,
            templateId: template.id,
            progress: 0,
            status: 'available',
            expiresAt: nextMidnight(),
            completedAt: null,
            createdAt: now,
          });
          newQuests.push(created);
          recentlyUsedIds.add(template.id);
        }
      }

      // Generate weekly quests (2 active per week) -- only if level >= 5
      if (!hasWeeklyQuests && playerLevel >= 5) {
        const weeklyTemplates = selectQuestTemplates(
          QUEST_TEMPLATES,
          'weekly',
          2,
          playerLevel,
          activeHabitTypes,
          recentlyUsedIds,
        );

        for (const template of weeklyTemplates) {
          const [created] = await questRepo.create({
            id: generateId(),
            userId,
            type: template.type,
            description: template.description,
            xpReward: template.xpReward,
            targetType: template.targetType,
            targetValue: template.targetValue,
            targetHabitId: template.targetHabitType ?? null,
            templateId: template.id,
            progress: 0,
            status: 'available',
            expiresAt: nextSundayMidnight(),
            completedAt: null,
            createdAt: now,
          });
          newQuests.push(created);
          recentlyUsedIds.add(template.id);
        }
      }

      // Generate stretch quest (1 active per week) -- only if level >= 8
      if (!hasStretchQuests && playerLevel >= 8) {
        const stretchTemplates = selectQuestTemplates(
          QUEST_TEMPLATES,
          'stretch',
          1,
          playerLevel,
          activeHabitTypes,
          recentlyUsedIds,
        );

        for (const template of stretchTemplates) {
          const [created] = await questRepo.create({
            id: generateId(),
            userId,
            type: template.type,
            description: template.description,
            xpReward: template.xpReward,
            targetType: template.targetType,
            targetValue: template.targetValue,
            targetHabitId: template.targetHabitType ?? null,
            templateId: template.id,
            progress: 0,
            status: 'available',
            expiresAt: nextSundayMidnight(),
            completedAt: null,
            createdAt: now,
          });
          newQuests.push(created);
        }
      }

      // FRDY-03: Generate Al-Kahf quest on Fridays (D-08: extra card, not replacing existing)
      const hasAlKahfQuest = currentQuests.some(q => q.templateId === 'friday-alkahf');
      if (isFriday() && !hasAlKahfQuest) {
        const { locationLat: lat, locationLng: lng, prayerCalcMethod } = useSettingsStore.getState();
        const expiresAt = getAlKahfExpiry(lat, lng, new Date(), prayerCalcMethod ?? 'MuslimWorldLeague', getPrayerWindows);
        const [created] = await questRepo.create({
          id: generateId(),
          userId,
          type: ALKAHF_TEMPLATE.type,
          description: ALKAHF_TEMPLATE.description,
          xpReward: ALKAHF_TEMPLATE.xpReward,
          targetType: ALKAHF_TEMPLATE.targetType,
          targetValue: ALKAHF_TEMPLATE.targetValue,
          targetHabitId: null,
          templateId: ALKAHF_TEMPLATE.id,
          progress: 0,
          status: 'available',
          expiresAt,
          completedAt: null,
          createdAt: now,
        });
        newQuests.push(created);
      }

      set({ quests: [...currentQuests, ...newQuests] });
    } catch (e) {
      console.warn('[gameStore] generateQuests error:', e);
    }
  },

  // ─── consumeCelebration ───────────────────────────────────────────────────

  consumeCelebration: () => {
    const state = get();
    if (state.pendingCelebrations.length === 0) return null;

    const [first, ...rest] = state.pendingCelebrations;
    set({ pendingCelebrations: rest });
    return first;
  },

  // ─── equipTitle ───────────────────────────────────────────────────────────

  equipTitle: async (userId: string, titleId: string) => {
    try {
      await userRepo.setActiveTitle(userId, titleId);

      // Find the full title data
      const allTitles = await titleRepo.getAll();
      const titleData = allTitles.find(t => t.id === titleId) ?? null;

      set({ activeTitle: titleData });
    } catch (e) {
      console.warn('[gameStore] equipTitle error:', e);
    }
  },
}));
