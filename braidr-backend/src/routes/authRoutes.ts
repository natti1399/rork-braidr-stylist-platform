import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { authLimiter, generalLimiter } from '../middleware/rateLimiter';
import {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', 
  authLimiter,
  validateUserRegistration,
  handleValidationErrors,
  AuthController.register
);

router.post('/login',
  authLimiter,
  validateUserLogin,
  handleValidationErrors,
  AuthController.login
);

router.post('/refresh-token',
  authLimiter,
  AuthController.refreshToken
);

// Email verification routes (placeholder)
router.post('/verify-email',
  authLimiter,
  AuthController.verifyEmail
);

router.post('/resend-verification',
  authLimiter,
  AuthController.verifyEmail // Using verifyEmail as placeholder
);

// Password reset routes (placeholder)
router.post('/forgot-password',
  authLimiter,
  AuthController.verifyEmail // Using verifyEmail as placeholder
);

router.post('/reset-password',
  authLimiter,
  AuthController.resetPassword
);

// Protected routes
router.use(authenticateToken); // All routes below require authentication

// Profile management
router.get('/profile',
  generalLimiter,
  AuthController.getProfile
);

router.put('/profile',
  generalLimiter,
  validateUserUpdate,
  handleValidationErrors,
  AuthController.updateProfile
);

router.post('/change-password',
  authLimiter,
  AuthController.changePassword
);

router.post('/deactivate',
  authLimiter,
  AuthController.deactivateAccount
);

// Address management
router.get('/addresses',
  generalLimiter,
  AuthController.getAddresses
);

router.post('/addresses',
  generalLimiter,
  AuthController.addAddress
);

router.put('/addresses/:addressId',
    generalLimiter,
    ...validateUUIDParam('addressId'),
    AuthController.updateAddress
  );

  router.delete('/addresses/:addressId',
    generalLimiter,
    ...validateUUIDParam('addressId'),
    AuthController.deleteAddress
);

// Logout
router.post('/logout',
  generalLimiter,
  AuthController.logout
);

export default router;