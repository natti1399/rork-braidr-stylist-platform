import { Router } from 'express';
import { StylistController } from '../controllers/stylistController';
import { authenticateToken, requireStylist, optionalAuth } from '../middleware/auth';
import { generalLimiter, searchLimiter } from '../middleware/rateLimiter';
import {
  validateUUIDParam,
  validatePagination,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// Public routes
router.get('/search',
  searchLimiter,
  validatePagination,
  handleValidationErrors,
  StylistController.searchStylists
);

router.get('/nearby',
  searchLimiter,
  StylistController.getNearbyStylists
);

router.get('/featured',
  generalLimiter,
  StylistController.getFeaturedStylists
);

router.get('/specialties',
  generalLimiter,
  StylistController.getSpecialties
);

router.get('/:profileId',
  generalLimiter,
  ...validateUUIDParam('profileId'),
  handleValidationErrors,
  StylistController.getPublicProfile
);

// Protected routes - require authentication
router.use(authenticateToken);

// Stylist profile management (requires stylist role)
router.post('/profile',
  generalLimiter,
  requireStylist,
  StylistController.createProfile
);

router.get('/profile/me',
  generalLimiter,
  requireStylist,
  StylistController.getProfile
);

router.put('/profile',
  generalLimiter,
  requireStylist,
  StylistController.updateProfile
);

// Availability management
router.put('/availability',
  generalLimiter,
  requireStylist,
  StylistController.updateAvailability
);

router.put('/business-hours',
  generalLimiter,
  requireStylist,
  StylistController.updateBusinessHours
);

// Portfolio management
router.post('/portfolio/images',
  generalLimiter,
  requireStylist,
  StylistController.addPortfolioImage
);

router.delete('/portfolio/images',
  generalLimiter,
  requireStylist,
  StylistController.removePortfolioImage
);

// Statistics
router.get('/stats/me',
  generalLimiter,
  requireStylist,
  StylistController.getStats
);

// Dashboard
router.get('/dashboard',
  generalLimiter,
  requireStylist,
  StylistController.getDashboard
);

export default router;