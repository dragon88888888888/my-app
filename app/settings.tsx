import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Switch, Platform, Linking } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAlert } from '@/contexts/AlertContext';
import { UserService } from '@/lib/userService';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { showAlert } = useAlert();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const email = await AsyncStorage.getItem('emailNotifications');
      const dark = await AsyncStorage.getItem('darkMode');

      if (notifications !== null) setNotificationsEnabled(JSON.parse(notifications));
      if (email !== null) setEmailNotifications(JSON.parse(email));
      if (dark !== null) setDarkMode(JSON.parse(dark));
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreference = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving preference:', error);
    }
  };

  const handleNotificationsChange = (value: boolean) => {
    setNotificationsEnabled(value);
    savePreference('notificationsEnabled', value);
  };

  const handleEmailNotificationsChange = (value: boolean) => {
    setEmailNotifications(value);
    savePreference('emailNotifications', value);
  };

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);
    savePreference('darkMode', value);

    showAlert(
      'Próximamente',
      'El modo oscuro estará disponible en una próxima actualización.',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  const handleSignOut = async () => {
    showAlert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              console.error('Error signing out:', error);
              showAlert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
            }
          },
        },
      ]
    );
  };

  const handleChangeProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showAlert(
          'Permiso Requerido',
          'Necesitamos permiso para acceder a tus fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let base64Image: string;

        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const reader = new FileReader();

          base64Image = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          if (asset.base64) {
            const mimeType = asset.uri.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'jpeg';
            base64Image = `data:image/${mimeType};base64,${asset.base64}`;
          } else {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64',
            });
            const mimeType = asset.uri.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'jpeg';
            base64Image = `data:image/${mimeType};base64,${base64}`;
          }
        }

        await user?.setProfileImage({
          file: base64Image,
        });

        showAlert('Éxito', 'Tu foto de perfil ha sido actualizada.');
      }
    } catch (error) {
      console.error('Error changing profile image:', error);
      showAlert('Error', 'No se pudo cambiar la foto de perfil. Intenta nuevamente.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        showAlert(
          'Permiso Requerido',
          'Necesitamos permiso para acceder a tu cámara.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        let base64Image: string;

        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const reader = new FileReader();

          base64Image = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } else {
          if (asset.base64) {
            const mimeType = asset.uri.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'jpeg';
            base64Image = `data:image/${mimeType};base64,${asset.base64}`;
          } else {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, {
              encoding: 'base64',
            });
            const mimeType = asset.uri.match(/\.(png|jpg|jpeg|gif|webp)$/i)?.[1] || 'jpeg';
            base64Image = `data:image/${mimeType};base64,${base64}`;
          }
        }

        await user?.setProfileImage({
          file: base64Image,
        });

        showAlert('Éxito', 'Tu foto de perfil ha sido actualizada.');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showAlert('Error', 'No se pudo tomar la foto. Intenta nuevamente.');
    }
  };

  const handleChangeProfileImageOptions = () => {
    showAlert(
      'Cambiar Foto de Perfil',
      'Elige una opción',
      [
        {
          text: 'Tomar Foto',
          onPress: handleTakePhoto,
        },
        {
          text: 'Elegir de Galería',
          onPress: handleChangeProfileImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handlePersonalInfo = () => {
    router.push('/personal-info');
  };

  const handlePrivacySecurity = () => {
    showAlert(
      'Privacidad y Seguridad',
      'Gestiona tu privacidad y seguridad',
      [
        {
          text: 'Gestionar en Clerk',
          onPress: () => {
            if (user) {
              Linking.openURL('https://accounts.clerk.com/user');
            }
          },
        },
        {
          text: 'Cerrar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLanguage = () => {
    showAlert(
      'Idioma',
      'Selecciona tu idioma preferido',
      [
        {
          text: 'Español',
          onPress: () => showAlert('Idioma', 'Ya estás usando Español'),
        },
        {
          text: 'English',
          onPress: () => showAlert('Próximamente', 'El idioma inglés estará disponible pronto.'),
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  const handleHelpCenter = () => {
    router.push('/help-center');
  };

  const handleTerms = () => {
    router.push('/terms');
  };

  const handlePrivacyPolicy = () => {
    router.push('/privacy');
  };

  const handleDeleteAccount = async () => {
    showAlert(
      'Eliminar Cuenta',
      'Esta acción es PERMANENTE y NO se puede deshacer.\n\nSe eliminarán:\n• Todos tus datos personales\n• Tu perfil astrológico\n• Tus preferencias de viaje\n• Todo el historial\n\n¿Estás completamente seguro?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?.id) {
                showAlert('Error', 'No se pudo identificar el usuario.');
                return;
              }

              // 1. Eliminar datos de Supabase
              console.log('Eliminando datos de Supabase...');
              const supabaseDeleted = await UserService.deleteUserData(user.id);

              if (!supabaseDeleted) {
                showAlert('Error', 'Hubo un problema al eliminar tus datos. Por favor contacta a soporte.');
                return;
              }

              // 2. Eliminar cuenta de Clerk
              console.log('Eliminando cuenta de Clerk...');
              await user.delete();

              // 3. Cerrar sesión
              console.log('Cerrando sesión...');
              await signOut();

              // 4. Redirigir a home
              router.replace('/');

              // 5. Mostrar confirmación (después de un pequeño delay para que se vea)
              setTimeout(() => {
                showAlert('Cuenta Eliminada', 'Tu cuenta y todos tus datos han sido eliminados exitosamente.');
              }, 500);
            } catch (error) {
              console.error('Error deleting account:', error);
              showAlert('Error', 'No se pudo eliminar la cuenta. Por favor contacta a soporte.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={30} color="#000000" />
        </TouchableOpacity>

        {/* Profile Section */}
        <Animated.View style={styles.profileSection} entering={FadeInDown.duration(400)}>
          <TouchableOpacity
            onPress={handleChangeProfileImageOptions}
            activeOpacity={0.8}
          >
            <View style={styles.profileImageContainer}>
              <Image
                source={{ uri: user?.imageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80' }}
                style={styles.profileImage}
                contentFit="cover"
              />
              <View style={styles.cameraIconContainer}>
                <IconSymbol name={"camera.fill" as any} size={16} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{user?.fullName || 'Usuario'}</Text>
          <Text style={styles.profileEmail}>{user?.primaryEmailAddress?.emailAddress || ''}</Text>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={styles.section} entering={FadeInDown.duration(400).delay(100)}>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handlePersonalInfo}>
            <IconSymbol name="person.fill" size={20} color="#000000" />
            <Text style={styles.menuItemText}>Información Personal</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handlePrivacySecurity}>
            <IconSymbol name={"lock.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Privacidad y Seguridad</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <IconSymbol name={"bell.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Notificaciones Push</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: '#D1D5DB', true: '#000000' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <IconSymbol name={"envelope.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Email</Text>
            <Switch
              value={emailNotifications}
              onValueChange={handleEmailNotificationsChange}
              trackColor={{ false: '#D1D5DB', true: '#000000' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <IconSymbol name={"moon.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Modo Oscuro</Text>
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeChange}
              trackColor={{ false: '#D1D5DB', true: '#000000' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#D1D5DB"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleLanguage}>
            <IconSymbol name="globe" size={20} color="#000000" />
            <Text style={styles.menuItemText}>Idioma</Text>
            <Text style={styles.menuItemValue}>Español</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleHelpCenter}>
            <IconSymbol name={"xmark.circle.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Centro de Ayuda</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleTerms}>
            <IconSymbol name={"doc.text.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Términos y Condiciones</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handlePrivacyPolicy}>
            <IconSymbol name={"shield.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Política de Privacidad</Text>
            <IconSymbol name="chevron.right" size={18} color="#000000" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.menuItem}>
            <IconSymbol name={"info.circle.fill" as any} size={20} color="#000000" />
            <Text style={styles.menuItemText}>Versión</Text>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </View>
        </Animated.View>

        {/* Sign Out Button */}
        <Animated.View style={styles.signOutSection} entering={FadeInDown.duration(400).delay(200)}>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <Text style={styles.signOutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Delete Account Button */}
        <Animated.View style={styles.deleteAccountSection} entering={FadeInDown.duration(400).delay(250)}>
          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteAccountText}>Eliminar Cuenta</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    paddingHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 44,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  menuItemValue: {
    fontSize: 15,
    color: '#666666',
    marginRight: 8,
  },
  signOutSection: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  deleteAccountSection: {
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 40,
  },
  deleteAccountButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#EF4444',
  },
});
