/**
 * PrayerTimeWindow -- compact prayer time badge for salah habit cards.
 *
 * Shows the prayer time range and current status (active/upcoming/passed).
 * Renders nothing for non-salah habits (when prayerWindow is null).
 */
import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PrayerWindow } from '../../types/habits';
import { formatPrayerTime } from '../../services/prayer-times';
import { colors, palette, typography, spacing, radius } from '../../tokens';

interface PrayerTimeWindowProps {
  prayerWindow: PrayerWindow | null;
}

/**
 * Calculate a human-readable relative time string (e.g., "In 2h 15m").
 */
function getRelativeTime(now: Date, target: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return '';

  const totalMinutes = Math.round(diffMs / 60_000);
  if (totalMinutes < 1) return 'In <1 min';
  if (totalMinutes < 60) return `In ${totalMinutes} min`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `In ${hours}h`;
  return `In ${hours}h ${mins}m`;
}

export function PrayerTimeWindow({ prayerWindow }: PrayerTimeWindowProps) {
  if (!prayerWindow) return null;

  const { start, end, status } = prayerWindow;
  const now = useMemo(() => new Date(), []);

  const timeRange = `${formatPrayerTime(start)} - ${formatPrayerTime(end)}`;

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'active':
        return {
          dotColor: palette['emerald-400'],
          label: 'Now',
          textColor: palette['emerald-400'],
        };
      case 'upcoming':
        return {
          dotColor: palette['sapphire-400'],
          label: getRelativeTime(now, start),
          textColor: palette['sapphire-400'],
        };
      case 'passed':
        return {
          dotColor: colors.dark.textMuted,
          label: 'Passed',
          textColor: colors.dark.textMuted,
        };
    }
  }, [status, now, start]);

  return (
    <View style={styles.container}>
      <Text style={styles.timeRange}>{timeRange}</Text>
      <View style={styles.statusBadge}>
        <View style={[styles.dot, { backgroundColor: statusConfig.dotColor }]} />
        <Text style={[styles.statusLabel, { color: statusConfig.textColor }]}>
          {statusConfig.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  timeRange: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  statusLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    letterSpacing: typography.caption.letterSpacing,
  },
});
