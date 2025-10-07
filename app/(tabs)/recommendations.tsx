import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { TripsService } from '@/lib/tripsService';
import { LegacyTrip } from '@/lib/supabase';
import RecommendationsQuestionnaire from '@/components/RecommendationsQuestionnaire';
import { UserService } from '@/lib/userService';
import { useUser } from '@clerk/clerk-expo';

export default function RecommendationsScreen() {
  const { user } = useUser();
  const [trips, setTrips] = useState<LegacyTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<{ [key: number]: string } | null>(null);
  const [checkingPreferences, setCheckingPreferences] = useState(true);
  const [likedTrips, setLikedTrips] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadTrips();
    checkUserPreferences();
  }, []);

  const checkUserPreferences = async () => {
    if (!user) {
      setCheckingPreferences(false);
      return;
    }

    try {
      const supabaseUser = await UserService.getUserByClerkId(user.id);

      if (supabaseUser) {
        const preferences = await UserService.getTravelPreferences(supabaseUser.id);

        if (preferences && preferences.completed) {
          // Usuario ya completó el cuestionario, no mostrarlo
          setShowQuestionnaire(false);
          console.log('✅ Usuario ya completó el cuestionario de recomendaciones');
        } else {
          // Usuario no ha completado el cuestionario
          setShowQuestionnaire(true);
        }
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
    } finally {
      setCheckingPreferences(false);
    }
  };

  const loadTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(' Iniciando carga de viajes...');
      const data = await TripsService.getAllTrips();
      console.log(' Viajes cargados:', data.length);
      setTrips(data);
    } catch (err) {
      setError('Error cargando viajes');
      console.error(' Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip: LegacyTrip) => {
    router.push({
      pathname: '/trip-detail',
      params: { tripId: trip.id, tripData: JSON.stringify(trip) }
    });
  };

  const handleQuestionnaireComplete = (answers: { [key: number]: string }) => {
    setQuestionnaireAnswers(answers);
    setShowQuestionnaire(false);
    console.log('Respuestas del cuestionario de recomendaciones:', answers);
  };

  const handleLike = (tripId: number) => {
    setLikedTrips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  // Mostrar loading mientras verifica si ya completó el cuestionario
  if (checkingPreferences) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Verificando perfil...</Text>
      </View>
    );
  }

  if (showQuestionnaire) {
    return <RecommendationsQuestionnaire onComplete={handleQuestionnaireComplete} />;
  }

  return (
    <Animated.View style={styles.container} entering={FadeIn.duration(300)}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={styles.header} entering={SlideInUp.duration(200).delay(100)}>
        <Text style={styles.title}>Viajes Posibles</Text>
        <Text style={styles.subtitle}>Descubre tu próximo destino</Text>
      </Animated.View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Cargando viajes...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadTrips}>
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : trips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron viajes disponibles</Text>
          </View>
        ) : (
          trips.map((trip, index) => (
            <Animated.View
              key={trip.id}
              style={styles.card}
              entering={SlideInUp.duration(250).delay(100 + index * 30)}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: trip.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'
                  }}
                  placeholder={{ blurhash: trip.blurhash }}
                  contentFit="cover"
                  transition={200}
                  onError={() => console.log('Image failed to load:', trip.title)}
                  style={styles.cardImage}
                />
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(trip.id)}
                >
                  <IconSymbol
                    name="heart"
                    size={24}
                    color={likedTrips.has(trip.id) ? '#EF4444' : '#FFFFFF'}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{trip.title}</Text>
                <Text style={styles.cardLocation}>
                  {trip.destinations.slice(0, 2).join(', ')}
                  {trip.destinations.length > 2 && ` +${trip.destinations.length - 2} más`}
                </Text>
                <Text style={styles.cardDescription}>{trip.description}</Text>

                <View style={styles.cardInfo}>
                  <View style={styles.infoItem}>
                    <IconSymbol name="dollarsign" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>
                      Desde {trip.currency === 'MXN' ? '$' : trip.currency === 'EUR' ? '€' : '$'}{trip.price_from.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <IconSymbol name="calendar" size={16} color="#6B7280" />
                    <Text style={styles.infoText}>{trip.duration_days} días</Text>
                  </View>
                </View>

                <View style={styles.tagsContainer}>
                  {trip.tags.slice(0, 3).map((tag, tagIndex) => (
                    <View key={tagIndex} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleTripSelect(trip)}
                >
                  <Text style={styles.selectButtonText}>Ver Viaje</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  cardDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  tag: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});