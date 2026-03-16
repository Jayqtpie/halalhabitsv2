/**
 * Prayer Reminders screen -- Per-prayer notification configuration.
 *
 * Shows a PrayerReminderRow for each of 5 prayers.
 * Navigated to from Settings > Prayer Reminders.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../src/stores/settingsStore';
import { PrayerReminderRow } from '../src/components/settings/PrayerReminderRow';
import { colors, typography, spacing } from '../src/tokens';
import type { PrayerName } from '../src/types/habits';

const PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export default function PrayerRemindersScreen() {
  const router = useRouter();

  const { prayerReminders, setPrayerReminder } = useSettingsStore(
    useShallow((s) => ({
      prayerReminders: s.prayerReminders,
      setPrayerReminder: s.setPrayerReminder,
    }))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back to settings"
          hitSlop={8}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Settings</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Prayer Reminders</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.helperText}>
          Configure reminders for each daily prayer. Lead time sets how early you're notified.
          The gentle follow-up sends a reminder 30 minutes after prayer time.
        </Text>

        <View style={styles.card}>
          {PRAYERS.map((prayer) => (
            <PrayerReminderRow
              key={prayer}
              prayer={prayer}
              config={prayerReminders[prayer]}
              onChange={(updates) => setPrayerReminder(prayer, updates)}
            />
          ))}
        </View>

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
    gap: 2,
  },
  backIcon: {
    fontSize: 24,
    color: colors.dark.primary,
    lineHeight: 28,
  },
  backText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    minWidth: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  helperText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border,
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
