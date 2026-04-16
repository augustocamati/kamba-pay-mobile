import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, Users, CheckSquare, Clapperboard, Puzzle, HeartHandshake } from 'lucide-react-native';

function TabIcon({ IconComponent, label, focused }: { IconComponent: any; label: string; focused: boolean }) {
  return (
    <View style={styles.tabIcon}>
      <IconComponent size={20} color={focused ? '#FF8C00' : 'rgba(255,255,255,0.45)'} strokeWidth={focused ? 2.5 : 2} />
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
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={LayoutDashboard} label="Dashboard" focused={focused} /> }}
      />
      <Tabs.Screen
        name="users"
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Users} label="Usuários" focused={focused} /> }}
      />
      <Tabs.Screen
        name="tasks"
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={CheckSquare} label="Tarefas" focused={focused} /> }}
      />
      <Tabs.Screen
        name="videos"
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Clapperboard} label="Vídeos" focused={focused} /> }}
      />
      <Tabs.Screen
        name="quizzes"
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={Puzzle} label="Quizzes" focused={focused} /> }}
      />
      <Tabs.Screen
        name="campaigns"
        options={{ tabBarIcon: ({ focused }) => <TabIcon IconComponent={HeartHandshake} label="Campanhas" focused={focused} /> }}
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
  tabIcon: { alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 2 },
  tabLabel: { fontSize: 9, fontFamily: 'Nunito_600SemiBold', color: '#4A5F8A', marginTop: 1 },
  tabLabelActive: { color: '#FF8C00' },
});
