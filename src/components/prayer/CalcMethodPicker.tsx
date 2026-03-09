/**
 * CalcMethodPicker -- modal selector for prayer time calculation method.
 *
 * Displays all 6 supported methods with descriptions.
 * Current selection highlighted with emerald accent.
 */
import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSettingsStore } from '../../stores/settingsStore';
import { CALC_METHODS, type CalcMethodKey } from '../../types/habits';
import {
  colors,
  typography,
  fontFamilies,
  spacing,
  componentSpacing,
  radius,
} from '../../tokens';

const c = colors.dark;

interface CalcMethodPickerProps {
  visible: boolean;
  onClose: () => void;
}

export function CalcMethodPicker({ visible, onClose }: CalcMethodPickerProps) {
  const currentMethod = useSettingsStore((s) => s.prayerCalcMethod);
  const setPrayerCalcMethod = useSettingsStore((s) => s.setPrayerCalcMethod);

  const handleSelect = useCallback(
    (method: CalcMethodKey) => {
      setPrayerCalcMethod(method);
      onClose();
    },
    [setPrayerCalcMethod, onClose],
  );

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
              <Text style={styles.headerTitle}>Prayer Calculation</Text>
              <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.description}>
              Choose the calculation method used by your local mosque or region.
            </Text>

            {/* Method List */}
            {CALC_METHODS.map((method) => {
              const isSelected = currentMethod === method.key;
              return (
                <TouchableOpacity
                  key={method.key}
                  style={[
                    styles.methodItem,
                    isSelected && styles.methodItemSelected,
                  ]}
                  onPress={() => handleSelect(method.key)}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${method.displayName} - ${method.description}`}
                >
                  <View style={styles.methodContent}>
                    <Text
                      style={[
                        styles.methodName,
                        isSelected && styles.methodNameSelected,
                      ]}
                    >
                      {method.displayName}
                    </Text>
                    <Text style={styles.methodDescription}>
                      {method.description}
                    </Text>
                  </View>

                  {/* Selection indicator */}
                  <View
                    style={[
                      styles.radio,
                      isSelected && styles.radioSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
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
    maxHeight: '75%',
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
    marginBottom: spacing.sm,
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
  description: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: c.textSecondary,
    marginBottom: spacing.lg,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: componentSpacing.listItemPaddingVertical,
    paddingHorizontal: componentSpacing.listItemPaddingHorizontal,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    marginBottom: spacing.sm,
  },
  methodItemSelected: {
    borderColor: c.primary,
    backgroundColor: 'rgba(13, 124, 61, 0.1)',
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textPrimary,
  },
  methodNameSelected: {
    color: c.primary,
  },
  methodDescription: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: c.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  radioSelected: {
    borderColor: c.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: c.primary,
  },
});
