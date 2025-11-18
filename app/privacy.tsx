import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';

export default function PrivacyScreen() {
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
        <Text style={styles.title}>Política de Privacidad</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.date}>Última actualización: Enero 2025</Text>

          <Text style={styles.sectionTitle}>1. Información que Recopilamos</Text>
          <Text style={styles.paragraph}>
            Recopilamos información que nos proporcionas directamente, como tu nombre, dirección de email, fecha de nacimiento y preferencias de viaje cuando creas una cuenta o utilizas nuestros servicios.
          </Text>

          <Text style={styles.sectionTitle}>2. Uso de la Información</Text>
          <Text style={styles.paragraph}>
            Utilizamos tu información para:
          </Text>
          <Text style={styles.bulletPoint}>• Proporcionar y mejorar nuestros servicios</Text>
          <Text style={styles.bulletPoint}>• Personalizar tu experiencia de viaje</Text>
          <Text style={styles.bulletPoint}>• Enviarte actualizaciones y recomendaciones</Text>
          <Text style={styles.bulletPoint}>• Procesar tus reservas y pagos</Text>
          <Text style={styles.bulletPoint}>• Responder a tus consultas y solicitudes</Text>

          <Text style={styles.sectionTitle}>3. Compartir Información</Text>
          <Text style={styles.paragraph}>
            No vendemos tu información personal. Podemos compartir tu información con:
          </Text>
          <Text style={styles.bulletPoint}>• Proveedores de servicios que nos ayudan a operar</Text>
          <Text style={styles.bulletPoint}>• Socios de viaje para procesar tus reservas</Text>
          <Text style={styles.bulletPoint}>• Autoridades cuando sea legalmente requerido</Text>

          <Text style={styles.sectionTitle}>4. Seguridad de Datos</Text>
          <Text style={styles.paragraph}>
            Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
          </Text>

          <Text style={styles.sectionTitle}>5. Cookies y Tecnologías Similares</Text>
          <Text style={styles.paragraph}>
            Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso de la aplicación y personalizar el contenido y los anuncios.
          </Text>

          <Text style={styles.sectionTitle}>6. Tus Derechos</Text>
          <Text style={styles.paragraph}>
            Tienes derecho a:
          </Text>
          <Text style={styles.bulletPoint}>• Acceder a tu información personal</Text>
          <Text style={styles.bulletPoint}>• Corregir información inexacta</Text>
          <Text style={styles.bulletPoint}>• Solicitar la eliminación de tus datos</Text>
          <Text style={styles.bulletPoint}>• Oponerte al procesamiento de tus datos</Text>
          <Text style={styles.bulletPoint}>• Exportar tus datos</Text>

          <Text style={styles.sectionTitle}>7. Retención de Datos</Text>
          <Text style={styles.paragraph}>
            Conservamos tu información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política o según lo requiera la ley.
          </Text>

          <Text style={styles.sectionTitle}>8. Privacidad de Menores</Text>
          <Text style={styles.paragraph}>
            Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores.
          </Text>

          <Text style={styles.sectionTitle}>9. Cambios a esta Política</Text>
          <Text style={styles.paragraph}>
            Podemos actualizar esta política de privacidad periódicamente. Te notificaremos de cambios significativos publicando la nueva política en la aplicación.
          </Text>

          <Text style={styles.sectionTitle}>10. Contacto</Text>
          <Text style={styles.paragraph}>
            Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, contáctanos en: privacy@nova-travels.com
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
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333333',
    marginLeft: 16,
    marginBottom: 8,
  },
});
