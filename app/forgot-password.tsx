import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAlert } from '@/contexts/AlertContext';

export default function ForgotPasswordScreen() {
  const { signIn } = useSignIn();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      showAlert('Email requerido', 'Por favor ingresa tu email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Email inválido', 'Por favor ingresa un email válido.');
      return;
    }

    setLoading(true);
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      showAlert(
        'Email enviado',
        'Te hemos enviado un código de recuperación. Revisa tu bandeja de entrada.',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/reset-password',
              params: { email }
            }),
          },
        ]
      );
    } catch (err: any) {
      console.error('Password reset error:', err);
      showAlert('Error', err.errors?.[0]?.message || 'No se pudo enviar el email de recuperación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Recuperar Contraseña</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <IconSymbol name="lock.fill" size={40} color="#000000" />
          </View>
        </View>

        <Text style={styles.subtitle}>
          Ingresa tu email y te enviaremos un código para restablecer tu contraseña
        </Text>

        <View style={styles.formContainer}>
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
              autoComplete="email"
            />
          </View>

          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendCode}
            disabled={loading || !email}
          >
            <Text style={styles.sendButtonText}>
              {loading ? 'Enviando...' : 'Enviar Código'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>
              Volver al <Text style={styles.backTextBold}>Inicio de Sesión</Text>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
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
  sendButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  backTextBold: {
    fontWeight: 'bold',
    color: '#000000',
  },
});
