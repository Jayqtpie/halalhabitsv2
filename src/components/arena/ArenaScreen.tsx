/**
 * ArenaScreen — full-screen route for the Nafs Boss Arena.
 *
 * Layout (top to bottom):
 *   1. Screen header bar (56px) — close icon + "Nafs Boss Arena" title
 *   2a. Active battle: Skia Canvas + BossHpBar + RpgDialogueBox + battle status + Abandon CTA
 *   2b. Idle state: BossEscapedNotice (if pending) + archetype gallery + Challenge/Begin Battle CTA
 *
 * Route: /arena — accessible via router.push('/arena')
 *
 * Adab-safety: no shame copy, level gate uses positive encouraging language.
 * Reduced motion: BossHpBar and RpgDialogueBox respect AccessibilityInfo.isReduceMotionEnabled.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Canvas } from '@shopify/react-native-skia';
import { useShallow } from 'zustand/react/shallow';
import { useBossStore } from '../../stores/bossStore';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';
import { BOSS_ARCHETYPES } from '../../domain/boss-content';
import { suggestArchetype } from '../../domain/boss-engine';
import { colors, typography, spacing, componentSpacing, radius } from '../../tokens';
import { ArchetypeCard } from './ArchetypeCard';
import { BossHpBar } from './BossHpBar';
import { RpgDialogueBox } from './RpgDialogueBox';
import { AbandonConfirmation } from './AbandonConfirmation';
import type { ArchetypeId, BossArchetype } from '../../domain/boss-content';
import { getBossDialoguePhase } from '../../domain/boss-engine';
import { calculatePartialXp, calculateBossXpReward } from '../../domain/boss-engine';

// Ordered list of archetype IDs per UI-SPEC D-12
const ARCHETYPE_ORDER: ArchetypeId[] = [
  'procrastinator',
  'distractor',
  'doubter',
  'glutton',
  'comparer',
  'perfectionist',
];

// Muted placeholder colors per archetype (placeholder until PNG assets)
const ARCHETYPE_PLACEHOLDER_COLOR: Record<ArchetypeId, string> = {
  procrastinator: 'rgba(100, 116, 139, 0.5)',  // slate
  distractor: 'rgba(59, 130, 246, 0.4)',        // blue
  doubter: 'rgba(139, 92, 246, 0.4)',           // violet
  glutton: 'rgba(249, 115, 22, 0.4)',           // orange
  comparer: 'rgba(234, 179, 8, 0.4)',           // yellow
  perfectionist: 'rgba(236, 72, 153, 0.4)',     // pink
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ArenaScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const canvasHeight = Math.min(screenWidth * 0.65, 280);

  // Store state
  const { activeBattle, loading, pendingEscapeNotice } = useBossStore(
    useShallow((s) => ({
      activeBattle: s.activeBattle,
      loading: s.loading,
      pendingEscapeNotice: s.pendingEscapeNotice,
    }))
  );
  const clearEscapeNotice = useBossStore((s) => s.clearEscapeNotice);
  const startBattle = useBossStore((s) => s.startBattle);
  const abandonBattle = useBossStore((s) => s.abandonBattle);

  const currentLevel = useGameStore((s) => s.currentLevel);
  const userId = useAuthStore((s) => s.userId);

  // Local state
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeId | null>(null);
  const [suggestedArchetype, setSuggestedArchetype] = useState<ArchetypeId>('procrastinator');
  const [canStartBattle, setCanStartBattle] = useState<boolean>(false);
  const [showAbandon, setShowAbandon] = useState<boolean>(false);
  const [startingBattle, setStartingBattle] = useState<boolean>(false);

  // Load active battle and check eligibility on mount
  useEffect(() => {
    const init = async () => {
      await useBossStore.getState().loadActiveBattle(userId);
      const canStart = await useBossStore.getState().canStart(userId);
      setCanStartBattle(canStart);
      // Suggest archetype based on no data available at this point (safe fallback)
      const suggested = suggestArchetype([], []);
      setSuggestedArchetype(suggested);
    };
    init();
  }, [userId]);

  // Derived battle values
  const hpRatio = activeBattle
    ? activeBattle.bossHp / activeBattle.bossMaxHp
    : 1;
  const hpPercent = Math.round(hpRatio * 100);
  const archetype = activeBattle ? BOSS_ARCHETYPES[activeBattle.archetype as ArchetypeId] : null;

  // Boss dialogue
  const dialogueText = React.useMemo(() => {
    if (!activeBattle || !archetype) return '...';
    const phase = getBossDialoguePhase(
      activeBattle.currentDay === 1,
      hpRatio,
      activeBattle.status,
    );
    switch (phase) {
      case 'intro': return archetype.dialogue.intro;
      case 'taunt': return archetype.dialogue.taunt;
      case 'player_winning': return archetype.dialogue.playerWinning;
      case 'defeated': return archetype.dialogue.defeated;
      default: return archetype.dialogue.taunt;
    }
  }, [activeBattle, archetype, hpRatio]);

  // Partial XP preview for abandon modal
  const partialXp = activeBattle
    ? calculatePartialXp(calculateBossXpReward(currentLevel), activeBattle.bossMaxHp, activeBattle.bossHp)
    : 0;
  const damagePercent = activeBattle
    ? Math.round(((activeBattle.bossMaxHp - activeBattle.bossHp) / activeBattle.bossMaxHp) * 100)
    : 0;

  // Gate checks
  const isUnderLevel = currentLevel < 10;
  const ctaDisabled = isUnderLevel || !canStartBattle || !selectedArchetype || startingBattle;

  const handleBeginBattle = useCallback(async () => {
    if (!selectedArchetype || startingBattle) return;
    setStartingBattle(true);
    try {
      await startBattle(selectedArchetype, currentLevel, userId);
    } finally {
      setStartingBattle(false);
    }
  }, [selectedArchetype, startBattle, currentLevel, userId, startingBattle]);

  const handleAbandonConfirm = useCallback(async () => {
    setShowAbandon(false);
    await abandonBattle(userId);
  }, [abandonBattle, userId]);

  const handleAbandonCancel = useCallback(() => {
    setShowAbandon(false);
  }, []);

  const handleChallengeAgain = useCallback(() => {
    clearEscapeNotice();
  }, [clearEscapeNotice]);

  const ctaLabel = selectedArchetype ? 'Begin Battle' : 'Challenge Boss';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>

        {/* ── Header bar ── */}
        <View style={styles.header}>
          <Pressable
            style={styles.closeButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Close Arena"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Nafs Boss Arena</Text>
          {/* Spacer for symmetry */}
          <View style={styles.headerSpacer} />
        </View>

        {/* ── Main content ── */}
        {activeBattle ? (
          // ── Active Battle View ──────────────────────────────────────────────
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Boss battle Skia Canvas */}
            <View
              accessibilityValue={{ min: 0, max: 100, now: hpPercent }}
              accessibilityLabel={`Boss HP: ${hpPercent}%`}
            >
              <Canvas style={[styles.canvas, { height: canvasHeight }]}>
                {/* Layer 1: Arena background placeholder */}
                {/* Layer 2: Boss silhouette placeholder (archetype-tinted) */}
                {/* Layer 3: BossHpBar */}
                <BossHpBar
                  hpRatio={hpRatio}
                  canvasWidth={screenWidth}
                  y={canvasHeight - 32}
                />
              </Canvas>
              {/* Archetype silhouette color overlay (outside Canvas — placeholder) */}
              <View
                style={[
                  styles.bossPlaceholder,
                  {
                    height: canvasHeight,
                    backgroundColor: archetype
                      ? ARCHETYPE_PLACEHOLDER_COLOR[archetype.id]
                      : 'rgba(100, 116, 139, 0.3)',
                  },
                ]}
                pointerEvents="none"
              />
            </View>

            {/* RPG Dialogue Box */}
            <View style={styles.dialogueContainer}>
              <RpgDialogueBox text={dialogueText} isActive={true} />
            </View>

            {/* Battle status */}
            <View style={styles.battleStatus}>
              <Text style={styles.dayCounter}>
                Day {activeBattle.currentDay} of {activeBattle.maxDays}
              </Text>
              <Text style={styles.hpReadout}>Boss HP: {hpPercent}%</Text>
              {activeBattle.mercyMode && (
                <Text style={styles.mercyIndicator}>
                  Mercy Mode active — counter-attacks halved
                </Text>
              )}
            </View>

            {/* Abandon Battle */}
            <Pressable
              style={styles.abandonButton}
              onPress={() => setShowAbandon(true)}
              accessibilityRole="button"
              accessibilityLabel="Abandon Battle"
            >
              <Text style={styles.abandonText}>Abandon Battle</Text>
            </Pressable>
          </ScrollView>
        ) : (
          // ── Idle State View ─────────────────────────────────────────────────
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* BossEscapedNotice (if pending) */}
            {pendingEscapeNotice && (
              <View style={styles.escapedNotice}>
                <Text style={styles.escapedHeading}>The battle is over</Text>
                <Text style={styles.escapedBody}>
                  You dealt {pendingEscapeNotice.damagePercent}% damage and earned{' '}
                  {pendingEscapeNotice.xpAwarded} XP for your effort. The nafs retreats — for now.
                </Text>
                <Pressable
                  style={styles.challengeAgainButton}
                  onPress={handleChallengeAgain}
                  accessibilityRole="button"
                  accessibilityLabel="Challenge Again"
                >
                  <Text style={styles.challengeAgainText}>Challenge Again</Text>
                </Pressable>
              </View>
            )}

            {/* Level gate empty state */}
            {isUnderLevel && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateHeading}>The Arena Awaits</Text>
                <Text style={styles.emptyStateBody}>
                  Reach Level 10 to challenge your nafs. Each archetype represents a struggle you can face and overcome.
                </Text>
                <Text style={styles.levelGateSubtext}>
                  You&apos;re Level {currentLevel} — keep building discipline to unlock boss battles.
                </Text>
              </View>
            )}

            {/* Archetype gallery (always shown, selection disabled when under-level) */}
            <View style={styles.galleryContainer}>
              {ARCHETYPE_ORDER.map((id) => {
                const a: BossArchetype = BOSS_ARCHETYPES[id];
                return (
                  <ArchetypeCard
                    key={id}
                    archetype={a}
                    isSelected={selectedArchetype === id}
                    isRecommended={!isUnderLevel && suggestedArchetype === id}
                    onSelect={() => {
                      if (!isUnderLevel) {
                        setSelectedArchetype(id === selectedArchetype ? null : id);
                      }
                    }}
                  />
                );
              })}
            </View>

            {/* Cooldown notice */}
            {!isUnderLevel && !canStartBattle && (
              <Text style={styles.cooldownNotice}>
                Next challenge available in a few days
              </Text>
            )}

            {/* Level gate helper text */}
            {isUnderLevel && (
              <Text style={styles.levelGateHelper}>Reach Level 10 to unlock</Text>
            )}

            {/* Primary CTA */}
            <Pressable
              style={[
                styles.ctaButton,
                ctaDisabled && styles.ctaButtonDisabled,
              ]}
              onPress={handleBeginBattle}
              disabled={ctaDisabled}
              accessibilityRole="button"
              accessibilityLabel={ctaLabel}
              accessibilityState={{ disabled: ctaDisabled }}
              android_ripple={!ctaDisabled ? { color: 'rgba(255,255,255,0.15)' } : undefined}
            >
              {startingBattle ? (
                <ActivityIndicator color={colors.dark.textPrimary} />
              ) : (
                <Text style={[styles.ctaText, ctaDisabled && styles.ctaTextDisabled]}>
                  {ctaLabel}
                </Text>
              )}
            </Pressable>
          </ScrollView>
        )}
      </View>

      {/* Abandon Battle confirmation modal (sibling to main content) */}
      <AbandonConfirmation
        visible={showAbandon}
        onConfirm={handleAbandonConfirm}
        onCancel={handleAbandonCancel}
        damagePercent={damagePercent}
        partialXp={partialXp}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: colors.dark.textSecondary,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // ── Shared scroll content ────────────────────────────────────────────────
  scrollContent: {
    padding: componentSpacing.modalPadding,
    gap: componentSpacing.modalElementGap,
    paddingBottom: spacing.xxl,
  },

  // ── Canvas / battle scene ────────────────────────────────────────────────
  canvas: {
    width: '100%',
    backgroundColor: colors.dark.background,
  },
  bossPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: radius.md,
  },

  // ── Dialogue box container ───────────────────────────────────────────────
  dialogueContainer: {
    // no extra margin — gap from scrollContent handles it
  },

  // ── Battle status ────────────────────────────────────────────────────────
  battleStatus: {
    gap: spacing.xs,
  },
  dayCounter: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
  hpReadout: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    opacity: 0.6,
  },
  mercyIndicator: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.mercy,
  },

  // ── Abandon button ───────────────────────────────────────────────────────
  abandonButton: {
    height: 52,
    backgroundColor: colors.dark.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(155, 27, 48, 0.5)',
  },
  abandonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.error, // ruby-500 #9B1B30
  },

  // ── Escaped notice ───────────────────────────────────────────────────────
  escapedNotice: {
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.xp, // gold-500
    borderRadius: radius.lg,
    padding: componentSpacing.cardPadding,
    gap: spacing.sm,
  },
  escapedHeading: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  escapedBody: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },
  challengeAgainButton: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.dark.primary,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  challengeAgainText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.primary,
  },

  // ── Empty state (level gate) ─────────────────────────────────────────────
  emptyState: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  emptyStateHeading: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  emptyStateBody: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },
  levelGateSubtext: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },

  // ── Archetype gallery ────────────────────────────────────────────────────
  galleryContainer: {
    gap: spacing.sm,
  },

  // ── Cooldown notice ──────────────────────────────────────────────────────
  cooldownNotice: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    opacity: 0.6,
    textAlign: 'center',
  },

  // ── Level gate helper text ───────────────────────────────────────────────
  levelGateHelper: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
  },

  // ── Primary CTA ──────────────────────────────────────────────────────────
  ctaButton: {
    height: 52,
    backgroundColor: colors.dark.primary,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    marginTop: spacing.xs,
  },
  ctaButtonDisabled: {
    opacity: 0.45,
  },
  ctaText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  ctaTextDisabled: {
    color: colors.dark.textPrimary,
  },
});
