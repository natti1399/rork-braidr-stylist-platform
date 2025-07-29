import { Request, Response } from 'express';

import { ReviewService } from '../services/reviewService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendNoContent } from '../utils/response';
import { sanitizePaginationParams } from '../utils/response';

export class ReviewController {
  /**
   * Create a new review
   */
  static createReview = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const {
      appointmentId,
      stylistId,
      serviceId,
      rating,
      comment,
      images
    } = req.body;

    if (!customerId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate required fields
    if (!appointmentId || !stylistId || !serviceId || !rating) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Validate rating
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      return sendError(res, 'Rating must be an integer between 1 and 5', 400);
    }

    const review = await ReviewService.createReview({
      customerId,
      appointmentId,
      stylistId,
      serviceId,
      rating,
      comment,
      images
    });

    sendCreated(res, { review }, 'Review created successfully');
  });

  /**
   * Get review by ID
   */
  static getReview = asyncHandler(async (req: Request, res: Response) => {
    const { reviewId } = req.params;

    const review = await ReviewService.getReviewById(reviewId);
    if (!review) {
      return sendNotFound(res, 'Review not found');
    }

    sendSuccess(res, { review }, 'Review retrieved successfully');
  });

  /**
   * Get reviews for a stylist
   */
  static getStylistReviews = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (rating) {
      const ratingNum = Number(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filters.rating = ratingNum;
      }
    }

    const result = await ReviewService.getReviewsByStylist(stylistId, filters);

    sendSuccess(res, result, 'Stylist reviews retrieved successfully');
  });

  /**
   * Get reviews for a service
   */
  static getServiceReviews = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (rating) {
      const ratingNum = Number(rating);
      if (ratingNum >= 1 && ratingNum <= 5) {
        filters.rating = ratingNum;
      }
    }

    const result = await ReviewService.getReviewsByService(serviceId, filters);

    sendSuccess(res, result, 'Service reviews retrieved successfully');
  });

  /**
   * Get reviews by customer
   */
  static getCustomerReviews = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!customerId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    const result = await ReviewService.getReviewsByCustomer(customerId, filters);

    sendSuccess(res, result, 'Customer reviews retrieved successfully');
  });

  /**
   * Update review
   */
  static updateReview = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    if (!customerId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate rating if provided
    if (rating !== undefined && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return sendError(res, 'Rating must be an integer between 1 and 5', 400);
    }

    const review = await ReviewService.updateReview(reviewId, customerId, {
      rating,
      comment,
      images
    });

    sendSuccess(res, { review }, 'Review updated successfully');
  });

  /**
   * Delete review
   */
  static deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const { reviewId } = req.params;

    if (!customerId) {
      return sendError(res, 'User not authenticated', 401);
    }

    await ReviewService.deleteReview(reviewId, customerId);

    sendNoContent(res, 'Review deleted successfully');
  });

  /**
   * Get recent reviews (for homepage/dashboard)
   */
  static getRecentReviews = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const reviews = await ReviewService.getRecentReviews(Number(limit));

    sendSuccess(res, { reviews }, 'Recent reviews retrieved successfully');
  });

  /**
   * Get top-rated reviews
   */
  static getTopRatedReviews = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10, minRating = 4 } = req.query;

    const reviews = await ReviewService.getTopRatedReviews(Number(limit), Number(minRating));

    sendSuccess(res, { reviews }, 'Top-rated reviews retrieved successfully');
  });

  /**
   * Get review statistics for a stylist
   */
  static getStylistReviewStats = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId } = req.params;

    const stats = await ReviewService.getStylistReviewStats(stylistId);

    sendSuccess(res, { stats }, 'Stylist review statistics retrieved successfully');
  });

  /**
   * Get review statistics for a service
   */
  static getServiceReviewStats = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.params;

    const stats = await ReviewService.getServiceReviewStats(serviceId);

    sendSuccess(res, { stats }, 'Service review statistics retrieved successfully');
  });

  /**
   * Get reviews that can be written by customer (completed appointments without reviews)
   */
  static getPendingReviews = asyncHandler(async (req: Request, res: Response) => {
    const customerId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!customerId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    // This would require a more complex query to find completed appointments without reviews
    // For now, return empty array as placeholder
    const result = {
      appointments: [],
      pagination: {
        page: sanitizedPage,
        limit: sanitizedLimit,
        total: 0,
        totalPages: 0
      }
    };

    sendSuccess(res, result, 'Pending reviews retrieved successfully');
  });

  /**
   * Get review summary for dashboard
   */
  static getReviewSummary = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { role = 'customer' } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    let summary;
    if (role === 'stylist') {
      // Get reviews received as stylist
      const stats = await ReviewService.getStylistReviewStats(userId);
      const recentReviews = await ReviewService.getReviewsByStylist(userId, { page: 1, limit: 5 });
      
      summary = {
        stats,
        recentReviews: recentReviews.reviews,
        type: 'received'
      };
    } else {
      // Get reviews written as customer
      const customerReviews = await ReviewService.getReviewsByCustomer(userId, { page: 1, limit: 5 });
      
      summary = {
        stats: {
          totalReviews: customerReviews.pagination.total,
          averageRating: 0 // Would need to calculate from customer's reviews
        },
        recentReviews: customerReviews.reviews,
        type: 'written'
      };
    }

    sendSuccess(res, { summary }, 'Review summary retrieved successfully');
  });

  /**
   * Report a review (for inappropriate content)
   */
  static reportReview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { reviewId } = req.params;
    const { reason } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!reason) {
      return sendError(res, 'Report reason is required', 400);
    }

    // In a real implementation, this would create a report record
    // For now, just acknowledge the report
    sendSuccess(res, { reported: true }, 'Review reported successfully');
  });

  /**
   * Get helpful reviews (most liked/helpful)
   */
  static getHelpfulReviews = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId, serviceId, limit = 10 } = req.query;

    if (!stylistId && !serviceId) {
      return sendError(res, 'Either stylistId or serviceId is required', 400);
    }

    let reviews;
    if (stylistId) {
      const result = await ReviewService.getReviewsByStylist(stylistId as string, {
        page: 1,
        limit: Number(limit)
      });
      reviews = result.reviews;
    } else {
      const result = await ReviewService.getReviewsByService(serviceId as string, {
        page: 1,
        limit: Number(limit)
      });
      reviews = result.reviews;
    }

    // Sort by rating and comment length as a proxy for helpfulness
    const helpfulReviews = reviews
      .filter(review => review.comment && review.comment.length > 50)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, Number(limit));

    sendSuccess(res, { reviews: helpfulReviews }, 'Helpful reviews retrieved successfully');
  });
}