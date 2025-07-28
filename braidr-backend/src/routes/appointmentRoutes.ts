import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController';
import { authenticateToken, requireStylist, requireCustomer } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';
import {
  validateAppointmentCreation,
  validatePagination,
  validateUUIDParam,
  handleValidationErrors
} from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Appointment creation (customers only)
router.post('/',
  generalLimiter,
  requireCustomer,
  validateAppointmentCreation,
  handleValidationErrors,
  AppointmentController.createAppointment
);

// Get appointment by ID (accessible by both customer and stylist)
router.get('/:appointmentId',
  generalLimiter,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.getAppointment
);

// Customer appointment routes
router.get('/customer/appointments',
  generalLimiter,
  requireCustomer,
  validatePagination,
  handleValidationErrors,
  AppointmentController.getCustomerAppointments
);

router.get('/customer/stats',
  generalLimiter,
  requireCustomer,
  AppointmentController.getCustomerStats
);

// Stylist appointment routes
router.get('/stylist/appointments',
  generalLimiter,
  requireStylist,
  validatePagination,
  handleValidationErrors,
  AppointmentController.getStylistAppointments
);

router.get('/stylist/stats',
  generalLimiter,
  requireStylist,
  AppointmentController.getStylistStats
);

// Appointment status management
router.patch('/:appointmentId/status',
  generalLimiter,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.updateAppointmentStatus
);

router.patch('/:appointmentId/payment-status',
  generalLimiter,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.updatePaymentStatus
);

// Appointment actions
router.patch('/:appointmentId/reschedule',
  generalLimiter,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.rescheduleAppointment
);

router.patch('/:appointmentId/cancel',
  generalLimiter,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.cancelAppointment
);

// Stylist-specific actions
router.patch('/:appointmentId/confirm',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.confirmAppointment
);

router.patch('/:appointmentId/start',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.startAppointment
);

router.patch('/:appointmentId/complete',
  generalLimiter,
  requireStylist,
  ...validateUUIDParam('appointmentId'),
  AppointmentController.completeAppointment
);

// Dashboard and utility routes
router.get('/dashboard/upcoming',
  generalLimiter,
  AppointmentController.getUpcomingAppointments
);

router.get('/history',
  generalLimiter,
  validatePagination,
  handleValidationErrors,
  AppointmentController.getAppointmentHistory
);

// Availability checking
router.get('/availability/time-slots',
  generalLimiter,
  AppointmentController.getAvailableTimeSlots
);

export default router;