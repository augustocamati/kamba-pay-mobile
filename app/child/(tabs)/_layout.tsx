import React from 'react';
import { Tabs } from 'expo-router';

// Tab bar completamente oculto — a navegação é feita pelos tiles do dashboard
export default function ChildTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    />
  );
}
