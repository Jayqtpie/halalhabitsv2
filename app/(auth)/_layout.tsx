/**
 * Auth route group layout.
 * Simple Stack with no header — full-screen auth screens.
 */
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
