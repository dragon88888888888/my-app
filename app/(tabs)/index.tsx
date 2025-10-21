import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useUser } from '@clerk/clerk-expo';
import { UserService } from '@/lib/userService';
import { useRouter } from 'expo-router';
import AgentsService from '@/lib/agentsService';
import Markdown from 'react-native-markdown-display';

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
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);

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

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text || message.trim();

    if (messageToSend && !loading) {
      const newUserMessage: Message = {
        id: Date.now(),
        text: messageToSend,
        sender: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newUserMessage]);
      setMessage('');
      setLoading(true);

      try {
        if (!user) {
          throw new Error('Usuario no autenticado');
        }

        const supabaseUser = await UserService.getUserByClerkId(user.id);

        if (!supabaseUser) {
          throw new Error('Usuario no encontrado en Supabase');
        }

        // Llamar al agente de chat
        const response = await AgentsService.sendChatMessage({
          user_id: supabaseUser.id.toString(),
          message: messageToSend,
          thread_id: threadId || undefined,
        });

        // Guardar el thread_id para mantener contexto
        if (!threadId) {
          setThreadId(response.thread_id);
        }

        // Validar que la respuesta no esté vacía
        if (!response.message || response.message.trim() === '') {
          throw new Error('El agente no retornó un mensaje');
        }

        // Agregar respuesta del bot
        const botResponse: Message = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botResponse]);

        // Scroll al final
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Error sending message:', error);

        // Respuesta de error
        const errorResponse: Message = {
          id: Date.now() + 1,
          text: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta nuevamente.',
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setLoading(false);
      }
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
            ref={scrollViewRef}
            style={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  msg.sender === 'user' ? styles.userMessage : styles.botMessage
                ]}
              >
                {msg.sender === 'user' ? (
                  <Text style={[styles.messageText, styles.userMessageText]}>
                    {msg.text}
                  </Text>
                ) : (
                  <Markdown style={chatMarkdownStyles}>
                    {msg.text}
                  </Markdown>
                )}
              </View>
            ))}
            {loading && (
              <View style={[styles.messageContainer, styles.botMessage]}>
                <ActivityIndicator size="small" color="#6B7280" />
              </View>
            )}
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
  },
  messagesContent: {
    paddingTop: 20,
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

const chatMarkdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 22,
  },
  heading1: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 10,
    marginBottom: 6,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  paragraph: {
    marginBottom: 8,
    lineHeight: 22,
    fontSize: 16,
    color: '#111827',
  },
  strong: {
    fontWeight: '700',
    color: '#111827',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  bullet_list_icon: {
    fontSize: 16,
    lineHeight: 22,
    marginRight: 6,
    color: '#6B7280',
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#EF4444',
  },
  fence: {
    backgroundColor: '#F9FAFB',
    borderRadius: 6,
    padding: 10,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  code_block: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#374151',
  },
  blockquote: {
    backgroundColor: '#F9FAFB',
    borderLeftWidth: 3,
    borderLeftColor: '#9CA3AF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginVertical: 8,
    borderRadius: 4,
  },
});