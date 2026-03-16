/**
 * SettingsList -- Reusable settings section list component.
 *
 * Renders grouped settings sections with headings.
 * Each section can contain toggle rows, navigation rows, or custom content.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';

export interface SettingsSection {
  title: string;
  children: React.ReactNode;
}

interface SettingsListProps {
  sections: SettingsSection[];
}

export function SettingsList({ sections }: SettingsListProps) {
  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <View key={section.title} style={[styles.section, index > 0 && styles.sectionGap]}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>{section.children}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionGap: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border,
  },
});
