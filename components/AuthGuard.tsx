import React, { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { UserService } from '@/lib/userService';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Sincronizar usuario de Clerk con Supabase cuando se carga
  useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && user) {
        const email = user.emailAddresses[0]?.emailAddress;
        const name = user.firstName || user.username || undefined;

        await UserService.syncClerkUser(user.id, email, name);
      }
    };

    if (isLoaded) {
      syncUser();
    }
  }, [isSignedIn, isLoaded, user]);

  // Wait for auth state to load
  if (!isLoaded) {
    return null; // Or loading component
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