import { Request, Response } from 'express';

import { ServiceService } from '../services/serviceService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated, sendNotFound, sendNoContent } from '../utils/response';
import { sanitizePaginationParams } from '../utils/response';
import { BraidingCategory } from '../types';

export class ServiceController {
  /**
   * Create a new service
   */
  static createService = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const {
      name,
      description,
      category,
      basePrice,
      duration,
      images,
      isActive = true
    } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate required fields
    if (!name || !description || !category || !basePrice || !duration) {
      return sendError(res, 'Missing required fields', 400);
    }

    // Validate category
    if (!Object.values(BraidingCategory).includes(category)) {
      return sendError(res, 'Invalid category', 400);
    }

    // Validate price and duration
    if (basePrice <= 0) {
      return sendError(res, 'Base price must be greater than 0', 400);
    }

    if (duration <= 0) {
      return sendError(res, 'Duration must be greater than 0', 400);
    }

    const service = await ServiceService.createService(userId, {
      name,
      description,
      category,
      basePrice,
      duration,
      images,
      isActive
    });

    sendCreated(res, { service }, 'Service created successfully');
  });

  /**
   * Get service by ID
   */
  static getService = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.params;

    const service = await ServiceService.getServiceById(serviceId);
    if (!service) {
      return sendNotFound(res, 'Service not found');
    }

    sendSuccess(res, { service }, 'Service retrieved successfully');
  });

  /**
   * Get services by stylist
   */
  static getStylistServices = asyncHandler(async (req: Request, res: Response) => {
    const { stylistId } = req.params;
    const { page = 1, limit = 10, category, isActive } = req.query;

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (category) {
      filters.category = category as BraidingCategory;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const result = await ServiceService.getServicesByStylist(stylistId, filters);

    sendSuccess(res, result, 'Stylist services retrieved successfully');
  });

  /**
   * Get current user's services (for stylist dashboard)
   */
  static getMyServices = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, category, isActive } = req.query;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (category) {
      filters.category = category as BraidingCategory;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const result = await ServiceService.getServicesByStylistUserId(userId, filters);

    sendSuccess(res, result, 'Your services retrieved successfully');
  });

  /**
   * Update service
   */
  static updateService = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;
    const {
      name,
      description,
      category,
      basePrice,
      duration,
      images,
      isActive
    } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate category if provided
    if (category && !Object.values(BraidingCategory).includes(category)) {
      return sendError(res, 'Invalid category', 400);
    }

    // Validate price if provided
    if (basePrice !== undefined && basePrice <= 0) {
      return sendError(res, 'Base price must be greater than 0', 400);
    }

    // Validate duration if provided
    if (duration !== undefined && duration <= 0) {
      return sendError(res, 'Duration must be greater than 0', 400);
    }

    const service = await ServiceService.updateService(serviceId, userId, {
      name,
      description,
      category,
      basePrice,
      duration,
      images,
      isActive
    });

    sendSuccess(res, { service }, 'Service updated successfully');
  });

  /**
   * Delete service
   */
  static deleteService = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    await ServiceService.deleteService(serviceId, userId);

    sendNoContent(res, 'Service deleted successfully');
  });

  /**
   * Search services
   */
  static searchServices = asyncHandler(async (req: Request, res: Response) => {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      maxDuration,
      latitude,
      longitude,
      radius = 25,
      page = 1,
      limit = 10
    } = req.query;

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (query) {
      filters.query = query as string;
    }

    if (category) {
      filters.category = category as BraidingCategory;
    }

    if (minPrice) {
      filters.minPrice = Number(minPrice);
    }

    if (maxPrice) {
      filters.maxPrice = Number(maxPrice);
    }

    if (maxDuration) {
      filters.maxDuration = Number(maxDuration);
    }

    // Add location filter if provided
    if (latitude && longitude) {
      filters.location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
        radius: Number(radius)
      };
    }

    const result = await ServiceService.searchServices(filters);

    sendSuccess(res, result, 'Services retrieved successfully');
  });

  /**
   * Get services by category
   */
  static getServicesByCategory = asyncHandler(async (req: Request, res: Response) => {
    const { category } = req.params;
    const { page = 1, limit = 10, minPrice, maxPrice, maxDuration } = req.query;

    // Validate category
    if (!Object.values(BraidingCategory).includes(category as BraidingCategory)) {
      return sendError(res, 'Invalid category', 400);
    }

    const { page: sanitizedPage, limit: sanitizedLimit } = sanitizePaginationParams(page, limit);

    const filters: any = {
      category: category as BraidingCategory,
      page: sanitizedPage,
      limit: sanitizedLimit
    };

    if (minPrice) {
      filters.minPrice = Number(minPrice);
    }

    if (maxPrice) {
      filters.maxPrice = Number(maxPrice);
    }

    if (maxDuration) {
      filters.maxDuration = Number(maxDuration);
    }

    const result = await ServiceService.searchServices(filters);

    sendSuccess(res, result, 'Services retrieved successfully');
  });

  /**
   * Get popular services
   */
  static getPopularServices = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 10 } = req.query;

    const result = await ServiceService.getPopularServices(Number(limit));

    sendSuccess(res, { services: result }, 'Popular services retrieved successfully');
  });

  /**
   * Add service image
   */
  static addServiceImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;
    const { imageUrl } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!imageUrl) {
      return sendError(res, 'Image URL is required', 400);
    }

    const service = await ServiceService.addServiceImage(serviceId, userId, imageUrl);

    sendSuccess(res, { service }, 'Service image added successfully');
  });

  /**
   * Remove service image
   */
  static removeServiceImage = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;
    const { imageUrl } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    if (!imageUrl) {
      return sendError(res, 'Image URL is required', 400);
    }

    const service = await ServiceService.removeServiceImage(serviceId, userId, imageUrl);

    sendSuccess(res, { service }, 'Service image removed successfully');
  });

  /**
   * Get service statistics
   */
  static getServiceStats = asyncHandler(async (req: Request, res: Response) => {
    const { serviceId } = req.params;

    const stats = await ServiceService.getServiceStats(serviceId);

    sendSuccess(res, { stats }, 'Service statistics retrieved successfully');
  });

  /**
   * Get all categories
   */
  static getCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = Object.values(BraidingCategory).map(category => ({
      value: category,
      label: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }));

    sendSuccess(res, { categories }, 'Categories retrieved successfully');
  });

  /**
   * Toggle service active status
   */
  static toggleServiceStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { serviceId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Get current service to toggle status
    const currentService = await ServiceService.getServiceById(serviceId);
    if (!currentService) {
      return sendNotFound(res, 'Service not found');
    }

    // Check ownership
    if (currentService.stylistId !== userId) {
      return sendError(res, 'Unauthorized to modify this service', 403);
    }

    const service = await ServiceService.updateService(serviceId, userId, {
      isActive: !currentService.isActive
    });

    sendSuccess(res, { service }, `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`);
  });

  /**
   * Get featured services (for homepage)
   */
  static getFeaturedServices = asyncHandler(async (req: Request, res: Response) => {
    const { limit = 8 } = req.query;

    // Get popular services as featured
    const result = await ServiceService.getPopularServices(Number(limit));

    sendSuccess(res, { services: result }, 'Featured services retrieved successfully');
  });
}