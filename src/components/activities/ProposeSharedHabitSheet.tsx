/**
 * ProposeSharedHabitSheet
 *
 * Modal sheet for proposing a shared habit to a buddy.
 * Opened from the buddy profile screen per D-01.
 *
 * Privacy Gate (D-02): Only eligible habit types shown — salah and muhasabah
 * are excluded via isEligibleForSharing from shared-habit-engine.
 *
 * Per project memory: do NOT add flex:1 to Modal children.
 * Per CLAUDE.md: No shame copy, reverent copy, privacy-first.
 */
import React, { useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSharedHabitStore } from '../../stores/sharedHabitStore';
import { useAuthStore } from '../../stores/authStore';
import { colors, palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';

// ─── Eligible Habit Types ─────────────────────────────────────────────────────

/**
 * Eligible habit types for sharing.
 * Salah and muhasabah are intentionally excluded per the Privacy Gate (D-02).
 * isEligibleForSharing from shared-habit-engine enforces this at store level too.
 */
const ELIGIBLE_HABIT_TYPES: Array<{ type: string; label: string }> = [
  { type: 'custom', label: 'Custom Habit' },
  { type: 'focus', label: 'Focus' },
  { type: 'kindness', label: 'Kindness' },
  { type: 'patience', label: 'Patience' },
  { type: 'gratitude', label: 'Gratitude' },
  { type: 'exercise', label: 'Exercise' },
  { type: 'reading', label: 'Reading' },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProposeSharedHabitSheetProps {
  visible: boolean;
  onClose: () => void;
  buddyPairId: string;
  buddyName: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProposeSharedHabitSheet({
  visible,
  onClose,
  buddyPairId,
  buddyName,
}: ProposeSharedHabitSheetProps) {
  const userId = useAuthStore((s) => s.userId);
  const proposeSharedHabit = useSharedHabitStore((s) => s.proposeSharedHabit);

  const [selectedType, setSelectedType] = useState<string>('custom');
  const [habitName, setHabitName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canPropose = habitName.trim().length > 0 && !submitting;

  const handlePropose = async () => {
    if (!canPropose) return;
    setSubmitting(true);
    try {
      const result = await proposeSharedHabit({
        buddyPairId,
        userId,
        habitType: selectedType,
        name: habitName.trim(),
        targetFrequency: 'daily',
      });
      if (result === 'success') {
        // Reset form and close
        setHabitName('');
        setSelectedType('custom');
        onClose();
      }
      // If 'ineligible_type' — should not happen since UI filters, but no crash
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setHabitName('');
    setSelectedType('custom');
    onClose();
  };

  const renderTypeOption = ({ item }: { item: { type: string; label: string } }) => {
    const isSelected = item.type === selectedType;
    return (
      <TouchableOpacity
        style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
        onPress={() => setSelectedType(item.type)}
        activeOpacity={0.7}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={item.label}
      >
        <Text style={[styles.typeOptionText, isSelected && styles.typeOptionTextSelected]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* Backdrop tap to close */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Sheet content — no flex:1 per project memory */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoider}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Title */}
          <Text style={styles.title}>Propose Shared Habit</Text>
          <Text style={styles.subtitle}>with {buddyName}</Text>

          {/* Habit type picker */}
          <Text style={styles.sectionLabel}>Type</Text>
          <FlatList
            data={ELIGIBLE_HABIT_TYPES}
            keyExtractor={(item) => item.type}
            renderItem={renderTypeOption}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeList}
            style={styles.typeListContainer}
          />

          {/* Habit name input */}
          <Text style={styles.sectionLabel}>Name</Text>
          <TextInput
            style={styles.nameInput}
            placeholder='e.g. "Read 10 pages daily"'
            placeholderTextColor={colors.dark.textMuted}
            value={habitName}
            onChangeText={setHabitName}
            autoCorrect={false}
            returnKeyType="done"
            maxLength={80}
            accessibilityLabel="Habit name"
          />

          {/* Frequency (daily only for v1) */}
          <View style={styles.frequencyRow}>
            <Text style={styles.sectionLabel}>Frequency</Text>
            <View style={styles.frequencyBadge}>
              <Text style={styles.frequencyText}>Daily</Text>
            </View>
          </View>

          {/* Propose button */}
          <TouchableOpacity
            style={[styles.proposeButton, !canPropose && styles.proposeButtonDisabled]}
            onPress={handlePropose}
            activeOpacity={0.8}
            disabled={!canPropose}
            accessibilityRole="button"
            accessibilityLabel="Propose shared habit"
            accessibilityState={{ disabled: !canPropose }}
          >
            <Text style={[styles.proposeButtonText, !canPropose && styles.proposeButtonTextDisabled]}>
              {submitting ? 'Proposing...' : 'Propose'}
            </Text>
          </TouchableOpacity>

          {/* Bottom safe area padding */}
          <View style={{ height: spacing.lg }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  keyboardAvoider: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: componentSpacing.modalPadding,
    paddingTop: spacing.md,
    // No flex:1 per project memory — sheet sizes to content
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.bodySm,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeListContainer: {
    marginBottom: spacing.lg,
  },
  typeList: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  typeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.background,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionSelected: {
    borderColor: palette['emerald-500'],
    backgroundColor: palette['emerald-900'],
  },
  typeOptionText: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  typeOptionTextSelected: {
    color: palette['emerald-400'],
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: colors.dark.background,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    minHeight: 48,
    marginBottom: spacing.lg,
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  frequencyBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.dark.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  frequencyText: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
  },
  proposeButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 12,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  proposeButtonDisabled: {
    opacity: 0.45,
  },
  proposeButtonText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-Bold',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proposeButtonTextDisabled: {
    color: 'rgba(255,255,255,0.6)',
  },
});
