/**
 * Onboarding Screen 4: Choose Your Path.
 *
 * 3 starter pack bundles (radio select). "Customize my own" opens PresetLibrary
 * in a modal. On continue, selected habits are created via habitStore.addHabit.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHabitStore } from '../../src/stores/habitStore';
import { STARTER_PACKS } from '../../src/domain/starter-packs';
import { getPresetByKey } from '../../src/domain/presets';
import { StarterPackSelector } from '../../src/components/onboarding/StarterPackSelector';
import { PresetLibrary } from '../../src/components/habits/PresetLibrary';
import { generateId } from '../../src/utils/uuid';
import { colors, typography, fontFamilies, spacing } from '../../src/tokens';
import type { NewHabit } from '../../src/types/database';

const c = colors.dark;
const ONBOARDING_USER_ID = 'default-user';

export default function HabitsScreen() {
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);

  const [selectedPackId, setSelectedPackId] = useState<string>(STARTER_PACKS[0].id);
  const [customMode, setCustomMode] = useState(false);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customAddedCount, setCustomAddedCount] = useState(0);

  const handleContinue = async () => {
    if (loading) return;

    // If using custom mode, habits are already added via PresetLibrary
    if (customMode) {
      router.push('/(onboarding)/tour' as never);
      return;
    }

    // Add habits from selected starter pack
    const pack = STARTER_PACKS.find((p) => p.id === selectedPackId);
    if (!pack) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      for (let i = 0; i < pack.habitKeys.length; i++) {
        const key = pack.habitKeys[i];
        const preset = getPresetByKey(key);
        if (!preset) continue;

        const newHabit: NewHabit = {
          id: generateId(),
          userId: ONBOARDING_USER_ID,
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
          sortOrder: i,
          createdAt: now,
          updatedAt: now,
        };
        await addHabit(newHabit);
      }
      router.push('/(onboarding)/tour' as never);
    } catch {
      // Error is stored in habitStore — continue anyway
      router.push('/(onboarding)/tour' as never);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCustom = () => {
    setCustomMode(true);
    setCustomModalVisible(true);
  };

  const handleCustomHabitAdded = () => {
    setCustomAddedCount((n) => n + 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.stepIndicator}>
          <Text style={styles.stepText}>{'4 / 5'}</Text>
        </View>
        <Text style={styles.heading}>{'Choose Your Path'}</Text>
        <Text style={styles.subheading}>
          {'Start with a curated bundle, or build your own.'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Starter Pack Cards */}
        {!customMode && (
          <>
            <Text style={styles.sectionLabel}>{'STARTER BUNDLES'}</Text>
            <StarterPackSelector
              packs={STARTER_PACKS}
              selectedId={selectedPackId}
              onSelect={setSelectedPackId}
            />
          </>
        )}

        {customMode && (
          <View style={styles.customActiveCard}>
            <Text style={styles.customActiveTitle}>{'Custom Selection'}</Text>
            <Text style={styles.customActiveDesc}>
              {customAddedCount > 0
                ? `${customAddedCount} habit${customAddedCount === 1 ? '' : 's'} added to your plan.`
                : 'No habits added yet. Tap below to open the library.'}
            </Text>
            <Pressable
              style={({ pressed }) => [styles.editButton, pressed ? styles.editButtonPressed : undefined]}
              onPress={() => setCustomModalVisible(true)}
            >
              <Text style={styles.editButtonText}>{'Open Habit Library'}</Text>
            </Pressable>
          </View>
        )}

        {/* Customize Link */}
        {!customMode && (
          <Pressable
            style={({ pressed }) => [styles.customizeLink, pressed ? styles.customizeLinkPressed : undefined]}
            onPress={handleOpenCustom}
            accessibilityLabel="Customize my own habit list"
            accessibilityRole="button"
          >
            <Text style={styles.customizeLinkIcon}>{'+'}</Text>
            <Text style={styles.customizeLinkText}>{'Customize my own'}</Text>
          </Pressable>
        )}

        {customMode && (
          <Pressable
            style={({ pressed }) => [styles.backToPresetsLink, pressed ? styles.customizeLinkPressed : undefined]}
            onPress={() => { setCustomMode(false); setCustomAddedCount(0); }}
            accessibilityLabel="Go back to starter bundles"
            accessibilityRole="button"
          >
            <Text style={styles.backToPresetsText}>{'← Back to starter bundles'}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.continueButton,
            loading ? styles.continueButtonLoading : undefined,
            pressed && !loading ? styles.continueButtonPressed : undefined,
          ]}
          onPress={handleContinue}
          disabled={loading}
          accessibilityLabel="Continue to tour"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.continueButtonText}>{'Continue'}</Text>
          )}
        </Pressable>
      </View>

      {/* Custom Habit Library Modal */}
      <Modal
        visible={customModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCustomModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{'Habit Library'}</Text>
            <Pressable
              style={({ pressed }) => [styles.modalClose, pressed ? styles.modalClosePressed : undefined]}
              onPress={() => setCustomModalVisible(false)}
              accessibilityLabel="Close habit library"
              accessibilityRole="button"
            >
              <Text style={styles.modalCloseText}>{'Done'}</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
          >
            <PresetLibrary onHabitAdded={handleCustomHabitAdded} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepIndicator: {
    backgroundColor: c.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.border,
  },
  stepText: {
    fontSize: 10,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 1,
  },
  heading: {
    fontSize: typography.headingLg.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
    textAlign: 'center',
    lineHeight: typography.headingLg.lineHeight,
  },
  subheading: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textSecondary,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 9,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    letterSpacing: 2,
  },
  customActiveCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: c.primary,
    padding: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  customActiveTitle: {
    fontSize: 12,
    fontFamily: fontFamilies.pixelFont,
    color: c.primary,
    letterSpacing: 0.5,
  },
  customActiveDesc: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: c.textSecondary,
    textAlign: 'center',
  },
  editButton: {
    marginTop: spacing.sm,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
  },
  editButtonPressed: {
    opacity: 0.75,
  },
  editButtonText: {
    fontSize: 13,
    fontFamily: fontFamilies.interSemiBold,
    color: c.primary,
  },
  customizeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  customizeLinkPressed: {
    opacity: 0.65,
  },
  customizeLinkIcon: {
    fontSize: 18,
    fontFamily: fontFamilies.interBold,
    color: c.primary,
    lineHeight: 22,
  },
  customizeLinkText: {
    fontSize: 15,
    fontFamily: fontFamilies.interSemiBold,
    color: c.primary,
  },
  backToPresetsLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  backToPresetsText: {
    fontSize: 13,
    fontFamily: fontFamilies.inter,
    color: c.textMuted,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    paddingTop: spacing.md,
  },
  continueButton: {
    backgroundColor: c.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonLoading: {
    backgroundColor: c.primaryPressed,
  },
  continueButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  continueButtonText: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.interBold,
    color: '#FFFFFF',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: c.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  modalTitle: {
    fontSize: typography.headingMd.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
  },
  modalClose: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalClosePressed: {
    opacity: 0.65,
  },
  modalCloseText: {
    fontSize: 15,
    fontFamily: fontFamilies.interSemiBold,
    color: c.primary,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: spacing.xl,
    paddingBottom: 48,
  },
});
