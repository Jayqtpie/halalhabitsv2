/**
 * AccountSection — settings section for account management.
 *
 * Guest state (not signed in):
 *   - Body: "Not signed in. Your progress lives on this device only."
 *   - Row: "Sign In" → navigates to /(auth)/sign-in
 *
 * Authenticated state:
 *   - Email display + SyncStatusIcon inline
 *   - "Sync Now" button (emerald-500)
 *   - "Sign Out" row (non-destructive, no confirmation)
 *   - "Delete Account" row (ruby-500 text) → opens DeleteAccountSheet
 *
 * Follows the same row pattern as the rest of the settings screen.
 */
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../tokens';
import { useAuthStore } from '../../stores/authStore';
import { signOut } from '../../services/auth-service';
import { flushQueue } from '../../services/sync-engine';
import { SyncStatusIcon } from '../sync/SyncStatusIcon';
import { DeleteAccountSheet } from './DeleteAccountSheet';

export function AccountSection() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const session = useAuthStore((s) => s.session);
  const email = session?.user?.email ?? '';

  const [deleteSheetVisible, setDeleteSheetVisible] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Session cleared via onAuthStateChange listener in root layout
  };

  const handleSyncNow = async () => {
    try {
      await flushQueue();
    } catch {
      // non-fatal
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>ACCOUNT</Text>

      <View style={styles.sectionCard}>
        {!isAuthenticated ? (
          // ── Guest state ────────────────────────────────────────────────
          <>
            <View style={styles.guestRow}>
              <Text style={styles.guestText}>
                Not signed in. Your progress lives on this device only.
              </Text>
            </View>
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={() => router.push('/(auth)/sign-in' as any)}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.rowLabel}>Sign In</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <Pressable
              style={styles.row}
              onPress={() => router.push('/(auth)/create-account' as any)}
              accessibilityRole="button"
              accessibilityLabel="Create Account"
            >
              <Text style={[styles.rowLabel, styles.primaryLabel]}>Create Account</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </>
        ) : (
          // ── Authenticated state ────────────────────────────────────────
          <>
            {/* Email + SyncStatusIcon row */}
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.emailText} numberOfLines={1}>
                {email}
              </Text>
              <SyncStatusIcon />
            </View>

            {/* Sync Now */}
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={handleSyncNow}
              accessibilityRole="button"
              accessibilityLabel="Sync Now"
            >
              <Text style={[styles.rowLabel, styles.primaryLabel]}>Sync Now</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Sign Out */}
            <Pressable
              style={[styles.row, styles.rowBorder]}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign Out"
            >
              <Text style={styles.rowLabel}>Sign Out</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>

            {/* Delete Account */}
            <Pressable
              style={styles.row}
              onPress={() => setDeleteSheetVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Delete Account"
            >
              <Text style={styles.destructiveLabel}>Delete Account</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </>
        )}
      </View>

      <DeleteAccountSheet
        visible={deleteSheetVisible}
        onDismiss={() => setDeleteSheetVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'PressStart2P-Regular',
    color: colors.dark.textMuted,
    letterSpacing: 1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.dark.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.dark.border,
  },
  guestRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  guestText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md, // listItemPaddingHorizontal
    paddingVertical: spacing.md,   // listItemPaddingVertical
    minHeight: 52,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  rowLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    flex: 1,
  },
  primaryLabel: {
    color: colors.dark.primary,
  },
  destructiveLabel: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.error,
    flex: 1,
  },
  emailText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    flex: 1,
    marginRight: spacing.sm,
  },
  chevron: {
    fontSize: 20,
    color: colors.dark.textMuted,
    lineHeight: 22,
  },
});
