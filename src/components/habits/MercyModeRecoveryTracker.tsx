/**
 * MercyModeRecoveryTracker -- 3-step visual progress indicator for mercy mode recovery.
 *
 * Shows a horizontal line of 3 circles:
 *   - Completed: filled emerald with checkmark
 *   - Current: pulsing/highlighted circle
 *   - Upcoming: muted outline
 *
 * Encouraging copy at each step (no shame, no guilt, no urgency).
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, palette, typography, fontFamilies, spacing, radius } from '../../tokens';

const c = colors.dark;

interface MercyModeRecoveryTrackerProps {
  /** 0 = not started, 1 = day 1 done, 2 = day 2 done, 3 = complete */
  recoveryDay: number;
  habitName: string;
  /** The streak count that will be partially restored on completion */
  restoredStreak?: number;
}

/** Encouraging copy for each completed step */
function getEncouragingCopy(day: number, restoredStreak?: number): string {
  switch (day) {
    case 1:
      return 'One step forward. Well done.';
    case 2:
      return 'Two steps. Your consistency is building.';
    case 3:
      return restoredStreak
        ? `Recovery complete! Your ${restoredStreak}-day momentum has been restored.`
        : 'Recovery complete! Your momentum has been restored.';
    default:
      return 'Begin your recovery journey.';
  }
}

export function MercyModeRecoveryTracker({
  recoveryDay,
  habitName,
  restoredStreak,
}: MercyModeRecoveryTrackerProps) {
  const copy = getEncouragingCopy(recoveryDay, restoredStreak);

  return (
    <View style={styles.container}>
      {/* Step indicators */}
      <View style={styles.stepsRow}>
        {[1, 2, 3].map((step) => {
          const isCompleted = recoveryDay >= step;
          const isCurrent = recoveryDay === step - 1;

          return (
            <React.Fragment key={step}>
              {/* Connecting line (before steps 2 and 3) */}
              {step > 1 && (
                <View
                  style={[
                    styles.connector,
                    recoveryDay >= step && styles.connectorComplete,
                  ]}
                />
              )}

              {/* Step circle */}
              <View
                style={[
                  styles.stepCircle,
                  isCompleted && styles.stepCircleComplete,
                  isCurrent && styles.stepCircleCurrent,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>{'✓'}</Text>
                ) : (
                  <Text style={styles.stepNumber}>{step}</Text>
                )}
              </View>
            </React.Fragment>
          );
        })}
      </View>

      {/* Encouraging copy */}
      <Text style={styles.copy}>{copy}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255, 179, 71, 0.06)',
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  connector: {
    height: 2,
    width: 40,
    backgroundColor: c.border,
  },
  connectorComplete: {
    backgroundColor: palette['emerald-400'],
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: c.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleComplete: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  stepCircleCurrent: {
    borderColor: c.mercy,
    borderWidth: 2.5,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stepNumber: {
    fontSize: typography.caption.fontSize,
    fontFamily: typography.caption.fontFamily,
    color: c.textMuted,
  },
  copy: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: c.mercy,
    textAlign: 'center',
  },
});
