/**
 * Custom habit creation form.
 *
 * Allows users to create personalized habits with name, category,
 * frequency, optional time window, and icon selection.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { PRESET_CATEGORIES } from '../../domain/presets';
import { useHabitStore } from '../../stores/habitStore';
import { useAuthStore } from '../../stores/authStore';
import { generateId } from '../../utils/uuid';
import { colors, typography, fontFamilies, spacing, componentSpacing, radius } from '../../tokens';
import type { PresetCategory } from '../../types/habits';
import type { NewHabit } from '../../types/database';

const c = colors.dark;

const ICON_OPTIONS = [
  '\u2B50', '\uD83D\uDCAA', '\uD83D\uDCDA', '\uD83C\uDF19', '\u2764\uFE0F',
  '\uD83C\uDF1F', '\uD83D\uDD25', '\uD83C\uDFAF', '\uD83E\uDDD8', '\u270D\uFE0F',
  '\uD83D\uDE4F', '\uD83D\uDCAB', '\uD83C\uDF31', '\uD83E\uDE77', '\uD83D\uDC8E',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // JS day values (Mon=1, Sun=0)

interface CustomHabitFormProps {
  onCreated?: () => void;
}

export function CustomHabitForm({ onCreated }: CustomHabitFormProps) {
  const { habits, addHabit } = useHabitStore(
    useShallow((s) => ({ habits: s.habits, addHabit: s.addHabit })),
  );

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PresetCategory>('character');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [timeWindowStart, setTimeWindowStart] = useState('');
  const [timeWindowEnd, setTimeWindowEnd] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (name.trim().length > 50) {
      newErrors.name = 'Name must be 50 characters or fewer';
    }
    if (frequency === 'specific_days' && selectedDays.length === 0) {
      newErrors.days = 'Select at least one day';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, frequency, selectedDays]);

  const handleSubmit = useCallback(async () => {
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      const now = new Date().toISOString();
      const newHabit: NewHabit = {
        id: generateId(),
        userId: useAuthStore.getState().userId,
        name: name.trim(),
        type: 'custom',
        category,
        frequency,
        frequencyDays:
          frequency === 'specific_days'
            ? JSON.stringify(selectedDays)
            : null,
        difficultyTier: 'medium',
        baseXp: 20,
        icon: selectedIcon,
        status: 'active',
        sortOrder: habits.length,
        timeWindowStart: timeWindowStart || null,
        timeWindowEnd: timeWindowEnd || null,
        createdAt: now,
        updatedAt: now,
      };

      await addHabit(newHabit);
      onCreated?.();
    } catch {
      Alert.alert('Error', 'Failed to create habit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    validate,
    submitting,
    name,
    category,
    frequency,
    selectedDays,
    selectedIcon,
    timeWindowStart,
    timeWindowEnd,
    habits.length,
    addHabit,
    onCreated,
  ]);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  return (
    <View style={styles.container}>
      {/* Name Input */}
      <View style={styles.field}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={[styles.input, errors.name ? styles.inputError : null]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Read 10 pages"
          placeholderTextColor={c.textMuted}
          maxLength={50}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Category Selector */}
      <View style={styles.field}>
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {PRESET_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.chip,
                category === cat.key && styles.chipActive,
              ]}
              onPress={() => setCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.chipText,
                  category === cat.key && styles.chipTextActive,
                ]}
              >
                {cat.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.field}>
        <Text style={styles.label}>Frequency</Text>
        <View style={styles.freqToggle}>
          <TouchableOpacity
            style={[
              styles.freqOption,
              frequency === 'daily' && styles.freqOptionActive,
            ]}
            onPress={() => setFrequency('daily')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.freqOptionText,
                frequency === 'daily' && styles.freqOptionTextActive,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.freqOption,
              frequency === 'specific_days' && styles.freqOptionActive,
            ]}
            onPress={() => setFrequency('specific_days')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.freqOptionText,
                frequency === 'specific_days' && styles.freqOptionTextActive,
              ]}
            >
              Specific Days
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Day Selector (visible when specific_days) */}
      {frequency === 'specific_days' && (
        <View style={styles.field}>
          <View style={styles.dayRow}>
            {DAY_LABELS.map((label, i) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.dayChip,
                  selectedDays.includes(DAY_VALUES[i]) && styles.dayChipActive,
                ]}
                onPress={() => toggleDay(DAY_VALUES[i])}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    selectedDays.includes(DAY_VALUES[i]) &&
                      styles.dayChipTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.days && <Text style={styles.errorText}>{errors.days}</Text>}
        </View>
      )}

      {/* Time Window (optional) */}
      <View style={styles.field}>
        <Text style={styles.label}>Time Window (optional)</Text>
        <View style={styles.timeRow}>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={timeWindowStart}
            onChangeText={setTimeWindowStart}
            placeholder="Start (e.g., 06:00)"
            placeholderTextColor={c.textMuted}
          />
          <Text style={styles.timeSeparator}>to</Text>
          <TextInput
            style={[styles.input, styles.timeInput]}
            value={timeWindowEnd}
            onChangeText={setTimeWindowEnd}
            placeholder="End (e.g., 08:00)"
            placeholderTextColor={c.textMuted}
          />
        </View>
      </View>

      {/* Icon Picker */}
      <View style={styles.field}>
        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICON_OPTIONS.map((icon) => (
            <TouchableOpacity
              key={icon}
              style={[
                styles.iconOption,
                selectedIcon === icon && styles.iconOptionActive,
              ]}
              onPress={() => setSelectedIcon(icon)}
              activeOpacity={0.7}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        activeOpacity={0.7}
      >
        <Text style={styles.submitButtonText}>
          {submitting ? 'Creating...' : 'Create Habit'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textSecondary,
    marginBottom: 2,
  },
  input: {
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: componentSpacing.listItemPaddingHorizontal,
    color: c.textPrimary,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
  },
  inputError: {
    borderColor: c.error,
  },
  errorText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.error,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  chipActive: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.15)',
  },
  chipIcon: {
    fontSize: 14,
  },
  chipText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.textMuted,
  },
  chipTextActive: {
    color: c.primary,
  },
  freqToggle: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: c.border,
  },
  freqOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  freqOptionActive: {
    backgroundColor: c.primary,
  },
  freqOptionText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textMuted,
  },
  freqOptionTextActive: {
    color: '#FFFFFF',
  },
  dayRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  dayChipActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  dayChipText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.textMuted,
  },
  dayChipTextActive: {
    color: '#FFFFFF',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    color: c.textMuted,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  iconOptionActive: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.15)',
  },
  iconText: {
    fontSize: 22,
  },
  submitButton: {
    backgroundColor: c.primary,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: '#FFFFFF',
  },
});
