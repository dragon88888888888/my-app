import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, {
  FadeIn,
  SlideInUp,
  SlideInLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface AstralProfile {
  signo: string;
  elemento: string;
  descripcion: string;
  nivel: number;
}

interface ProfileData {
  aventura: number;
  cultura: number;
  conexion: number;
  luxe: number;
  conciencia: number;
}

// Datos mock del perfil astral - esto se reemplazará con datos reales del agente
const astralProfile: AstralProfile = {
  signo: 'El Explorador Lunar',
  elemento: 'Agua-Aire',
  descripcion: 'Tu espíritu viajero se guía por la intuición y la curiosidad. Buscas experiencias que nutran tanto tu mente como tu alma.',
  nivel: 42,
};

const profileData: ProfileData = {
  aventura: 95,
  cultura: 88,
  conexion: 92,
  luxe: 66,
  conciencia: 90,
};

const StatCard = ({ label, value, icon, delay }: { label: string; value: number; icon: any; delay: number }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value / 100, { duration: 1000 });
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${interpolate(progress.value, [0, 1], [0, 100], Extrapolate.CLAMP)}%`,
    };
  });

  return (
    <Animated.View
      style={styles.statCard}
      entering={SlideInLeft.duration(400).delay(delay)}
    >
      <View style={styles.statHeader}>
        <View style={styles.statIconContainer}>
          {icon}
        </View>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
      <View style={styles.statBarBackground}>
        <Animated.View style={[styles.statBarFill, animatedStyle]} />
      </View>
    </Animated.View>
  );
};

const AstralCard = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scale.value, [1, 1.05], [0.3, 0.6]),
    };
  });

  return (
    <Animated.View
      style={styles.astralCardContainer}
      entering={FadeIn.duration(600).delay(200)}
    >
      {/* Glow effect */}
      <Animated.View style={[styles.astralGlow, glowStyle]} />

      {/* Rotating outer ring */}
      <Animated.View style={[styles.astralRingOuter, animatedStyle]}>
        <View style={styles.astralRingSegment1} />
        <View style={styles.astralRingSegment2} />
        <View style={styles.astralRingSegment3} />
      </Animated.View>

      {/* Static inner content */}
      <View style={styles.astralContent}>
        <Text style={styles.astralSigno}>{astralProfile.signo}</Text>
        <Text style={styles.astralElemento}>{astralProfile.elemento}</Text>
        <View style={styles.astralLevel}>
          <Text style={styles.astralLevelLabel}>Nivel</Text>
          <Text style={styles.astralLevelValue}>{astralProfile.nivel}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const PentagonChart = ({ data }: { data: ProfileData }) => {
  const center = { x: 100, y: 100 };
  const radius = 70;

  const angles = [-90, -18, 54, 126, 198];
  const labels = ['Aventura', 'Cultura', 'Conexión', 'Luxe', 'Conciencia'];
  const values = [data.aventura, data.cultura, data.conexion, data.luxe, data.conciencia];

  const calculatePoint = (angle: number, value: number) => {
    const radian = (angle * Math.PI) / 180;
    const distance = (radius * value) / 100;
    return {
      x: center.x + distance * Math.cos(radian),
      y: center.y + distance * Math.sin(radian),
    };
  };

  const pentagonPoints = values.map((value, index) =>
    calculatePoint(angles[index], value)
  );

  const pulseAnimation = useSharedValue(1);

  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedPulse = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  return (
    <Animated.View
      style={styles.chartContainer}
      entering={SlideInUp.duration(500).delay(300)}
    >
      <Animated.View style={[styles.chartContent, animatedPulse]}>
        {/* Grid circles */}
        {[1, 0.75, 0.5, 0.25].map((scale, idx) => (
          <View
            key={idx}
            style={[
              styles.gridCircle,
              {
                width: radius * 2 * scale,
                height: radius * 2 * scale,
              }
            ]}
          />
        ))}

        {/* Grid lines */}
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
                    { translateX: -0.5 },
                    { translateY: -0.5 },
                    { rotate: `${angle + 90}deg` }
                  ],
                }
              ]}
            />
          );
        })}

        {/* Pentagon shape */}
        <View style={styles.pentagonContainer}>
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
                      { translateY: -1.5 },
                      { rotate: `${angle}deg` }
                    ],
                  }
                ]}
              />
            );
          })}

          {pentagonPoints.map((point, index) => (
            <View
              key={index}
              style={[
                styles.pentagonPoint,
                {
                  left: point.x - 5,
                  top: point.y - 5,
                }
              ]}
            />
          ))}
        </View>

        {/* Labels */}
        {angles.map((angle, index) => {
          const radian = (angle * Math.PI) / 180;
          const labelRadius = radius + 30;
          const x = center.x + labelRadius * Math.cos(radian);
          const y = center.y + labelRadius * Math.sin(radian);

          return (
            <View
              key={index}
              style={[
                styles.chartLabelContainer,
                {
                  left: x - 35,
                  top: y - 12,
                }
              ]}
            >
              <Text style={styles.chartLabel}>{labels[index]}</Text>
              <Text style={styles.chartValue}>{values[index]}</Text>
            </View>
          );
        })}
      </Animated.View>
    </Animated.View>
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

      <Animated.View style={styles.header} entering={SlideInUp.duration(300)}>
        <View>
          <Text style={styles.title}>Tu Perfil Astral</Text>
          <Text style={styles.subtitle}>Viajero Nivel {astralProfile.nivel}</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <IconSymbol name="gearshape.fill" size={24} color="#374151" />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.content}>
        {/* Astral Card */}
        <AstralCard />

        {/* Descripción */}
        <Animated.View
          style={styles.descriptionContainer}
          entering={FadeIn.duration(500).delay(400)}
        >
          <Text style={styles.descriptionText}>{astralProfile.descripcion}</Text>
        </Animated.View>

        {/* Pentagon Chart */}
        <View style={styles.chartSection}>
          <Animated.Text
            style={styles.sectionTitle}
            entering={SlideInLeft.duration(400).delay(500)}
          >
            Diagrama de Experiencias
          </Animated.Text>
          <PentagonChart data={profileData} />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <Animated.Text
            style={styles.sectionTitle}
            entering={SlideInLeft.duration(400).delay(600)}
          >
            Atributos del Viajero
          </Animated.Text>

          <StatCard
            label="Espíritu de Aventura"
            value={profileData.aventura}
            icon={<IconSymbol name="leaf.fill" size={20} color="#000000" />}
            delay={700}
          />
          <StatCard
            label="Consciencia Cultural"
            value={profileData.cultura}
            icon={<IconSymbol name="sparkles" size={20} color="#000000" />}
            delay={800}
          />
          <StatCard
            label="Conexión Humana"
            value={profileData.conexion}
            icon={<IconSymbol name="heart" size={20} color="#000000" />}
            delay={900}
          />
          <StatCard
            label="Apreciación del Luxe"
            value={profileData.luxe}
            icon={<IconSymbol name="dollarsign" size={20} color="#000000" />}
            delay={1000}
          />
          <StatCard
            label="Conciencia Ecológica"
            value={profileData.conciencia}
            icon={<IconSymbol name="leaf.fill" size={20} color="#000000" />}
            delay={1100}
          />
        </View>

        {/* Footer spacer */}
        <View style={styles.footer} />
      </View>
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
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingHorizontal: 24,
  },

  // Astral Card Styles
  astralCardContainer: {
    height: 240,
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  astralGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#000000',
    opacity: 0.1,
  },
  astralRingOuter: {
    position: 'absolute',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  astralRingSegment1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  astralRingSegment2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderColor: '#374151',
    borderStyle: 'dotted',
  },
  astralRingSegment3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: '#9CA3AF',
  },
  astralContent: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  astralSigno: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  astralElemento: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  astralLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  astralLevelLabel: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  astralLevelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Description
  descriptionContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 32,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Chart Section
  chartSection: {
    marginBottom: 32,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 280,
    marginTop: 16,
  },
  chartContent: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  gridCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 1000,
    transform: [{ translateX: -70 }, { translateY: -70 }],
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
    height: 3,
    backgroundColor: '#000000',
    transformOrigin: '0 50%',
  },
  pentagonPoint: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: '#000000',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chartLabelContainer: {
    position: 'absolute',
    width: 70,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 11,
    color: '#374151',
    textAlign: 'center',
    fontWeight: '600',
  },
  chartValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  statBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 3,
  },
  footer: {
    height: 40,
  },
});
