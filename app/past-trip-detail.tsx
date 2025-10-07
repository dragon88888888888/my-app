import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function PastTripDetailScreen() {
  const params = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('about');

  // Parse trip data from params
  const tripDataParam = params.tripData as string;
  let tripData;

  if (tripDataParam) {
    try {
      tripData = JSON.parse(tripDataParam);
    } catch (error) {
      console.error('Error parsing trip data:', error);
      // Fallback data
      tripData = {
        id: 1,
        destination: 'Tokyo',
        country: 'Japan',
        dates: ' - 14 mar - 24 mar',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
      };
    }
  } else {
    // Fallback data
    tripData = {
      id: 1,
      destination: 'Tokyo',
      country: 'Japan',
      dates: ' - 14 mar - 24 mar',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    };
  }

  const handleBack = () => {
    router.back();
  };

  const handleShare = () => {
    console.log('Compartir recuerdo del viaje');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        {/* Background Image - Full screen */}
        <Image
          source={{ uri: tripData.image }}
          contentFit="cover"
          transition={300}
          style={styles.backgroundImage}
        />

      {/* Floating buttons on image */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Spacer to push card down */}
        <View style={styles.topSpacer} />

        {/* Info Card - starts from middle of screen */}
        <View style={styles.infoCard}>
          <Text style={styles.title}>{tripData.destination}</Text>
          <View style={styles.locationRow}>
            <IconSymbol name="location.fill" size={14} color="#6B7280" />
            <Text style={styles.location}>{tripData.country}</Text>
          </View>

          <View style={styles.dateRow}>
            <IconSymbol name="calendar" size={14} color="#6B7280" />
            <Text style={styles.dateText}>{tripData.dates}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
                Recuerdos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'highlights' && styles.activeTab]}
              onPress={() => setActiveTab('highlights')}
            >
              <Text style={[styles.tabText, activeTab === 'highlights' && styles.activeTabText]}>
                Destacados
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'photos' && styles.activeTab]}
              onPress={() => setActiveTab('photos')}
            >
              <Text style={[styles.tabText, activeTab === 'photos' && styles.activeTabText]}>
                Fotos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                Stats
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View style={styles.contentSection}>
          {activeTab === 'about' && (
            <View>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>
                Este fue un viaje inolvidable lleno de experiencias únicas y momentos especiales.
                Desde la cultura vibrante hasta la gastronomía auténtica, cada día trajo nuevas
                aventuras y recuerdos que durarán para siempre.
              </Text>
            </View>
          )}

          {activeTab === 'highlights' && (
            <View>
              <Text style={styles.sectionTitle}>Destacados del Viaje</Text>
              <View style={styles.highlightsList}>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <IconSymbol name="star.fill" size={20} color="#000000" />
                  </View>
                  <Text style={styles.highlightText}>Experiencias culturales únicas</Text>
                </View>

                <View style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <IconSymbol name="fork.knife" size={20} color="#000000" />
                  </View>
                  <Text style={styles.highlightText}>Gastronomía local auténtica</Text>
                </View>

                <View style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <IconSymbol name="camera.fill" size={20} color="#000000" />
                  </View>
                  <Text style={styles.highlightText}>Lugares fotográficos impresionantes</Text>
                </View>

                <View style={styles.highlightItem}>
                  <View style={styles.highlightIcon}>
                    <IconSymbol name="person.2.fill" size={20} color="#000000" />
                  </View>
                  <Text style={styles.highlightText}>Conexiones significativas</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'photos' && (
            <View>
              <Text style={styles.sectionTitle}>Galería de Fotos</Text>
              <Text style={styles.description}>
                156 fotos capturaron los mejores momentos de este viaje increíble.
              </Text>
            </View>
          )}

          {activeTab === 'stats' && (
            <View>
              <Text style={styles.sectionTitle}>Estadísticas del Viaje</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <IconSymbol name="location.fill" size={28} color="#000000" />
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Lugares visitados</Text>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name="photo.fill" size={28} color="#000000" />
                  <Text style={styles.statValue}>156</Text>
                  <Text style={styles.statLabel}>Fotos tomadas</Text>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name="fork.knife" size={28} color="#000000" />
                  <Text style={styles.statValue}>24</Text>
                  <Text style={styles.statLabel}>Restaurantes</Text>
                </View>

                <View style={styles.statCard}>
                  <IconSymbol name="figure.walk" size={28} color="#000000" />
                  <Text style={styles.statValue}>45km</Text>
                  <Text style={styles.statLabel}>Caminados</Text>
                </View>
              </View>
            </View>
          )}
          </View>
        </View>
      </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSpacer: {
    height: 450,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  shareButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    minHeight: 500,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 13,
    color: '#6B7280',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000000',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  activeTabText: {
    color: '#000000',
    fontWeight: '600',
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  highlightsList: {
    gap: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
});
