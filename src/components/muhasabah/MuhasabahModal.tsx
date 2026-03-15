/**
 * MuhasabahModal — Root-level overlay container
 *
 * Reads muhasabahStore.isOpen and currentStep to render the correct step.
 * Mounts as an absoluteFillObject overlay (same pattern as LevelUpOverlay).
 * Fades in on open (0 → 1, 300ms). Returns null when closed.
 *
 * Mount this inside GestureHandlerRootView but OUTSIDE the Stack navigator
 * in app/_layout.tsx so it overlays all screens.
 *
 * MUHA-01, MUHA-04: Container only — adab rails enforced in each step.
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useMuhasabahStore } from '../../stores/muhasabahStore';
import { MuhasabahStep1 } from './MuhasabahStep1';
import { MuhasabahStep2 } from './MuhasabahStep2';
import { MuhasabahStep3 } from './MuhasabahStep3';
import { MuhasabahClosing } from './MuhasabahClosing';

// ─── Component ─────────────────────────────────────────────────────────────

export function MuhasabahModal() {
  const { isOpen, currentStep } = useMuhasabahStore(
    useShallow((s) => ({ isOpen: s.isOpen, currentStep: s.currentStep })),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on open
  useEffect(() => {
    if (isOpen) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, fadeAnim]);

  if (!isOpen) return null;

  return (
    <Animated.View
      style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: fadeAnim }]}
      accessibilityViewIsModal
      accessibilityLabel="Muhasabah evening reflection"
    >
      <View style={styles.container}>
        {currentStep === 0 && <MuhasabahStep1 />}
        {currentStep === 1 && <MuhasabahStep2 />}
        {currentStep === 2 && <MuhasabahStep3 />}
        {currentStep === 'closing' && <MuhasabahClosing />}
      </View>
    </Animated.View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    // Deep dark overlay — rgba(10, 8, 28, 0.95) per plan spec
    backgroundColor: 'rgba(10, 8, 28, 0.95)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    paddingHorizontal: 24,
    // Max width for large screens — stays mobile-first
    maxWidth: 480,
    alignSelf: 'center',
  },
});
