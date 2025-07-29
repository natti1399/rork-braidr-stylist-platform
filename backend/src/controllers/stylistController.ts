import { Request, Response } from 'express';

import { StylistService } from '../services/stylistService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated, sendNotFound } from '../utils/response';
import { sanitizePaginationParams } from '../utils/response';
import { BraidingCategory } from '../types';

export class StylistController {
  /**
   * Create stylist profile
   */
  static createProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const {
      businessName,
      bio,
      experience,
      specialties,
      certifications,
      portfolioImages,
      businessHours,
      serviceRadius,
      baseLocation
    } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate required fields
    if (!bio || !experience || !specialties || !businessHours || !serviceRadius || !baseLocation) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Validate base location
    if (!baseLocation.latitude || !baseLocation.longitude || !baseLocation.address) {
      return sendError(res, 'Complete base location is required', 400);
    }

    // Validate business hours structure
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of requiredDays) {
      if (!businessHours[day] || typeof businessHours[day].isOpen !== 'boolean') {
        return sendError(res, `Invalid business hours for ${day}`, 400);
      }
    }

    const profile = await StylistService.createProfile(userId, {
      businessName,
      bio,
      experience,
      specialties,
      certifications,
      portfolioImages,
      businessHours,
      serviceRadius,
      baseLocation
    });

    sendCreated(res, { profile }, 'Stylist profile created successfully');
  });

  /**
   * Get stylist profile by user ID
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const profile = await StylistService.getProfileByUserId(userId);
    if (!profile) {
      return sendNotFound(res, 'Stylist profile not found');
    }

    sendSuccess(res, { profile }, 'Stylist profile retrieved successfully');
  });

  /**
   * Get stylist profile by profile ID (public)
   */
  static getPublicProfile = asyncHandler(async (req: Request, res: Response) => {
    const { profileId } = req.params;

    const profile = await StylistService.getProfileById(profileId);
    if (!profile) {
      return sendNotFound(res, 'Stylist profile not found');
    }

    sendSuccess(res, { profile }, 'Stylist profile retrieved successfully');
  });

  /**
   * Update stylist profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
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
    } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const profile = await StylistService.updateProfile(userId, {
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
    });

    sendSuccess(res, { profile }, 'Stylist profile updated successfully');
  });

  /**
   * Search stylists
   */
  static searchStylists = asyncHandler(async (req: Request, res: Response) => {
    const {
      latitude,
      longitude,
      radius = 25,
      specialties,
      minRating = 0,
      maxPrice,
      isAvailable = true,
      page = 1,
      limit = 10
    } = req.query;

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      minRating: Number(minRating),
      isAvailable: isAvailable === 'true',
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    // Add location filter if provided
    if (latitude && longitude) {
      filters.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius)
      };
    }

    // Add specialties filter if provided
    if (specialties) {
      filters.specialties = Array.isArray(specialties) ? specialties : [specialties];
    }

    // Add max price filter if provided
    if (maxPrice) {
      filters.maxPrice = Number(maxPrice);
    }

    const result = await StylistService.searchStylists(filters);

    sendSuccess(res, result, 'Stylists retrieved successfully');
  });

  /**
   * Get nearby stylists
   */
  static getNearbyStylists = asyncHandler(async (req: Request, res: Response) => {
    const { latitude, longitude, radius = 25, limit = 10 } = req.query;

    if (!latitude || !longitude) {
      return sendError(res, 'Latitude and longitude are required', 400);
    }

    const stylists = await StylistService.getNearbyStylists(
      Number(latitude),
      Number(longitude),
      Number(radius),
      Number(limit)
    );

    sendSuccess(res, { stylists }, 'Nearby stylists retrieved successfully');
  });

  /**
   * Update availability
   */
  static updateAvailability = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { isAvailable } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (typeof isAvailable !== 'boolean') {
      return sendError(res, 'isAvailable must be a boolean', 400);
    }

    const profile = await StylistService.updateAvailability(userId, isAvailable);

    sendSuccess(res, { profile }, 'Availability updated successfully');
  });

  /**
   * Update business hours
   */
  static updateBusinessHours = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { businessHours } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!businessHours) {
      return sendError(res, 'Business hours are required', 400);
    }

    // Validate business hours structure
    const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (const day of requiredDays) {
      if (!businessHours[day] || typeof businessHours[day].isOpen !== 'boolean') {
        return sendError(res, `Invalid business hours for ${day}`, 400);
      }
    }

    const profile = await StylistService.updateBusinessHours(userId, businessHours);

    sendSuccess(res, { profile }, 'Business hours updated successfully');
  });

  /**
   * Add portfolio image
   */
  static addPortfolioImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { imageUrl } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!imageUrl) {
      return sendError(res, 'Image URL is required', 400);
    }

    const profile = await StylistService.addPortfolioImage(userId, imageUrl);

    sendSuccess(res, { profile }, 'Portfolio image added successfully');
  });

  /**
   * Remove portfolio image
   */
  static removePortfolioImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { imageUrl } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!imageUrl) {
      return sendError(res, 'Image URL is required', 400);
    }

    const profile = await StylistService.removePortfolioImage(userId, imageUrl);

    sendSuccess(res, { profile }, 'Portfolio image removed successfully');
  });

  /**
   * Get stylist statistics
   */
  static getStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const stats = await StylistService.getStylistStats(userId);

    sendSuccess(res, { stats }, 'Stylist statistics retrieved successfully');
  });

  /**
   * Get all specialties (for dropdown/filter options)
   */
  static getSpecialties = asyncHandler(async (req: Request, res: Response) => {
    // This could be dynamic from database or static list
    const specialties = [
      'Box Braids',
      'Cornrows',
      'French Braids',
      'Dutch Braids',
      'Fishtail Braids',
      'Goddess Braids',
      'Knotless Braids',
      'Fulani Braids',
      'Senegalese Twists',
      'Passion Twists',
      'Marley Twists',
      'Havana Twists',
      'Crochet Braids',
      'Faux Locs',
      'Butterfly Locs',
      'Bantu Knots',
      'Flat Twists',
      'Two-Strand Twists',
      'Micro Braids',
      'Tree Braids',
      'Invisible Braids',
      'Feed-in Braids',
      'Stitch Braids',
      'Tribal Braids',
      'Bohemian Braids'
    ];

    sendSuccess(res, { specialties }, 'Specialties retrieved successfully');
  });

  /**
   * Get featured stylists (for homepage)
   */
  static getFeaturedStylists = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 6 } = req.query;

    // Get top-rated stylists
    const result = await StylistService.searchStylists({
      minRating: 4.0,
      isAvailable: true,
      page: 1,
      limit: Number(limit)
    });

    sendSuccess(res, { stylists: result.stylists }, 'Featured stylists retrieved successfully');
  });

  /**
   * Get stylist dashboard data
   */
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Get profile and stats
    const [profile, stats] = await Promise.all([
      StylistService.getProfileByUserId(userId),
      StylistService.getStylistStats(userId)
    ]);

    if (!profile) {
      return sendNotFound(res, 'Stylist profile not found');
    }

    const dashboardData = {
      profile,
      stats,
      quickActions: {
        updateAvailability: `/api/stylists/availability`,
        viewAppointments: `/api/appointments/stylist`,
        manageServices: `/api/services`,
        viewReviews: `/api/reviews/stylist`
      }
    };

    sendSuccess(res, dashboardData, 'Dashboard data retrieved successfully');
  });
}