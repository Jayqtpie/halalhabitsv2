/**
 * Add Habit screen -- browse presets or create custom habits.
 *
 * Pushed from the habits tab "+" button. Contains PresetLibrary
 * for quick preset selection and a toggle to show the custom
 * habit creation form.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { PresetLibrary } from '../src/components/habits/PresetLibrary';
import { CustomHabitForm } from '../src/components/habits/CustomHabitForm';
import { colors, typography, fontFamilies, spacing } from '../src/tokens';

const c = colors.dark;

export default function AddHabitScreen() {
  const router = useRouter();
  const [showCustomForm, setShowCustomForm] = useState(false);

  const handleHabitAdded = useCallback(() => {
    // User can keep adding presets; no auto-navigate
  }, []);

  const handleCustomCreated = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Add Habit',
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.textPrimary,
          headerTitleStyle: {
            fontFamily: fontFamilies.pixelFont,
            fontSize: 14,
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              !showCustomForm && styles.modeButtonActive,
            ]}
            onPress={() => setShowCustomForm(false)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeButtonText,
                !showCustomForm && styles.modeButtonTextActive,
              ]}
            >
              Presets
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeButton,
              showCustomForm && styles.modeButtonActive,
            ]}
            onPress={() => setShowCustomForm(true)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeButtonText,
                showCustomForm && styles.modeButtonTextActive,
              ]}
            >
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {showCustomForm ? (
          <CustomHabitForm onCreated={handleCustomCreated} />
        ) : (
          <>
            <Text style={styles.sectionHint}>
              Tap "Add" to add a habit to your daily list.
            </Text>
            <PresetLibrary onHabitAdded={handleHabitAdded} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: c.surface,
    borderRadius: 10,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: c.primary,
  },
  modeButtonText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textMuted,
  },
  modeButtonTextActive: {
    color: '#FFFFFF',
  },
  sectionHint: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: c.textSecondary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
});
