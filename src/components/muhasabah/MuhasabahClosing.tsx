/**
 * MuhasabahClosing — Ayah/Hadith closing + XP reward
 *
 * Shows curated Quranic ayah or hadith, "+12 XP" reward confirmation,
 * and a warm closing message. Single "Done" button calls close().
 * Content rotates by today's date.
 *
 * Adab: Warm, not obligatory. "Good night" framing, not shame-based.
 * MUHA-01: Closing screen with ayah + XP confirms completion.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { getClosingContent, CLOSING_CONTENT } from '../../domain/muhasabah-engine';
import { colors } from '../../tokens/colors';
import { fontFamilies } from '../../tokens/typography';

const c = colors.dark;

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahClosing() {
  const { close, closingContentIndex } = useMuhasabahStore((s) => ({
    close: s.close,
    closingContentIndex: s.closingContentIndex,
  }));

  // Rotate content by today's date + the closingContentIndex counter
  const dateIndex = new Date().getDate() % CLOSING_CONTENT.length;
  const contentIndex = (dateIndex + closingContentIndex) % CLOSING_CONTENT.length;
  const content = getClosingContent(contentIndex);

  const sourceLabel = content.type === 'ayah' ? 'Quran' : 'Hadith';

  return (
    <View style={styles.container}>
      {/* XP reward badge */}
      <View style={styles.xpBadge} accessibilityLabel="12 XP earned">
        <Text style={styles.xpText}>+12 XP</Text>
      </View>

      {/* Arabic text — RTL, large */}
      <Text
        style={styles.arabicText}
        accessibilityLanguage="ar"
        accessibilityLabel={`Arabic: ${content.arabic}`}
      >
        {content.arabic}
      </Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Translation */}
      <Text style={styles.translation}>{content.translation}</Text>

      {/* Source */}
      <Text style={styles.source}>
        — {sourceLabel}: {content.source}
      </Text>

      {/* Closing message — wise mentor, warm, no obligation */}
      <Text style={styles.closingMessage}>Alhamdulillah. Good night.</Text>

      {/* Done button */}
      <Pressable
        style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Done, close Muhasabah"
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 8,
  },
  xpBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.12)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: c.xp,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 36,
  },
  xpText: {
    fontFamily: fontFamilies.pixelFont,
    fontSize: 14,
    lineHeight: 20,
    color: c.xp,
    letterSpacing: 1,
  },
  arabicText: {
    fontFamily: 'System', // Built-in system Arabic font — no custom Arabic pixel font for v1
    fontSize: 22,
    lineHeight: 38,
    color: c.textPrimary,
    textAlign: 'right',
    writingDirection: 'rtl',
    width: '100%',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  divider: {
    width: 48,
    height: 1,
    backgroundColor: c.border,
    marginBottom: 20,
  },
  translation: {
    fontFamily: fontFamilies.inter,
    fontSize: 16,
    lineHeight: 26,
    color: c.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  source: {
    fontFamily: fontFamilies.inter,
    fontSize: 12,
    lineHeight: 18,
    color: c.textMuted,
    textAlign: 'center',
    letterSpacing: 0.3,
    marginBottom: 40,
  },
  closingMessage: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 15,
    lineHeight: 24,
    color: c.textSecondary,
    textAlign: 'center',
    marginBottom: 36,
  },
  doneButton: {
    width: '100%',
    height: 56,
    backgroundColor: c.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneButtonPressed: {
    backgroundColor: c.primaryPressed,
  },
  doneButtonText: {
    fontFamily: fontFamilies.interSemiBold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
