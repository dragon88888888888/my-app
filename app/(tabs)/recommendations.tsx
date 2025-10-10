import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Modal } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInUp, useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
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
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<{ [key: number]: string } | null>(null);
  const [likedTrips, setLikedTrips] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAIButton, setShowAIButton] = useState(false);
  const [hasShownAIButton, setHasShownAIButton] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  const aiButtonOpacity = useSharedValue(0);
  const aiButtonTranslateY = useSharedValue(100);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const filterCategories = [
    { id: 'adventure', label: 'Aventura', icon: 'leaf.fill' },
    { id: 'culture', label: 'Cultura', icon: 'sparkles' },
    { id: 'beach', label: 'Playa', icon: 'location.fill' },
    { id: 'mountain', label: 'Montaña', icon: 'location.fill' },
    { id: 'city', label: 'Ciudad', icon: 'location.fill' },
    { id: 'spiritual', label: 'Espiritual', icon: 'sparkles' },
  ];

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (showAIButton) {
      aiButtonOpacity.value = withTiming(1, { duration: 400 });
      aiButtonTranslateY.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });

      hideTimeoutRef.current = setTimeout(() => {
        hideAIButton();
      }, 15000);
    } else {
      aiButtonOpacity.value = withTiming(0, { duration: 300 });
      aiButtonTranslateY.value = withTiming(100, { duration: 300 });
    }

    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showAIButton]);

  const hideAIButton = () => {
    setShowAIButton(false);
    setHasShownAIButton(true);
  };

  const handleExploreWithAI = () => {
    setShowQuestionnaire(true);
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

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    if (scrollY > 100 && !showAIButton && !hasShownAIButton) {
      setShowAIButton(true);
    }
  };

  const aiButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: aiButtonOpacity.value,
      transform: [{ translateY: aiButtonTranslateY.value }],
    };
  });

  if (showQuestionnaire) {
    return <RecommendationsQuestionnaire onComplete={handleQuestionnaireComplete} />;
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destinations.some(dest => dest.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === 'all') return matchesSearch;

    if (selectedCategory === 'liked') {
      return matchesSearch && likedTrips.has(trip.id);
    }

    const matchesCategory = trip.tags.some(tag =>
      tag.toLowerCase().includes(selectedCategory.toLowerCase())
    );

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explora</Text>
          <Text style={styles.subtitle}>Encuentra tu destino ideal</Text>
        </View>
        <TouchableOpacity style={styles.aiIconButton} onPress={handleExploreWithAI}>
          <IconSymbol name="sparkles" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <IconSymbol name="magnifyingglass" size={20} color="#9CA3AF" />
        <Text style={styles.searchInput}>Busca tu destino soñado...</Text>
      </View>

      {/* Category Filters */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <IconSymbol
              name="location.fill"
              size={16}
              color={selectedCategory === 'all' ? '#FFFFFF' : '#374151'}
            />
            <Text style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryChip, selectedCategory === 'liked' && styles.categoryChipActive]}
            onPress={() => setSelectedCategory('liked')}
          >
            <IconSymbol
              name="heart"
              size={16}
              color={selectedCategory === 'liked' ? '#FFFFFF' : '#374151'}
            />
            <Text style={[styles.categoryText, selectedCategory === 'liked' && styles.categoryTextActive]}>
              Me gusta
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setShowFiltersModal(true)}
        >
          <IconSymbol
            name="slider.horizontal.3"
            size={18}
            color="#111827"
          />
        </TouchableOpacity>
      </View>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFiltersModal(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <IconSymbol name="chevron.down" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersList}>
              {filterCategories.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterItem,
                    selectedCategory === filter.id && styles.filterItemActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(filter.id);
                    setShowFiltersModal(false);
                  }}
                >
                  <View style={styles.filterItemLeft}>
                    <IconSymbol
                      name={filter.icon as any}
                      size={20}
                      color={selectedCategory === filter.id ? '#FFFFFF' : '#374151'}
                    />
                    <Text style={[
                      styles.filterItemText,
                      selectedCategory === filter.id && styles.filterItemTextActive
                    ]}>
                      {filter.label}
                    </Text>
                  </View>
                  {selectedCategory === filter.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Text style={styles.resultsText}>
          {filteredTrips.length} destinos encontrados
        </Text>

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
        ) : filteredTrips.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron viajes disponibles</Text>
          </View>
        ) : (
          filteredTrips.map((trip, index) => (
            <View key={trip.id} style={styles.card}>
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
            </View>
          ))
        )}
      </ScrollView>

      <Animated.View style={[styles.floatingButtonContainer, aiButtonStyle]}>
        <TouchableOpacity style={styles.aiButton} onPress={handleExploreWithAI}>
          <IconSymbol name="magnifyingglass" size={20} color="#FFFFFF" />
          <Text style={styles.aiButtonText}>Explorar Viaje con IA</Text>
          <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  aiIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  categoriesWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 24,
    marginBottom: 20,
    gap: 12,
  },
  categoriesContainer: {
    flex: 1,
    maxHeight: 40,
  },
  categoriesContent: {
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#000000',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  filterChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  resultsText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20,
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
    padding: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 14,
  },
  cardInfo: {
    flexDirection: 'row',
    marginBottom: 14,
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
    marginBottom: 16,
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
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  aiButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  filtersList: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  filterItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#F9FAFB',
  },
  filterItemActive: {
    backgroundColor: '#000000',
  },
  filterItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  filterItemTextActive: {
    color: '#FFFFFF',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
});