import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, ScrollView, Platform, Keyboard } from 'react-native';
import { useSignIn, useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserService } from '@/lib/userService';

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signOut, isSignedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Cerrar sesión si el usuario ya está autenticado
  useEffect(() => {
    const handleSignOut = async () => {
      if (isSignedIn) {
        try {
          await signOut();
          console.log('✅ Sesión anterior cerrada en login');
        } catch (error) {
          console.error('Error al cerrar sesión anterior:', error);
        }
      }
    };

    handleSignOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll cuando aparece el teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSignIn = async () => {
    if (!isLoaded) {
      console.log('❌ [Login] Clerk no está cargado');
      return;
    }

    console.log('🔑 [Login] Iniciando proceso de login...');
    console.log('  - Email:', email);
    console.log('  - Password length:', password.length);

    setLoading(true);
    try {
      console.log('🔑 [Login] Creando sesión con Clerk...');
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      console.log('🔑 [Login] Respuesta de Clerk:', completeSignIn.status);

      if (completeSignIn.status === 'complete') {
        // Intentar activar la sesión, pero manejar el error si ya existe
        try {
          await setActive({ session: completeSignIn.createdSessionId });
        } catch (sessionError: any) {
          // Si ya existe una sesión, simplemente continuar
          console.log('Session may already exist, continuing...', sessionError.message);
        }

        // IMPORTANTE: Sincronizar con Supabase ANTES de navegar
        console.log('✅ Inicio de sesión exitoso, sincronizando con Supabase...');

        const userId = completeSignIn.identifier;
        const userEmail = email; // Ya tenemos el email del form

        if (userId) {
          const supabaseUser = await UserService.syncClerkUser(userId, userEmail);

          if (supabaseUser) {
            console.log('✅ Usuario sincronizado con Supabase:', supabaseUser.id);
          } else {
            console.error('❌ Error al sincronizar usuario con Supabase');
            // No bloqueamos el login, solo advertimos
            console.warn('Continuando sin sincronización...');
          }
        }

        // Check if user has completed onboarding before
        // For now, we assume existing users go directly to main app
        const hasCompletedOnboarding = true; // Replace with actual check

        if (hasCompletedOnboarding) {
          router.replace('/(tabs)');
        } else {
          router.replace('/cuestionario');
        }
      } else {
        console.log('Sign in incomplete:', completeSignIn);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      Alert.alert('Error', err.errors?.[0]?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // OAuth handlers - Temporarily disabled until properly configured
  const onGoogleSignIn = useCallback(async () => {
    Alert.alert('Google OAuth', 'Google OAuth será configurado próximamente');
  }, []);

  const onAppleSignIn = useCallback(async () => {
    Alert.alert('Apple OAuth', 'Apple Sign In será configurado próximamente');
  }, []);

  const onFacebookSignIn = useCallback(async () => {
    Alert.alert('Facebook OAuth', 'Facebook Login será configurado próximamente');
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Iniciar Sesión</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Bienvenido de vuelta a Nova</Text>

        <View style={styles.formContainer}>
          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={onGoogleSignIn}
            >
              <Image
                source={{ uri: 'https://www.google.com/favicon.ico' }}
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={onAppleSignIn}
            >
              <Image
                source={{ uri: 'https://www.apple.com/favicon.ico' }}
                style={styles.appleIcon}
              />
              <Text style={styles.oauthButtonText}>Continuar con Apple</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthButton}
              onPress={onFacebookSignIn}
            >
              <Image
                source={{ uri: 'https://www.facebook.com/favicon.ico' }}
                style={styles.oauthIcon}
              />
              <Text style={styles.oauthButtonText}>Continuar con Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={showPassword ? 'eye.slash' : 'eye'}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.signInButton, loading && styles.signInButtonDisabled]}
            onPress={handleSignIn}
            disabled={loading || !email || !password}
          >
            <Text style={styles.signInButtonText}>
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.switchText}>
              ¿No tienes cuenta? <Text style={styles.switchTextBold}>Crear cuenta</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  spacer: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  formContainer: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#374151',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingRight: 12,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signInButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  switchTextBold: {
    fontWeight: 'bold',
    color: '#000000',
  },
  oauthContainer: {
    gap: 12,
  },
  oauthButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  oauthButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  oauthIcon: {
    width: 20,
    height: 20,
  },
  appleIcon: {
    width: 32,
    height: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});