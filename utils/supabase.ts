import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Database types based on the existing models
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone?: string
          avatar?: string
          role: 'customer' | 'stylist' | 'admin'
          is_email_verified: boolean
          is_phone_verified: boolean
          is_active: boolean
          last_login?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string
          avatar?: string
          role?: 'customer' | 'stylist' | 'admin'
          is_email_verified?: boolean
          is_phone_verified?: boolean
          is_active?: boolean
          last_login?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string
          avatar?: string
          role?: 'customer' | 'stylist' | 'admin'
          is_email_verified?: boolean
          is_phone_verified?: boolean
          is_active?: boolean
          last_login?: string
        }
      }
      stylists: {
        Row: {
          id: string
          user_id: string
          business_name?: string
          bio: string
          specialties: string[]
          experience: string
          location: any // JSON object
          service_area: number
          portfolio: string[]
          rating: number
          review_count: number
          total_bookings: number
          is_verified: boolean
          is_available: boolean
          languages: string[]
          working_hours: any // JSON object
          response_time: number
          features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name?: string
          bio: string
          specialties: string[]
          experience: string
          location: any
          service_area?: number
          portfolio?: string[]
          rating?: number
          review_count?: number
          total_bookings?: number
          is_verified?: boolean
          is_available?: boolean
          languages?: string[]
          working_hours: any
          response_time?: number
          features?: string[]
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          bio?: string
          specialties?: string[]
          experience?: string
          location?: any
          service_area?: number
          portfolio?: string[]
          rating?: number
          review_count?: number
          total_bookings?: number
          is_verified?: boolean
          is_available?: boolean
          languages?: string[]
          working_hours?: any
          response_time?: number
          features?: string[]
        }
      }
      services: {
        Row: {
          id: string
          stylist_id: string
          name: string
          description: string
          category: string
          price: number
          duration: string
          duration_minutes: number
          image: string
          is_active: boolean
          booking_count: number
          add_ons: any // JSON array
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stylist_id: string
          name: string
          description: string
          category: string
          price: number
          duration: string
          duration_minutes: number
          image?: string
          is_active?: boolean
          booking_count?: number
          add_ons?: any
          tags?: string[]
        }
        Update: {
          id?: string
          stylist_id?: string
          name?: string
          description?: string
          category?: string
          price?: number
          duration?: string
          duration_minutes?: number
          image?: string
          is_active?: boolean
          booking_count?: number
          add_ons?: any
          tags?: string[]
        }
      }
      appointments: {
        Row: {
          id: string
          customer_id: string
          stylist_id: string
          service_id: string
          booking_id: string
          appointment_date: string
          start_time: string
          end_time: string
          duration: number
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          location: any // JSON object
          contact_number: string
          total_price: number
          add_ons: any // JSON array
          special_requests?: string
          cancellation_reason?: string
          cancelled_by?: 'customer' | 'stylist'
          cancelled_at?: string
          confirmed_at?: string
          completed_at?: string
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          stylist_id: string
          service_id: string
          booking_id: string
          appointment_date: string
          start_time: string
          end_time: string
          duration: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          location: any
          contact_number: string
          total_price: number
          add_ons?: any
          special_requests?: string
          cancellation_reason?: string
          cancelled_by?: 'customer' | 'stylist'
          cancelled_at?: string
          confirmed_at?: string
          completed_at?: string
          reminder_sent?: boolean
        }
        Update: {
          id?: string
          customer_id?: string
          stylist_id?: string
          service_id?: string
          booking_id?: string
          appointment_date?: string
          start_time?: string
          end_time?: string
          duration?: number
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
          location?: any
          contact_number?: string
          total_price?: number
          add_ons?: any
          special_requests?: string
          cancellation_reason?: string
          cancelled_by?: 'customer' | 'stylist'
          cancelled_at?: string
          confirmed_at?: string
          completed_at?: string
          reminder_sent?: boolean
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          appointment_id?: string
          content: string
          message_type: 'text' | 'image' | 'system'
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          appointment_id?: string
          content: string
          message_type?: 'text' | 'image' | 'system'
          is_read?: boolean
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          appointment_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'system'
          is_read?: boolean
        }
      }
      reviews: {
        Row: {
          id: string
          customer_id: string
          stylist_id: string
          appointment_id: string
          rating: number
          comment?: string
          is_anonymous: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          stylist_id: string
          appointment_id: string
          rating: number
          comment?: string
          is_anonymous?: boolean
        }
        Update: {
          id?: string
          customer_id?: string
          stylist_id?: string
          appointment_id?: string
          rating?: number
          comment?: string
          is_anonymous?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}