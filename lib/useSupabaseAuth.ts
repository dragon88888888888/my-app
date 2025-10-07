import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';

/**
 * Hook para sincronizar el estado de autenticación de Clerk
 * Por ahora solo monitorea el estado, sin integrar JWT con Supabase
 * (requiere configurar JWT template en Clerk Dashboard)
 */
export function useSupabaseAuth() {
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Este hook está listo para integrar JWT de Clerk con Supabase
    // cuando configures el template JWT en Clerk Dashboard
    if (isSignedIn) {
      // Usuario autenticado
      console.log('✅ Usuario autenticado con Clerk');
    } else {
      // Usuario no autenticado
      console.log('❌ Usuario no autenticado');
    }
  }, [isSignedIn]);
}
