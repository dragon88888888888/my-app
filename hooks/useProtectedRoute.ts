import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';

export function useProtectedRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      router.replace('/');
    } else if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isSignedIn, isLoaded, segments]);
}
