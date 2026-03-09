/**
 * EditHabitSheet -- bottom sheet for editing or archiving an existing habit.
 *
 * Editable: name, frequency, frequencyDays, timeWindowStart/End, icon.
 * NOT editable: type, category, presetKey (structural fields).
 * Archive is soft-delete (status='archived') with confirmation prompt.
 */
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useHabitStore } from '../../stores/habitStore';
import { colors, typography, fontFamilies, spacing, componentSpacing, radius } from '../../tokens';
import type { Habit } from '../../types/database';

const c = colors.dark;

const ICON_OPTIONS = [
  '\u2B50', '\uD83D\uDCAA', '\uD83D\uDCDA', '\uD83C\uDF19', '\u2764\uFE0F',
  '\uD83C\uDF1F', '\uD83D\uDD25', '\uD83C\uDFAF', '\uD83E\uDDD8', '\u270D\uFE0F',
  '\uD83D\uDE4F', '\uD83D\uDCAB', '\uD83C\uDF31', '\uD83E\uDE77', '\uD83D\uDC8E',
  '\uD83D\uDD4C', '\uD83D\uDCD6', '\uD83D\uDCFF', '\uD83E\uDD32', '\uD83C\uDF1C',
];

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

interface EditHabitSheetProps {
  habit: Habit | null;
  visible: boolean;
  onClose: () => void;
}

export function EditHabitSheet({ habit, visible, onClose }: EditHabitSheetProps) {
  const { updateHabit, archiveHabit } = useHabitStore(
    useShallow((s) => ({ updateHabit: s.updateHabit, archiveHabit: s.archiveHabit })),
  );

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'specific_days'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedIcon, setSelectedIcon] = useState(ICON_OPTIONS[0]);
  const [timeWindowStart, setTimeWindowStart] = useState('');
  const [timeWindowEnd, setTimeWindowEnd] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequency((habit.frequency as 'daily' | 'specific_days') || 'daily');
      setSelectedDays(
        habit.frequencyDays ? JSON.parse(habit.frequencyDays) : [],
      );
      setSelectedIcon(habit.icon || ICON_OPTIONS[0]);
      setTimeWindowStart(habit.timeWindowStart || '');
      setTimeWindowEnd(habit.timeWindowEnd || '');
      setErrors({});
    }
  }, [habit]);

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

  const handleSave = useCallback(async () => {
    if (!habit || !validate() || saving) return;

    setSaving(true);
    try {
      await updateHabit(habit.id, {
        name: name.trim(),
        frequency,
        frequencyDays:
          frequency === 'specific_days'
            ? JSON.stringify(selectedDays)
            : null,
        icon: selectedIcon,
        timeWindowStart: timeWindowStart || null,
        timeWindowEnd: timeWindowEnd || null,
      });
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update habit.');
    } finally {
      setSaving(false);
    }
  }, [
    habit,
    validate,
    saving,
    name,
    frequency,
    selectedDays,
    selectedIcon,
    timeWindowStart,
    timeWindowEnd,
    updateHabit,
    onClose,
  ]);

  const handleArchive = useCallback(() => {
    if (!habit) return;

    Alert.alert(
      'Archive this habit?',
      'You can restore it later. Your streak data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archiveHabit(habit.id);
            onClose();
          },
        },
      ],
    );
  }, [habit, archiveHabit, onClose]);

  const toggleDay = useCallback((day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  if (!habit) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Edit Habit</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                value={name}
                onChangeText={setName}
                placeholder="Habit name"
                placeholderTextColor={c.textMuted}
                maxLength={50}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
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

            {/* Day Selector */}
            {frequency === 'specific_days' && (
              <View style={styles.field}>
                <View style={styles.dayRow}>
                  {DAY_LABELS.map((label, i) => (
                    <TouchableOpacity
                      key={label}
                      style={[
                        styles.dayChip,
                        selectedDays.includes(DAY_VALUES[i]) &&
                          styles.dayChipActive,
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
                {errors.days && (
                  <Text style={styles.errorText}>{errors.days}</Text>
                )}
              </View>
            )}

            {/* Time Window */}
            <View style={styles.field}>
              <Text style={styles.label}>Time Window (optional)</Text>
              <View style={styles.timeRow}>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={timeWindowStart}
                  onChangeText={setTimeWindowStart}
                  placeholder="Start"
                  placeholderTextColor={c.textMuted}
                />
                <Text style={styles.timeSeparator}>to</Text>
                <TextInput
                  style={[styles.input, styles.timeInput]}
                  value={timeWindowEnd}
                  onChangeText={setTimeWindowEnd}
                  placeholder="End"
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

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saving && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.archiveButton}
                onPress={handleArchive}
                activeOpacity={0.7}
              >
                <Text style={styles.archiveButtonText}>Archive Habit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: c.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: c.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  scrollArea: {
    padding: componentSpacing.modalPadding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
  },
  closeButton: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    padding: spacing.xs,
  },
  field: {
    gap: spacing.xs,
    marginBottom: componentSpacing.modalElementGap,
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
    width: 40,
    height: 40,
    borderRadius: 8,
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
    fontSize: 20,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  saveButton: {
    backgroundColor: c.primary,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: '#FFFFFF',
  },
  archiveButton: {
    paddingVertical: componentSpacing.buttonPaddingVertical,
    paddingHorizontal: componentSpacing.buttonPaddingHorizontal,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.error,
  },
  archiveButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.error,
  },
});
