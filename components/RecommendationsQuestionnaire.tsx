import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { useUser } from '@clerk/clerk-expo';
import { UserService } from '@/lib/userService';

interface Question {
  id: number;
  question: string;
  subtitle: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿En qué momento de tu vida te encuentras?',
    subtitle: 'Ayúdanos a entender tu situación actual para personalizar tu experiencia',
    options: [
      'En búsqueda de nuevos rumbos',
      'Necesito reconectar conmigo mismo/a',
      'Celebrando un logro o transición',
      'Sanando de una pérdida o ruptura',
      'Explorando nuevas facetas de mi personalidad',
      'Buscando claridad sobre mi futuro'
    ]
  },
  {
    id: 2,
    question: '¿Qué aspectos de ti mismo/a te gustaría explorar o fortalecer?',
    subtitle: 'Selecciona lo que más resuena contigo en este momento',
    options: [
      'Creatividad e inspiración',
      'Confianza y valentía',
      'Paz interior y equilibrio',
      'Conexión espiritual',
      'Liderazgo y determinación',
      'Compasión y empatía',
      'Intuición y sabiduría'
    ]
  },
  {
    id: 3,
    question: '¿Cuál es tu intención principal para este viaje?',
    subtitle: 'Define el propósito que guiará tu experiencia transformadora',
    options: [
      'Sanar heridas emocionales',
      'Celebrar un momento especial',
      'Reconectar con la naturaleza',
      'Explorar mi espiritualidad',
      'Desafiar mis límites',
      'Encontrar inspiración creativa',
      'Fortalecer una relación importante'
    ]
  },
  {
    id: 4,
    question: '¿Qué te gustaría que este viaje transforme en tu vida?',
    subtitle: 'Visualiza el cambio que buscas lograr',
    options: [
      'Mi perspectiva sobre un problema',
      'Mi relación conmigo mismo/a',
      'Mi conexión con otros',
      'Mi propósito de vida',
      'Mis miedos o limitaciones',
      'Mi nivel de energía y vitalidad'
    ]
  },
  {
    id: 5,
    question: '¿Qué tipo de actividades nutren más tu alma?',
    subtitle: 'Elige las experiencias que te conectan profundamente contigo',
    options: [
      'Rituales y ceremonias ancestrales',
      'Meditación y contemplación',
      'Arte y expresión creativa',
      'Aventura física y deportes',
      'Conexión con comunidades locales',
      'Gastronomía consciente',
      'Terapias holísticas y bienestar'
    ]
  },
  {
    id: 6,
    question: '¿Cómo prefieres procesar las experiencias profundas?',
    subtitle: 'Tu forma natural de integrar y reflexionar sobre lo vivido',
    options: [
      'En solitud y silencio',
      'Compartiendo con otros viajeros',
      'A través del movimiento corporal',
      'Mediante la escritura o arte',
      'En contacto con la naturaleza',
      'Con guía de mentores o maestros'
    ]
  },
  {
    id: 7,
    question: '¿Qué tipo de entorno te ayuda a conectar mejor contigo mismo/a?',
    subtitle: 'El escenario ideal para tu transformación personal',
    options: [
      'Montañas y alturas',
      'Océano y costas',
      'Selvas y bosques',
      'Desiertos y espacios amplios',
      'Ciudades con historia ancestral',
      'Lugares sagrados y templos',
      'Comunidades rurales auténticas'
    ]
  },
  {
    id: 8,
    question: '¿Qué nivel de comodidad prefieres durante tu transformación?',
    subtitle: 'Encuentra el balance perfecto para tu experiencia',
    options: [
      'Lujo consciente (comfort + propósito)',
      'Simplicidad auténtica',
      'Experiencias rústicas transformadoras',
      'Balance entre comodidad y desafío'
    ]
  },
  {
    id: 9,
    question: '¿Cómo sabrás que el viaje cumplió su propósito?',
    subtitle: 'Define tu indicador personal de transformación exitosa',
    options: [
      'Me siento más en paz conmigo mismo/a',
      'Tengo claridad sobre mis próximos pasos',
      'He sanado algo que me dolía',
      'Siento renovada mi energía vital',
      'He conectado profundamente con algo mayor',
      'Regreso con herramientas para mi día a día'
    ]
  }
];

interface RecommendationsQuestionnaireProps {
  onComplete: (answers: { [key: number]: string }) => void;
}

export default function RecommendationsQuestionnaire({ onComplete }: RecommendationsQuestionnaireProps) {
  const { user } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (currentAnswer.trim() !== '') {
      const newAnswers = {
        ...answers,
        [questions[currentQuestion].id]: currentAnswer
      };
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setCurrentAnswer('');
      } else {
        // Guardar en BD antes de completar
        await savePreferences(newAnswers);
        onComplete(newAnswers);
      }
    }
  };

  const savePreferences = async (finalAnswers: { [key: number]: string }) => {
    if (!user) {
      console.error('No user found');
      return;
    }

    setSaving(true);

    try {
      // Obtener el usuario de Supabase
      const supabaseUser = await UserService.getUserByClerkId(user.id);

      if (!supabaseUser) {
        console.error('User not found in Supabase');
        return;
      }

      // Guardar las preferencias de viaje
      const result = await UserService.saveTravelPreferences(supabaseUser.id, finalAnswers);

      if (result) {
        console.log('Preferencias de viaje guardadas exitosamente');
      } else {
        console.error('Error guardando preferencias de viaje');
      }
    } catch (error) {
      console.error('Error in savePreferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers[questions[currentQuestion - 1].id];
      setCurrentAnswer(previousAnswer || '');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const isAnswerValid = currentAnswer.trim() !== '';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} disabled={currentQuestion === 0}>
          <IconSymbol
            name="chevron.left"
            size={24}
            color={currentQuestion === 0 ? '#E5E7EB' : '#374151'}
          />
        </TouchableOpacity>
        <Text style={styles.progressText}>
          {currentQuestion + 1} de {questions.length}
        </Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressFill, { width: `${progress}%` }]}
            entering={FadeIn.duration(300)}
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={styles.questionContainer}
          entering={SlideInUp.duration(400)}
          key={currentQuestion}
        >
          <Text style={styles.questionText}>{currentQ.question}</Text>
          <Text style={styles.subtitleText}>{currentQ.subtitle}</Text>
        </Animated.View>

        <Animated.View
          style={styles.optionsContainer}
          entering={SlideInUp.duration(400).delay(100)}
        >
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                currentAnswer === option && styles.optionButtonSelected
              ]}
              onPress={() => setCurrentAnswer(option)}
            >
              <View style={[
                styles.optionCircle,
                currentAnswer === option && styles.optionCircleSelected
              ]}>
                {currentAnswer === option && (
                  <View style={styles.optionCircleInner} />
                )}
              </View>
              <Text style={[
                styles.optionText,
                currentAnswer === option && styles.optionTextSelected
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isAnswerValid ? styles.continueButtonEnabled : styles.continueButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!isAnswerValid || saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Text style={[
                styles.continueButtonText,
                isAnswerValid && styles.continueButtonTextEnabled
              ]}>
                {isLastQuestion ? 'Ver Recomendaciones' : 'Continuar'}
              </Text>
              {!isLastQuestion && (
                <IconSymbol
                  name="chevron.right"
                  size={16}
                  color={isAnswerValid ? '#FFFFFF' : '#9CA3AF'}
                />
              )}
            </>
          )}
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  spacer: {
    width: 24,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  progressBackground: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionContainer: {
    marginBottom: 32,
  },
  questionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 32,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: '#000000',
    backgroundColor: '#F9FAFB',
  },
  optionCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionCircleSelected: {
    borderColor: '#000000',
  },
  optionCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: '#111827',
  },
  footer: {
    padding: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonEnabled: {
    backgroundColor: '#000000',
  },
  continueButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  continueButtonTextEnabled: {
    color: '#FFFFFF',
  },
});