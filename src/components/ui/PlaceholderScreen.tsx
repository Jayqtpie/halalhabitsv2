/**
 * Placeholder screen component for tabs not yet built.
 * Styled to feel intentional, not broken.
 * Uses design tokens exclusively and RTL-ready layout.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing } from '../../tokens';

interface PlaceholderScreenProps {
  tabName: string;
  phase: number;
  description?: string;
}

export function PlaceholderScreen({ tabName, phase, description }: PlaceholderScreenProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{tabName}</Text>
      <Text style={styles.phase}>{t('placeholder.phaseIndicator', { phase })}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
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
    letterSpacing: typography.bodySm.letterSpacing,
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textMuted,
    textAlign: 'center',
    letterSpacing: typography.bodyMd.letterSpacing,
  },
});
