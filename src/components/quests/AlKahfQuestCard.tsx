/**
 * AlKahfQuestCard -- Friday-only quest card for the Surah Al-Kahf reading challenge.
 *
 * Displays an 18-section progress tracker with a Maghrib deadline.
 * Section progress is stored locally in component state and synced to the
 * quest repository via setProgress on each section tap.
 *
 * Three visual states:
 *   - active:    Emerald border glow, scrollable section chips
 *   - completed: Checkmark + "Jumu'ah honored! +100 XP"
 *   - expired:   Dimmed (opacity 0.45), neutral expired copy — no shame
 *
 * Accessibility: each section chip has accessibilityRole="checkbox" with
 * checked state and Section N / completed labeling.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { colors, palette, typography, spacing, radius } from '../../tokens';
import type { Quest } from '../../types/database';
import { questRepo } from '../../db/repos';

// ─── Constants ───────────────────────────────────────────────────────────────

const TOTAL_SECTIONS = 18;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formats a deadline ISO string to a human-readable time (HH:MM).
 * Returns null if the date is midnight (location fallback — no Maghrib available).
 */
function formatMaghribTime(expiresAt: string): string | null {
  const d = new Date(expiresAt);
  // Midnight check: hours === 0 AND minutes === 0 indicates midnight fallback
  if (d.getHours() === 0 && d.getMinutes() === 0) {
    return null; // Caller renders "Complete by midnight"
  }
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Returns true if the quest has passed its expiry without being completed.
 */
function isExpired(quest: Quest): boolean {
  if (quest.status === 'completed') return false;
  return new Date() > new Date(quest.expiresAt);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface AlKahfQuestCardProps {
  /** The Al-Kahf quest object (templateId === 'friday-alkahf') from gameStore.quests */
  quest: Quest;
}

export function AlKahfQuestCard({ quest }: AlKahfQuestCardProps) {
  // Local section completion state — initialised from persisted quest.progress.
  // A section is "complete" if its index < persisted progress count.
  // This is a simplification: completed sections are always the first N.
  // For granular tap-toggling we track a boolean array.
  const [completedSections, setCompletedSections] = useState<boolean[]>(() => {
    const arr = new Array(TOTAL_SECTIONS).fill(false);
    const saved = Math.min(quest.progress, TOTAL_SECTIONS);
    for (let i = 0; i < saved; i++) arr[i] = true;
    return arr;
  });

  const isCompleted = quest.status === 'completed';
  const expired = isExpired(quest);

  const maghribTime = formatMaghribTime(quest.expiresAt);
  const deadlineLabel = maghribTime
    ? `Complete by Maghrib · ${maghribTime}`
    : 'Complete by midnight';

  const progressCount = completedSections.filter(Boolean).length;

  // ── Section tap handler ────────────────────────────────────────────────────

  const handleSectionTap = useCallback(
    async (index: number) => {
      if (isCompleted || expired) return;

      const updated = [...completedSections];
      updated[index] = !updated[index];
      setCompletedSections(updated);

      const newProgress = updated.filter(Boolean).length;

      try {
        await questRepo.setProgress(quest.id, newProgress, quest.targetValue);
      } catch (e) {
        // Non-fatal: local state already updated; progress persists on next sync
        console.warn('[AlKahfQuestCard] setProgress error:', e);
      }
    },
    [completedSections, isCompleted, expired, quest.id]
  );

  // ── Render: expired overlay ────────────────────────────────────────────────

  const cardStyle = [
    styles.card,
    expired && !isCompleted ? styles.cardExpired : styles.cardActive,
  ];

  return (
    <View style={cardStyle}>

      {/* Header row: title + XP badge */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Surah Al-Kahf Challenge</Text>
        <View style={[styles.xpBadge, (expired && !isCompleted) && styles.xpBadgeExpired]}>
          <Text style={[styles.xpBadgeText, (expired && !isCompleted) && styles.xpBadgeTextExpired]}>
            +100 XP
          </Text>
        </View>
      </View>

      {/* Deadline row */}
      <View style={styles.deadlineRow}>
        <Text style={styles.deadlineIcon}>{'⏱'}</Text>
        <Text style={styles.deadlineText}>{deadlineLabel}</Text>
      </View>

      {/* Body: completed / expired / active */}
      {isCompleted ? (
        <View style={styles.completedRow}>
          <Text style={styles.completedCheckmark}>{'✓'}</Text>
          <Text style={styles.completedText}>{"Jumu'ah honored! +100 XP"}</Text>
        </View>
      ) : expired ? (
        <Text style={styles.expiredText}>Quest expired at Maghrib</Text>
      ) : (
        <>
          {/* Progress bar — 18 segmented sections */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(progressCount / TOTAL_SECTIONS) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressCount}>{progressCount} / 18 sections</Text>
          </View>

          {/* Scrollable section chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsScroll}
            contentContainerStyle={styles.chipsContent}
          >
            {completedSections.map((done, i) => {
              const sectionNum = i + 1;
              return (
                <Pressable
                  key={i}
                  onPress={() => handleSectionTap(i)}
                  style={[styles.chip, done && styles.chipCompleted]}
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Section ${sectionNum}, ${done ? 'completed' : 'incomplete'}`}
                  accessibilityState={{ checked: done }}
                >
                  <Text style={[styles.chipText, done && styles.chipTextCompleted]}>
                    {sectionNum}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  cardActive: {
    borderColor: colors.dark.primary,
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  cardExpired: {
    borderColor: colors.dark.border,
    opacity: 0.45,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    fontWeight: '700',
    color: colors.dark.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  xpBadge: {
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dark.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  xpBadgeExpired: {
    borderColor: colors.dark.textMuted,
  },
  xpBadgeText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.xp,
  },
  xpBadgeTextExpired: {
    color: colors.dark.textMuted,
  },

  // Deadline row
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: 4,
  },
  deadlineIcon: {
    fontSize: 12,
  },
  deadlineText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
  },

  // Progress
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.dark.primary,
    borderRadius: radius.sm,
  },
  progressCount: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textSecondary,
    minWidth: 80,
    textAlign: 'right',
  },

  // Section chips
  chipsScroll: {
    marginTop: spacing.xs,
  },
  chipsContent: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  chip: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipCompleted: {
    backgroundColor: colors.dark.primary,
    borderColor: colors.dark.primary,
  },
  chipText: {
    fontSize: 10,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textSecondary,
    fontWeight: '600',
  },
  chipTextCompleted: {
    color: colors.dark.textPrimary,
  },

  // Completed state
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  completedCheckmark: {
    fontSize: 16,
    color: colors.dark.primary,
    fontWeight: '700',
  },
  completedText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    fontWeight: '700',
    color: colors.dark.primary,
  },

  // Expired state
  expiredText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
    color: colors.dark.textMuted,
    marginTop: spacing.xs,
  },
});
