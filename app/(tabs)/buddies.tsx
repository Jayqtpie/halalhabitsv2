/**
 * Buddy List Tab Screen
 *
 * Primary screen for the Buddy Connection System.
 * Displays pending requests, accepted buddies, and empty state.
 * Hosts modals for invite code generation, code entry, and discoverability.
 *
 * Per CLAUDE.md memory: No flex:1 on modal children.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBuddyStore } from '../../src/stores/buddyStore';
import { useAuthStore } from '../../src/stores/authStore';
import { colors, typography, spacing, componentSpacing } from '../../src/tokens';

// Components imported below as they are built in Tasks 2a and 2b
// (stub placeholder — expanded in next tasks)

export default function BuddiesScreen() {
  const insets = useSafeAreaInsets();
  const userId = useAuthStore((s) => s.userId);
  const { accepted, pendingIncoming, loading, loadBuddies } = useBuddyStore();

  useEffect(() => {
    loadBuddies(userId);
  }, [userId]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.heading}>Buddies</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
    paddingHorizontal: spacing.lg,
  },
  heading: {
    ...typography.headingXl,
    color: colors.dark.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
});
