/**
 * Settings screen -- Grouped settings with 4 sections.
 *
 * Sections: Prayer, Notifications, Appearance, About
 *
 * Navigated to from the profile screen gear icon.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { useSettingsStore } from '../src/stores/settingsStore';
import { colors, typography, spacing } from '../src/tokens';
import ExpoConstants from 'expo-constants';

const CALC_METHODS = [
  { key: 'ISNA', label: 'ISNA (North America)' },
  { key: 'MWL', label: 'Muslim World League' },
  { key: 'Egyptian', label: 'Egyptian General Authority' },
  { key: 'Makkah', label: 'Umm Al-Qura University' },
  { key: 'Karachi', label: 'University of Islamic Sciences' },
  { key: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { key: 'Jafari', label: 'Shia Ithna-Ashari' },
];

// Version from expo config — use optional chaining for safety across SDK versions
const APP_VERSION: string =
  (ExpoConstants?.expoConfig?.version as string | undefined) ?? '1.0.0';

// ─── Row components ───────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  subtext?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  isLast?: boolean;
}

function ToggleRow({ label, subtext, value, onValueChange, isLast }: ToggleRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {subtext ? <Text style={styles.rowSubtext}>{subtext}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.dark.border, true: colors.dark.primary }}
        thumbColor={value ? '#FFFFFF' : colors.dark.textMuted}
        accessibilityLabel={label}
        accessibilityRole="switch"
      />
    </View>
  );
}

interface NavRowProps {
  label: string;
  value?: string;
  onPress: () => void;
  isLast?: boolean;
  isDestructive?: boolean;
}

function NavRow({ label, value, onPress, isLast, isDestructive }: NavRowProps) {
  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowBorder]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.rowLabel, isDestructive && styles.destructiveLabel]}>{label}</Text>
      <View style={styles.rowRight}>
        {value ? <Text style={styles.rowValue}>{value}</Text> : null}
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

interface StaticRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function StaticRow({ label, value, isLast }: StaticRowProps) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();

  const {
    prayerCalcMethod,
    setPrayerCalcMethod,
    locationName,
    muhasabahNotifEnabled,
    setMuhasabahNotifEnabled,
    streakMilestonesEnabled,
    toggleStreakMilestones,
    questExpiringEnabled,
    toggleQuestExpiring,
    morningMotivationEnabled,
    toggleMorningMotivation,
    soundEnabled,
    toggleSound,
    hapticEnabled,
    toggleHaptic,
    arabicTermsEnabled,
    toggleArabicTerms,
  } = useSettingsStore(
    useShallow((s) => ({
      prayerCalcMethod: s.prayerCalcMethod,
      setPrayerCalcMethod: s.setPrayerCalcMethod,
      locationName: s.locationName,
      muhasabahNotifEnabled: s.muhasabahNotifEnabled,
      setMuhasabahNotifEnabled: s.setMuhasabahNotifEnabled,
      streakMilestonesEnabled: s.streakMilestonesEnabled,
      toggleStreakMilestones: s.toggleStreakMilestones,
      questExpiringEnabled: s.questExpiringEnabled,
      toggleQuestExpiring: s.toggleQuestExpiring,
      morningMotivationEnabled: s.morningMotivationEnabled,
      toggleMorningMotivation: s.toggleMorningMotivation,
      soundEnabled: s.soundEnabled,
      toggleSound: s.toggleSound,
      hapticEnabled: s.hapticEnabled,
      toggleHaptic: s.toggleHaptic,
      arabicTermsEnabled: s.arabicTermsEnabled,
      toggleArabicTerms: s.toggleArabicTerms,
    }))
  );

  const calcMethodLabel =
    CALC_METHODS.find((m) => m.key === prayerCalcMethod)?.label ?? prayerCalcMethod;

  const handleCalcMethodPress = useCallback(() => {
    Alert.alert(
      'Prayer Calculation Method',
      'Select the method that best fits your region:',
      [
        ...CALC_METHODS.map((method) => ({
          text: method.label,
          onPress: () => setPrayerCalcMethod(method.key),
          style: method.key === prayerCalcMethod ? 'destructive' as const : 'default' as const,
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ]
    );
  }, [prayerCalcMethod, setPrayerCalcMethod]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
        >
          <Text style={styles.backIcon}>‹</Text>
          <Text style={styles.backText}>Profile</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Prayer Section */}
        <Text style={styles.sectionTitle}>PRAYER</Text>
        <View style={styles.sectionCard}>
          <NavRow
            label="Calculation Method"
            value={calcMethodLabel}
            onPress={handleCalcMethodPress}
          />
          <NavRow
            label="Location"
            value={locationName ?? 'Not set'}
            onPress={() => {
              // Location re-request is handled by prayer-times service
              // For now show informational alert
              Alert.alert(
                'Location',
                locationName
                  ? `Current: ${locationName}\n\nLocation updates automatically from your device.`
                  : 'Location not set. Prayer times require location access.'
              );
            }}
            isLast
          />
        </View>

        {/* Notifications Section */}
        <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          <NavRow
            label="Prayer Reminders"
            onPress={() => router.push('/prayer-reminders' as any)}
          />
          <ToggleRow
            label="Muhasabah Reminder"
            subtext="Daily evening reflection"
            value={muhasabahNotifEnabled}
            onValueChange={setMuhasabahNotifEnabled}
          />
          <ToggleRow
            label="Streak Milestones"
            value={streakMilestonesEnabled}
            onValueChange={toggleStreakMilestones}
          />
          <ToggleRow
            label="Quest Expiring"
            value={questExpiringEnabled}
            onValueChange={toggleQuestExpiring}
          />
          <ToggleRow
            label="Morning Motivation"
            value={morningMotivationEnabled}
            onValueChange={toggleMorningMotivation}
            isLast
          />
        </View>

        {/* Appearance Section */}
        <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>APPEARANCE</Text>
        <View style={styles.sectionCard}>
          <ToggleRow
            label="Sound Effects"
            value={soundEnabled}
            onValueChange={toggleSound}
          />
          <ToggleRow
            label="Haptic Feedback"
            value={hapticEnabled}
            onValueChange={toggleHaptic}
          />
          <ToggleRow
            label="Arabic Terminology"
            subtext="Show Islamic terms with English context"
            value={arabicTermsEnabled}
            onValueChange={toggleArabicTerms}
            isLast
          />
        </View>

        {/* About Section */}
        <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>ABOUT</Text>
        <View style={styles.sectionCard}>
          <StaticRow label="Version" value={APP_VERSION} />
          <StaticRow
            label="Credits"
            value="Made with adab"
            isLast
          />
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
  sectionTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textMuted,
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitleGap: {
    marginTop: spacing.lg,
  },
  sectionCard: {
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  rowSubtext: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: colors.dark.textMuted,
    lineHeight: 22,
  },
  destructiveLabel: {
    color: colors.dark.error,
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
