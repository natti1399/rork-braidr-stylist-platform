import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { mockAppointments, mockConversations, mockServices, mockStylist } from "@/mocks/data";
import { Appointment, Conversation, Service, Stylist } from "@/types";

// In a real app, these would be API calls
const fetchStylist = async (): Promise<Stylist> => {
  // Simulate API call
  const stored = await AsyncStorage.getItem("stylist");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockStylist;
};

const fetchServices = async (): Promise<Service[]> => {
  // Simulate API call
  const stored = await AsyncStorage.getItem("services");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockServices;
};

const fetchAppointments = async (): Promise<Appointment[]> => {
  // Simulate API call
  const stored = await AsyncStorage.getItem("appointments");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockAppointments;
};

const fetchConversations = async (): Promise<Conversation[]> => {
  // Simulate API call
  const stored = await AsyncStorage.getItem("conversations");
  if (stored) {
    return JSON.parse(stored);
  }
  return mockConversations;
};



export const [StylistProvider, useStylist] = createContextHook(() => {
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);


  // Fetch stylist data
  const stylistQuery = useQuery({
    queryKey: ["stylist"],
    queryFn: fetchStylist,
  });

  // Fetch services
  const servicesQuery = useQuery({
    queryKey: ["services"],
    queryFn: fetchServices,
  });

  // Fetch appointments
  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  // Fetch conversations
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });



  useEffect(() => {
    if (stylistQuery.data) {
      setStylist(stylistQuery.data);
    }
  }, [stylistQuery.data]);

  useEffect(() => {
    if (servicesQuery.data) {
      setServices(servicesQuery.data);
    }
  }, [servicesQuery.data]);

  useEffect(() => {
    if (appointmentsQuery.data) {
      setAppointments(appointmentsQuery.data);
    }
  }, [appointmentsQuery.data]);

  useEffect(() => {
    if (conversationsQuery.data) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);



  // Filter appointments by date
  const getAppointmentsByDate = (date: string): Appointment[] => {
    return appointments.filter((appointment) => appointment.date === date);
  };

  // Get today's appointments
  const getTodayAppointments = (): Appointment[] => {
    const today = new Date().toISOString().split("T")[0];
    return getAppointmentsByDate(today);
  };

  // Get upcoming appointments (today and future)
  const getUpcomingAppointments = (): Appointment[] => {
    const today = new Date().toISOString().split("T")[0];
    return appointments.filter(
      (appointment) => appointment.date >= today && appointment.status !== "cancelled"
    ).sort((a, b) => {
      // Sort by date and then by start time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  };

  // Get next appointment
  const getNextAppointment = (): Appointment | null => {
    const upcoming = getUpcomingAppointments();
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  // Add a new service
  const addService = async (service: Omit<Service, "id" | "stylistId">): Promise<Service> => {
    if (!stylist) throw new Error("Stylist not found");
    
    const newService: Service = {
      ...service,
      id: `serv${services.length + 1}`,
      stylistId: stylist.id,
    };
    
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("services", JSON.stringify(updatedServices));
    
    return newService;
  };

  // Update a service
  const updateService = async (serviceId: string, updates: Partial<Service>): Promise<Service> => {
    const serviceIndex = services.findIndex((s) => s.id === serviceId);
    if (serviceIndex === -1) throw new Error("Service not found");
    
    const updatedService = { ...services[serviceIndex], ...updates };
    const updatedServices = [...services];
    updatedServices[serviceIndex] = updatedService;
    
    setServices(updatedServices);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("services", JSON.stringify(updatedServices));
    
    return updatedService;
  };

  // Delete a service
  const deleteService = async (serviceId: string): Promise<void> => {
    const updatedServices = services.filter((s) => s.id !== serviceId);
    setServices(updatedServices);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("services", JSON.stringify(updatedServices));
  };

  // Update appointment status
  const updateAppointmentStatus = async (
    appointmentId: string,
    status: Appointment["status"]
  ): Promise<Appointment> => {
    const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId);
    if (appointmentIndex === -1) throw new Error("Appointment not found");
    
    const updatedAppointment = { ...appointments[appointmentIndex], status };
    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = updatedAppointment;
    
    setAppointments(updatedAppointments);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    return updatedAppointment;
  };

  // Add a new appointment
  const addAppointment = async (appointment: Omit<Appointment, "id">): Promise<Appointment> => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `a${appointments.length + 1}`,
    };
    
    const updatedAppointments = [...appointments, newAppointment];
    setAppointments(updatedAppointments);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    return newAppointment;
  };

  // Get appointment by ID
  const getAppointmentById = (appointmentId: string): Appointment | undefined => {
    return appointments.find((appointment) => appointment.id === appointmentId);
  };

  // Update appointment
  const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> => {
    const appointmentIndex = appointments.findIndex((a) => a.id === appointmentId);
    if (appointmentIndex === -1) throw new Error("Appointment not found");
    
    const updatedAppointment = { ...appointments[appointmentIndex], ...updates };
    const updatedAppointments = [...appointments];
    updatedAppointments[appointmentIndex] = updatedAppointment;
    
    setAppointments(updatedAppointments);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("appointments", JSON.stringify(updatedAppointments));
    
    return updatedAppointment;
  };

  // Get service by ID
  const getServiceById = (serviceId: string): Service | undefined => {
    return services.find((service) => service.id === serviceId);
  };

  // Get conversation by ID
  const getConversationById = (conversationId: string): Conversation | undefined => {
    return conversations.find((conversation) => conversation.id === conversationId);
  };

  // Send message
  const sendMessage = async (conversationId: string, message: any): Promise<void> => {
    const conversationIndex = conversations.findIndex((c) => c.id === conversationId);
    if (conversationIndex === -1) throw new Error("Conversation not found");
    
    const updatedConversation = {
      ...conversations[conversationIndex],
      messages: [message, ...conversations[conversationIndex].messages],
      lastMessage: message,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedConversations = [...conversations];
    updatedConversations[conversationIndex] = updatedConversation;
    
    setConversations(updatedConversations);
    
    // In a real app, this would be an API call
    await AsyncStorage.setItem("conversations", JSON.stringify(updatedConversations));
  };

  return {
    stylist,
    services,
    appointments,
    conversations,
    isLoading: 
      stylistQuery.isLoading || 
      servicesQuery.isLoading || 
      appointmentsQuery.isLoading || 
      conversationsQuery.isLoading,
    getAppointmentsByDate,
    getTodayAppointments,
    getUpcomingAppointments,
    getNextAppointment,
    addService,
    updateService,
    deleteService,
    updateAppointmentStatus,
    addAppointment,
    getAppointmentById,
    updateAppointment,
    getServiceById,
    getConversationById,
    sendMessage,
  };
});

// Custom hooks for specific data needs
export const useAppointments = () => {
  const { appointments, getAppointmentsByDate, getTodayAppointments, getUpcomingAppointments, getNextAppointment, updateAppointmentStatus, addAppointment, getAppointmentById, updateAppointment } = useStylist();
  return { 
    appointments, 
    getAppointmentsByDate, 
    getTodayAppointments, 
    getUpcomingAppointments, 
    getNextAppointment,
    updateAppointmentStatus,
    addAppointment,
    getAppointmentById,
    updateAppointment
  };
};

export const useServices = () => {
  const { services, addService, updateService, deleteService, getServiceById } = useStylist();
  return { services, addService, updateService, deleteService, getServiceById };
};

export const useConversations = () => {
  const { conversations, getConversationById, sendMessage } = useStylist();
  return { conversations, getConversationById, sendMessage };
};

