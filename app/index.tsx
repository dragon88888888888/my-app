import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function OnboardingScreen() {
  const { isSignedIn, isLoaded } = useAuth();

  // Mostrar loading mientras carga Clerk
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  // Si está autenticado, mostrar loading y dejar que _layout maneje la redirección
  if (isSignedIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const handleComenzar = () => {
    router.push('/cuestionario');
  };

  return (
    <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Nova</Text>
            <Text style={styles.appSubtitle}>Turismo con Sentido</Text>
          </View>

          <View style={styles.mainContent}>
            <Text style={styles.title}></Text>
            <Text style={styles.subtitle}>
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.startButton} onPress={() => router.push('/login')}>
              <Text style={styles.startButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/signup')}>
              <Text style={styles.secondaryButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
    paddingBottom: 100,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoImage: {
    width: 360,
    height: 360,
    marginBottom: -20,
  },
  appTitle: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 6,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 120,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});