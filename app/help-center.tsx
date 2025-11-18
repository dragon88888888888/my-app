import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Linking } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HelpCenterScreen() {
  const helpItems = [
    {
      icon: 'envelope.fill',
      title: 'Contactar Soporte',
      description: 'Envíanos un email y te responderemos pronto',
      action: () => Linking.openURL('mailto:support@nova-travels.com'),
    },
    {
      icon: 'questionmark.circle.fill',
      title: 'Preguntas Frecuentes',
      description: 'Encuentra respuestas a las preguntas más comunes',
      action: () => {},
    },
    {
      icon: 'book.fill',
      title: 'Guía de Usuario',
      description: 'Aprende a usar todas las funciones de la app',
      action: () => {},
    },
    {
      icon: 'message.fill',
      title: 'Chat en Vivo',
      description: 'Habla con nuestro equipo en tiempo real',
      action: () => {},
    },
  ];

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
          <Text style={styles.title}>Centro de Ayuda</Text>
        </View>

        <Text style={styles.subtitle}>¿En qué podemos ayudarte?</Text>

        <Animated.View style={styles.section} entering={FadeInDown.duration(400)}>
          {helpItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.helpItem}
              onPress={item.action}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconSymbol name={item.icon} size={24} color="#000000" />
              </View>
              <View style={styles.helpItemContent}>
                <Text style={styles.helpItemTitle}>{item.title}</Text>
                <Text style={styles.helpItemDescription}>{item.description}</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
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
  subtitle: {
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpItemContent: {
    flex: 1,
  },
  helpItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  helpItemDescription: {
    fontSize: 14,
    color: '#666666',
  },
});
