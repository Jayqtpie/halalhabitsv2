/**
 * PrayerCountdown -- Shows next prayer name + countdown timer.
 *
 * Updates every 60 seconds. Uses settingsStore for location and
 * prayer-times service to calculate upcoming prayer windows.
 * Shows "--" if location not set.
 *
 * Format: "Dhuhr in 2h 15m"
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../../stores/settingsStore';
import { getPrayerWindows } from '../../services/prayer-times';
import { colors, typography } from '../../tokens';
import type { CalcMethodKey } from '../../types/habits';

function formatCountdown(now: Date, target: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return 'now';

  const totalMinutes = Math.round(diffMs / 60_000);
  if (totalMinutes < 1) return '<1m';
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function PrayerCountdown() {
  const { locationLat, locationLng, prayerCalcMethod } = useSettingsStore(
    useShallow((s) => ({
      locationLat: s.locationLat,
      locationLng: s.locationLng,
      prayerCalcMethod: s.prayerCalcMethod,
    })),
  );

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const nextPrayer = useMemo(() => {
    if (locationLat === null || locationLng === null) return null;

    try {
      const windows = getPrayerWindows(
        locationLat,
        locationLng,
        now,
        prayerCalcMethod as CalcMethodKey,
        now,
      );
      // Find next upcoming prayer
      const upcoming = windows.find((w) => w.status === 'upcoming');
      if (upcoming) return upcoming;
      // Find active prayer (currently in its window)
      const active = windows.find((w) => w.status === 'active');
      if (active) return active;
      // All prayers passed today — calculate tomorrow's Fajr
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowWindows = getPrayerWindows(
        locationLat!,
        locationLng!,
        tomorrow,
        prayerCalcMethod as CalcMethodKey,
        now,
      );
      return tomorrowWindows[0] ?? null;
    } catch {
      return null;
    }
  }, [locationLat, locationLng, prayerCalcMethod, now]);

  if (!nextPrayer || locationLat === null || locationLng === null) {
    return <Text style={styles.text}>--</Text>;
  }

  const countdown = formatCountdown(now, nextPrayer.start);
  return (
    <Text style={styles.text} numberOfLines={1}>
      {nextPrayer.displayName} in {countdown}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.caption.fontSize,
    fontFamily: typography.caption.fontFamily,
    lineHeight: typography.caption.lineHeight,
    color: colors.dark.textSecondary,
    flexShrink: 1,
  },
});
