import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

function TabIcon({ icon, label, focused }: { icon: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <Text style={[styles.tabEmoji, focused && styles.tabEmojiActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#FF8C00',
        tabBarInactiveTintColor: '#4A5F8A',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="📊" label="Dashboard" focused={focused} /> }}
      />
      <Tabs.Screen
        name="users"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👥" label="Usuários" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="✅" label="Tarefas" focused={focused} /> }}
      />
      <Tabs.Screen
        name="videos"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🎬" label="Vídeos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🧩" label="Quizzes" focused={focused} /> }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💝" label="Campanhas" focused={focused} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0D1526',
    borderTopColor: 'rgba(255,255,255,0.07)',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 90 : 72,
    paddingBottom: Platform.OS === 'ios' ? 26 : 10,
    paddingTop: 8,
  },
  tabIcon: { alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 2 },
  tabEmoji: { fontSize: 18, opacity: 0.45 },
  tabEmojiActive: { opacity: 1 },
  tabLabel: { fontSize: 8, fontFamily: 'Nunito_600SemiBold', color: '#4A5F8A' },
  tabLabelActive: { color: '#FF8C00' },
});
