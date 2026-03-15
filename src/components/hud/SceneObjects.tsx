/**
 * SceneObjects -- Invisible Pressable tap zones overlaid on the pixel art scene.
 *
 * Three interactive objects in the game world:
 *   - Quest Board (left):   navigates to Quests tab
 *   - Prayer Mat (center):  navigates to Habits tab
 *   - Journal (right):      opens Muhasabah modal
 *
 * All tap zones meet 44x44px minimum touch target (ui-ux-pro-max touch-target-size rule).
 * Positions are approximate percentages -- adjust based on actual pixel art asset placement.
 *
 * Journal shows an animated glow ring when showJournalGlow is true (Muhasabah time).
 */
import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface SceneObjectsProps {
  onTapQuestBoard: () => void;
  onTapPrayerMat: () => void;
  onTapJournal: () => void;
  showJournalGlow?: boolean;
}

function JournalGlowRing({ visible }: { visible: boolean }) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(1.0, { duration: 750 }),
          withTiming(0.4, { duration: 750 }),
        ),
        -1,
        false,
      );
    } else {
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!visible) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.glowRing, animStyle]} />
  );
}

export function SceneObjects({
  onTapQuestBoard,
  onTapPrayerMat,
  onTapJournal,
  showJournalGlow = false,
}: SceneObjectsProps) {
  return (
    <>
      {/* Quest Board -- left side of scene */}
      <Pressable
        style={[styles.tapZone, styles.questBoard]}
        onPress={onTapQuestBoard}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Quest board. Navigate to quests."
      />

      {/* Prayer Mat -- center of scene */}
      <Pressable
        style={[styles.tapZone, styles.prayerMat]}
        onPress={onTapPrayerMat}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Prayer mat. Navigate to habits."
      />

      {/* Journal / Muhasabah -- right side of scene */}
      <View style={[styles.tapZone, styles.journal]}>
        <JournalGlowRing visible={showJournalGlow} />
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onTapJournal}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={
            showJournalGlow
              ? 'Journal. Muhasabah reflection available now.'
              : 'Journal. Open Muhasabah reflection.'
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tapZone: {
    position: 'absolute',
  },
  questBoard: {
    left: '8%',
    top: '28%',
    width: 64,
    height: 64,
  },
  prayerMat: {
    left: '45%',
    top: '50%',
    width: 55,
    height: 45,
  },
  journal: {
    right: '8%',
    top: '38%',
    width: 60,
    height: 60,
  },
  glowRing: {
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 80, 0.8)',
  },
});
