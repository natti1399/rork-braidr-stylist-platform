export type Stylist = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  bio?: string;
  location?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  rating: number;
  reviewCount: number;
  completionRate: number;
};

export type Service = {
  id: string;
  stylistId: string;
  name: string;
  description?: string;
  price: string;
  duration: number; // in minutes
  image?: string;
  category?: string;
  isActive?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
};

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  stylistId?: string;
  customerId?: string;
  serviceId?: string;
  date: string; // ISO date string
  startTime: string; // 24h format "HH:MM"
  endTime: string; // 24h format "HH:MM"
  status: AppointmentStatus;
  price: string;
  location?: string;
  notes?: string;
  customer?: Customer;
  service?: Service;
};

export type Message = {
  id: string;
  senderId: string;
  receiverId?: string;
  text: string;
  timestamp: string; // ISO date string
  read?: boolean;
  type: 'text' | 'image';
};

export type Conversation = {
  id: string;
  participants: {
    id: string;
    type: 'stylist' | 'customer';
    name: string;
    avatar?: string;
  }[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt?: string;
};

export type DashboardStats = {
  todayRevenue: number;
  todayRevenueChange: number;
  weekRevenue: number;
  weekRevenueChange: number;
  rating: number;
  ratingChange: number;
  completionRate: number;
  completionRateChange: number;
  upcomingAppointmentsCount: number;
};