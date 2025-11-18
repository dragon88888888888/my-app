import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PersonalInfoScreen() {
  const { user } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    try {
      await user?.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setEditing(false);
      Alert.alert('Éxito', 'Tu información ha sido actualizada.');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'No se pudo actualizar la información.');
    }
  };

  const handleCancel = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEditing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left" size={24} color="#000000" />
          </TouchableOpacity>
          <Text style={styles.title}>Información Personal</Text>
        </View>

        <Animated.View style={styles.section} entering={FadeInDown.duration(400)}>
          <View style={styles.field}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={firstName}
              onChangeText={setFirstName}
              editable={editing}
              placeholder="Tu nombre"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Apellido</Text>
            <TextInput
              style={[styles.input, !editing && styles.inputDisabled]}
              value={lastName}
              onChangeText={setLastName}
              editable={editing}
              placeholder="Tu apellido"
              placeholderTextColor="#999999"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.primaryEmailAddress?.emailAddress || ''}
              editable={false}
            />
            <Text style={styles.helpText}>El email no puede ser modificado</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>ID de Usuario</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.id || ''}
              editable={false}
            />
          </View>
        </Animated.View>

        {editing ? (
          <Animated.View style={styles.buttonContainer} entering={FadeInDown.duration(400)}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View style={styles.buttonContainer} entering={FadeInDown.duration(400)}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => setEditing(true)}
              activeOpacity={0.7}
            >
              <IconSymbol name="pencil" size={18} color="#FFFFFF" />
              <Text style={styles.editButtonText}>Editar Información</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
  },
  section: {
    paddingHorizontal: 24,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  inputDisabled: {
    backgroundColor: '#FAFAFA',
    color: '#999999',
  },
  helpText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#000000',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#000000',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});
