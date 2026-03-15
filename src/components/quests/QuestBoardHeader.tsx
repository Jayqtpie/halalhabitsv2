/**
 * QuestBoardHeader -- Tab toggle between Quests and Titles views.
 *
 * Active tab: emerald underline + primary text color.
 * Inactive tab: secondary text color, no underline.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../tokens';

interface QuestBoardHeaderProps {
  activeTab: 'quests' | 'titles';
  onTabChange: (tab: 'quests' | 'titles') => void;
}

export function QuestBoardHeader({ activeTab, onTabChange }: QuestBoardHeaderProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.tab}
        onPress={() => onTabChange('quests')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'quests' }}
        accessibilityLabel="Quests tab"
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'quests' ? styles.tabTextActive : styles.tabTextInactive,
          ]}
        >
          Quests
        </Text>
        {activeTab === 'quests' && <View style={styles.activeUnderline} />}
      </Pressable>

      <Pressable
        style={styles.tab}
        onPress={() => onTabChange('titles')}
        accessibilityRole="tab"
        accessibilityState={{ selected: activeTab === 'titles' }}
        accessibilityLabel="Titles tab"
      >
        <Text
          style={[
            styles.tabText,
            activeTab === 'titles' ? styles.tabTextActive : styles.tabTextInactive,
          ]}
        >
          Titles
        </Text>
        {activeTab === 'titles' && <View style={styles.activeUnderline} />}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingVertical: spacing.md,
    backgroundColor: colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    gap: spacing.xl,
  },
  tab: {
    alignItems: 'center',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
    minHeight: 44,
    justifyContent: 'flex-end',
  },
  tabText: {
    fontSize: 12,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    fontWeight: '700' as const,
    letterSpacing: typography.headingMd.letterSpacing,
  },
  tabTextActive: {
    color: colors.dark.textPrimary,
  },
  tabTextInactive: {
    color: colors.dark.textSecondary,
  },
  activeUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.dark.primary,
    borderRadius: 1,
  },
});
