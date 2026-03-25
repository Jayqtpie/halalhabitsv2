/**
 * OnlineStatusDot — small indicator dot showing whether a buddy is online.
 *
 * Green dot = active within the last 15 minutes.
 * Gray dot  = offline / inactive.
 *
 * Created in Plan 05 as a minimal dependency for the buddy profile screen.
 * Plan 04 (buddy list) will re-export / reuse this component.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';

export type OnlineStatus = 'online' | 'offline';

interface OnlineStatusDotProps {
  status: OnlineStatus;
  /** Optional label shown next to the dot, e.g. "Active 2h ago" */
  label?: string;
}

export function OnlineStatusDot({ status, label }: OnlineStatusDotProps) {
  const dotColor =
    status === 'online' ? palette['emerald-500'] : palette['text-muted'];

  return (
    <View style={styles.row} accessible accessibilityLabel={label ?? (status === 'online' ? 'Online' : 'Offline')}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      {label != null && (
        <Text style={styles.label}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    ...typography.bodySm,
    color: palette['text-muted'],
  },
});
