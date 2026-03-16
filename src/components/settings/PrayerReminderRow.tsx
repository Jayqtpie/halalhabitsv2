/**
 * PrayerReminderRow -- Per-prayer notification configuration row.
 *
 * Shows: prayer name, enabled toggle, lead time picker, gentle follow-up toggle.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { colors, typography, spacing } from '../../tokens';
import type { PrayerName } from '../../types/habits';
import type { PrayerReminderConfig } from '../../stores/settingsStore';

const LEAD_MINUTES_OPTIONS = [5, 10, 15, 30];

const PRAYER_DISPLAY_NAMES: Record<PrayerName, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

interface PrayerReminderRowProps {
  prayer: PrayerName;
  config: PrayerReminderConfig;
  onChange: (updates: Partial<PrayerReminderConfig>) => void;
}

export function PrayerReminderRow({ prayer, config, onChange }: PrayerReminderRowProps) {
  const [showLeadPicker, setShowLeadPicker] = useState(false);

  const prayerName = PRAYER_DISPLAY_NAMES[prayer];

  return (
    <View style={styles.container}>
      {/* Prayer header row: name + main toggle */}
      <View style={styles.headerRow}>
        <Text style={styles.prayerName}>{prayerName}</Text>
        <Switch
          value={config.enabled}
          onValueChange={(val) => onChange({ enabled: val })}
          trackColor={{ false: colors.dark.border, true: colors.dark.primary }}
          thumbColor={config.enabled ? '#FFFFFF' : colors.dark.textMuted}
          accessibilityLabel={`${prayerName} reminder`}
          accessibilityRole="switch"
        />
      </View>

      {/* Sub-settings: only show when enabled */}
      {config.enabled && (
        <View style={styles.subSettings}>
          {/* Lead time row */}
          <View style={styles.subRow}>
            <Text style={styles.subLabel}>Remind me</Text>
            <Pressable
              style={styles.leadPicker}
              onPress={() => setShowLeadPicker(true)}
              accessibilityRole="button"
              accessibilityLabel={`Lead time: ${config.leadMinutes} minutes before`}
            >
              <Text style={styles.leadPickerText}>{config.leadMinutes} min before</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </View>

          {/* Follow-up toggle */}
          <View style={styles.subRow}>
            <View style={styles.followUpTextCol}>
              <Text style={styles.subLabel}>Gentle follow-up</Text>
              <Text style={styles.followUpHint}>30 min after prayer time</Text>
            </View>
            <Switch
              value={config.followUpEnabled}
              onValueChange={(val) => onChange({ followUpEnabled: val })}
              trackColor={{ false: colors.dark.border, true: colors.dark.primary }}
              thumbColor={config.followUpEnabled ? '#FFFFFF' : colors.dark.textMuted}
              accessibilityLabel={`${prayerName} follow-up reminder`}
              accessibilityRole="switch"
            />
          </View>
        </View>
      )}

      {/* Lead time picker modal */}
      <Modal
        visible={showLeadPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeadPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLeadPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remind me before {prayerName}</Text>
            {LEAD_MINUTES_OPTIONS.map((minutes) => (
              <Pressable
                key={minutes}
                style={[
                  styles.modalOption,
                  config.leadMinutes === minutes && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onChange({ leadMinutes: minutes });
                  setShowLeadPicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${minutes} minutes before`}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    config.leadMinutes === minutes && styles.modalOptionTextSelected,
                  ]}
                >
                  {minutes} minutes before
                </Text>
                {config.leadMinutes === minutes && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  subSettings: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    gap: spacing.sm,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subLabel: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
  followUpTextCol: {
    flex: 1,
  },
  followUpHint: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: colors.dark.textMuted,
    marginTop: 2,
  },
  leadPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  leadPickerText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.primary,
  },
  chevron: {
    fontSize: 16,
    color: colors.dark.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  modalTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: typography.headingMd.fontFamily,
    color: colors.dark.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: `${colors.dark.primary}22`,
  },
  modalOptionText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  modalOptionTextSelected: {
    color: colors.dark.primary,
  },
  checkmark: {
    fontSize: 16,
    color: colors.dark.primary,
  },
});
