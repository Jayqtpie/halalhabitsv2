/**
 * DungeonSheet — bottom sheet modal for the Dopamine Detox Dungeon.
 *
 * Implemented as RN Modal with animationType="slide" (same pattern as other
 * modals in the app). Manages idle state (session entry) and active state
 * (session monitoring).
 *
 * Idle state:
 *   - Daily / Deep variant toggle
 *   - Duration chips (2H, 4H, 6H for daily; 6H, 8H for deep)
 *   - XP preview computed from calculateDetoxXP
 *   - "Enter the Dungeon" CTA (disabled while loading)
 *
 * Active state:
 *   - Large countdown timer (DetoxCountdownTimer variant='sheet')
 *   - XP earned preview
 *   - "Exit Early (−X XP)" secondary destructive action
 *   - Opens EarlyExitConfirmation on Exit Early tap
 *
 * Spacing: modalPadding (24px) outer, modalElementGap (16px) between sections.
 * All touch targets meet 44px minimum per ui-ux-pro-max touch-target-size rule.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { useDetoxStore } from '../../stores/detoxStore';
import { calculateDetoxXP } from '../../domain/detox-engine';
import { DetoxCountdownTimer } from './DetoxCountdownTimer';
import { EarlyExitConfirmation } from './EarlyExitConfirmation';
import { colors, typography, spacing, componentSpacing, radius } from '../../tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type Variant = 'daily' | 'deep';

interface DurationChip {
  hours: number;
  label: string;
}

const DAILY_CHIPS: DurationChip[] = [
  { hours: 2, label: '2H' },
  { hours: 4, label: '4H' },
  { hours: 6, label: '6H' },
];

const DEEP_CHIPS: DurationChip[] = [
  { hours: 6, label: '6H' },
  { hours: 8, label: '8H' },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface DungeonSheetProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export function DungeonSheet({ visible, onClose, userId }: DungeonSheetProps) {
  const activeSession = useDetoxStore((s) => s.activeSession);
  const loading = useDetoxStore((s) => s.loading);
  const startSession = useDetoxStore((s) => s.startSession);
  const completeSession = useDetoxStore((s) => s.completeSession);
  const getPenaltyPreview = useDetoxStore((s) => s.getPenaltyPreview);
  const isDailyAvailableCheck = useDetoxStore((s) => s.isDailyAvailable);
  const isDeepAvailableCheck = useDetoxStore((s) => s.isDeepAvailable);
  const loadActiveSession = useDetoxStore((s) => s.loadActiveSession);

  const [selectedVariant, setSelectedVariant] = useState<Variant>('daily');
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [deepAvailable, setDeepAvailable] = useState<boolean>(true);
  const [dailyAvailable, setDailyAvailable] = useState<boolean>(true);
  const [showEarlyExit, setShowEarlyExit] = useState<boolean>(false);
  const [penaltyXP, setPenaltyXP] = useState<number>(0);

  // Hydrate active session from DB and check availability when sheet opens
  useEffect(() => {
    if (!visible) return;
    const hydrate = async () => {
      await loadActiveSession(userId);
      const [daily, deep] = await Promise.all([
        isDailyAvailableCheck(userId),
        isDeepAvailableCheck(userId),
      ]);
      setDailyAvailable(daily);
      setDeepAvailable(deep);
    };
    hydrate();
  }, [visible, userId, loadActiveSession, isDailyAvailableCheck, isDeepAvailableCheck]);

  // Reset to daily if deep becomes unavailable
  useEffect(() => {
    if (!deepAvailable && selectedVariant === 'deep') {
      setSelectedVariant('daily');
    }
  }, [deepAvailable, selectedVariant]);

  // Sync duration when variant changes (ensure selected chip exists)
  const chips = selectedVariant === 'daily' ? DAILY_CHIPS : DEEP_CHIPS;
  const validDurations = chips.map((c) => c.hours);
  const effectiveDuration = validDurations.includes(selectedDuration)
    ? selectedDuration
    : chips[0].hours;

  // Current penalty preview — recalculated on each render during active session
  const currentPenalty = activeSession ? getPenaltyPreview() : 0;

  const handleVariantSelect = useCallback(
    (variant: Variant) => {
      if (variant === 'deep' && !deepAvailable) return;
      setSelectedVariant(variant);
      // Reset to first chip of new variant
      const newChips = variant === 'daily' ? DAILY_CHIPS : DEEP_CHIPS;
      setSelectedDuration(newChips[0].hours);
    },
    [deepAvailable]
  );

  const handleDurationSelect = useCallback((hours: number) => {
    setSelectedDuration(hours);
  }, []);

  const handleEnterDungeon = useCallback(async () => {
    if (loading) return;
    const success = await startSession(selectedVariant, effectiveDuration, userId);
    if (!success) {
      // Re-check availability (state may have changed)
      const [daily, deep] = await Promise.all([
        isDailyAvailableCheck(userId),
        isDeepAvailableCheck(userId),
      ]);
      setDailyAvailable(daily);
      setDeepAvailable(deep);
    }
  }, [
    loading,
    startSession,
    selectedVariant,
    effectiveDuration,
    userId,
    isDailyAvailableCheck,
    isDeepAvailableCheck,
  ]);

  const handleExitEarlyPress = useCallback(() => {
    const penalty = getPenaltyPreview();
    setPenaltyXP(penalty);
    setShowEarlyExit(true);
  }, [getPenaltyPreview]);

  const handleConfirmExit = useCallback(async () => {
    setShowEarlyExit(false);
    await useDetoxStore.getState().exitEarly(userId);
    onClose();
  }, [userId, onClose]);

  const handleCancelExit = useCallback(() => {
    setShowEarlyExit(false);
  }, []);

  const handleSessionComplete = useCallback(async () => {
    await completeSession(userId);
    onClose();
  }, [completeSession, userId, onClose]);

  // XP preview for idle state
  const xpPreview = calculateDetoxXP(selectedVariant, effectiveDuration);

  // CTA state logic
  const ctaAvailable = selectedVariant === 'daily' ? dailyAvailable : deepAvailable;
  const ctaLabel = ctaAvailable ? 'Enter the Dungeon' : 'Available Tomorrow';
  const ctaDisabled = loading || !ctaAvailable;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <TouchableWithoutFeedback onPress={onClose} accessibilityRole="button" accessibilityLabel="Close dungeon sheet">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        {/* Drag handle */}
        <View style={styles.handle} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeSession ? (
            // ── Active Session View ────────────────────────────────────────
            <View style={styles.activeContainer}>
              <Text style={styles.sheetTitle}>Dopamine Detox Dungeon</Text>
              <Text style={styles.activeStatusLabel}>SESSION ACTIVE</Text>

              <View style={styles.timerContainer}>
                <DetoxCountdownTimer
                  startedAt={activeSession.startedAt}
                  durationHours={activeSession.durationHours}
                  variant="sheet"
                  onComplete={handleSessionComplete}
                />
              </View>

              <Text style={styles.xpEarnedLabel}>
                Complete for +{calculateDetoxXP(
                  activeSession.variant as 'daily' | 'deep',
                  activeSession.durationHours
                )}{' '}
                XP
              </Text>

              <Pressable
                style={styles.exitEarlyButton}
                onPress={handleExitEarlyPress}
                accessibilityRole="button"
                accessibilityLabel={`Exit Early, penalty ${currentPenalty} XP`}
                android_ripple={{ color: 'rgba(155, 27, 48, 0.2)' }}
              >
                <Text style={styles.exitEarlyText}>
                  {`Exit Early (−${currentPenalty} XP)`}
                </Text>
              </Pressable>
            </View>
          ) : (
            // ── Idle State View ────────────────────────────────────────────
            <View style={styles.idleContainer}>
              <Text style={styles.sheetTitle}>Dopamine Detox Dungeon</Text>
              <Text style={styles.sheetSubtitle}>
                A voluntary challenge to reclaim your focus. Your habit streaks stay protected while you&apos;re inside.
              </Text>

              {/* Variant toggle */}
              <View style={styles.variantToggle}>
                <Pressable
                  style={[
                    styles.variantSegment,
                    styles.variantSegmentLeft,
                    selectedVariant === 'daily' && styles.variantSegmentActive,
                  ]}
                  onPress={() => handleVariantSelect('daily')}
                  accessibilityRole="button"
                  accessibilityLabel="Daily variant"
                  accessibilityState={{ selected: selectedVariant === 'daily' }}
                  android_ripple={{ color: 'rgba(13,124,61,0.2)' }}
                >
                  <Text
                    style={[
                      styles.variantLabel,
                      selectedVariant === 'daily' && styles.variantLabelActive,
                    ]}
                  >
                    Daily
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.variantSegment,
                    styles.variantSegmentRight,
                    selectedVariant === 'deep' && styles.variantSegmentActive,
                    !deepAvailable && styles.variantSegmentDisabled,
                  ]}
                  onPress={() => handleVariantSelect('deep')}
                  disabled={!deepAvailable}
                  accessibilityRole="button"
                  accessibilityLabel="Deep variant, once per week"
                  accessibilityState={{
                    selected: selectedVariant === 'deep',
                    disabled: !deepAvailable,
                  }}
                  android_ripple={deepAvailable ? { color: 'rgba(13,124,61,0.2)' } : undefined}
                >
                  <Text
                    style={[
                      styles.variantLabel,
                      selectedVariant === 'deep' && styles.variantLabelActive,
                      !deepAvailable && styles.variantLabelDisabled,
                    ]}
                  >
                    Deep (6-8h)
                  </Text>
                  <Text style={styles.variantBadge}>Once per week</Text>
                </Pressable>
              </View>

              {/* Duration chips */}
              <View style={styles.chipsRow}>
                {chips.map((chip) => {
                  const isSelected = chip.hours === effectiveDuration;
                  return (
                    <Pressable
                      key={chip.hours}
                      style={[
                        styles.durationChip,
                        isSelected && styles.durationChipSelected,
                      ]}
                      onPress={() => handleDurationSelect(chip.hours)}
                      accessibilityRole="button"
                      accessibilityLabel={`${chip.label} duration`}
                      accessibilityState={{ selected: isSelected }}
                      android_ripple={{ color: 'rgba(13,124,61,0.2)' }}
                    >
                      <Text
                        style={[
                          styles.chipLabel,
                          isSelected && styles.chipLabelSelected,
                        ]}
                      >
                        {chip.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* XP preview */}
              <Text style={styles.xpPreview}>Complete for +{xpPreview} XP</Text>

              {/* CTA button */}
              <Pressable
                style={[styles.ctaButton, ctaDisabled && styles.ctaButtonDisabled]}
                onPress={handleEnterDungeon}
                disabled={ctaDisabled}
                accessibilityRole="button"
                accessibilityLabel={ctaLabel}
                accessibilityState={{ disabled: ctaDisabled }}
                android_ripple={!ctaDisabled ? { color: 'rgba(255,255,255,0.15)' } : undefined}
              >
                <Text style={[styles.ctaText, ctaDisabled && styles.ctaTextDisabled]}>
                  {loading ? 'Starting…' : ctaLabel}
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </View>

      {/* EarlyExitConfirmation inside the same Modal so it renders on top */}
      <EarlyExitConfirmation
        visible={showEarlyExit}
        penaltyXP={penaltyXP}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.dark.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xxl, // safe area bottom padding
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: colors.dark.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: radius.full,
    alignSelf: 'center',
    marginVertical: spacing.sm,
  },
  scrollContent: {
    padding: componentSpacing.modalPadding,
  },

  // ── Shared ──────────────────────────────────────────────────────────
  sheetTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    marginBottom: spacing.xs,
  },

  // ── Idle State ──────────────────────────────────────────────────────
  idleContainer: {
    gap: componentSpacing.modalElementGap,
  },
  sheetSubtitle: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
  },

  // Variant toggle
  variantToggle: {
    flexDirection: 'row',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
  },
  variantSegment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.dark.surface,
  },
  variantSegmentLeft: {
    borderRightWidth: 1,
    borderRightColor: colors.dark.border,
  },
  variantSegmentRight: {},
  variantSegmentActive: {
    backgroundColor: 'rgba(13,124,61,0.15)',
  },
  variantSegmentDisabled: {
    opacity: 0.4,
  },
  variantLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  variantLabelActive: {
    color: colors.dark.primary,
  },
  variantLabelDisabled: {
    color: colors.dark.textMuted,
  },
  variantBadge: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    marginTop: 2,
  },

  // Duration chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  durationChip: {
    minWidth: 60,
    minHeight: 44,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationChipSelected: {
    backgroundColor: 'rgba(13,124,61,0.15)',
    borderColor: colors.dark.primary,
  },
  chipLabel: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    letterSpacing: typography.hudLabel.letterSpacing,
    color: colors.dark.textSecondary,
  },
  chipLabelSelected: {
    color: colors.dark.primary,
  },

  // XP preview
  xpPreview: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.xp,
  },

  // CTA
  ctaButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: radius.md,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  ctaButtonDisabled: {
    backgroundColor: colors.dark.border,
  },
  ctaText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
  },
  ctaTextDisabled: {
    color: colors.dark.textMuted,
  },

  // ── Active State ────────────────────────────────────────────────────
  activeContainer: {
    alignItems: 'center',
    gap: componentSpacing.modalElementGap,
  },
  activeStatusLabel: {
    fontSize: typography.hudLabel.fontSize,
    lineHeight: typography.hudLabel.lineHeight,
    fontFamily: typography.hudLabel.fontFamily,
    fontWeight: '700',
    letterSpacing: typography.hudLabel.letterSpacing,
    color: colors.dark.primary,
  },
  timerContainer: {
    paddingVertical: spacing.lg,
  },
  xpEarnedLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.xp,
  },

  // Exit Early button: destructive outline
  exitEarlyButton: {
    minHeight: 44,
    width: '100%',
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.error,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  exitEarlyText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '600',
    color: colors.dark.error,
  },
});
