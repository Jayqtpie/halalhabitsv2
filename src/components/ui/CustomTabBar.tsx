/**
 * Custom pixel-accented tab bar with jewel-tone active states.
 *
 * Uses simple geometric shapes as placeholder icons (real pixel art icons are Phase 5).
 * Structure allows easy icon source swap later.
 * Uses design tokens exclusively for colors, spacing, typography.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, typography, spacing, componentSpacing } from '../../tokens';

/** Placeholder icon shapes - swap for pixel art icons in Phase 5 */
function TabIcon({ routeName, focused }: { routeName: string; focused: boolean }) {
  const color = focused ? colors.dark.primary : colors.dark.textMuted;
  const size = focused ? 24 : 20;

  // Simple geometric shapes as placeholder icons
  const shapeStyle = {
    width: size,
    height: size,
    borderColor: color,
    borderWidth: 2,
  };

  switch (routeName) {
    case 'index':
      // Home: diamond (rotated square)
      return (
        <View
          style={[shapeStyle, { transform: [{ rotate: '45deg' }], borderRadius: 2 }]}
        />
      );
    case 'habits':
      // Habits: circle
      return <View style={[shapeStyle, { borderRadius: size / 2 }]} />;
    case 'quests':
      // Quests: square
      return <View style={[shapeStyle, { borderRadius: 2 }]} />;
    case 'profile':
      // Profile: rounded square
      return <View style={[shapeStyle, { borderRadius: size / 4 }]} />;
    default:
      return <View style={[shapeStyle, { borderRadius: 2 }]} />;
  }
}

/** Maps route names to i18n translation keys */
const routeLabels: Record<string, string> = {
  index: 'tabs.home',
  habits: 'tabs.habits',
  quests: 'tabs.quests',
  profile: 'tabs.profile',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      <View style={styles.border} />
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const label = t(routeLabels[route.name] ?? route.name);

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <View style={styles.iconContainer}>
                <TabIcon routeName={route.name} focused={isFocused} />
                {isFocused && <View style={styles.activeGlow} />}
              </View>
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? colors.dark.primary : colors.dark.textMuted },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dark.surface,
    paddingTop: componentSpacing.tabBarPaddingVertical,
  },
  border: {
    height: 1,
    backgroundColor: colors.dark.border,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    marginBottom: spacing.xs,
  },
  activeGlow: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.dark.primary,
    opacity: 0.1,
  },
  label: {
    fontSize: typography.bodySm.fontSize,
    lineHeight: typography.bodySm.lineHeight,
    fontFamily: typography.bodySm.fontFamily,
    letterSpacing: typography.bodySm.letterSpacing,
  },
});
