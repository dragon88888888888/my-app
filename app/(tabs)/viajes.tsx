import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

const pastTripsData = [
  {
    id: 1,
    destination: 'Tokyo',
    country: 'Japan',
    dates: ' - 14 mar - 24 mar',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  },
  {
    id: 2,
    destination: 'Barcelona',
    country: 'Spain',
    dates: ' - 9 sept - 19 sept',
    image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
  },
];

export default function PastTripsScreen() {
  const handleNewTrip = () => {
    router.push('/recommendations');
  };

  const handleTripDetail = (trip: any) => {
    router.push({
      pathname: '/past-trip-detail',
      params: {
        tripId: trip.id,
        tripData: JSON.stringify(trip)
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <Text style={styles.title}>Mis Viajes</Text>
        <Text style={styles.subtitle}>Tu cartera de experiencias</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Historial de Viajes</Text>
          
          <View style={styles.tripsContainer}>
            {pastTripsData.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.tripCard}
                onPress={() => handleTripDetail(trip)}
              >
                <ImageBackground
                  source={{ uri: trip.image }}
                  style={styles.tripCardBackground}
                  imageStyle={styles.tripCardImage}
                >
                  <View style={styles.tripCardOverlay}>
                    <View style={styles.tripHeader}>
                      <View />
                      <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                    </View>

                    <View>
                      <Text style={styles.tripDestination}>{trip.destination}</Text>
                      <View style={styles.tripCountryRow}>
                        <Text style={styles.tripCountry}>{trip.country}</Text>
                        <Text style={styles.tripDates}>{trip.dates}</Text>
                      </View>
                    </View>
                  </View>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.newTripButton} onPress={handleNewTrip}>
          <IconSymbol name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.newTripText}>Agregar Viaje</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  tripsContainer: {
    gap: 16,
  },
  tripCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 0,
  },
  tripCardBackground: {
    width: '100%',
    minHeight: 200,
  },
  tripCardImage: {
    borderRadius: 12,
  },
  tripCardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 20,
    justifyContent: 'space-between',
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripDestination: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tripCountryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  tripCountry: {
    fontSize: 16,
    color: '#E5E7EB',
  },
  tripDates: {
    fontSize: 14,
    color: '#E5E7EB',
    fontWeight: '500',
  },
  tripPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  newTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    marginTop: 20,
    marginBottom: 40,
  },
  newTripText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
