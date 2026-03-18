/**
 * Sign-In screen — full-screen auth form.
 *
 * Calls signIn(email, password) from auth-service.
 * On success: router.replace('/(tabs)').
 * On error: shows adab-safe error copy below the form.
 *
 * Guest escape hatch: "Continue Without Account" link at bottom.
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  TextInput as TextInputType,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '../../src/tokens';
import { signIn } from '../../src/services/auth-service';

// ── Error message mapping ────────────────────────────────────────────────────

function mapAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes('invalid') ||
    lower.includes('wrong') ||
    lower.includes('credentials') ||
    lower.includes('password') ||
    lower.includes('not found') ||
    lower.includes('no user')
  ) {
    return 'Incorrect email or password. Please try again.';
  }
  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('connection') ||
    lower.includes('offline')
  ) {
    return 'No connection. Check your internet and try again.';
  }
  return 'Incorrect email or password. Please try again.';
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef<TextInputType>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Incorrect email or password. Please try again.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: authError } = await signIn(email.trim(), password);

    setLoading(false);
    if (authError) {
      setError(mapAuthError(authError));
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Card */}
          <View style={styles.card}>
            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>

            {/* Email field */}
            <View style={styles.fieldWrapper}>
              <TextInput
                style={[
                  styles.input,
                  emailFocused && styles.inputFocused,
                  error ? styles.inputError : null,
                ]}
                value={email}
                onChangeText={(v) => { setEmail(v); setError(null); }}
                placeholder="Email"
                placeholderTextColor={colors.dark.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                accessibilityLabel="Email address"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Password field */}
            <View style={styles.fieldWrapper}>
              <View style={[
                styles.passwordRow,
                passwordFocused && styles.inputFocused,
                error ? styles.inputError : null,
              ]}>
                <TextInput
                  ref={passwordRef}
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setError(null); }}
                  placeholder="Password"
                  placeholderTextColor={colors.dark.textMuted}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  accessibilityLabel="Password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onSubmitEditing={handleSignIn}
                />
                <Pressable
                  style={styles.showHideButton}
                  onPress={() => setShowPassword((v) => !v)}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                  hitSlop={8}
                >
                  <Text style={styles.showHideText}>{showPassword ? '🙈' : '👁️'}</Text>
                </Pressable>
              </View>
            </View>

            {/* Error message */}
            {error ? (
              <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
            ) : null}

            {/* Primary CTA */}
            <Pressable
              style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
              onPress={handleSignIn}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </Pressable>

            {/* Create account link */}
            <Pressable
              onPress={() => router.push('/(auth)/create-account' as any)}
              accessibilityRole="link"
              accessibilityLabel="Don't have an account? Create one"
            >
              <Text style={styles.secondaryLink}>
                Don't have an account?{' '}
                <Text style={styles.secondaryLinkAccent}>Create one</Text>
              </Text>
            </Pressable>
          </View>

          {/* Guest escape hatch */}
          <Pressable
            style={styles.guestButton}
            onPress={() => router.replace('/(tabs)' as any)}
            accessibilityRole="button"
            accessibilityLabel="Continue Without Account"
          >
            <Text style={styles.guestText}>Continue Without Account</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: 16, // cardPadding
    gap: 16, // modalElementGap
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: 'PressStart2P-Regular',
    fontWeight: '700',
    color: colors.dark.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  fieldWrapper: {
    // wrapper for spacing consistency
  },
  input: {
    backgroundColor: colors.dark.background,
    borderWidth: 2,
    borderColor: colors.dark.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
    minHeight: 44,
  },
  inputFocused: {
    borderColor: colors.dark.borderFocus,
  },
  inputError: {
    borderColor: colors.dark.error,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.background,
    borderWidth: 2,
    borderColor: colors.dark.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: typography.bodyMd.fontFamily,
    color: colors.dark.textPrimary,
  },
  showHideButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showHideText: {
    fontSize: 18,
  },
  errorText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.error,
  },
  primaryButton: {
    backgroundColor: colors.dark.primary,
    borderRadius: 8,
    paddingVertical: 16, // buttonPaddingVertical
    paddingHorizontal: 24, // buttonPaddingHorizontal
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: typography.bodyMd.fontSize,
    lineHeight: typography.bodyMd.lineHeight,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  secondaryLink: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
    textAlign: 'center',
  },
  secondaryLinkAccent: {
    color: colors.dark.primary,
    fontFamily: 'Inter-SemiBold',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  guestText: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    color: colors.dark.textSecondary,
  },
});
