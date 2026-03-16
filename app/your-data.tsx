/**
 * Your Data screen -- Privacy-first data management.
 *
 * Shows what data is stored locally, allows export as JSON,
 * and provides full data deletion with onboarding reset.
 *
 * Adab safety: No shame copy. Deletion is a fresh start, not punishment.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, fontFamilies, spacing } from '../src/tokens';
import { exportUserData, deleteAllUserData } from '../src/services/data-export';

const USER_ID = 'local-user';

const DATA_CATEGORIES = [
  { key: 'habits', label: 'Habits', description: 'Your habit names, types, and settings' },
  {
    key: 'completions',
    label: 'Completions',
    description: 'Daily completion records and timestamps',
  },
  { key: 'streaks', label: 'Streaks', description: 'Streak counts and history' },
  { key: 'xp', label: 'XP & Level', description: 'Discipline score and progression' },
  { key: 'titles', label: 'Titles', description: 'Earned Identity Titles' },
  { key: 'quests', label: 'Quests', description: 'Active and completed quests' },
  {
    key: 'muhasabah',
    label: 'Muhasabah',
    description: 'Personal reflections (private, never leaves device)',
  },
  { key: 'settings', label: 'Settings', description: 'App preferences and configurations' },
];

export default function YourDataScreen() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportUserData(USER_ID);
    } catch (err) {
      Alert.alert('Export Failed', 'Unable to export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Everything?',
      'This will permanently delete all your habits, streaks, XP, and reflections. This cannot be undone.\n\nYou\'ll start fresh with the onboarding flow.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAllUserData(USER_ID);
              // Navigate to onboarding
              router.replace('/(onboarding)/welcome' as any);
            } catch (err) {
              setDeleting(false);
              Alert.alert(
                'Deletion Failed',
                'Some data may not have been deleted. Please try again.'
              );
            }
          },
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Your Data</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Your data stays on your device</Text>
          <Text style={styles.introText}>
            All your habits, reflections, and progress are stored locally on your phone.
            Nothing is shared without your explicit consent.
          </Text>
        </View>

        {/* What's stored */}
        <Text style={styles.sectionTitle}>{"WHAT'S STORED"}</Text>
        <View style={styles.sectionCard}>
          {DATA_CATEGORIES.map((category, index) => (
            <View
              key={category.key}
              style={[
                styles.categoryRow,
                index < DATA_CATEGORIES.length - 1 && styles.categoryRowBorder,
              ]}
            >
              <Text style={styles.categoryLabel}>{category.label}</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
          ))}
        </View>

        {/* Export */}
        <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>DATA EXPORT</Text>
        <View style={styles.sectionCard}>
          <View style={styles.exportSection}>
            <Text style={styles.exportDescription}>
              Export all your data as a JSON file. You can use this as a backup or to review
              your progress.
            </Text>
            <Pressable
              style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
              onPress={handleExport}
              disabled={exporting}
              accessibilityRole="button"
              accessibilityLabel="Export data as JSON"
            >
              {exporting ? (
                <ActivityIndicator color={colors.dark.background} size="small" />
              ) : (
                <Text style={styles.exportButtonText}>Export Data (JSON)</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* Delete */}
        <Text style={[styles.sectionTitle, styles.sectionTitleGap]}>RESET</Text>
        <View style={styles.sectionCard}>
          <View style={styles.deleteSection}>
            <Text style={styles.deleteDescription}>
              Permanently delete all your data and start fresh. Your settings, habits, streaks,
              XP, and reflections will be removed.
            </Text>
            <Pressable
              style={[styles.deleteButton, deleting && styles.deleteButtonDisabled]}
              onPress={handleDelete}
              disabled={deleting}
              accessibilityRole="button"
              accessibilityLabel="Delete all data and restart onboarding"
            >
              {deleting ? (
                <ActivityIndicator color={colors.dark.error} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>Delete Everything</Text>
              )}
            </Pressable>
          </View>
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
  introSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  introTitle: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
    fontFamily: fontFamilies.interBold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  introText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textSecondary,
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
  categoryRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  categoryRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  categoryLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
  },
  exportSection: {
    padding: spacing.md,
  },
  exportDescription: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    marginBottom: spacing.md,
  },
  exportButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.background,
    fontWeight: '600',
  },
  deleteSection: {
    padding: spacing.md,
  },
  deleteDescription: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    marginBottom: spacing.md,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.dark.error,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.error,
    fontWeight: '600',
  },
  bottomPad: {
    height: spacing.xxl,
  },
});
