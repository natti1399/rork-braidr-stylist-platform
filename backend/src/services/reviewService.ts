import { supabase } from '../config/database';
import { Review, AppointmentStatus } from '../types';
import { generateUUID } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';
import { StylistService } from './stylistService';

export class ReviewService {
  /**
   * Create a new review
   */
  static async createReview(reviewData: {
    customerId: string;
    stylistId: string;
    appointmentId: string;
    serviceId: string;
    rating: number;
    comment?: string;
    images?: string[];
  }): Promise<Review> {
    const {
      customerId,
      stylistId,
      appointmentId,
      serviceId,
      rating,
      comment,
      images = []
    } = reviewData;

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    // Verify appointment exists and is completed
    const { data: appointment } = await supabase
      .from('appointments')
      .select('status, customer_id, stylist_id, service_id')
      .eq('id', appointmentId)
      .single();

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      throw new AppError('Can only review completed appointments', 400);
    }

    if (appointment.customer_id !== customerId) {
      throw new AppError('Not authorized to review this appointment', 403);
    }

    if (appointment.stylist_id !== stylistId || appointment.service_id !== serviceId) {
      throw new AppError('Invalid stylist or service for this appointment', 400);
    }

    // Check if review already exists for this appointment
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single();

    if (existingReview) {
      throw new AppError('Review already exists for this appointment', 409);
    }

    const reviewId = generateUUID();
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        id: reviewId,
        customer_id: customerId,
        stylist_id: stylistId,
        appointment_id: appointmentId,
        service_id: serviceId,
        rating,
        comment,
        images,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create review', 500);
    }

    // Update stylist rating
    await StylistService.updateRating(stylistId, rating);

    return review;
  }

  /**
   * Get review by ID
   */
  static async getReviewById(reviewId: string): Promise<Review | null> {
    const { data: review, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error || !review) {
      return null;
    }

    return review;
  }

  /**
   * Get reviews for a stylist
   */
  static async getStylistReviews(
    stylistId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category
        )
      `, { count: 'exact' })
      .eq('stylist_id', stylistId)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch stylist reviews', 500);
    }

    return {
      reviews: reviews || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get reviews for a service
   */
  static async getServiceReviews(
    serviceId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        )
      `, { count: 'exact' })
      .eq('service_id', serviceId)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch service reviews', 500);
    }

    return {
      reviews: reviews || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Get reviews by customer
   */
  static async getCustomerReviews(
    customerId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const { data: reviews, error, count } = await supabase
      .from('reviews')
      .select(`
        *,
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category,
          images
        )
      `, { count: 'exact' })
      .eq('customer_id', customerId)
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch customer reviews', 500);
    }

    return {
      reviews: reviews || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }

  /**
   * Update review
   */
  static async updateReview(
    reviewId: string,
    customerId: string,
    updateData: {
      rating?: number;
      comment?: string;
      images?: string[];
    }
  ): Promise<Review> {
    const { rating, comment, images } = updateData;

    // Verify review belongs to customer
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('customer_id, stylist_id, rating')
      .eq('id', reviewId)
      .single();

    if (!existingReview) {
      throw new AppError('Review not found', 404);
    }

    if (existingReview.customer_id !== customerId) {
      throw new AppError('Not authorized to update this review', 403);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (rating !== undefined) updateFields.rating = rating;
    if (comment !== undefined) updateFields.comment = comment;
    if (images !== undefined) updateFields.images = images;

    const { data: review, error } = await supabase
      .from('reviews')
      .update(updateFields)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update review', 500);
    }

    // If rating changed, update stylist rating
    if (rating !== undefined && rating !== existingReview.rating) {
      // Recalculate stylist rating
      await this.recalculateStylistRating(existingReview.stylist_id);
    }

    return review;
  }

  /**
   * Delete review
   */
  static async deleteReview(reviewId: string, customerId: string) {
    // Verify review belongs to customer
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('customer_id, stylist_id')
      .eq('id', reviewId)
      .single();

    if (!existingReview) {
      throw new AppError('Review not found', 404);
    }

    if (existingReview.customer_id !== customerId) {
      throw new AppError('Not authorized to delete this review', 403);
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      throw new AppError('Failed to delete review', 500);
    }

    // Recalculate stylist rating
    await this.recalculateStylistRating(existingReview.stylist_id);

    return { message: 'Review deleted successfully' };
  }

  /**
   * Get review statistics for stylist
   */
  static async getStylistReviewStats(stylistId: string) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', stylistId);

    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews,
      ratingDistribution
    };
  }

  /**
   * Get review statistics for service
   */
  static async getServiceReviewStats(serviceId: string) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('service_id', serviceId);

    if (!reviews || reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating] = (dist[review.rating] || 0) + 1;
      return dist;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews,
      ratingDistribution
    };
  }

  /**
   * Get recent reviews (for homepage/dashboard)
   */
  static async getRecentReviews(limit: number = 10) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new AppError('Failed to fetch recent reviews', 500);
    }

    return reviews || [];
  }

  /**
   * Get top-rated reviews
   */
  static async getTopRatedReviews(limit: number = 10) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        customers:users!customer_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        stylists:users!stylist_id(
          id,
          first_name,
          last_name,
          profile_picture_url
        ),
        services:braiding_services!service_id(
          id,
          name,
          category
        )
      `)
      .eq('rating', 5)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new AppError('Failed to fetch top-rated reviews', 500);
    }

    return reviews || [];
  }

  /**
   * Check if customer can review appointment
   */
  static async canReviewAppointment(customerId: string, appointmentId: string): Promise<boolean> {
    // Check if appointment is completed and belongs to customer
    const { data: appointment } = await supabase
      .from('appointments')
      .select('status, customer_id')
      .eq('id', appointmentId)
      .single();

    if (!appointment || appointment.customer_id !== customerId) {
      return false;
    }

    if (appointment.status !== AppointmentStatus.COMPLETED) {
      return false;
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single();

    return !existingReview;
  }

  /**
   * Recalculate stylist rating after review changes
   */
  private static async recalculateStylistRating(stylistId: string) {
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('stylist_id', stylistId);

    if (!reviews || reviews.length === 0) {
      // No reviews, set rating to 0
      await supabase
        .from('stylist_profiles')
        .update({
          rating: 0,
          total_reviews: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', stylistId);
      return;
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;

    await supabase
      .from('stylist_profiles')
      .update({
        rating: Math.round(averageRating * 100) / 100,
        total_reviews: totalReviews,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', stylistId);
  }
}