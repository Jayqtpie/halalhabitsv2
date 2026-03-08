/**
 * Font comparison spike screen.
 *
 * Side-by-side comparison of Press Start 2P (pixel) vs Inter Bold (modern)
 * at various heading and body sizes. Rendered on dark background with jewel tones.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { colors, fontFamilies, spacing, typography } from '../../src/tokens';

function SampleRow({ label, font, size }: { label: string; font: string; size: number }) {
  return (
    <View style={styles.sampleRow}>
      <Text style={styles.sampleLabel}>{label} ({size}px)</Text>
      <Text style={{ fontFamily: font, fontSize: size, color: colors.dark.textPrimary }}>
        Your discipline grows
      </Text>
    </View>
  );
}

export default function FontSpikeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Font Comparison Spike</Text>
      <Text style={styles.subtitle}>Compare pixel font vs modern font for headings and body text</Text>

      {/* Heading comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HEADINGS: Press Start 2P (Pixel)</Text>
        <SampleRow label="Heading XL" font={fontFamilies.pixelFont} size={28} />
        <SampleRow label="Heading LG" font={fontFamilies.pixelFont} size={24} />
        <SampleRow label="Heading MD" font={fontFamilies.pixelFont} size={20} />
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HEADINGS: Inter Bold (Modern)</Text>
        <SampleRow label="Heading XL" font={fontFamilies.interBold} size={28} />
        <SampleRow label="Heading LG" font={fontFamilies.interBold} size={24} />
        <SampleRow label="Heading MD" font={fontFamilies.interSemiBold} size={20} />
      </View>

      <View style={styles.divider} />

      {/* Body text */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>BODY TEXT: Inter</Text>
        <SampleRow label="Body LG" font={fontFamilies.inter} size={17} />
        <SampleRow label="Body MD" font={fontFamilies.inter} size={15} />
        <SampleRow label="Body SM" font={fontFamilies.inter} size={13} />
        <SampleRow label="Caption" font={fontFamilies.inter} size={11} />
      </View>

      <View style={styles.divider} />

      {/* HUD labels comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>HUD LABELS: Pixel vs Modern</Text>
        <View style={styles.comparisonRow}>
          <View style={styles.comparisonCol}>
            <Text style={styles.colLabel}>Press Start 2P</Text>
            <Text style={{ fontFamily: fontFamilies.pixelFont, fontSize: 16, color: colors.dark.xp }}>
              LVL 42
            </Text>
            <Text style={{ fontFamily: fontFamilies.pixelFont, fontSize: 12, color: colors.dark.xp }}>
              1,250 XP
            </Text>
            <Text style={{ fontFamily: fontFamilies.pixelFont, fontSize: 10, color: colors.dark.textSecondary }}>
              STREAK x3.0
            </Text>
          </View>
          <View style={styles.comparisonCol}>
            <Text style={styles.colLabel}>Inter Bold</Text>
            <Text style={{ fontFamily: fontFamilies.interBold, fontSize: 16, color: colors.dark.xp }}>
              LVL 42
            </Text>
            <Text style={{ fontFamily: fontFamilies.interBold, fontSize: 12, color: colors.dark.xp }}>
              1,250 XP
            </Text>
            <Text style={{ fontFamily: fontFamilies.interBold, fontSize: 10, color: colors.dark.textSecondary }}>
              STREAK x3.0
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
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
    fontFamily: typography.bodyMd.fontFamily,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.caption.fontSize,
    fontFamily: fontFamilies.inter,
    color: colors.dark.primary,
    letterSpacing: 1.5,
    marginBottom: spacing.md,
  },
  sampleRow: {
    marginBottom: spacing.md,
  },
  sampleLabel: {
    fontSize: typography.caption.fontSize,
    fontFamily: fontFamilies.inter,
    color: colors.dark.textMuted,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.border,
    marginVertical: spacing.lg,
  },
  comparisonRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  comparisonCol: {
    flex: 1,
    gap: spacing.sm,
  },
  colLabel: {
    fontSize: typography.caption.fontSize,
    fontFamily: fontFamilies.inter,
    color: colors.dark.textMuted,
    marginBottom: spacing.xs,
  },
});
