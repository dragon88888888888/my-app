import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, AppState } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useRef } from 'react';
// import 'react-native-reanimated'; // Comentado para compatibilidad con Expo Go
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useSupabaseAuth } from '@/lib/useSupabaseAuth';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const appState = useRef(AppState.currentState);

  // Sincronizar tokens de Clerk con Supabase
  useSupabaseAuth();

  // Función para ocultar la barra de navegación de Android
  const hideNavigationBar = async () => {
    if (Platform.OS === 'android') {
      try {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBehaviorAsync('overlay-swipe');
        await NavigationBar.setBackgroundColorAsync('#FFFFFF00'); // Transparente
        await NavigationBar.setPositionAsync('absolute');
      } catch (error) {
        console.error('Error ocultando barra de navegación:', error);
      }
    }
  };

  // Ocultar la barra de navegación de Android en TODAS las pantallas
  useEffect(() => {
    hideNavigationBar();
  }, [pathname]); // Se ejecuta cada vez que cambia la ruta

  // Mantener la barra oculta cuando la app regresa al foreground
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // La app ha regresado al foreground
          hideNavigationBar();
        }
        appState.current = nextAppState;
      });

      return () => {
        subscription.remove();
      };
    }
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="cuestionario" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip-detail" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

  if (!publishableKey) {
    throw new Error('Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootLayoutNav />
    </ClerkProvider>
  );
}
