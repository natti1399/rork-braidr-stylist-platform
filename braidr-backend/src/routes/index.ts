import { Router } from 'express';
import authRoutes from './authRoutes';
import stylistRoutes from './stylistRoutes';
import serviceRoutes from './serviceRoutes';
import appointmentRoutes from './appointmentRoutes';
import reviewRoutes from './reviewRoutes';
import messagingRoutes from './messagingRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Braidr API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/stylists', stylistRoutes);
router.use('/services', serviceRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/messaging', messagingRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'Braidr API',
    version: '1.0.0',
    description: 'Backend API for Braidr - Hair Braiding Service Platform',
    endpoints: {
      auth: '/api/auth',
      stylists: '/api/stylists',
      services: '/api/services',
      appointments: '/api/appointments',
      reviews: '/api/reviews',
      messaging: '/api/messaging'
    },
    documentation: 'https://api.braidr.com/docs',
    support: 'support@braidr.com'
  });
});

export default router;