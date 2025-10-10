import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@clerk/clerk-expo';
import { UserService } from '@/lib/userService';
import { useRouter } from 'expo-router';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestionCard {
  id: number;
  icon: string;
  title: string;
  prompt: string;
}

const SUGGESTIONS: SuggestionCard[] = [
  {
    id: 1,
    icon: 'location.fill',
    title: 'Ayúdame a planificar mi próximo viaje',
    prompt: 'Quiero planificar un viaje, ¿por dónde empiezo?'
  },
  {
    id: 2,
    icon: 'sparkles',
    title: 'Recomiéndame destinos según mis preferencias',
    prompt: 'Quiero que me recomiendes destinos basados en mis preferencias de viaje'
  },
  {
    id: 3,
    icon: 'calendar',
    title: 'Cuál es la mejor época para viajar',
    prompt: '¿Cuál es la mejor época del año para viajar a mi destino favorito?'
  },
  {
    id: 4,
    icon: 'globe',
    title: 'Dame tips para viajar como un local',
    prompt: 'Dame consejos para experimentar el destino como un local'
  }
];

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState('');
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadUserName();
  }, [user]);

  const loadUserName = async () => {
    if (user?.id) {
      const supabaseUser = await UserService.getUserByClerkId(user.id);
      if (supabaseUser?.name) {
        setUserName(supabaseUser.name);
      } else {
        // Fallback al nombre de Clerk
        setUserName(user.firstName || '');
      }
    }
  };

  const handleSendMessage = (text?: string) => {
    const messageToSend = text || message.trim();

    if (messageToSend) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: messageToSend,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newUserMessage]);
      setMessage('');

      // Simulate bot response
      setTimeout(() => {
        const botResponse: Message = {
          id: Date.now() + 1,
          text: 'Gracias por tu pregunta. Como asistente de viajes, puedo ayudarte con destinos, consejos de viaje y planificación. ¿Hay algo específico que te gustaría saber?',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleSuggestionPress = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton}>
          <IconSymbol name="line.3.horizontal" size={24} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <IconSymbol name="sparkles" size={20} color="#111827" />
          <Text style={styles.headerTitleText}>Nova</Text>
        </View>

        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/recommendations')}
        >
          <IconSymbol name="magnifyingglass" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        {messages.length === 0 ? (
          <ScrollView
            style={styles.emptyStateScrollView}
            contentContainerStyle={styles.emptyStateContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>
                Hola, {userName || ''}
              </Text>
              <Text style={styles.welcomeSubtitle}>
                ¿Cómo puedo ayudarte hoy?
              </Text>
            </View>

            <View style={styles.suggestionsGrid}>
              {SUGGESTIONS.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionCard}
                  onPress={() => handleSuggestionPress(suggestion.prompt)}
                  activeOpacity={0.7}
                >
                  <View style={styles.suggestionIconContainer}>
                    <IconSymbol
                      name={suggestion.icon}
                      size={24}
                      color="#6B7280"
                    />
                  </View>
                  <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  msg.sender === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.sender === 'user' ? styles.userMessageText : styles.botMessageText
                ]}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Pregúntame cualquier cosa..."
            placeholderTextColor="#9CA3AF"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              message.trim() ? styles.sendButtonActive : styles.sendButtonInactive
            ]}
            onPress={() => handleSendMessage()}
            disabled={!message.trim()}
          >
            <IconSymbol
              name="arrow.up"
              size={20}
              color={message.trim() ? '#FFFFFF' : '#9CA3AF'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  contentContainer: {
    flex: 1,
  },
  emptyStateScrollView: {
    flex: 1,
  },
  emptyStateContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  welcomeSection: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 42,
  },
  welcomeSubtitle: {
    fontSize: 20,
    color: '#6B7280',
    lineHeight: 28,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  suggestionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 20,
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#000000',
    alignSelf: 'flex-end',
    marginLeft: '20%',
  },
  botMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    marginRight: '20%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#111827',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    color: '#111827',
    paddingVertical: 8,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#000000',
  },
  sendButtonInactive: {
    backgroundColor: 'transparent',
  },
});