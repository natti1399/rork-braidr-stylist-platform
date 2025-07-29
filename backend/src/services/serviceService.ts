import { supabase } from '../config/database';
import { BraidingService, BraidingCategory } from '../types';
import { generateUUID } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class ServiceService {
  /**
   * Create a new braiding service
   */
  static async createService(stylistId: string, serviceData: {
    name: string;
    description: string;
    category: BraidingCategory;
    basePrice: number;
    duration: number; // in minutes
    images?: string[];
    isActive?: boolean;
  }): Promise<BraidingService> {
    const {
      name,
      description,
      category,
      basePrice,
      duration,
      images = [],
      isActive = true
    } = serviceData;

    // Verify stylist exists
    const { data: stylist } = await supabase
      .from('stylist_profiles')
      .select('id')
      .eq('user_id', stylistId)
      .single();

    if (!stylist) {
      throw new AppError('Stylist profile not found', 404);
    }

    const serviceId = generateUUID();
    const { data: service, error } = await supabase
      .from('braiding_services')
      .insert({
        id: serviceId,
        stylist_id: stylistId,
        name,
        description,
        category,
        base_price: basePrice,
        duration,
        images,
        is_active: isActive,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create service', 500);
    }

    return service;
  }

  /**
   * Get service by ID
   */
  static async getServiceById(serviceId: string): Promise<BraidingService | null> {
    const { data: service, error } = await supabase
      .from('braiding_services')
      .select(`
        *,
        stylist_profiles!inner(
          user_id,
          business_name,
          rating,
          users!inner(
            first_name,
            last_name,
            profile_picture_url
          )
        )
      `)
      .eq('id', serviceId)
      .eq('is_active', true)
      .single();

    if (error || !service) {
      return null;
    }

    return service;
  }

  /**
   * Get services by stylist
   */
  static async getServicesByStylist(
    stylistId: string,
    includeInactive: boolean = false
  ): Promise<BraidingService[]> {
    let query = supabase
      .from('braiding_services')
      .select('*')
      .eq('stylist_id', stylistId);

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: services, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch services', 500);
    }

    return services || [];
  }

  /**
   * Update service
   */
  static async updateService(
    serviceId: string,
    stylistId: string,
    updateData: {
      name?: string;
      description?: string;
      category?: BraidingCategory;
      basePrice?: number;
      duration?: number;
      images?: string[];
      isActive?: boolean;
    }
  ): Promise<BraidingService> {
    const {
      name,
      description,
      category,
      basePrice,
      duration,
      images,
      isActive
    } = updateData;

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (category !== undefined) updateFields.category = category;
    if (basePrice !== undefined) updateFields.base_price = basePrice;
    if (duration !== undefined) updateFields.duration = duration;
    if (images !== undefined) updateFields.images = images;
    if (isActive !== undefined) updateFields.is_active = isActive;

    const { data: service, error } = await supabase
      .from('braiding_services')
      .update(updateFields)
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update service', 500);
    }

    return service;
  }

  /**
   * Delete service
   */
  static async deleteService(serviceId: string, stylistId: string) {
    // Check if service has any pending or confirmed appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('id')
      .eq('service_id', serviceId)
      .in('status', ['pending', 'confirmed']);

    if (appointments && appointments.length > 0) {
      throw new AppError('Cannot delete service with pending or confirmed appointments', 400);
    }

    const { error } = await supabase
      .from('braiding_services')
      .delete()
      .eq('id', serviceId)
      .eq('stylist_id', stylistId);

    if (error) {
      throw new AppError('Failed to delete service', 500);
    }

    return { message: 'Service deleted successfully' };
  }

  /**
   * Search services with filters
   */
  static async searchServices(filters: {
    category?: BraidingCategory;
    minPrice?: number;
    maxPrice?: number;
    maxDuration?: number;
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
    stylistRating?: number;
    query?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      category,
      minPrice,
      maxPrice,
      maxDuration,
      stylistRating,
      query,
      page = 1,
      limit = 10
    } = filters;

    let queryBuilder = supabase
      .from('braiding_services')
      .select(`
        *,
        stylist_profiles!inner(
          user_id,
          business_name,
          rating,
          base_latitude,
          base_longitude,
          users!inner(
            first_name,
            last_name,
            profile_picture_url
          )
        )
      `, { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    if (minPrice !== undefined) {
      queryBuilder = queryBuilder.gte('base_price', minPrice);
    }

    if (maxPrice !== undefined) {
      queryBuilder = queryBuilder.lte('base_price', maxPrice);
    }

    if (maxDuration !== undefined) {
      queryBuilder = queryBuilder.lte('duration', maxDuration);
    }

    if (stylistRating !== undefined) {
      queryBuilder = queryBuilder.gte('stylist_profiles.rating', stylistRating);
    }

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: services, error, count } = await queryBuilder
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to search services', 500);
    }

    return {
      services: services || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get popular services
   */
  static async getPopularServices(limit: number = 10): Promise<BraidingService[]> {
    // Get services with most appointments
    const { data: services, error } = await supabase
      .from('braiding_services')
      .select(`
        *,
        stylist_profiles!inner(
          user_id,
          business_name,
          rating,
          users!inner(
            first_name,
            last_name,
            profile_picture_url
          )
        ),
        appointments(count)
      `)
      .eq('is_active', true)
      .limit(limit)
      .order('appointments.count', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch popular services', 500);
    }

    return services || [];
  }

  /**
   * Get services by category
   */
  static async getServicesByCategory(
    category: BraidingCategory,
    page: number = 1,
    limit: number = 10
  ) {
    const { data: services, error, count } = await supabase
      .from('braiding_services')
      .select(`
        *,
        stylist_profiles!inner(
          user_id,
          business_name,
          rating,
          users!inner(
            first_name,
            last_name,
            profile_picture_url
          )
        )
      `, { count: 'exact' })
      .eq('category', category)
      .eq('is_active', true)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch services by category', 500);
    }

    return {
      services: services || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Add service image
   */
  static async addServiceImage(serviceId: string, stylistId: string, imageUrl: string) {
    // Get current images
    const { data: service } = await supabase
      .from('braiding_services')
      .select('images')
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .single();

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    const currentImages = service.images || [];
    const updatedImages = [...currentImages, imageUrl];

    const { data: updatedService, error } = await supabase
      .from('braiding_services')
      .update({
        images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to add service image', 500);
    }

    return updatedService;
  }

  /**
   * Remove service image
   */
  static async removeServiceImage(serviceId: string, stylistId: string, imageUrl: string) {
    // Get current images
    const { data: service } = await supabase
      .from('braiding_services')
      .select('images')
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .single();

    if (!service) {
      throw new AppError('Service not found', 404);
    }

    const currentImages = service.images || [];
    const updatedImages = currentImages.filter(img => img !== imageUrl);

    const { data: updatedService, error } = await supabase
      .from('braiding_services')
      .update({
        images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', serviceId)
      .eq('stylist_id', stylistId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to remove service image', 500);
    }

    return updatedService;
  }

  /**
   * Get service statistics
   */
  static async getServiceStats(serviceId: string) {
    // Get appointment statistics
    const { data: appointments } = await supabase
      .from('appointments')
      .select('status, total_price, created_at')
      .eq('service_id', serviceId);

    const totalBookings = appointments?.length || 0;
    const completedBookings = appointments?.filter(apt => apt.status === 'completed').length || 0;
    const totalRevenue = appointments
      ?.filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.total_price || 0), 0) || 0;

    // Get average rating from reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('service_id', serviceId);

    const averageRating = reviews && reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    return {
      totalBookings,
      completedBookings,
      totalRevenue,
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: reviews?.length || 0
    };
  }

  /**
   * Get all service categories
   */
  static getServiceCategories(): BraidingCategory[] {
    return Object.values(BraidingCategory);
  }
}