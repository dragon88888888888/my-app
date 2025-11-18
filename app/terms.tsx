import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.title}>Términos y Condiciones</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.date}>Última actualización: Enero 2025</Text>

          <Text style={styles.sectionTitle}>1. Aceptación de Términos</Text>
          <Text style={styles.paragraph}>
            Al acceder y usar Nova, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes usar nuestra aplicación.
          </Text>

          <Text style={styles.sectionTitle}>2. Uso de la Aplicación</Text>
          <Text style={styles.paragraph}>
            Nova es una plataforma de viajes que te ayuda a descubrir y planificar experiencias de viaje personalizadas. Nos reservamos el derecho de modificar o discontinuar el servicio en cualquier momento.
          </Text>

          <Text style={styles.sectionTitle}>3. Cuentas de Usuario</Text>
          <Text style={styles.paragraph}>
            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas no compartir tu cuenta con terceros y notificarnos inmediatamente de cualquier uso no autorizado.
          </Text>

          <Text style={styles.sectionTitle}>4. Contenido del Usuario</Text>
          <Text style={styles.paragraph}>
            Al enviar contenido a Nova, otorgas a Nova una licencia mundial, no exclusiva y libre de regalías para usar, reproducir y mostrar dicho contenido en relación con el servicio.
          </Text>

          <Text style={styles.sectionTitle}>5. Privacidad</Text>
          <Text style={styles.paragraph}>
            Tu privacidad es importante para nosotros. Consulta nuestra Política de Privacidad para obtener información sobre cómo recopilamos, usamos y protegemos tus datos personales.
          </Text>

          <Text style={styles.sectionTitle}>6. Propiedad Intelectual</Text>
          <Text style={styles.paragraph}>
            Todo el contenido de Nova, incluyendo texto, gráficos, logos e imágenes, es propiedad de Nova o sus licenciantes y está protegido por leyes de derechos de autor.
          </Text>

          <Text style={styles.sectionTitle}>7. Limitación de Responsabilidad</Text>
          <Text style={styles.paragraph}>
            Nova no será responsable de ningún daño indirecto, incidental o consecuente que resulte del uso o la imposibilidad de usar nuestro servicio.
          </Text>

          <Text style={styles.sectionTitle}>8. Cambios en los Términos</Text>
          <Text style={styles.paragraph}>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. Te notificaremos de cambios significativos a través de la aplicación o por email.
          </Text>

          <Text style={styles.sectionTitle}>9. Contacto</Text>
          <Text style={styles.paragraph}>
            Si tienes preguntas sobre estos términos, contáctanos en: support@nova-travels.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  date: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 16,
  },
});
