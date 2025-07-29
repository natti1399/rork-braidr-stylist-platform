import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController';
import { authenticateToken, requireStylist, optionalAuth } from '../middleware/auth';
import { generalLimiter, searchLimiter } from '../middleware/rateLimiter';
import {
  validateServiceCreation,
  validatePagination,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// Public routes
router.get('/search',
  searchLimiter,
  validatePagination,
  handleValidationErrors,
  ServiceController.searchServices
);

router.get('/categories',
  generalLimiter,
  ServiceController.getCategories
);

router.get('/category/:category',
  generalLimiter,
  validatePagination,
  handleValidationErrors,
  ServiceController.getServicesByCategory
);

router.get('/popular',
  generalLimiter,
  ServiceController.getPopularServices
);

router.get('/featured',
  generalLimiter,
  ServiceController.getFeaturedServices
);

router.get('/stylist/:stylistId',
  generalLimiter,
  ...validateUUIDParam('stylistId'),
  validatePagination,
  handleValidationErrors,
  ServiceController.getStylistServices
);

router.get('/:serviceId',
  generalLimiter,
  ...validateUUIDParam('serviceId'),
  handleValidationErrors,
  ServiceController.getService
);

router.get('/:serviceId/stats',
  generalLimiter,
  ...validateUUIDParam('serviceId'),
  ServiceController.getServiceStats
);

// Protected routes - require authentication
router.use(authenticateToken);

// Service management (requires stylist role)
router.post('/',
  generalLimiter,
  requireStylist,
  validateServiceCreation,
  handleValidationErrors,
  ServiceController.createService
);

router.get('/my/services',
  generalLimiter,
  requireStylist,
  validatePagination,
  handleValidationErrors,
  ServiceController.getMyServices
);

router.put('/:serviceId',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('serviceId'),
  ServiceController.updateService
);

router.delete('/:serviceId',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('serviceId'),
  ServiceController.deleteService
);

router.patch('/:serviceId/toggle-status',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('serviceId'),
  ServiceController.toggleServiceStatus
);

// Service image management
router.post('/:serviceId/images',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('serviceId'),
  ServiceController.addServiceImage
);

router.delete('/:serviceId/images',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('serviceId'),
  ServiceController.removeServiceImage
);

export default router;