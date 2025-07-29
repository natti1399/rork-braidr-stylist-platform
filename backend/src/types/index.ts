export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  userType: UserType;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserType {
  CUSTOMER = 'customer',
  STYLIST = 'stylist',
  BOTH = 'both'
}

export interface StylistProfile {
  id: string;
  userId: string;
  bio?: string;
  specialties: string[];
  basePrice: number;
  portfolioImages: string[];
  isAvailable: boolean;
  businessHours: BusinessHours;
  certifications?: string[];
  experienceYears?: number;
  location: Address;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime?: string; // HH:MM format
  closeTime?: string; // HH:MM format
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface BraidingService {
  id: string;
  stylistId: string;
  serviceName: string;
  description: string;
  basePrice: number;
  estimatedDuration: number; // in minutes
  category: BraidingCategory;
  images: string[];
  isActive: boolean;
  requirements?: string;
  createdAt: string;
  updatedAt: string;
}

export enum BraidingCategory {
  BOX_BRAIDS = 'box_braids',
  CORNROWS = 'cornrows',
  FRENCH_BRAIDS = 'french_braids',
  DUTCH_BRAIDS = 'dutch_braids',
  FISHTAIL = 'fishtail',
  GODDESS_BRAIDS = 'goddess_braids',
  KNOTLESS_BRAIDS = 'knotless_braids',
  PASSION_TWISTS = 'passion_twists',
  LOCS = 'locs',
  TWISTS = 'twists'
}

export interface Appointment {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  duration: number;
  totalPrice: number;
  status: AppointmentStatus;
  specialInstructions?: string;
  location: Address;
  // No payment processing - booking only
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

// PaymentStatus removed - Braidr is booking-only, no payment processing

export interface Review {
  id: string;
  customerId: string;
  stylistId: string;
  appointmentId: string;
  rating: number; // 1-5
  comment?: string;
  reviewImages?: string[];
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  customerId: string;
  stylistId: string;
  lastMessageDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isRead: boolean;
  sentAt: string;
  attachments?: string[];
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  APPOINTMENT_REQUEST = 'appointment_request',
  SYSTEM = 'system'
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchFilters {
  category?: BraidingCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in miles
  };
  rating?: number;
  availability?: {
    date: string;
    time: string;
  };
}

export interface NotificationPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  type: NotificationType;
}

export enum NotificationType {
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  NEW_MESSAGE = 'new_message',
  NEW_REVIEW = 'new_review',
  PAYMENT_RECEIVED = 'payment_received'
}