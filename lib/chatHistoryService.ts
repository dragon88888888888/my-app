import { supabase } from './supabase';

export interface Message {
  id: number;
  conversation_id: number;
  sender: 'user' | 'bot';
  content: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  thread_id: string;
  title: string | null;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

class ChatHistoryService {
  static async createConversation(userId: number, threadId: string, firstMessage?: string): Promise<Conversation> {
    try {
      const title = this.generateTitle(firstMessage);

      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          thread_id: threadId,
          title,
          last_message: firstMessage || null,
          last_message_at: firstMessage ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  static async getConversationByThreadId(threadId: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('thread_id', threadId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error getting conversation by thread ID:', error);
      throw error;
    }
  }

  static async getUserConversations(userId: number, limit: number = 50): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  static async getConversationMessages(conversationId: number): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  static async saveMessage(
    conversationId: number,
    sender: 'user' | 'bot',
    content: string
  ): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender,
          content,
        })
        .select()
        .single();

      if (error) throw error;

      await this.updateConversationLastMessage(conversationId, content);

      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  static async updateConversationLastMessage(conversationId: number, lastMessage: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({
          last_message: lastMessage,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation last message:', error);
      throw error;
    }
  }

  static async updateConversationTitle(conversationId: number, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      throw error;
    }
  }

  static async deleteConversation(conversationId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  static generateTitle(firstMessage?: string): string {
    if (!firstMessage) return 'Nueva conversación';

    const maxLength = 50;
    const cleaned = firstMessage.trim();

    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return cleaned.substring(0, maxLength - 3) + '...';
  }

  static async getOrCreateConversation(
    userId: number,
    threadId: string,
    firstMessage?: string
  ): Promise<Conversation> {
    try {
      let conversation = await this.getConversationByThreadId(threadId);

      if (!conversation) {
        conversation = await this.createConversation(userId, threadId, firstMessage);
      }

      return conversation;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  }
}

export default ChatHistoryService;
