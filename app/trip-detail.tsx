import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const tripDetailsDatabase = {
  1: {
    title: 'Aventura en Santorini',
    location: 'Santorini, Grecia',
    duration: '7 días',
    groupSize: '6-10 personas',
    price: '$2,800',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    blurhash: 'LHF5}xYk^6#M@-5c,1J5@[or[Q6.',
    experienceProfile: {
      aventura: 90,
      cultura: 85,
      conexion: 80,
      luxe: 95,
      conciencia: 70,
    },
    description: 'Descubre la magia de Santorini con sus icónicos atardeceres, arquitectura única y aguas cristalinas. Una experiencia inolvidable entre acantilados volcánicos y pueblos blancos.',
  },
  2: {
    title: 'Experiencia Cultural en París',
    location: 'París, Francia',
    duration: '5 días',
    groupSize: '4-8 personas',
    price: '$2,200',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1420&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    blurhash: 'LGE{9pD%xvt7_3WBj[ay00Rj~qof',
    experienceProfile: {
      aventura: 60,
      cultura: 100,
      conexion: 85,
      luxe: 90,
      conciencia: 75,
    },
    description: 'Sumérgete en la cultura parisina más auténtica. Desde el Louvre hasta Montmartre, vive París como un verdadero local con experiencias gastronómicas únicas.',
  },
  3: {
    title: 'Serenidad en Kyoto',
    location: 'Kyoto, Japón',
    duration: '8 días',
    groupSize: '6-12 personas',
    price: '$3,100',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    blurhash: 'LFE:}PVD00xHjXIotRoL8_t7RPV@',
    experienceProfile: {
      aventura: 70,
      cultura: 95,
      conexion: 90,
      luxe: 80,
      conciencia: 100,
    },
    description: 'Encuentra la paz interior en los templos milenarios de Kyoto. Experimenta la ceremonia del té, jardines zen y la belleza efímera de los cerezos en flor.',
  },
};

export default function TripDetailScreen() {
  const params = useLocalSearchParams();
  const [showHeaderButtons, setShowHeaderButtons] = useState(true);

  // Get trip data from params
  const tripId = params.tripId ? parseInt(params.tripId as string) : 1;
  const tripDataParam = params.tripData as string;

  // Use real trip data if available, otherwise fallback to static data
  let tripDetailData;
  if (tripDataParam) {
    try {
      const realTripData = JSON.parse(tripDataParam);
      tripDetailData = {
        title: realTripData.title,
        location: realTripData.destinations.join(', '),
        duration: `${realTripData.duration_days} días`,
        groupSize: '6-10 personas', // Default value since it's not in the real data
        price: `${realTripData.currency === 'MXN' ? '$' : realTripData.currency === 'EUR' ? '€' : '$'}${realTripData.price_from.toLocaleString()}`,
        image: realTripData.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
        blurhash: realTripData.blurhash || 'LHF5}xYk^6#M@-5c,1J5@[or[Q6.',
        experienceProfile: {
          aventura: 75,
          cultura: 80,
          conexion: 85,
          luxe: 70,
          conciencia: 90,
        },
        description: realTripData.description,
      };
    } catch (error) {
      console.error('Error parsing trip data:', error);
      tripDetailData = tripDetailsDatabase[tripId as keyof typeof tripDetailsDatabase] || tripDetailsDatabase[1];
    }
  } else {
    tripDetailData = tripDetailsDatabase[tripId as keyof typeof tripDetailsDatabase] || tripDetailsDatabase[1];
  }

  const handleBack = () => {
    router.back();
  };

  const handleRequestInfo = () => {
    console.log('Solicitar información del viaje');
  };

  const handleFavorite = () => {
    console.log('Agregar a favoritos');
  };

  const handleShare = () => {
    console.log('Compartir viaje');
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    // Hide buttons when scrolled past the image (400px height)
    const imageHeight = 400;
    const shouldShowButtons = scrollY < imageHeight - 100; // Hide 100px before image completely disappears
    
    if (shouldShowButtons !== showHeaderButtons) {
      setShowHeaderButtons(shouldShowButtons);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: tripDetailData.image }}
          placeholder={{ blurhash: tripDetailData.blurhash }}
          contentFit="cover"
          transition={300}
          onError={() => console.log('Hero image failed to load')}
          style={styles.heroImage}
        />
        
        {/* Header overlay - only show when image is visible */}
        {showHeaderButtons && (
          <View
            style={styles.headerOverlay}
          >
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <IconSymbol name="chevron.left" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
                <IconSymbol name="heart" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <IconSymbol name="share" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{tripDetailData.title}</Text>
          <View style={styles.locationContainer}>
            <IconSymbol name="location.fill" size={16} color="#6B7280" />
            <Text style={styles.location}>{tripDetailData.location}</Text>
          </View>
          
          <View style={styles.tripInfo}>
            <View style={styles.infoItem}>
              <IconSymbol name="calendar" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{tripDetailData.duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <IconSymbol name="person.fill" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{tripDetailData.groupSize}</Text>
            </View>
          </View>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.description}>{tripDetailData.description}</Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Perfil de la experiencia</Text>
          <View style={styles.profileBars}>
            {Object.entries(tripDetailData.experienceProfile).map(([key, value]) => {
              const labels = {
                aventura: 'Aventura',
                cultura: 'Cultura',
                conexion: 'Conexión',
                luxe: 'Luxe',
                conciencia: 'Conciencia',
              };
              
              return (
                <View key={key} style={styles.profileBar}>
                  <Text style={styles.profileLabel}>{labels[key as keyof typeof labels]}</Text>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <View style={[styles.barFill, { width: `${value}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.profilePercentage}>{value}%</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.priceLabel}>Desde</Text>
          <Text style={styles.price}>{tripDetailData.price}</Text>
        </View>

        <TouchableOpacity style={styles.requestButton} onPress={handleRequestInfo}>
          <Text style={styles.requestButtonText}>Comprar Ahora</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    height: 400,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  location: {
    fontSize: 16,
    color: '#6B7280',
  },
  tripInfo: {
    flexDirection: 'row',
    gap: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  profileSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  profileBars: {
    gap: 12,
  },
  profileBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileLabel: {
    width: 80,
    fontSize: 14,
    color: '#374151',
  },
  barContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  barBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  profilePercentage: {
    width: 40,
    textAlign: 'right',
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  priceSection: {
    marginBottom: 32,
  },
  priceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  requestButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});