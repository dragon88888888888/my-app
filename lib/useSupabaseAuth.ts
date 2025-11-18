import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Hook para sincronizar el estado de autenticación de Clerk
 * Por ahora solo monitorea el estado, sin integrar JWT con Supabase
 * (requiere configurar JWT template en Clerk Dashboard)
 */
export function useSupabaseAuth() {
  const { isSignedIn } = useAuth();
  const lastAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    // Solo loguear cuando cambia el estado de autenticación
    if (lastAuthState.current !== isSignedIn) {
      lastAuthState.current = isSignedIn;

      if (isSignedIn) {
        console.log('✅ Usuario autenticado con Clerk');
      } else {
        console.log('❌ Usuario no autenticado');
      }
    }
  }, [isSignedIn]);
}
