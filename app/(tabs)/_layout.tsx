/**
 * Tab navigator layout using custom pixel-accented tab bar.
 * 4 screens: Home, Habits, Quests, Profile.
 */
import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../src/components/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="habits" />
      <Tabs.Screen name="quests" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
