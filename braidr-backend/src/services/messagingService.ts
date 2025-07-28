import { supabase } from '../config/database';
import { Conversation, Message, MessageType } from '../types';
import { generateUUID } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class MessagingService {
  /**
   * Create or get existing conversation between customer and stylist
   */
  static async getOrCreateConversation(
    customerId: string,
    stylistId: string
  ): Promise<Conversation> {
    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .eq('customer_id', customerId)
      .eq('stylist_id', stylistId)
      .single();

    if (existingConversation) {
      return existingConversation;
    }

    // Create new conversation
    const conversationId = generateUUID();
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        id: conversationId,
        customer_id: customerId,
        stylist_id: stylistId,
        last_message_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .single();

    if (error) {
      throw new AppError('Failed to create conversation', 500);
    }

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  static async getConversationById(
    conversationId: string,
    userId: string
  ): Promise<Conversation | null> {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .eq('id', conversationId)
      .or(`customer_id.eq.${userId},stylist_id.eq.${userId}`)
      .single();

    if (error || !conversation) {
      return null;
    }

    return conversation;
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const { data: conversations, error, count } = await supabase
      .from('conversations')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        messages!inner(
          id,
          content,
          message_type,
          sender_id,
          created_at
        )
      `, { count: 'exact' })
      .or(`customer_id.eq.${userId},stylist_id.eq.${userId}`)
      .range((page - 1) * limit, page * limit - 1)
      .order('last_message_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch conversations', 500);
    }

    // Get the latest message for each conversation
    const conversationsWithLastMessage = await Promise.all(
      (conversations || []).map(async (conversation) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conversation,
          lastMessage
        };
      })
    );

    return {
      conversations: conversationsWithLastMessage,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Send a message
   */
  static async sendMessage(messageData: {
    conversationId: string;
    senderId: string;
    content: string;
    messageType?: MessageType;
    attachmentUrl?: string;
  }): Promise<Message> {
    const {
      conversationId,
      senderId,
      content,
      messageType = MessageType.TEXT,
      attachmentUrl
    } = messageData;

    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== senderId && conversation.stylist_id !== senderId) {
      throw new AppError('Not authorized to send messages in this conversation', 403);
    }

    const messageId = generateUUID();
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        id: messageId,
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        attachment_url: attachmentUrl,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        sender:users!sender_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .single();

    if (error) {
      throw new AppError('Failed to send message', 500);
    }

    // Update conversation's last message timestamp
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    return message;
  }

  /**
   * Get messages in a conversation
   */
  static async getConversationMessages(
    conversationId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== userId && conversation.stylist_id !== userId) {
      throw new AppError('Not authorized to view this conversation', 403);
    }

    const { data: messages, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `, { count: 'exact' })
      .eq('conversation_id', conversationId)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch messages', 500);
    }

    return {
      messages: (messages || []).reverse(), // Reverse to show oldest first
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Mark messages as read
   */
  static async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== userId && conversation.stylist_id !== userId) {
      throw new AppError('Not authorized to mark messages as read', 403);
    }

    // Mark all unread messages from other user as read
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new AppError('Failed to mark messages as read', 500);
    }
  }

  /**
   * Get unread message count for user
   */
  static async getUnreadMessageCount(userId: string): Promise<number> {
    // Get all conversations for the user
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .or(`customer_id.eq.${userId},stylist_id.eq.${userId}`);

    if (!conversations || conversations.length === 0) {
      return 0;
    }

    const conversationIds = conversations.map(c => c.id);

    // Count unread messages in these conversations (not sent by the user)
    const { count, error } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .in('conversation_id', conversationIds)
      .neq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new AppError('Failed to get unread message count', 500);
    }

    return count || 0;
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(
    messageId: string,
    userId: string
  ): Promise<void> {
    // Verify user owns the message
    const { data: message } = await supabase
      .from('messages')
      .select('sender_id, created_at')
      .eq('id', messageId)
      .single();

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.sender_id !== userId) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    // Check if message is recent (allow deletion within 5 minutes)
    const messageTime = new Date(message.created_at).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (currentTime - messageTime > fiveMinutes) {
      throw new AppError('Cannot delete messages older than 5 minutes', 400);
    }

    const { error } = await supabase
      .from('messages')
      .update({
        content: '[Message deleted]',
        is_deleted: true
      })
      .eq('id', messageId);

    if (error) {
      throw new AppError('Failed to delete message', 500);
    }
  }

  /**
   * Search messages in a conversation
   */
  static async searchMessages(
    conversationId: string,
    userId: string,
    query: string,
    page: number = 1,
    limit: number = 20
  ) {
    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== userId && conversation.stylist_id !== userId) {
      throw new AppError('Not authorized to search this conversation', 403);
    }

    const { data: messages, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `, { count: 'exact' })
      .eq('conversation_id', conversationId)
      .ilike('content', `%${query}%`)
      .eq('is_deleted', false)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to search messages', 500);
    }

    return {
      messages: messages || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get conversation statistics
   */
  static async getConversationStats(conversationId: string, userId: string) {
    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id, created_at')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== userId && conversation.stylist_id !== userId) {
      throw new AppError('Not authorized to view conversation stats', 403);
    }

    // Get message statistics
    const { data: messages } = await supabase
      .from('messages')
      .select('sender_id, message_type, created_at')
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false);

    const totalMessages = messages?.length || 0;
    const userMessages = messages?.filter(m => m.sender_id === userId).length || 0;
    const otherUserMessages = totalMessages - userMessages;
    
    const messageTypes = messages?.reduce((acc, message) => {
      acc[message.message_type] = (acc[message.message_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalMessages,
      userMessages,
      otherUserMessages,
      messageTypes,
      conversationStarted: conversation.created_at
    };
  }

  /**
   * Block/Unblock conversation
   */
  static async toggleConversationBlock(
    conversationId: string,
    userId: string,
    isBlocked: boolean
  ): Promise<void> {
    // Verify user is part of the conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('customer_id, stylist_id')
      .eq('id', conversationId)
      .single();

    if (!conversation) {
      throw new AppError('Conversation not found', 404);
    }

    if (conversation.customer_id !== userId && conversation.stylist_id !== userId) {
      throw new AppError('Not authorized to block this conversation', 403);
    }

    const blockField = conversation.customer_id === userId ? 'is_blocked_by_customer' : 'is_blocked_by_stylist';

    const { error } = await supabase
      .from('conversations')
      .update({
        [blockField]: isBlocked,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) {
      throw new AppError('Failed to update conversation block status', 500);
    }
  }
}