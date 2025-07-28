import { Router } from 'express';
import { MessagingController } from '../controllers/messagingController';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter, messageLimiter, searchLimiter } from '../middleware/rateLimiter';
import {
  validateMessageCreation,
  validatePagination,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Conversation management
router.post('/conversations',
  generalLimiter,
  MessagingController.getOrCreateConversation
);

router.get('/conversations',
  generalLimiter,
  validatePagination,
  handleValidationErrors,
  MessagingController.getConversations
);

router.get('/conversations/:conversationId',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  handleValidationErrors,
  MessagingController.getConversation
);

// Message management
router.get('/conversations/:conversationId/messages',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  validatePagination,
  handleValidationErrors,
  MessagingController.getMessages
);

router.post('/conversations/:conversationId/messages',
  messageLimiter,
  ...validateUUIDParam('conversationId'),
  validateMessageCreation,
  handleValidationErrors,
  MessagingController.sendMessage
);

router.patch('/conversations/:conversationId/read',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.markAsRead
);

router.patch('/conversations/:conversationId/read-all',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.markConversationAsRead
);

// Message actions
router.delete('/messages/:messageId',
  generalLimiter,
  ...validateUUIDParam('messageId'),
  MessagingController.deleteMessage
);

router.get('/messages/:messageId/status',
  generalLimiter,
  ...validateUUIDParam('messageId'),
  MessagingController.getMessageStatus
);

// Search functionality
router.get('/search',
  searchLimiter,
  validatePagination,
  handleValidationErrors,
  MessagingController.searchMessages
);

// Unread count
router.get('/unread-count',
  generalLimiter,
  MessagingController.getUnreadCount
);

// Conversation blocking
router.patch('/conversations/:conversationId/block',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.blockConversation
);

router.patch('/conversations/:conversationId/unblock',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.unblockConversation
);

// Conversation statistics
router.get('/conversations/:conversationId/stats',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.getConversationStats
);

// Real-time features
router.get('/conversations/:conversationId/online-status',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.getOnlineStatus
);

router.post('/conversations/:conversationId/typing',
  generalLimiter,
  ...validateUUIDParam('conversationId'),
  MessagingController.sendTypingIndicator
);

// Dashboard
router.get('/dashboard',
  generalLimiter,
  MessagingController.getMessagingDashboard
);

export default router;