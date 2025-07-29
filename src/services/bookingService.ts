import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Stylist {
  id: string;
  userId: string;
  businessName?: string;
  bio: string;
  specialties: string[];
  experience: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  serviceArea: number;
  portfolio: string[];
  rating: number;
  reviewCount: number;
  totalBookings: number;
  isVerified: boolean;
  isAvailable: boolean;
  languages: string[];
  workingHours: {
    [key: string]: {
      start: string;
      end: string;
      isWorking: boolean;
    };
  };
  responseTime: number;
  features: string[];
  distance?: string;
  availableNext?: string;
}

export interface Service {
  id: string;
  stylistId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: string;
  durationMinutes: number;
  image: string;
  isActive: boolean;
  bookingCount: number;
  addOns: {
    id: string;
    name: string;
    description: string;
    price: number;
  }[];
  tags: string[];
}

export interface Appointment {
  id: string;
  customerId: string;
  stylistId: string;
  serviceId: string;
  bookingId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    notes?: string;
  };
  contactNumber: string;
  totalPrice: number;
  addOns: {
    id: string;
    name: string;
    price: number;
  }[];
  specialRequests?: string;
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'stylist';
  cancelledAt?: string;
  confirmedAt?: string;
  completedAt?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radius?: number;
  specialties?: string[];
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  availableToday?: boolean;
  features?: string[];
  sortBy?: 'distance' | 'rating' | 'price' | 'experience';
  page?: number;
  limit?: number;
}

export interface BookingRequest {
  stylistId: string;
  serviceId: string;
  appointmentDate: string;
  startTime: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
  };
  contactNumber: string;
  addOns?: string[];
  specialRequests?: string;
}

class BookingService {
  // Stylist Discovery
  async searchStylists(filters: SearchFilters = {}) {
    try {
      const response = await apiService.getStylists(filters);
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.stylists || [],
          pagination: response.data.pagination || null
        };
      }
      return { success: false, error: response.error || 'Failed to search stylists' };
    } catch (error) {
      console.error('Search stylists error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getStylistDetails(stylistId: string) {
    try {
      const response = await apiService.getStylistById(stylistId);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to get stylist details' };
    } catch (error) {
      console.error('Get stylist details error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getStylistServices(stylistId: string) {
    try {
      const response = await apiService.getServicesByStylist(stylistId);
      if (response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, error: response.error || 'Failed to get services' };
    } catch (error) {
      console.error('Get stylist services error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Booking Management
  async createBooking(bookingData: BookingRequest) {
    try {
      const response = await apiService.createAppointment(bookingData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to create booking' };
    } catch (error) {
      console.error('Create booking error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async getMyBookings(status?: string) {
    try {
      const params = status ? { status } : {};
      const response = await apiService.getAppointments(params);
      if (response.success) {
        return { success: true, data: response.data || [] };
      }
      return { success: false, error: response.error || 'Failed to get bookings' };
    } catch (error) {
      console.error('Get bookings error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async updateBookingStatus(appointmentId: string, status: string) {
    try {
      const response = await apiService.updateAppointmentStatus(appointmentId, status);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response.error || 'Failed to update booking' };
    } catch (error) {
      console.error('Update booking status error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  // Location Services
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // This would integrate with expo-location
      // For now, return a default location (NYC)
      return {
        latitude: 40.7128,
        longitude: -74.0060
      };
    } catch (error) {
      console.error('Get location error:', error);
      return null;
    }
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Favorites Management
  async getFavoriteStylists(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem('favoriteStylists');
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Get favorites error:', error);
      return [];
    }
  }

  async addToFavorites(stylistId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteStylists();
      if (!favorites.includes(stylistId)) {
        favorites.push(stylistId);
        await AsyncStorage.setItem('favoriteStylists', JSON.stringify(favorites));
      }
      return true;
    } catch (error) {
      console.error('Add to favorites error:', error);
      return false;
    }
  }

  async removeFromFavorites(stylistId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteStylists();
      const updatedFavorites = favorites.filter(id => id !== stylistId);
      await AsyncStorage.setItem('favoriteStylists', JSON.stringify(updatedFavorites));
      return true;
    } catch (error) {
      console.error('Remove from favorites error:', error);
      return false;
    }
  }

  // Utility Functions
  generateBookingId(): string {
    return `BRD${Date.now().toString().slice(-6)}`;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours}h ${mins}m`;
  }

  formatDistance(miles: number): string {
    if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  }

  isWithinServiceArea(stylistLat: number, stylistLon: number, customerLat: number, customerLon: number, serviceAreaMiles: number): boolean {
    const distance = this.calculateDistance(stylistLat, stylistLon, customerLat, customerLon);
    return distance <= serviceAreaMiles;
  }
}

export const bookingService = new BookingService();
export default bookingService;