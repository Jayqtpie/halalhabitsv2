/**
 * Onboarding stack navigator.
 *
 * No back gesture — onboarding flows forward only.
 * gestureEnabled: false prevents swipe-back accidentally exiting mid-flow.
 */
import { Stack } from 'expo-router';
import { colors } from '../../src/tokens';

const c = colors.dark;

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: c.background },
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="character" />
      <Stack.Screen name="niyyah" />
      <Stack.Screen name="habits" />
      <Stack.Screen name="tour" />
    </Stack>
  );
}
