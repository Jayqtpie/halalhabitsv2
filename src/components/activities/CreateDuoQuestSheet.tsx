/**
 * CreateDuoQuestSheet
 *
 * Modal sheet for creating a duo quest — choose from curated templates
 * or create a custom quest with profanity filtering.
 *
 * Per D-05: supports template-based AND custom creation.
 * Per D-06: client-side profanity filter via leo-profanity.
 * Per D-07: opened from buddy profile screen.
 * Per D-08: max 3 active quests per buddy pair (store enforces, UI shows alert).
 * Per project memory: no flex:1 in Modal children.
 */
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import filter from 'leo-profanity';
import { useDuoQuestStore } from '../../stores/duoQuestStore';
import { DUO_QUEST_TEMPLATES, type DuoQuestTemplate } from '../../domain/duo-quest-templates';
import { colors, palette } from '../../tokens/colors';
import { typography } from '../../tokens/typography';
import { componentSpacing, spacing } from '../../tokens/spacing';

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateDuoQuestSheetProps {
  visible: boolean;
  onClose: () => void;
  buddyPairId: string;
  buddyName: string;
  userId: string;
}

// ─── Duration options ─────────────────────────────────────────────────────────

const DURATION_OPTIONS = [3, 5, 7, 14] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateDuoQuestSheet({
  visible,
  onClose,
  buddyPairId,
  buddyName,
  userId,
}: CreateDuoQuestSheetProps) {
  const insets = useSafeAreaInsets();
  const { createFromTemplate, createCustom } = useDuoQuestStore();

  const [tab, setTab] = useState<'templates' | 'custom'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<DuoQuestTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom form state
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [customDuration, setCustomDuration] = useState<number>(7);

  const resetForm = () => {
    setSelectedTemplate(null);
    setCustomTitle('');
    setCustomDescription('');
    setCustomTarget('');
    setCustomDuration(7);
    setTab('templates');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ── Template creation ───────────────────────────────────────────────────

  const handleStartTemplate = async () => {
    if (!selectedTemplate || loading) return;
    setLoading(true);
    try {
      const result = await createFromTemplate({ buddyPairId, userId, template: selectedTemplate });
      if (result === 'max_reached') {
        Alert.alert('Quest Limit', 'Maximum 3 active quests with this buddy.');
      } else {
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Custom creation with profanity filter (D-06) ────────────────────────

  const handleCreateCustom = async () => {
    if (loading) return;
    const titleTrimmed = customTitle.trim();
    const descTrimmed = customDescription.trim();
    const targetNum = parseInt(customTarget, 10);

    if (!titleTrimmed || !targetNum || targetNum < 1) return;

    // Per D-06: client-side profanity filter
    if (filter.clean(titleTrimmed) !== titleTrimmed || filter.clean(descTrimmed) !== descTrimmed) {
      Alert.alert('Language Filter', 'Please use appropriate language for quest title and description.');
      return;
    }

    const xpRewardEach = Math.min(150, Math.max(50, targetNum * 15));

    setLoading(true);
    try {
      const result = await createCustom({
        buddyPairId,
        userId,
        title: titleTrimmed,
        description: descTrimmed || `Complete ${targetNum} times in ${customDuration} days`,
        targetValue: targetNum,
        durationDays: customDuration,
        xpRewardEach,
      });
      if (result === 'max_reached') {
        Alert.alert('Quest Limit', 'Maximum 3 active quests with this buddy.');
      } else {
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const customValid = customTitle.trim().length > 0 && parseInt(customTarget, 10) > 0;

  // ── Template card renderer ──────────────────────────────────────────────

  const renderTemplate = ({ item }: { item: DuoQuestTemplate }) => {
    const isSelected = selectedTemplate?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.templateCard, isSelected && styles.templateCardSelected]}
        onPress={() => setSelectedTemplate(item)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.description}`}
        accessibilityState={{ selected: isSelected }}
      >
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.templateMeta}>
          <Text style={styles.templateMetaText}>{item.durationDays} days</Text>
          <Text style={styles.templateXp}>{item.xpRewardEach} XP + {item.xpRewardBonus} bonus</Text>
        </View>
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
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Sheet — no flex:1 per project memory constraint */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <Text style={styles.sheetTitle}>Start Duo Quest</Text>
        <Text style={styles.sheetSubtitle}>with {buddyName}</Text>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'templates' && styles.tabBtnActive]}
            onPress={() => setTab('templates')}
          >
            <Text style={[styles.tabText, tab === 'templates' && styles.tabTextActive]}>
              Templates
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, tab === 'custom' && styles.tabBtnActive]}
            onPress={() => setTab('custom')}
          >
            <Text style={[styles.tabText, tab === 'custom' && styles.tabTextActive]}>
              Custom
            </Text>
          </TouchableOpacity>
        </View>

        {/* Templates tab */}
        {tab === 'templates' && (
          <>
            <FlatList
              data={DUO_QUEST_TEMPLATES}
              keyExtractor={(t) => t.id}
              renderItem={renderTemplate}
              contentContainerStyle={styles.templateList}
              showsVerticalScrollIndicator={false}
              style={styles.listContainer}
            />
            <TouchableOpacity
              style={[styles.startBtn, !selectedTemplate && styles.startBtnDisabled]}
              onPress={() => void handleStartTemplate()}
              disabled={!selectedTemplate || loading}
              activeOpacity={0.85}
            >
              <Text style={[styles.startBtnText, !selectedTemplate && styles.startBtnTextDisabled]}>
                {loading ? 'Starting...' : 'Start Quest'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Custom tab */}
        {tab === 'custom' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.customForm}
            style={styles.listContainer}
          >
            <Text style={styles.fieldLabel}>Quest Title</Text>
            <TextInput
              style={styles.textInput}
              value={customTitle}
              onChangeText={(t) => setCustomTitle(t.slice(0, 50))}
              placeholder="e.g. Walk 10k steps"
              placeholderTextColor={colors.dark.textMuted}
              maxLength={50}
            />

            <Text style={styles.fieldLabel}>Description (optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={customDescription}
              onChangeText={(t) => setCustomDescription(t.slice(0, 200))}
              placeholder="What does this quest involve?"
              placeholderTextColor={colors.dark.textMuted}
              maxLength={200}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.fieldLabel}>How many times?</Text>
            <TextInput
              style={styles.textInput}
              value={customTarget}
              onChangeText={(t) => setCustomTarget(t.replace(/[^0-9]/g, '').slice(0, 3))}
              placeholder="e.g. 5"
              placeholderTextColor={colors.dark.textMuted}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.fieldLabel}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, customDuration === d && styles.durationChipActive]}
                  onPress={() => setCustomDuration(d)}
                >
                  <Text style={[styles.durationText, customDuration === d && styles.durationTextActive]}>
                    {d} days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* XP preview */}
            {customValid && (
              <Text style={styles.xpPreview}>
                XP reward: {Math.min(150, Math.max(50, parseInt(customTarget, 10) * 15))} each
              </Text>
            )}

            <TouchableOpacity
              style={[styles.startBtn, !customValid && styles.startBtnDisabled]}
              onPress={() => void handleCreateCustom()}
              disabled={!customValid || loading}
              activeOpacity={0.85}
            >
              <Text style={[styles.startBtnText, !customValid && styles.startBtnTextDisabled]}>
                {loading ? 'Creating...' : 'Create Quest'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.sm,
    paddingHorizontal: componentSpacing.modalPadding,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.headingMd,
    color: colors.dark.textPrimary,
    textAlign: 'center',
  },
  sheetSubtitle: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: colors.dark.primary,
  },
  tabText: {
    ...typography.bodyMd,
    color: colors.dark.textMuted,
  },
  tabTextActive: {
    color: colors.dark.primary,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },

  // Template list
  listContainer: {
    maxHeight: 360,
  },
  templateList: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  templateCard: {
    backgroundColor: colors.dark.background,
    borderRadius: 12,
    padding: componentSpacing.cardPadding,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    gap: spacing.xs,
  },
  templateCardSelected: {
    borderColor: colors.dark.primary,
  },
  templateTitle: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textPrimary,
  },
  templateDesc: {
    ...typography.bodySm,
    color: colors.dark.textSecondary,
    lineHeight: 20,
  },
  templateMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  templateMetaText: {
    ...typography.caption,
    color: colors.dark.textMuted,
  },
  templateXp: {
    ...typography.caption,
    color: colors.dark.xp,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },

  // Start button
  startBtn: {
    backgroundColor: colors.dark.primary,
    borderRadius: 12,
    paddingVertical: componentSpacing.buttonPaddingVertical,
    alignItems: 'center',
    marginTop: spacing.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  startBtnDisabled: {
    backgroundColor: colors.dark.border,
  },
  startBtnText: {
    ...typography.bodyMd,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  startBtnTextDisabled: {
    color: colors.dark.textMuted,
  },

  // Custom form
  customForm: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  fieldLabel: {
    ...typography.bodySm,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    color: colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  textInput: {
    backgroundColor: colors.dark.background,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...typography.bodyMd,
    color: colors.dark.textPrimary,
    borderWidth: 1,
    borderColor: colors.dark.border,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  durationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.background,
  },
  durationChipActive: {
    borderColor: colors.dark.primary,
    backgroundColor: `${palette['emerald-500']}20`,
  },
  durationText: {
    ...typography.bodySm,
    color: colors.dark.textMuted,
  },
  durationTextActive: {
    color: colors.dark.primary,
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
  },
  xpPreview: {
    ...typography.bodySm,
    color: colors.dark.xp,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
