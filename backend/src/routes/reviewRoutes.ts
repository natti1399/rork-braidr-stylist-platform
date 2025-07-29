import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController';
import { authenticateToken, requireCustomer, optionalAuth } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import {
  validateReviewCreation,
  validatePagination,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// Public routes
router.get('/recent',
  generalLimiter,
  ReviewController.getRecentReviews
);

router.get('/top-rated',
  generalLimiter,
  ReviewController.getTopRatedReviews
);

router.get('/helpful',
  generalLimiter,
  ReviewController.getHelpfulReviews
);

router.get('/stylist/:stylistId',
  generalLimiter,
  ...validateUUIDParam('stylistId'),
  validatePagination,
  handleValidationErrors,
  ReviewController.getStylistReviews
);

router.get('/stylist/:stylistId/stats',
  generalLimiter,
  ...validateUUIDParam('stylistId'),
  ReviewController.getStylistReviewStats
);

router.get('/service/:serviceId',
  generalLimiter,
  ...validateUUIDParam('serviceId'),
  validatePagination,
  handleValidationErrors,
  ReviewController.getServiceReviews
);

router.get('/service/:serviceId/stats',
  generalLimiter,
  ...validateUUIDParam('serviceId'),
  ReviewController.getServiceReviewStats
);

router.get('/:reviewId',
  generalLimiter,
  ...validateUUIDParam('reviewId'),
  ReviewController.getReview
);

// Protected routes - require authentication
router.use(authenticateToken);

// Review creation (customers only)
router.post('/',
  generalLimiter,
  requireCustomer,
  validateReviewCreation,
  handleValidationErrors,
  ReviewController.createReview
);

// Customer review management
router.get('/customer/reviews',
  generalLimiter,
  requireCustomer,
  validatePagination,
  handleValidationErrors,
  ReviewController.getCustomerReviews
);

router.get('/customer/pending',
  generalLimiter,
  requireCustomer,
  validatePagination,
  handleValidationErrors,
  ReviewController.getPendingReviews
);

router.put('/:reviewId',
  generalLimiter,
  requireCustomer,
  ...validateUUIDParam('reviewId'),
  ReviewController.updateReview
);

router.delete('/:reviewId',
  generalLimiter,
  requireCustomer,
  ...validateUUIDParam('reviewId'),
  ReviewController.deleteReview
);

// Review reporting
router.post('/:reviewId/report',
  generalLimiter,
  ...validateUUIDParam('reviewId'),
  ReviewController.reportReview
);

// Dashboard and summary routes
router.get('/dashboard/summary',
  generalLimiter,
  ReviewController.getReviewSummary
);

export default router;