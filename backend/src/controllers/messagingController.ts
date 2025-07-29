import { Request, Response } from 'express';

import { MessagingService } from '../services/messagingService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendNoContent } from '../utils/response';
import { sanitizePaginationParams } from '../utils/response';
import { MessageType } from '../types';

export class MessagingController {
  /**
   * Get or create a conversation between two users
   */
  static getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { otherUserId } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!otherUserId) {
      return sendError(res, 'Other user ID is required', 400);
    }

    if (userId === otherUserId) {
      return sendError(res, 'Cannot create conversation with yourself', 400);
    }

    const conversation = await MessagingService.getOrCreateConversation(userId, otherUserId);

    sendSuccess(res, { conversation }, 'Conversation retrieved successfully');
  });

  /**
   * Get user's conversations
   */
  static getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { page = 1, limit = 20 } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const paginationParams = sanitizePaginationParams(Number(page), Number(limit));

    const result = await MessagingService.getUserConversations(userId, paginationParams);

    sendSuccess(res, result, 'Conversations retrieved successfully');
  });

  /**
   * Get conversation by ID
   */
  static getConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const conversation = await MessagingService.getConversationById(conversationId, userId);
    if (!conversation) {
      return sendNotFound(res, 'Conversation not found');
    }

    sendSuccess(res, { conversation }, 'Conversation retrieved successfully');
  });

  /**
   * Get messages in a conversation
   */
  static getMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const paginationParams = sanitizePaginationParams(Number(page), Number(limit));

    const result = await MessagingService.getConversationMessages(conversationId, userId, paginationParams);

    sendSuccess(res, result, 'Messages retrieved successfully');
  });

  /**
   * Send a message
   */
  static sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const senderId = req.user?.userId;
    const { conversationId } = req.params;
    const { content, messageType = MessageType.TEXT, attachments } = req.body;

    if (!senderId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!content && !attachments) {
      return sendError(res, 'Message content or attachments are required', 400);
    }

    // Validate message type
    if (!Object.values(MessageType).includes(messageType)) {
      return sendError(res, 'Invalid message type', 400);
    }

    // Validate content based on message type
    if (messageType === MessageType.TEXT && !content) {
      return sendError(res, 'Text content is required for text messages', 400);
    }

    if (messageType === MessageType.IMAGE && !attachments?.length) {
      return sendError(res, 'Attachments are required for image messages', 400);
    }

    const message = await MessagingService.sendMessage({
      conversationId,
      senderId,
      content,
      messageType,
      attachmentUrl: attachments?.[0] // Take first attachment URL
    });

    sendCreated(res, { message }, 'Message sent successfully');
  });

  /**
   * Mark messages as read
   */
  static markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    const { messageIds } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return sendError(res, 'Message IDs array is required', 400);
    }

    await MessagingService.markMessagesAsRead(conversationId, messageIds);

    sendSuccess(res, { markedAsRead: true }, 'Messages marked as read successfully');
  });

  /**
   * Mark all messages in conversation as read
   */
  static markConversationAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Mark all messages in conversation as read - using existing method
    await MessagingService.markMessagesAsRead(conversationId, []);

    sendSuccess(res, { markedAsRead: true }, 'Conversation marked as read successfully');
  });

  /**
   * Get unread message count
   */
  static getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Get total unread count for user
    const unreadCount = await MessagingService.getUnreadMessageCount(userId);

    sendSuccess(res, { unreadCount }, 'Unread count retrieved successfully');
  });

  /**
   * Delete a message (soft delete)
   */
  static deleteMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const deleted = await MessagingService.deleteMessage(messageId, userId);
    if (!deleted) {
      return sendError(res, 'Message cannot be deleted (time limit exceeded or not found)', 400);
    }

    sendSuccess(res, { deleted: true }, 'Message deleted successfully');
  });

  /**
   * Search messages
   */
  static searchMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { query, conversationId, page = 1, limit = 20 } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!query) {
      return sendError(res, 'Search query is required', 400);
    }

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const result = await MessagingService.searchMessages(userId, {
      query: query as string,
      conversationId: conversationId as string,
      page: sanitizedPage,
      limit: sanitizedLimit
    });

    sendSuccess(res, result, 'Messages search completed successfully');
  });

  /**
   * Block a conversation
   */
  static blockConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    await MessagingService.blockConversation(conversationId, userId);

    sendSuccess(res, { blocked: true }, 'Conversation blocked successfully');
  });

  /**
   * Unblock a conversation
   */
  static unblockConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    await MessagingService.unblockConversation(conversationId, userId);

    sendSuccess(res, { unblocked: true }, 'Conversation unblocked successfully');
  });

  /**
   * Get conversation statistics
   */
  static getConversationStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const stats = await MessagingService.getConversationStats(conversationId, userId);

    sendSuccess(res, { stats }, 'Conversation statistics retrieved successfully');
  });

  /**
   * Get messaging dashboard data
   */
  static getMessagingDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Get recent conversations and unread count
    const [conversations, totalUnreadCount] = await Promise.all([
      MessagingService.getUserConversations(userId, { page: 1, limit: 10 }),
      MessagingService.getTotalUnreadCount(userId)
    ]);

    const dashboardData = {
      recentConversations: conversations.conversations,
      totalUnreadCount,
      quickActions: {
        newMessage: '/api/messaging/conversations',
        searchMessages: '/api/messaging/search',
        viewAllConversations: '/api/messaging/conversations'
      }
    };

    sendSuccess(res, dashboardData, 'Messaging dashboard data retrieved successfully');
  });

  /**
   * Get online status of users in conversation
   */
  static getOnlineStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // In a real implementation, this would check online status from Redis or similar
    // For now, return mock data
    const onlineStatus = {
      users: [
        { userId: 'user1', isOnline: true, lastSeen: new Date() },
        { userId: 'user2', isOnline: false, lastSeen: new Date(Date.now() - 300000) }
      ]
    };

    sendSuccess(res, onlineStatus, 'Online status retrieved successfully');
  });

  /**
   * Send typing indicator
   */
  static sendTypingIndicator = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { conversationId } = req.params;
    const { isTyping = true } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // In a real implementation, this would emit a real-time event
    // For now, just acknowledge the request
    sendSuccess(res, { typingIndicatorSent: true }, 'Typing indicator sent successfully');
  });

  /**
   * Get message delivery status
   */
  static getMessageStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { messageId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // In a real implementation, this would check message delivery/read status
    // For now, return mock data
    const status = {
      messageId,
      delivered: true,
      deliveredAt: new Date(),
      read: false,
      readAt: null
    };

    sendSuccess(res, { status }, 'Message status retrieved successfully');
  });
}