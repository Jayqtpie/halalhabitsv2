/**
 * QuestSection -- Section header with quest cards grouped by type.
 *
 * Empty state: subtle text when no quests in section.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { QuestCard } from './QuestCard';
import { colors, typography, spacing } from '../../tokens';
import type { Quest } from '../../types/database';

interface QuestSectionProps {
  title: string;
  quests: Quest[];
}

export function QuestSection({ title, quests }: QuestSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>{title}</Text>
      {quests.length === 0 ? (
        <Text style={styles.emptyText}>No {title.toLowerCase()} active</Text>
      ) : (
        quests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: 11,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700' as const,
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
});
