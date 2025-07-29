import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  messageType: 'text' | 'image' | 'system' | 'booking';
  content: string;
  imageUrl?: string;
  metadata?: {
    appointmentId?: string;
    bookingDetails?: any;
    systemAction?: string;
  };
  isRead: boolean;
  readAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation extends Document {
  _id: string;
  participants: string[]; // array of user IDs
  lastMessage: string;
  lastMessageAt: Date;
  lastMessageBy: string;
  unreadCount: {
    [userId: string]: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  conversationId: {
    type: String,
    required: true,
    ref: 'Conversation',
    index: true
  },
  senderId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  receiverId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'system', 'booking'],
    default: 'text',
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // optional field
        return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Image URL must be a valid image URL'
    }
  },
  metadata: {
    appointmentId: { type: String, ref: 'Appointment' },
    bookingDetails: { type: Schema.Types.Mixed },
    systemAction: { 
      type: String,
      enum: ['booking_confirmed', 'booking_cancelled', 'appointment_reminder', 'review_request']
    }
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

const ConversationSchema = new Schema<IConversation>({
  participants: [{
    type: String,
    required: true,
    ref: 'User'
  }],
  lastMessage: {
    type: String,
    maxlength: 100 // truncated version for display
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  lastMessageBy: {
    type: String,
    ref: 'User'
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: new Map()
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Message indexes for performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ messageType: 1, createdAt: -1 });

// Compound indexes for common queries
MessageSchema.index({ 
  conversationId: 1, 
  isDeleted: 1, 
  createdAt: -1 
});

MessageSchema.index({ 
  receiverId: 1, 
  isRead: 1, 
  createdAt: -1 
});

// Conversation indexes
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1, isActive: 1 });

// Compound index for user's conversations
ConversationSchema.index({ 
  participants: 1, 
  isActive: 1, 
  lastMessageAt: -1 
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);