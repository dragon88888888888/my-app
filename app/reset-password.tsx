import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAlert } from '@/contexts/AlertContext';

export default function ResetPasswordScreen() {
  const { signIn, setActive } = useSignIn();
  const { showAlert } = useAlert();
  const params = useLocalSearchParams();
  const email = params.email as string;

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!code || !newPassword) {
      showAlert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }

    if (newPassword.length < 8) {
      showAlert('Contraseña débil', 'La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId });

        showAlert(
          'Contraseña actualizada',
          'Tu contraseña ha sido actualizada exitosamente.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      showAlert('Error', err.errors?.[0]?.message || 'No se pudo restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      showAlert('Código reenviado', 'Te hemos enviado un nuevo código a tu email.');
    } catch (err: any) {
      console.error('Resend code error:', err);
      showAlert('Error', 'No se pudo reenviar el código');
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
        <Text style={styles.title}>Restablecer Contraseña</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Ingresa el código que te enviamos a {email}
        </Text>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Código de verificación</Text>
            <TextInput
              style={styles.textInput}
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nueva contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
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
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading || !code || !newPassword}
          >
            <Text style={styles.resetButtonText}>
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={resendCode} disabled={loading}>
            <Text style={styles.resendText}>
              ¿No recibiste el código? <Text style={styles.resendTextBold}>Reenviar</Text>
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
  resetButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  resetButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
  },
  resendTextBold: {
    fontWeight: 'bold',
    color: '#000000',
  },
});
