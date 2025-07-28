import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ApiResponse, ValidationError } from '../types';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const validationErrors: ValidationError[] = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg
    }));

    const response: ApiResponse = {
      success: false,
      error: 'Validation failed',
      errors: validationErrors
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('userType')
    .isIn(['customer', 'stylist', 'both'])
    .withMessage('User type must be customer, stylist, or both'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be less than 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be less than 50 characters'),
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  handleValidationErrors
];

// Service validation rules
export const validateServiceCreation = [
  body('serviceName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Service name is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('estimatedDuration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Estimated duration must be between 15 and 480 minutes'),
  body('category')
    .isIn(['box_braids', 'cornrows', 'french_braids', 'dutch_braids', 'fishtail', 'goddess_braids', 'knotless_braids', 'passion_twists', 'locs', 'twists'])
    .withMessage('Invalid service category'),
  handleValidationErrors
];

// Appointment validation rules
export const validateAppointmentCreation = [
  body('stylistId')
    .isUUID()
    .withMessage('Valid stylist ID is required'),
  body('serviceId')
    .isUUID()
    .withMessage('Valid service ID is required'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Valid appointment date is required'),
  body('specialInstructions')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special instructions must be less than 500 characters'),
  handleValidationErrors
];

// Review validation rules
export const validateReviewCreation = [
  body('appointmentId')
    .isUUID()
    .withMessage('Valid appointment ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must be less than 1000 characters'),
  handleValidationErrors
];

// Message validation rules
export const validateMessageCreation = [
  body('conversationId')
    .isUUID()
    .withMessage('Valid conversation ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content is required and must be less than 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'appointment_request', 'system'])
    .withMessage('Invalid message type'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isAlpha()
    .withMessage('Sort by must contain only letters'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// UUID parameter validation
export const validateUUIDParam = (paramName: string) => [
  param(paramName)
    .isUUID()
    .withMessage(`Valid ${paramName} is required`),
  handleValidationErrors
];