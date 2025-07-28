import { Appointment, Conversation, Customer, DashboardStats, Message, Service, Stylist } from "@/types";

export const mockStylist: Stylist = {
  id: "s1",
  name: "Test Stylist",
  email: "test@braidr.com",
  phone: "123-456-7890",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  bio: "Professional braider with 5+ years of experience specializing in box braids, goddess braids, and more.",
  location: {
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zip: "10001",
    coordinates: {
      latitude: 40.7128,
      longitude: -74.006,
    },
  },
  rating: 4.9,
  reviewCount: 89,
  completionRate: 96,
};

export const mockServices: Service[] = [
  {
    id: "serv1",
    stylistId: "s1",
    name: "Box Braids",
    description: "Traditional box braids with neat partings and clean edges.",
    price: "$180.00",
    duration: 240, // 4 hours
    image: "https://images.unsplash.com/photo-1595175279819-e6c186188ccd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
    category: "Braiding",
    isActive: true,
  },
  {
    id: "serv2",
    stylistId: "s1",
    name: "Goddess Braids",
    description: "Elegant goddess braids with curly ends for a sophisticated look.",
    price: "$220.00",
    duration: 300, // 5 hours
    image: "https://images.unsplash.com/photo-1605980625600-88c7a85c027a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
    category: "Braiding",
    isActive: true,
  },
  {
    id: "serv3",
    stylistId: "s1",
    name: "Knotless Braids",
    description: "Knotless braids for a natural, lightweight feel with less tension.",
    price: "$200.00",
    duration: 270, // 4.5 hours
    image: "https://images.unsplash.com/photo-1626255077456-9e959f153436?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
    category: "Braiding",
    isActive: true,
  },
];

export const mockCustomers: Customer[] = [
  {
    id: "c1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "555-123-4567",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "c2",
    name: "Maya Williams",
    email: "maya@example.com",
    phone: "555-987-6543",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
  {
    id: "c3",
    name: "Jasmine Taylor",
    email: "jasmine@example.com",
    phone: "555-456-7890",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80",
  },
];

// Current date for reference
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    stylistId: "s1",
    customerId: "c1",
    serviceId: "serv1",
    date: formatDate(today),
    startTime: "10:00",
    endTime: "14:00",
    status: "confirmed",
    price: "$180.00",
    location: "Studio",
    customer: mockCustomers[0],
    service: mockServices[0],
  },
  {
    id: "a2",
    stylistId: "s1",
    customerId: "c2",
    serviceId: "serv1",
    date: formatDate(tomorrow),
    startTime: "14:00",
    endTime: "18:00",
    status: "confirmed",
    price: "$180.00",
    location: "Studio",
    customer: mockCustomers[1],
    service: mockServices[0],
  },
  {
    id: "a3",
    stylistId: "s1",
    customerId: "c3",
    serviceId: "serv2",
    date: formatDate(tomorrow),
    startTime: "09:00",
    endTime: "14:00",
    status: "pending",
    price: "$220.00",
    location: "Studio",
    customer: mockCustomers[2],
    service: mockServices[1],
  },
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    senderId: "c1",
    receiverId: "s1",
    text: "Hi, I'm interested in getting box braids next week. Do you have any availability?",
    timestamp: new Date(today.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: "text",
  },
  {
    id: "m2",
    senderId: "s1",
    receiverId: "c1",
    text: "Hello! Yes, I have availability on Tuesday and Thursday next week. What time works for you?",
    timestamp: new Date(today.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: "text",
  },
  {
    id: "m3",
    senderId: "c1",
    receiverId: "s1",
    text: "Tuesday at 10 AM would be perfect!",
    timestamp: new Date(today.getTime() - 30 * 60 * 1000).toISOString(),
    read: false,
    type: "text",
  },
  {
    id: "m4",
    senderId: "c2",
    receiverId: "s1",
    text: "Do you have any openings this weekend?",
    timestamp: new Date(today.getTime() - 5 * 60 * 60 * 1000).toISOString(),
    read: true,
    type: "text",
  },
];

export const mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: [
      {
        id: "s1",
        type: "stylist",
        name: "Test Stylist",
        avatar: mockStylist.avatar,
      },
      {
        id: "c1",
        type: "customer",
        name: mockCustomers[0].name,
        avatar: mockCustomers[0].avatar,
      },
    ],
    messages: [mockMessages[2], mockMessages[1], mockMessages[0]],
    lastMessage: mockMessages[2],
    unreadCount: 1,
    updatedAt: mockMessages[2].timestamp,
  },
  {
    id: "conv2",
    participants: [
      {
        id: "s1",
        type: "stylist",
        name: "Test Stylist",
        avatar: mockStylist.avatar,
      },
      {
        id: "c2",
        type: "customer",
        name: mockCustomers[1].name,
        avatar: mockCustomers[1].avatar,
      },
    ],
    messages: [mockMessages[3]],
    lastMessage: mockMessages[3],
    unreadCount: 0,
    updatedAt: mockMessages[3].timestamp,
  },
];

export const mockDashboardStats: DashboardStats = {
  todayRevenue: 540,
  todayRevenueChange: 12,
  weekRevenue: 2380,
  weekRevenueChange: 18,
  rating: 4.9,
  ratingChange: 0.1,
  completionRate: 96,
  completionRateChange: 3,
  upcomingAppointmentsCount: 5,
};