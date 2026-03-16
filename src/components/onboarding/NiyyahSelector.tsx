/**
 * Niyyah (intention) multi-select chip component.
 *
 * Max 3 selections enforced. Selected chips use filled emerald background.
 * Unselected chips use border-only style.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NiyyahOption } from '../../domain/niyyah-options';
import { colors, fontFamilies, spacing } from '../../tokens';

const c = colors.dark;

interface NiyyahSelectorProps {
  options: NiyyahOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelections?: number;
}

export function NiyyahSelector({
  options,
  selectedIds,
  onToggle,
  maxSelections = 3,
}: NiyyahSelectorProps) {
  const handleToggle = (id: string) => {
    const isSelected = selectedIds.includes(id);
    if (!isSelected && selectedIds.length >= maxSelections) {
      // Max reached — don't add more
      return;
    }
    onToggle(id);
  };

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        const atMax = !isSelected && selectedIds.length >= maxSelections;

        return (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              styles.chip,
              isSelected && styles.chipSelected,
              atMax && styles.chipDisabled,
              pressed && !atMax && styles.chipPressed,
            ]}
            onPress={() => handleToggle(option.id)}
            accessibilityLabel={option.text}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isSelected, disabled: atMax }}
          >
            {isSelected && (
              <Text style={styles.checkIcon}>{'✓'}</Text>
            )}
            <Text style={[
              styles.chipText,
              isSelected && styles.chipTextSelected,
              atMax && styles.chipTextDisabled,
            ]}>
              {option.text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: c.border,
    backgroundColor: 'transparent',
    // Min touch target: paddingVertical 10 + lineHeight ~22 = ~42px, close to 44. Add extra:
    minHeight: 44,
  },
  chipSelected: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  chipDisabled: {
    opacity: 0.4,
  },
  chipPressed: {
    opacity: 0.75,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fontFamilies.inter,
    color: c.textSecondary,
    lineHeight: 20,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.interSemiBold,
  },
  chipTextDisabled: {
    color: c.textMuted,
  },
  checkIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontFamily: fontFamilies.interBold,
  },
});
