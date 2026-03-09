/**
 * Preset habit library with categorized sections.
 *
 * Displays ~15 Islamic habit presets across 6 categories.
 * Salah prayers are individually selectable (not all-or-nothing).
 * Already-added presets are shown as disabled to prevent duplicates.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { PRESET_CATEGORIES, getPresetsByCategory } from '../../domain/presets';
import { useHabitStore } from '../../stores/habitStore';
import { getCoordinates } from '../../services/location';
import { generateId } from '../../utils/uuid';
import { colors, typography, fontFamilies, spacing, componentSpacing } from '../../tokens';
import type { PresetHabit, PresetCategory } from '../../types/habits';
import type { NewHabit } from '../../types/database';

const c = colors.dark;

interface PresetLibraryProps {
  onHabitAdded?: () => void;
}

export function PresetLibrary({ onHabitAdded }: PresetLibraryProps) {
  const { habits, addHabit } = useHabitStore(
    useShallow((s) => ({ habits: s.habits, addHabit: s.addHabit })),
  );

  const [addedKeys, setAddedKeys] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<PresetCategory | null>('salah');
  const [locationRequested, setLocationRequested] = useState(false);

  // Check which presets are already added
  const existingPresetKeys = new Set(
    habits.filter((h) => h.presetKey).map((h) => h.presetKey),
  );

  const isAlreadyAdded = useCallback(
    (key: string) => existingPresetKeys.has(key) || addedKeys.has(key),
    [existingPresetKeys, addedKeys],
  );

  const handleAddPreset = useCallback(
    async (preset: PresetHabit) => {
      if (isAlreadyAdded(preset.key)) return;

      const now = new Date().toISOString();
      const newHabit: NewHabit = {
        id: generateId(),
        userId: 'default-user',
        name: preset.name,
        type: preset.type,
        presetKey: preset.key,
        category: preset.category,
        frequency: preset.frequency,
        frequencyDays: preset.frequencyDays ?? null,
        difficultyTier: preset.difficultyTier,
        baseXp: preset.baseXp,
        icon: preset.icon,
        status: 'active',
        sortOrder: habits.length,
        createdAt: now,
        updatedAt: now,
      };

      await addHabit(newHabit);
      setAddedKeys((prev) => new Set(prev).add(preset.key));

      // Request location for first salah preset (needed for prayer times)
      if (preset.type === 'salah' && !locationRequested) {
        setLocationRequested(true);
        await getCoordinates();
      }

      onHabitAdded?.();
    },
    [addHabit, habits.length, isAlreadyAdded, locationRequested, onHabitAdded],
  );

  const toggleCategory = useCallback(
    (key: PresetCategory) => {
      setExpandedCategory((prev) => (prev === key ? null : key));
    },
    [],
  );

  return (
    <View style={styles.container}>
      {PRESET_CATEGORIES.map((cat) => {
        const presets = getPresetsByCategory(cat.key);
        const isExpanded = expandedCategory === cat.key;

        return (
          <View key={cat.key} style={styles.categorySection}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(cat.key)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryHeaderLeft}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.displayName}</Text>
              </View>
              <Text style={styles.expandIcon}>
                {isExpanded ? '\u25B2' : '\u25BC'}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.presetList}>
                {presets.map((preset) => {
                  const added = isAlreadyAdded(preset.key);
                  return (
                    <View key={preset.key} style={styles.presetItem}>
                      <View style={styles.presetInfo}>
                        <Text style={styles.presetIcon}>{preset.icon}</Text>
                        <View style={styles.presetText}>
                          <Text style={styles.presetName}>{preset.name}</Text>
                          <Text
                            style={styles.presetDescription}
                            numberOfLines={2}
                          >
                            {preset.description}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          added && styles.addButtonDisabled,
                        ]}
                        onPress={() => handleAddPreset(preset)}
                        disabled={added}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.addButtonText,
                            added && styles.addButtonTextDisabled,
                          ]}
                        >
                          {added ? 'Added' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  categorySection: {
    backgroundColor: c.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: componentSpacing.listItemPaddingVertical,
    paddingHorizontal: componentSpacing.listItemPaddingHorizontal,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
  },
  expandIcon: {
    fontSize: 10,
    color: c.textMuted,
  },
  presetList: {
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: componentSpacing.listItemPaddingVertical,
    paddingHorizontal: componentSpacing.listItemPaddingHorizontal,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  presetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  presetIcon: {
    fontSize: 24,
  },
  presetText: {
    flex: 1,
  },
  presetName: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textPrimary,
  },
  presetDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: c.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  addButtonText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: '#FFFFFF',
  },
  addButtonTextDisabled: {
    color: c.textMuted,
  },
});
