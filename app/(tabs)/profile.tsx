/**
 * Profile tab - Profile and settings placeholder (Phase 6).
 * Includes links to spike screens for development review.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, radius } from '../../src/tokens';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{t('tabs.profile')}</Text>
      <Text style={styles.phase}>{t('placeholder.phaseIndicator', { phase: 6 })}</Text>
      <Text style={styles.description}>Profile and settings coming in Phase 6</Text>

      <View style={styles.spikeSection}>
        <Text style={styles.spikeLabel}>Development Spikes</Text>
        <TouchableOpacity
          style={styles.spikeButton}
          onPress={() => router.push('/_spike/fonts')}
        >
          <Text style={styles.spikeButtonText}>Font Comparison</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.spikeButton}
          onPress={() => router.push('/_spike/theme')}
        >
          <Text style={styles.spikeButtonText}>Theme Comparison</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dark.background,
    paddingStart: spacing.lg,
    paddingEnd: spacing.lg,
  },
  heading: {
    fontSize: typography.headingLg.fontSize,
    lineHeight: typography.headingLg.lineHeight,
    fontWeight: typography.headingLg.fontWeight as '700',
    fontFamily: typography.headingLg.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  phase: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.primary,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  spikeSection: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  spikeLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textSecondary,
    letterSpacing: typography.caption.letterSpacing,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  spikeButton: {
    backgroundColor: colors.dark.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    minWidth: 200,
    alignItems: 'center',
  },
  spikeButtonText: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.primary,
  },
});
