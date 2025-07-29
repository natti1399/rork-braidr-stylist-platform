import { supabase } from '../config/database';
import { StylistProfile, BusinessHours, DaySchedule } from '../types';
import { generateUUID, calculateDistance } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class StylistService {
  /**
   * Create stylist profile
   */
  static async createProfile(userId: string, profileData: {
    businessName?: string;
    bio: string;
    experience: number;
    specialties: string[];
    certifications?: string[];
    portfolioImages?: string[];
    businessHours: BusinessHours;
    serviceRadius: number;
    baseLocation: {
      latitude: number;
      longitude: number;
      address: string;
    };
  }): Promise<StylistProfile> {
    const {
      businessName,
      bio,
      experience,
      specialties,
      certifications = [],
      portfolioImages = [],
      businessHours,
      serviceRadius,
      baseLocation
    } = profileData;

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      throw new AppError('Stylist profile already exists', 409);
    }

    const profileId = generateUUID();
    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .insert({
        id: profileId,
        user_id: userId,
        business_name: businessName,
        bio,
        experience,
        specialties,
        certifications,
        portfolio_images: portfolioImages,
        business_hours: businessHours,
        service_radius: serviceRadius,
        base_latitude: baseLocation.latitude,
        base_longitude: baseLocation.longitude,
        base_address: baseLocation.address,
        is_verified: false,
        is_available: true,
        rating: 0,
        total_reviews: 0,
        total_appointments: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create stylist profile', 500);
    }

    return profile;
  }

  /**
   * Get stylist profile by user ID
   */
  static async getProfileByUserId(userId: string): Promise<StylistProfile | null> {
    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          phone_number
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  }

  /**
   * Get stylist profile by profile ID
   */
  static async getProfileById(profileId: string): Promise<StylistProfile | null> {
    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          email,
          profile_picture_url,
          phone_number
        )
      `)
      .eq('id', profileId)
      .single();

    if (error || !profile) {
      return null;
    }

    return profile;
  }

  /**
   * Update stylist profile
   */
  static async updateProfile(userId: string, updateData: {
    businessName?: string;
    bio?: string;
    experience?: number;
    specialties?: string[];
    certifications?: string[];
    portfolioImages?: string[];
    businessHours?: BusinessHours;
    serviceRadius?: number;
    baseLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    isAvailable?: boolean;
  }): Promise<StylistProfile> {
    const {
      businessName,
      bio,
      experience,
      specialties,
      certifications,
      portfolioImages,
      businessHours,
      serviceRadius,
      baseLocation,
      isAvailable
    } = updateData;

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (businessName !== undefined) updateFields.business_name = businessName;
    if (bio !== undefined) updateFields.bio = bio;
    if (experience !== undefined) updateFields.experience = experience;
    if (specialties !== undefined) updateFields.specialties = specialties;
    if (certifications !== undefined) updateFields.certifications = certifications;
    if (portfolioImages !== undefined) updateFields.portfolio_images = portfolioImages;
    if (businessHours !== undefined) updateFields.business_hours = businessHours;
    if (serviceRadius !== undefined) updateFields.service_radius = serviceRadius;
    if (isAvailable !== undefined) updateFields.is_available = isAvailable;

    if (baseLocation) {
      updateFields.base_latitude = baseLocation.latitude;
      updateFields.base_longitude = baseLocation.longitude;
      updateFields.base_address = baseLocation.address;
    }

    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .update(updateFields)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update stylist profile', 500);
    }

    return profile;
  }

  /**
   * Search stylists with filters
   */
  static async searchStylists(filters: {
    location?: {
      latitude: number;
      longitude: number;
      radius: number; // in kilometers
    };
    specialties?: string[];
    minRating?: number;
    maxPrice?: number;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      location,
      specialties,
      minRating = 0,
      maxPrice,
      isAvailable = true,
      page = 1,
      limit = 10
    } = filters;

    let query = supabase
      .from('stylist_profiles')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `, { count: 'exact' })
      .eq('is_available', isAvailable)
      .gte('rating', minRating);

    // Filter by specialties
    if (specialties && specialties.length > 0) {
      query = query.overlaps('specialties', specialties);
    }

    const { data: stylists, error, count } = await query
      .range((page - 1) * limit, page * limit - 1)
      .order('rating', { ascending: false });

    if (error) {
      throw new AppError('Failed to search stylists', 500);
    }

    let filteredStylists = stylists || [];

    // Filter by location if provided
    if (location) {
      filteredStylists = filteredStylists.filter(stylist => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          stylist.base_latitude,
          stylist.base_longitude
        );
        return distance <= location.radius;
      });
    }

    return {
      stylists: filteredStylists,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get nearby stylists
   */
  static async getNearbyStylists(
    latitude: number,
    longitude: number,
    radiusKm: number = 25,
    limit: number = 10
  ) {
    const { data: stylists, error } = await supabase
      .from('stylist_profiles')
      .select(`
        *,
        users!inner(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `)
      .eq('is_available', true)
      .limit(limit * 2); // Get more to filter by distance

    if (error) {
      throw new AppError('Failed to fetch nearby stylists', 500);
    }

    // Filter by distance and sort
    const nearbyStylists = (stylists || [])
      .map(stylist => {
        const distance = calculateDistance(
          latitude,
          longitude,
          stylist.base_latitude,
          stylist.base_longitude
        );
        return { ...stylist, distance };
      })
      .filter(stylist => stylist.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return nearbyStylists;
  }

  /**
   * Update stylist availability
   */
  static async updateAvailability(userId: string, isAvailable: boolean) {
    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .update({
        is_available: isAvailable,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update availability', 500);
    }

    return profile;
  }

  /**
   * Update business hours
   */
  static async updateBusinessHours(userId: string, businessHours: BusinessHours) {
    const { data: profile, error } = await supabase
      .from('stylist_profiles')
      .update({
        business_hours: businessHours,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update business hours', 500);
    }

    return profile;
  }

  /**
   * Add portfolio image
   */
  static async addPortfolioImage(userId: string, imageUrl: string) {
    // Get current portfolio images
    const { data: profile } = await supabase
      .from('stylist_profiles')
      .select('portfolio_images')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new AppError('Stylist profile not found', 404);
    }

    const currentImages = profile.portfolio_images || [];
    const updatedImages = [...currentImages, imageUrl];

    const { data: updatedProfile, error } = await supabase
      .from('stylist_profiles')
      .update({
        portfolio_images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to add portfolio image', 500);
    }

    return updatedProfile;
  }

  /**
   * Remove portfolio image
   */
  static async removePortfolioImage(userId: string, imageUrl: string) {
    // Get current portfolio images
    const { data: profile } = await supabase
      .from('stylist_profiles')
      .select('portfolio_images')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new AppError('Stylist profile not found', 404);
    }

    const currentImages = profile.portfolio_images || [];
    const updatedImages = currentImages.filter(img => img !== imageUrl);

    const { data: updatedProfile, error } = await supabase
      .from('stylist_profiles')
      .update({
        portfolio_images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to remove portfolio image', 500);
    }

    return updatedProfile;
  }

  /**
   * Get stylist statistics
   */
  static async getStylistStats(userId: string) {
    const { data: profile } = await supabase
      .from('stylist_profiles')
      .select('rating, total_reviews, total_appointments')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new AppError('Stylist profile not found', 404);
    }

    // Get additional stats from appointments
    const { data: appointmentStats } = await supabase
      .from('appointments')
      .select('status, total_price')
      .eq('stylist_id', userId);

    const completedAppointments = appointmentStats?.filter(apt => apt.status === 'completed') || [];
    const totalEarnings = completedAppointments.reduce((sum, apt) => sum + (apt.total_price || 0), 0);

    return {
      rating: profile.rating,
      totalReviews: profile.total_reviews,
      totalAppointments: profile.total_appointments,
      completedAppointments: completedAppointments.length,
      totalEarnings
    };
  }

  /**
   * Update stylist rating (called after new review)
   */
  static async updateRating(stylistId: string, newRating: number) {
    // Get current rating and review count
    const { data: profile } = await supabase
      .from('stylist_profiles')
      .select('rating, total_reviews')
      .eq('user_id', stylistId)
      .single();

    if (!profile) {
      throw new AppError('Stylist profile not found', 404);
    }

    const currentRating = profile.rating || 0;
    const currentReviews = profile.total_reviews || 0;
    const newReviewCount = currentReviews + 1;
    const updatedRating = ((currentRating * currentReviews) + newRating) / newReviewCount;

    const { error } = await supabase
      .from('stylist_profiles')
      .update({
        rating: Math.round(updatedRating * 100) / 100, // Round to 2 decimal places
        total_reviews: newReviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', stylistId);

    if (error) {
      throw new AppError('Failed to update rating', 500);
    }

    return {
      newRating: Math.round(updatedRating * 100) / 100,
      totalReviews: newReviewCount
    };
  }
}