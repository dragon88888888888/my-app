import React, { useEffect, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { UserService } from '@/lib/userService';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);

  // Sincronizar usuario de Clerk con Supabase cuando se carga
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        setIsSyncing(true);
        console.log('✅ Usuario autenticado con Clerk');

        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.firstName || user.username || undefined;

        const supabaseUser = await UserService.syncClerkUser(user.id, email, name);

        if (supabaseUser) {
          console.log('✅ Usuario sincronizado con Supabase:', supabaseUser.id);
        } else {
          console.error('❌ Error al sincronizar usuario con Supabase');
        }

        setIsSyncing(false);
      }
    };

    if (isLoaded) {
      syncUser();
    }
  }, [isSignedIn, isLoaded, user]);

  // Wait for auth state to load or user to sync
  if (!isLoaded || isSyncing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // If authentication is required but user is not signed in
  if (requireAuth && !isSignedIn) {
    return <Redirect href="/" />;
  }

  // NO redirigir automáticamente si el usuario está autenticado
  // Siempre mostrar la pantalla de login/onboarding al iniciar la app
  // if (!requireAuth && isSignedIn) {
  //   return <Redirect href="/(tabs)" />;
  // }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
});