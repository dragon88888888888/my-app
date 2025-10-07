import { Tabs } from 'expo-router';
import React from 'react';

import AnimatedTabBar from '@/components/ui/AnimatedTabBar';
import AuthGuard from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard requireAuth={true}>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: 'shift',
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Chat',
          }}
        />
        <Tabs.Screen
          name="recommendations"
          options={{
            title: 'Explora',
          }}
        />
        <Tabs.Screen
          name="viajes"
          options={{
            title: 'Viajes',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
