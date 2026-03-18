/**
 * SyncStatusIcon — cloud icon with 4 visual states.
 *
 * Reads directly from authStore (no props needed for state).
 *
 * States:
 *   idle     → cloud with x, surface-700, no caption (no account or offline)
 *   syncing  → cloud + animated spinner, emerald-500, caption "Syncing..."
 *   synced   → cloud + checkmark, emerald-500, caption "Synced"
 *   error    → cloud + warning badge, gold-500, caption "Sync failed — tap to retry"
 *
 * Tap: triggers syncNow() when in error state (placeholder — wired in plan 04).
 * Touch target: 44x44px minimum.
 */
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { colors, typography, spacing } from '../../tokens';
import { useAuthStore } from '../../stores/authStore';
import { flushQueue } from '../../services/sync-engine';

export function SyncStatusIcon() {
  const syncStatus = useAuthStore((s) => s.syncStatus);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const rotation = useSharedValue(0);

  useEffect(() => {
    if (syncStatus === 'syncing') {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 800,
          easing: Easing.linear,
        }),
        -1, // infinite
        false, // no reverse
      );
    } else {
      cancelAnimation(rotation);
      rotation.value = 0;
    }
  }, [syncStatus, rotation]);

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handlePress = async () => {
    if (syncStatus === 'error') {
      try {
        await flushQueue();
      } catch {
        // non-fatal
      }
    }
  };

  // Determine visual state
  const isOffline = !isAuthenticated || syncStatus === 'idle';

  const iconColor = isOffline
    ? '#334155' // surface-700 — muted
    : syncStatus === 'error'
    ? colors.dark.xp // gold-500
    : colors.dark.primary; // emerald-500

  const accessibilityLabel =
    isOffline
      ? 'Offline — no account connected'
      : syncStatus === 'syncing'
      ? 'Sync in progress'
      : syncStatus === 'synced'
      ? 'Synced'
      : 'Sync failed, tap to retry';

  const caption =
    isOffline
      ? 'Offline'
      : syncStatus === 'syncing'
      ? 'Syncing...'
      : syncStatus === 'synced'
      ? 'Synced'
      : 'Sync failed — tap to retry';

  return (
    <Pressable
      style={styles.container}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={4}
    >
      {/* Cloud icon with state badge */}
      <View style={styles.iconWrapper}>
        {/* Cloud base using text emoji — pixel-art icon migration in Phase 5 */}
        <Text style={[styles.cloudIcon, { color: iconColor }]}>
          {isOffline ? '☁' : '☁'}
        </Text>

        {/* State badge overlay */}
        {!isOffline && (
          <View style={styles.badgeOverlay}>
            {syncStatus === 'syncing' && (
              <Animated.View style={[styles.spinner, spinnerStyle]}>
                <Text style={[styles.badgeIcon, { color: colors.dark.primary }]}>↻</Text>
              </Animated.View>
            )}
            {syncStatus === 'synced' && (
              <Text style={[styles.badgeIcon, { color: colors.dark.primary }]}>✓</Text>
            )}
            {syncStatus === 'error' && (
              <Text style={[styles.badgeIcon, { color: colors.dark.xp }]}>!</Text>
            )}
          </View>
        )}

        {/* Offline X overlay */}
        {isOffline && (
          <View style={styles.badgeOverlay}>
            <Text style={[styles.badgeIcon, { color: '#334155' }]}>✕</Text>
          </View>
        )}
      </View>

      {/* Caption */}
      <Text style={[styles.caption, { color: iconColor }]}>{caption}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloudIcon: {
    fontSize: 22,
    lineHeight: 24,
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -6,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.background,
    borderRadius: 7,
  },
  badgeIcon: {
    fontSize: 9,
    lineHeight: 12,
    fontWeight: '700',
  },
  spinner: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
  },
});
