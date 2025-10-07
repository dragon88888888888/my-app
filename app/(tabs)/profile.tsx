import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInUp, SlideInLeft } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

interface ProfileData {
  aventura: number;
  cultura: number;
  conexion: number;
  luxe: number;
  conciencia: number;
}

const profileData: ProfileData = {
  aventura: 100,
  cultura: 100,
  conexion: 100,
  luxe: 66,
  conciencia: 90,
};

const RadarChart = ({ data }: { data: ProfileData }) => {
  const center = { x: 120, y: 120 };
  const radius = 80;
  
  // Pentagon angles (starting from top, going clockwise) - Fixed order
  const angles = [-90, -18, 54, 126, 198];
  const labels = ['Aventura', 'Cultura', 'Conexión', 'Luxe', 'Conciencia'];
  const values = [data.aventura, data.cultura, data.conexion, data.luxe, data.conciencia];
  
  // Calculate pentagon points based on values
  const calculatePoint = (angle: number, value: number) => {
    const radian = (angle * Math.PI) / 180;
    const distance = (radius * value) / 100;
    return {
      x: center.x + distance * Math.cos(radian),
      y: center.y + distance * Math.sin(radian),
    };
  };
  
  // Create pentagon path points in correct order
  const pentagonPoints = values.map((value, index) => 
    calculatePoint(angles[index], value)
  );

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartPlaceholder}>
        {/* Grid circles */}
        <View style={[styles.gridCircle, { width: 180, height: 180 }]} />
        <View style={[styles.gridCircle, { width: 140, height: 140 }]} />
        <View style={[styles.gridCircle, { width: 100, height: 100 }]} />
        <View style={[styles.gridCircle, { width: 60, height: 60 }]} />
        
        {/* Grid lines to pentagon points */}
        {angles.map((angle, index) => {
          const radian = (angle * Math.PI) / 180;
          const endX = center.x + radius * Math.cos(radian);
          const endY = center.y + radius * Math.sin(radian);
          
          return (
            <View
              key={index}
              style={[
                styles.radarLine,
                {
                  left: center.x,
                  top: center.y,
                  width: radius,
                  transform: [
                    { translateX: -1 },
                    { translateY: -1 },
                    { rotate: `${angle + 90}deg` }
                  ],
                }
              ]}
            />
          );
        })}
        
        {/* Pentagon shape with better visibility */}
        <View style={styles.pentagonContainer}>
          {/* Pentagon connecting lines */}
          {pentagonPoints.map((point, index) => {
            const nextPoint = pentagonPoints[(index + 1) % pentagonPoints.length];
            const lineLength = Math.sqrt(
              Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
            );
            const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
            
            return (
              <View
                key={index}
                style={[
                  styles.pentagonEdge,
                  {
                    left: point.x,
                    top: point.y,
                    width: lineLength,
                    transform: [
                      { translateY: -1 },
                      { rotate: `${angle}deg` }
                    ],
                  }
                ]}
              />
            );
          })}
          
          {/* Pentagon points */}
          {pentagonPoints.map((point, index) => (
            <View
              key={index}
              style={[
                styles.pentagonPoint,
                {
                  left: point.x - 4,
                  top: point.y - 4,
                }
              ]}
            />
          ))}
        </View>
        
        {/* Labels positioned around the chart */}
        {angles.map((angle, index) => {
          const radian = (angle * Math.PI) / 180;
          const labelRadius = radius + 25;
          const x = center.x + labelRadius * Math.cos(radian);
          const y = center.y + labelRadius * Math.sin(radian);
          
          return (
            <Text
              key={index}
              style={[
                styles.chartLabel,
                {
                  position: 'absolute',
                  left: x - 30,
                  top: y - 10,
                  width: 60,
                }
              ]}
            >
              {labels[index]}
            </Text>
          );
        })}
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <Animated.View style={styles.header} entering={SlideInUp.duration(150)}>
        <Text style={styles.title}>Tu Perfil</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#000000" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={styles.content} entering={FadeIn.duration(200).delay(50)}>
        <Animated.View entering={SlideInUp.duration(200).delay(75)}>
          <RadarChart data={profileData} />
        </Animated.View>
        
        <Animated.View style={styles.sectionContainer} entering={SlideInLeft.duration(200).delay(100)}>
          <Text style={styles.sectionTitle}>Tu Espejo Digital</Text>
          <Text style={styles.sectionSubtitle}>
            Estos valores reflejan tu personalidad y preferencias de viaje
          </Text>
          
          <View style={styles.barsContainer}>
            {Object.entries(profileData).map(([key, value], index) => {
              const labels = {
                aventura: 'Aventura',
                cultura: 'Cultura',
                conexion: 'Conexión',
                luxe: 'Luxe',
                conciencia: 'Conciencia',
              };
              
              return (
                <Animated.View 
                  key={key} 
                  style={styles.barItem}
                  entering={SlideInLeft.duration(300).delay(300 + index * 75)}
                >
                  <Text style={styles.barLabel}>{labels[key as keyof ProfileData]}</Text>
                  <View style={styles.barContainer}>
                    <View style={styles.barBackground}>
                      <Animated.View 
                        style={[styles.barFill, { width: `${value}%` }]}
                        entering={SlideInLeft.duration(400).delay(400 + index * 75)}
                      />
                    </View>
                  </View>
                  <Text style={styles.barPercentage}>{value}%</Text>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </ScrollView>
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
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 24,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginBottom: 32,
    position: 'relative',
  },
  chartPlaceholder: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gridCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 100,
  },
  radarLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E5E7EB',
    transformOrigin: '0 0',
  },
  pentagonContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  pentagonEdge: {
    position: 'absolute',
    height: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    transformOrigin: '0 50%',
  },
  pentagonPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#000000',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
    position: 'absolute',
    fontWeight: '500',
  },
  labelTop: {
    top: -10,
    left: -25,
    width: 50,
  },
  labelTopRight: {
    top: 20,
    right: -25,
    width: 50,
  },
  labelBottomRight: {
    bottom: 20,
    right: -25,
    width: 50,
  },
  labelBottomLeft: {
    bottom: 20,
    left: -25,
    width: 50,
  },
  labelTopLeft: {
    top: 20,
    left: -25,
    width: 50,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  barsContainer: {
    gap: 16,
  },
  barItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    width: 80,
    fontSize: 16,
    color: '#374151',
  },
  barContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  barPercentage: {
    width: 48,
    textAlign: 'right',
    fontSize: 16,
    color: '#374151',
  },
});