import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Animated } from 'react-native';
import { IconSymbol, type IconSymbolName } from '@/components/ui/IconSymbol';
import { useUser } from '@clerk/clerk-expo';
import { UserService } from '@/lib/userService';
import { useRouter } from 'expo-router';
import AgentsService from '@/lib/agentsService';
import ChatHistoryService, { type Conversation } from '@/lib/chatHistoryService';
import Markdown from 'react-native-markdown-display';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface SuggestionCard {
  id: number;
  icon: IconSymbolName;
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
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    loadUserName();
  }, [user]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (sidebarVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: Platform.OS !== 'web',
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -320,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [sidebarVisible]);

  const loadUserName = async () => {
    if (user?.id) {
      const supabaseUser = await UserService.getUserByClerkId(user.id);
      if (supabaseUser?.name) {
        setUserName(supabaseUser.name);
      } else {
        setUserName(user.firstName || '');
      }
    }
  };

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      if (!user?.id) return;

      const supabaseUser = await UserService.getUserByClerkId(user.id);
      if (!supabaseUser) return;

      const userConversations = await ChatHistoryService.getUserConversations(supabaseUser.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const handleOpenSidebar = () => {
    setSidebarVisible(true);
    loadConversations();
  };

  const handleNewChat = () => {
    setMessages([]);
    setThreadId(null);
    setConversationId(null);
    setSidebarVisible(false);
  };

  const handleLoadConversation = async (conversation: Conversation) => {
    try {
      setSidebarVisible(false);
      setLoading(true);

      const dbMessages = await ChatHistoryService.getConversationMessages(conversation.id);

      setThreadId(conversation.thread_id);
      setConversationId(conversation.id);

      const formattedMessages: Message[] = dbMessages.map((msg) => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
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

        const response = await AgentsService.sendChatMessage({
          user_id: supabaseUser.id.toString(),
          message: messageToSend,
          thread_id: threadId || undefined,
        });

        let currentConversationId = conversationId;

        if (!threadId) {
          setThreadId(response.thread_id);

          const conversation = await ChatHistoryService.createConversation(
            supabaseUser.id,
            response.thread_id,
            messageToSend
          );

          currentConversationId = conversation.id;
          setConversationId(conversation.id);
        }

        if (currentConversationId) {
          await ChatHistoryService.saveMessage(currentConversationId, 'user', messageToSend);
        }

        if (!response.message || response.message.trim() === '') {
          throw new Error('El agente no retornó un mensaje');
        }

        const botResponse: Message = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botResponse]);

        if (currentConversationId) {
          await ChatHistoryService.saveMessage(currentConversationId, 'bot', response.message);
        }

        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Error sending message:', error);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays < 7) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleOpenSidebar}>
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

      <Modal
        visible={sidebarVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSidebarVisible(false)}
        accessible={true}
        accessibilityViewIsModal={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
            accessible={true}
            accessibilityLabel="Menú de conversaciones"
          >
            <View style={styles.sidebarHeader}>
              <View style={styles.sidebarHeaderTitle}>
                <IconSymbol name="bubble.left.and.bubble.right" size={24} color="#111827" />
                <Text style={styles.sidebarTitle}>Conversaciones</Text>
              </View>
              <TouchableOpacity
                onPress={() => setSidebarVisible(false)}
                accessible={true}
                accessibilityLabel="Cerrar menú"
                accessibilityRole="button"
              >
                <IconSymbol name="xmark" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newChatButton}
              onPress={handleNewChat}
              accessible={true}
              accessibilityLabel="Crear nueva conversación"
              accessibilityRole="button"
            >
              <IconSymbol name="square.and.pencil" size={20} color="#FFFFFF" />
              <Text style={styles.newChatButtonText}>Nueva conversación</Text>
            </TouchableOpacity>

            {loadingConversations ? (
              <View style={styles.sidebarLoading}>
                <ActivityIndicator size="large" color="#000000" />
              </View>
            ) : (
              <ScrollView style={styles.conversationsList} showsVerticalScrollIndicator={false}>
                {conversations.length === 0 ? (
                  <View style={styles.emptyConversations}>
                    <Text style={styles.emptyConversationsText}>
                      No hay conversaciones guardadas
                    </Text>
                  </View>
                ) : (
                  conversations.map((conversation) => (
                    <TouchableOpacity
                      key={conversation.id}
                      style={styles.conversationItem}
                      onPress={() => handleLoadConversation(conversation)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityLabel={`Conversación: ${conversation.title || 'Nueva conversación'}`}
                      accessibilityHint="Toca para abrir esta conversación"
                      accessibilityRole="button"
                    >
                      <View style={styles.conversationContent}>
                        <Text style={styles.conversationTitle} numberOfLines={1}>
                          {conversation.title || 'Nueva conversación'}
                        </Text>
                        {conversation.last_message && (
                          <Text style={styles.conversationPreview} numberOfLines={2}>
                            {conversation.last_message}
                          </Text>
                        )}
                      </View>
                      {conversation.updated_at && (
                        <Text style={styles.conversationDate}>
                          {formatDate(conversation.updated_at)}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </Animated.View>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarVisible(false)}
            accessible={true}
            accessibilityLabel="Cerrar menú de conversaciones"
            accessibilityRole="button"
            importantForAccessibility="no"
          />
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  sidebar: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sidebarHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#000000',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  newChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sidebarLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationsList: {
    flex: 1,
    marginTop: 16,
  },
  emptyConversations: {
    padding: 40,
    alignItems: 'center',
  },
  emptyConversationsText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  conversationItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  conversationContent: {
    marginBottom: 4,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  conversationPreview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  conversationDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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
