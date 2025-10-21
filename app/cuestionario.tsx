import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Platform, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '@clerk/clerk-expo';
import { UserService } from '@/lib/userService';
import AgentsService from '@/lib/agentsService';

interface Question {
  id: number;
  question: string;
  subtitle: string;
  type: 'text' | 'date' | 'time' | 'location' | 'multiple-choice';
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

const questions: Question[] = [
  {
    id: 1,
    question: '¿Cuál es tu nombre o apodo?',
    subtitle: 'Esto le dará un toque personal a tu experiencia',
    type: 'text',
    placeholder: 'Ej: María, Alex, Luna...',
    required: true
  },
  {
    id: 2,
    question: '¿Qué tipo de experiencias buscas cuando viajas?',
    subtitle: 'Tu estilo de viaje preferido nos ayudará a personalizar tus recomendaciones',
    type: 'multiple-choice',
    required: true,
    options: [
      'Aventura y adrenalina',
      'Relajación y bienestar',
      'Cultura e historia',
      'Naturaleza y ecoturismo',
      'Vida nocturna y social',
      'Gastronomía local',
      'Espiritualidad y crecimiento personal'
    ]
  },
  {
    id: 3,
    question: '¿Qué te gustaría descubrir o transformar a través de tus viajes?',
    subtitle: 'Tu motivación personal nos permitirá sugerir experiencias más significativas',
    type: 'multiple-choice',
    required: true,
    options: [
      'Conectar conmigo mismo/a',
      'Conocer nuevas culturas',
      'Superar miedos o límites',
      'Encontrar inspiración creativa',
      'Sanar y renovar energías',
      'Fortalecer relaciones',
      'Vivir aventuras únicas'
    ]
  },
  {
    id: 4,
    question: '¿Cuál es tu fecha de nacimiento?',
    subtitle: 'Necesaria para ubicar el Sol, la Luna y los planetas en tu carta',
    type: 'date',
    required: false
  },
  {
    id: 5,
    question: '¿A qué hora naciste?',
    subtitle: 'Fundamental para calcular tu ascendente y casas astrológicas',
    type: 'time',
    placeholder: 'Si no sabes la hora exacta, usa la aproximada',
    required: false
  },
  {
    id: 6,
    question: '¿En qué ciudad y país naciste?',
    subtitle: 'Necesario para ajustar la posición planetaria según zona horaria',
    type: 'location',
    placeholder: 'Ej: Madrid, España',
    required: false
  }
];

export default function CuestionarioScreen() {
  const { user } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string | Date }>({});
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  const handleTextChange = (text: string) => {
    setCurrentAnswer(text);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      setCurrentAnswer(selectedDate.toLocaleDateString('es-ES'));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedDate(selectedTime);
      setCurrentAnswer(selectedTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      }));
    }
  };

  const handleNext = () => {
    const currentQ = questions[currentQuestion];
    let answerToSave = currentAnswer;

    if (currentQ.type === 'date' || currentQ.type === 'time') {
      answerToSave = selectedDate.toISOString();
    }

    // Validar si la respuesta es requerida
    if (currentQ.required && answerToSave.trim() === '') {
      return; // No continuar si es requerida y está vacía
    }

    // Guardar la respuesta si no está vacía (incluso si es opcional)
    if (answerToSave.trim() !== '') {
      const newAnswers = {
        ...answers,
        [currentQ.id]: answerToSave
      };
      setAnswers(newAnswers);
    }

    // Continuar a la siguiente pregunta o completar
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setCurrentAnswer('');
      setSelectedDate(new Date());
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const previousAnswer = answers[questions[currentQuestion - 1].id];
      setCurrentAnswer(previousAnswer ? String(previousAnswer) : '');
    }
  };

  const handleComplete = async () => {
    if (!user) {
      console.error('No user found');
      router.replace('/(tabs)');
      return;
    }

    // IMPORTANTE: Guardar la última respuesta antes de completar
    const currentQ = questions[currentQuestion];
    let finalAnswers = { ...answers };

    if (currentAnswer.trim() !== '') {
      let answerToSave = currentAnswer;
      if (currentQ.type === 'date' || currentQ.type === 'time') {
        answerToSave = selectedDate.toISOString();
      }
      finalAnswers[currentQ.id] = answerToSave;
    }

    setSaving(true);

    try {
      // Obtener el usuario de Supabase con múltiples reintentos (el AuthGuard puede estar sincronizando)
      let supabaseUser = null;
      let retries = 0;
      const maxRetries = 6;

      while (!supabaseUser && retries < maxRetries) {
        supabaseUser = await UserService.getUserByClerkId(user.id);

        if (!supabaseUser) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      if (!supabaseUser) {
        Alert.alert(
          'Error de Sincronización',
          'No se pudo sincronizar tu usuario. Por favor cierra sesión y vuelve a iniciar.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
        setSaving(false);
        return;
      }

      // Guardar las respuestas del cuestionario usando finalAnswers
      await UserService.saveAstralQuestionnaire(supabaseUser.id, finalAnswers);

      // Si el usuario proporcionó datos de nacimiento, generar perfil astral
      const fecha = finalAnswers[4];
      const hora = finalAnswers[5];
      const lugar = finalAnswers[6];

      if (fecha) {
        try {

          // Formatear fecha para el agente (solo YYYY-MM-DD)
          let fechaFormateada = '';
          if (typeof fecha === 'string') {
            // Si es ISO string, extraer solo la fecha
            if (fecha.includes('T')) {
              fechaFormateada = fecha.split('T')[0];
            } else {
              fechaFormateada = fecha;
            }
          } else if (fecha instanceof Date) {
            fechaFormateada = fecha.toISOString().split('T')[0];
          }

          // Formatear hora (solo HH:MM)
          let horaFormateada = undefined;
          if (hora) {
            if (typeof hora === 'string') {
              // Si es ISO string, extraer solo la hora HH:MM
              if (hora.includes('T')) {
                const dateObj = new Date(hora);
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                horaFormateada = `${hours}:${minutes}`;
              } else {
                horaFormateada = hora;
              }
            } else if (hora instanceof Date) {
              const hours = String(hora.getHours()).padStart(2, '0');
              const minutes = String(hora.getMinutes()).padStart(2, '0');
              horaFormateada = `${hours}:${minutes}`;
            }
          }

          // Formatear lugar (verificar si existe y no está vacío)
          let lugarFormateado = undefined;
          if (lugar && typeof lugar === 'string' && lugar.trim() !== '') {
            lugarFormateado = lugar.trim();
          }

          // Llamar al agente astral
          await AgentsService.generateAstroProfile({
            user_id: supabaseUser.id,
            nombre: finalAnswers[1] ? String(finalAnswers[1]).trim() : undefined,
            experiencias_viaje: finalAnswers[2] ? String(finalAnswers[2]).trim() : undefined,
            transformacion_viaje: finalAnswers[3] ? String(finalAnswers[3]).trim() : undefined,
            fecha_nacimiento: fechaFormateada,
            hora_nacimiento: horaFormateada,
            lugar_nacimiento: lugarFormateado,
          });

          // Mostrar mensaje de éxito
          Alert.alert(
            '¡Perfil Creado!',
            'Tu perfil astrológico ha sido generado. Puedes verlo en la sección de Perfil.',
            [{ text: 'OK' }]
          );
        } catch (astroError) {
          console.error('Error generando perfil astral:', astroError);
          // No bloqueamos el flujo si falla el perfil astral
          Alert.alert(
            'Perfil Parcial',
            'Tus respuestas se guardaron, pero no se pudo generar el perfil astral. Puedes intentarlo más tarde desde tu perfil.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
      Alert.alert(
        'Error',
        'Hubo un problema al guardar tu información. Por favor intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
      router.replace('/(tabs)');
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;

  // Validación según el tipo de pregunta
  const isAnswerValid = currentQ.required ? currentAnswer.trim() !== '' : true;

  const renderInputField = () => {
    switch (currentQ.type) {
      case 'multiple-choice':
        return (
          <View style={styles.optionsContainer}>
            {currentQ.options?.map((option, index) => (
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
          </View>
        );

      case 'text':
      case 'location':
        return (
          <TextInput
            style={styles.textInput}
            value={currentAnswer}
            onChangeText={handleTextChange}
            placeholder={currentQ.placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={currentQ.type === 'location'}
            numberOfLines={currentQ.type === 'location' ? 2 : 1}
          />
        );

      case 'date':
        return (
          <View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateButtonText, currentAnswer && styles.dateButtonTextFilled]}>
                {currentAnswer || 'Selecciona tu fecha de nacimiento'}
              </Text>
              <IconSymbol name="calendar" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
        );

      case 'time':
        return (
          <View>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.dateButtonText, currentAnswer && styles.dateButtonTextFilled]}>
                {currentAnswer || 'Selecciona tu hora de nacimiento'}
              </Text>
              <IconSymbol name="clock" size={20} color="#6B7280" />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
        );


      default:
        return null;
    }
  };

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
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQ.question}</Text>
          <Text style={styles.subtitleText}>{currentQ.subtitle}</Text>
        </View>

        <View style={styles.inputContainer}>
          {renderInputField()}
          {currentQ.placeholder && currentQ.type !== 'date' && currentQ.type !== 'time' && (
            <Text style={styles.hintText}>{currentQ.placeholder}</Text>
          )}
        </View>
      </View>

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
                {isLastQuestion ? 'Completar' : 'Continuar'}
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
    backgroundColor: '#374151',
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
  inputContainer: {
    gap: 16,
  },
  textInput: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#374151',
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
  dateButtonTextFilled: {
    color: '#374151',
  },
  hintText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
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
  optionsContainer: {
    gap: 12,
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
    borderColor: '#374151',
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
    borderColor: '#374151',
  },
  optionCircleInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#374151',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: '#111827',
  },
});