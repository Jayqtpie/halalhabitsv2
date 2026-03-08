/**
 * Theme comparison spike screen.
 *
 * Shows a mock habit card and button samples in both dark and light mode
 * using the semantic color tokens, so the user can decide on theme direction.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { colors, fontFamilies, spacing, radius, typography, componentSpacing } from '../../src/tokens';

interface MockCardProps {
  mode: 'dark' | 'light';
}

function MockHabitCard({ mode }: MockCardProps) {
  const c = colors[mode];

  return (
    <View
      style={[
        cardStyles.card,
        { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <View style={cardStyles.header}>
        <View style={[cardStyles.icon, { backgroundColor: c.primary }]} />
        <View style={cardStyles.headerText}>
          <Text style={[cardStyles.title, { color: c.textPrimary, fontFamily: fontFamilies.interBold }]}>
            Fajr Prayer
          </Text>
          <Text style={[cardStyles.subtitle, { color: c.textSecondary, fontFamily: fontFamilies.inter }]}>
            Daily - Salah
          </Text>
        </View>
        <View style={[cardStyles.streakBadge, { backgroundColor: c.xp + '20' }]}>
          <Text style={[cardStyles.streakText, { color: c.xp, fontFamily: fontFamilies.pixelFont }]}>
            x2.5
          </Text>
        </View>
      </View>
      <View style={cardStyles.xpRow}>
        <View style={[cardStyles.xpBar, { backgroundColor: c.hud.xpBarBg }]}>
          <View
            style={[
              cardStyles.xpFill,
              { backgroundColor: c.hud.xpBarFill, width: '65%' },
            ]}
          />
        </View>
        <Text style={[cardStyles.xpLabel, { color: c.textMuted, fontFamily: fontFamilies.inter }]}>
          +30 XP
        </Text>
      </View>
    </View>
  );
}

function ButtonSamples({ mode }: MockCardProps) {
  const c = colors[mode];

  return (
    <View style={buttonStyles.row}>
      <View style={[buttonStyles.button, { backgroundColor: c.primary }]}>
        <Text style={[buttonStyles.buttonText, { color: '#FFFFFF', fontFamily: fontFamilies.interBold }]}>
          Complete
        </Text>
      </View>
      <View style={[buttonStyles.button, { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border }]}>
        <Text style={[buttonStyles.buttonText, { color: c.textPrimary, fontFamily: fontFamilies.inter }]}>
          Skip
        </Text>
      </View>
      <View style={[buttonStyles.button, { backgroundColor: c.error + '15' }]}>
        <Text style={[buttonStyles.buttonText, { color: c.error, fontFamily: fontFamilies.inter }]}>
          Archive
        </Text>
      </View>
    </View>
  );
}

function TextHierarchy({ mode }: MockCardProps) {
  const c = colors[mode];

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={{ fontSize: typography.headingLg.fontSize, fontFamily: fontFamilies.interBold, color: c.textPrimary }}>
        Heading Large
      </Text>
      <Text style={{ fontSize: typography.headingMd.fontSize, fontFamily: fontFamilies.interSemiBold, color: c.textPrimary }}>
        Heading Medium
      </Text>
      <Text style={{ fontSize: typography.bodyMd.fontSize, fontFamily: fontFamilies.inter, color: c.textSecondary }}>
        Body text in secondary color for supporting information.
      </Text>
      <Text style={{ fontSize: typography.caption.fontSize, fontFamily: fontFamilies.inter, color: c.textMuted }}>
        Caption text in muted color for metadata and timestamps.
      </Text>
    </View>
  );
}

export default function ThemeSpikeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Theme Comparison Spike</Text>
      <Text style={styles.subtitle}>Dark mode vs light mode with jewel-tone palette</Text>

      {/* Dark mode section */}
      <View style={[styles.modeSection, { backgroundColor: colors.dark.background }]}>
        <Text style={[styles.modeLabel, { color: colors.dark.primary }]}>DARK MODE</Text>
        <MockHabitCard mode="dark" />
        <ButtonSamples mode="dark" />
        <TextHierarchy mode="dark" />
      </View>

      <View style={{ height: spacing.xl }} />

      {/* Light mode section */}
      <View style={[styles.modeSection, { backgroundColor: colors.light.background }]}>
        <Text style={[styles.modeLabel, { color: colors.light.primary }]}>LIGHT MODE</Text>
        <MockHabitCard mode="light" />
        <ButtonSamples mode="light" />
        <TextHierarchy mode="light" />
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.backgroundDeep,
  },
  content: {
    paddingStart: spacing.lg,
    paddingEnd: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: fontFamilies.inter,
    color: colors.dark.primary,
  },
  title: {
    fontSize: typography.headingLg.fontSize,
    fontFamily: fontFamilies.interBold,
    color: colors.dark.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.bodyMd.fontSize,
    fontFamily: fontFamilies.inter,
    color: colors.dark.textSecondary,
    marginBottom: spacing.xl,
  },
  modeSection: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  modeLabel: {
    fontSize: typography.caption.fontSize,
    fontFamily: fontFamilies.inter,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
});

const cardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: componentSpacing.cardPadding,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    marginEnd: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.bodyLg.fontSize,
    lineHeight: typography.bodyLg.lineHeight,
  },
  subtitle: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
  },
  streakBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  streakText: {
    fontSize: 10,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  xpBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: 3,
  },
  xpLabel: {
    fontSize: typography.caption.fontSize,
  },
});

const buttonStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.bodySm.fontSize,
  },
});
