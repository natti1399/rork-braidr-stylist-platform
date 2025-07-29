import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'stylist';
  isEmailVerified: boolean;
  avatar?: string;
  createdAt: string;
}

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: 'customer' | 'stylist';
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      const tokens = await AsyncStorage.getItem('authTokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens);
        return accessToken;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      
      const config: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: RegisterData): Promise<ApiResponse<LoginResponse>> {
    return this.makeRequest<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return this.makeRequest<AuthTokens>('/auth/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<null>> {
    return this.makeRequest<null>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile');
  }

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    return this.makeRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Stylist endpoints
  async getStylists(params?: {
    latitude?: number;
    longitude?: number;
    radius?: number;
    specialties?: string[];
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    return this.makeRequest<any>(`/stylists?${queryParams.toString()}`);
  }

  async getStylistById(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/stylists/${id}`);
  }

  // Service endpoints
  async getServicesByStylist(stylistId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/services/stylist/${stylistId}`);
  }

  // Appointment endpoints
  async createAppointment(appointmentData: any): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async getAppointments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    return this.makeRequest<any>(`/appointments?${queryParams.toString()}`);
  }

  async updateAppointmentStatus(
    appointmentId: string, 
    status: string
  ): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Messaging endpoints
  async getMessages(conversationId: string): Promise<ApiResponse<any>> {
    return this.makeRequest<any>(`/messages/${conversationId}`);
  }

  async sendMessage(messageData: {
    conversationId: string;
    content: string;
    type?: string;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }
}

export const apiService = new ApiService();
export type { User, AuthTokens, LoginResponse, RegisterData, ApiResponse };