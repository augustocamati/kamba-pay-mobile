import React from 'react';
import { Stack } from 'expo-router';
import { SoundProvider } from '@/lib/sound-context';
import { MascotProvider } from '@/lib/mascot-context';

export default function ChildLayout() {
  return (
    <MascotProvider>
      <SoundProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="aula" />
          <Stack.Screen name="quiz" />
          <Stack.Screen name="shop" />
          <Stack.Screen name="submit-task" />
        </Stack>
      </SoundProvider>
    </MascotProvider>
  );
}
