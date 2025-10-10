import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, PanResponder } from 'react-native';
import { Image } from 'expo-image';
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
  sostenibilidad: number;
  cultura: number;
  conexion: number;
  lujo: number;
}

interface SecondaryAttributes {
  exploradorIntensivo: number;
  viajeroContemplativo: number;
  cazadorExperiencias: number;
  arquitectoViaje: number;
  naveganteLibre: number;
  exploradorEquilibrado: number;
  transformacionPersonal: number;
  contribucionSocial: number;
  inspiracionCreativa: number;
  coleccionistaHistorias: number;
}

// Datos mock del perfil astral - esto se reemplazará con datos reales del agente
const astralProfile: AstralProfile = {
  signo: 'El Explorador Lunar',
  elemento: 'Agua-Aire',
  descripcion: 'Tu espíritu viajero se guía por la intuición y la curiosidad. Buscas experiencias que nutran tanto tu mente como tu alma.',
  nivel: 42,
};

const initialProfileData: ProfileData = {
  aventura: 25,
  sostenibilidad: 20,
  cultura: 20,
  conexion: 20,
  lujo: 15,
};

const initialSecondaryAttributes: SecondaryAttributes = {
  exploradorIntensivo: 15,
  viajeroContemplativo: 40,
  cazadorExperiencias: 10,
  arquitectoViaje: 5,
  naveganteLibre: 30,
  exploradorEquilibrado: 0,
  transformacionPersonal: 35,
  contribucionSocial: 25,
  inspiracionCreativa: 20,
  coleccionistaHistorias: 20,
};

const CustomSlider = ({
  value,
  onValueChange,
  color
}: {
  value: number;
  onValueChange: (value: number) => void;
  color: string;
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const locationX = evt.nativeEvent.locationX;
      const percentage = Math.max(0, Math.min(100, (locationX / sliderWidth) * 100));
      onValueChange(percentage);
    },
    onPanResponderMove: (evt) => {
      const locationX = evt.nativeEvent.locationX;
      const percentage = Math.max(0, Math.min(100, (locationX / sliderWidth) * 100));
      onValueChange(percentage);
    },
  });

  return (
    <View
      style={styles.sliderTrack}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={[styles.sliderFill, { width: `${value}%`, backgroundColor: color }]} />
      <View style={[styles.sliderThumb, { left: `${value}%`, backgroundColor: color }]} />
    </View>
  );
};

const EditableStatBar = ({
  label,
  value,
  emoji,
  onChange,
  color = '#000000'
}: {
  label: string;
  value: number;
  emoji: string;
  onChange: (value: number) => void;
  color?: string;
}) => {
  return (
    <View style={styles.sliderCard}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderEmoji}>{emoji}</Text>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{Math.round(value)}</Text>
      </View>
      <CustomSlider value={value} onValueChange={onChange} color={color} />
    </View>
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

      {/* Static inner content - Profile Picture */}
      <View style={styles.astralContent}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80' }}
          style={styles.profileImage}
          contentFit="cover"
        />
      </View>
    </Animated.View>
  );
};

const PentagonChart = ({ data }: { data: ProfileData }) => {
  const center = { x: 150, y: 150 };
  const radius = 120;
  const minRadius = 20; // Radio mínimo para que el pentágono siempre sea visible

  const angles = [-90, -18, 54, 126, 198];
  const labels = ['Aventura', 'Sostenible', 'Cultura', 'Conexión', 'Lujo'];
  const values = [data.aventura, data.sostenibilidad, data.cultura, data.conexion, data.lujo];
  const colors = ['#EF4444', '#10B981', '#8B5CF6', '#F59E0B', '#3B82F6'];

  const calculatePoint = (angle: number, value: number) => {
    const radian = (angle * Math.PI) / 180;
    // Mapear el valor de 0-100 a minRadius-radius para que siempre sea visible
    const distance = minRadius + ((radius - minRadius) * value) / 100;
    return {
      x: center.x + distance * Math.cos(radian),
      y: center.y + distance * Math.sin(radian),
    };
  };

  const pentagonPoints = values.map((value, index) =>
    calculatePoint(angles[index], value)
  );

  // Función para calcular puntos del pentágono a diferentes escalas
  const createPentagonPath = (scale: number) => {
    const points = angles.map(angle => {
      const radian = (angle * Math.PI) / 180;
      return {
        x: center.x + (radius * scale) * Math.cos(radian),
        y: center.y + (radius * scale) * Math.sin(radian),
      };
    });
    return points;
  };

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
        {/* Grid pentagons */}
        {[1, 0.75, 0.5, 0.25].map((scale, idx) => {
          const pentagonGridPoints = createPentagonPath(scale);
          return (
            <View key={idx} style={styles.gridPentagonContainer}>
              {pentagonGridPoints.map((point, index) => {
                const nextPoint = pentagonGridPoints[(index + 1) % pentagonGridPoints.length];
                const lineLength = Math.sqrt(
                  Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2)
                );
                const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);

                return (
                  <View
                    key={index}
                    style={[
                      styles.gridPentagonEdge,
                      {
                        left: point.x,
                        top: point.y,
                        width: lineLength,
                        transform: [
                          { translateY: -0.5 },
                          { rotate: `${angle}deg` }
                        ],
                      }
                    ]}
                  />
                );
              })}
            </View>
          );
        })}

        {/* Grid lines */}
        {angles.map((angle, index) => {
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
                    backgroundColor: colors[index],
                    transform: [
                      { translateY: -1 },
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
                  left: point.x - 6,
                  top: point.y - 6,
                  backgroundColor: colors[index],
                  borderColor: colors[index],
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
                  left: x - 45,
                  top: y - 20,
                }
              ]}
            >
              <Text style={styles.chartLabel}>{labels[index]}</Text>
              <View style={[styles.chartValueBadge, { backgroundColor: colors[index] }]}>
                <Text style={styles.chartValue}>{Math.round(values[index])}</Text>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const [profileData, setProfileData] = React.useState<ProfileData>(initialProfileData);
  const [secondaryAttrs, setSecondaryAttrs] = React.useState<SecondaryAttributes>(initialSecondaryAttributes);

  const totalPrimaryPoints = Object.values(profileData).reduce((sum, val) => sum + val, 0);
  const totalSecondaryPoints = Object.values(secondaryAttrs).reduce((sum, val) => sum + val, 0);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handlePrimaryChange = (key: keyof ProfileData, newValue: number) => {
    newValue = Math.round(newValue); // Asegurar números enteros
    const diff = newValue - profileData[key];
    const others = Object.keys(profileData).filter(k => k !== key) as (keyof ProfileData)[];
    const othersTotal = others.reduce((sum, k) => sum + profileData[k], 0);

    if (othersTotal === 0 && diff > 0) return;

    const newData = { ...profileData, [key]: newValue };

    others.forEach(k => {
      const proportion = othersTotal > 0 ? profileData[k] / othersTotal : 1 / others.length;
      newData[k] = Math.max(0, Math.round(profileData[k] - (diff * proportion)));
    });

    const sum = Object.values(newData).reduce((s, v) => s + v, 0);
    if (sum > 0) {
      Object.keys(newData).forEach(k => {
        newData[k as keyof ProfileData] = Math.round((newData[k as keyof ProfileData] / sum) * 100);
      });
    }

    setProfileData(newData);
  };

  const handleSecondaryChange = (key: keyof SecondaryAttributes, newValue: number) => {
    newValue = Math.round(newValue); // Asegurar números enteros
    const diff = newValue - secondaryAttrs[key];
    const others = Object.keys(secondaryAttrs).filter(k => k !== key) as (keyof SecondaryAttributes)[];
    const othersTotal = others.reduce((sum, k) => sum + secondaryAttrs[k], 0);

    if (othersTotal === 0 && diff > 0) return;

    const newData = { ...secondaryAttrs, [key]: newValue };

    others.forEach(k => {
      const proportion = othersTotal > 0 ? secondaryAttrs[k] / othersTotal : 1 / others.length;
      newData[k] = Math.max(0, Math.round(secondaryAttrs[k] - (diff * proportion)));
    });

    const sum = Object.values(newData).reduce((s, v) => s + v, 0);
    if (sum > 0) {
      Object.keys(newData).forEach(k => {
        newData[k as keyof SecondaryAttributes] = Math.round((newData[k as keyof SecondaryAttributes] / sum) * 100);
      });
    }

    setSecondaryAttrs(newData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Animated.View style={styles.header} entering={SlideInUp.duration(300)}>
        <View>
          <Text style={styles.title}>Tu Perfil</Text>
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
            Perfil del Viajero
          </Animated.Text>
          <PentagonChart data={profileData} />
        </View>

        {/* Dimensiones Principales */}
        <View style={styles.statsSection}>
          <Animated.Text
            style={styles.sectionTitle}
            entering={SlideInLeft.duration(400).delay(600)}
          >
            Dimensiones Principales (100 pts)
          </Animated.Text>

          <EditableStatBar
            emoji="🏔️"
            label="Espíritu Aventurero"
            value={profileData.aventura}
            onChange={(v) => handlePrimaryChange('aventura', v)}
            color="#EF4444"
          />

          <EditableStatBar
            emoji="🌱"
            label="Conciencia Sostenible"
            value={profileData.sostenibilidad}
            onChange={(v) => handlePrimaryChange('sostenibilidad', v)}
            color="#10B981"
          />

          <EditableStatBar
            emoji="🎭"
            label="Inmersión Cultural"
            value={profileData.cultura}
            onChange={(v) => handlePrimaryChange('cultura', v)}
            color="#8B5CF6"
          />

          <EditableStatBar
            emoji="❤️"
            label="Conexión Humana"
            value={profileData.conexion}
            onChange={(v) => handlePrimaryChange('conexion', v)}
            color="#F59E0B"
          />

          <EditableStatBar
            emoji="✨"
            label="Apreciación del Lujo"
            value={profileData.lujo}
            onChange={(v) => handlePrimaryChange('lujo', v)}
            color="#3B82F6"
          />
        </View>

        {/* Ritmo de Viaje */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Ritmo de Viaje</Text>
          <EditableStatBar
            emoji="🎯"
            label="Explorador Intensivo"
            value={secondaryAttrs.exploradorIntensivo}
            onChange={(v) => handleSecondaryChange('exploradorIntensivo', v)}
            color="#DC2626"
          />
          <EditableStatBar
            emoji="🧘"
            label="Viajero Contemplativo"
            value={secondaryAttrs.viajeroContemplativo}
            onChange={(v) => handleSecondaryChange('viajeroContemplativo', v)}
            color="#059669"
          />
          <EditableStatBar
            emoji="📸"
            label="Cazador de Experiencias"
            value={secondaryAttrs.cazadorExperiencias}
            onChange={(v) => handleSecondaryChange('cazadorExperiencias', v)}
            color="#7C3AED"
          />
        </View>

        {/* Estilo de Planificación */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estilo de Planificación</Text>
          <EditableStatBar
            emoji="📋"
            label="Arquitecto del Viaje"
            value={secondaryAttrs.arquitectoViaje}
            onChange={(v) => handleSecondaryChange('arquitectoViaje', v)}
            color="#D97706"
          />
          <EditableStatBar
            emoji="🎲"
            label="Navegante Libre"
            value={secondaryAttrs.naveganteLibre}
            onChange={(v) => handleSecondaryChange('naveganteLibre', v)}
            color="#2563EB"
          />
          <EditableStatBar
            emoji="🗺️"
            label="Explorador Equilibrado"
            value={secondaryAttrs.exploradorEquilibrado}
            onChange={(v) => handleSecondaryChange('exploradorEquilibrado', v)}
            color="#EC4899"
          />
        </View>

        {/* Motivación Principal */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Motivación Principal</Text>
          <EditableStatBar
            emoji="🌟"
            label="Transformación Personal"
            value={secondaryAttrs.transformacionPersonal}
            onChange={(v) => handleSecondaryChange('transformacionPersonal', v)}
            color="#F59E0B"
          />
          <EditableStatBar
            emoji="🤝"
            label="Contribución Social"
            value={secondaryAttrs.contribucionSocial}
            onChange={(v) => handleSecondaryChange('contribucionSocial', v)}
            color="#10B981"
          />
          <EditableStatBar
            emoji="🎨"
            label="Inspiración Creativa"
            value={secondaryAttrs.inspiracionCreativa}
            onChange={(v) => handleSecondaryChange('inspiracionCreativa', v)}
            color="#8B5CF6"
          />
          <EditableStatBar
            emoji="🏛️"
            label="Coleccionista de Historias"
            value={secondaryAttrs.coleccionistaHistorias}
            onChange={(v) => handleSecondaryChange('coleccionistaHistorias', v)}
            color="#EF4444"
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
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
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
    height: 450,
    marginTop: 20,
    marginBottom: 20,
  },
  chartContent: {
    width: 300,
    height: 300,
    position: 'relative',
  },
  gridCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 1000,
    transform: [{ translateX: -120 }, { translateY: -120 }],
  },
  gridPentagonContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  gridPentagonEdge: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#E5E7EB',
    transformOrigin: '0 50%',
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
    transformOrigin: '0 50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  pentagonPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chartLabelContainer: {
    position: 'absolute',
    width: 90,
    alignItems: 'center',
  },
  chartLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 4,
  },
  chartValueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  chartValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  pointsCounter: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pointsText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
  },
  pointsValue: {
    fontWeight: 'bold',
    color: '#000000',
  },
  pointsOverLimit: {
    color: '#EF4444',
  },
  sliderCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sliderEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  sliderValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    minWidth: 40,
    textAlign: 'right',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'relative',
    marginTop: 8,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    top: -8,
    marginLeft: -12,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  footer: {
    height: 40,
  },
});
