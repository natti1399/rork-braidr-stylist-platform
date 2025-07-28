import { Response } from 'express';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  };
  
  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode: number = 400
): void => {
  const response: ApiResponse = {
    success: false,
    error
  };
  
  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  message?: string,
  statusCode: number = 200
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    message
  };
  
  res.status(statusCode).json(response);
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  page: number,
  limit: number,
  total: number
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev
  };
};

/**
 * Validate and sanitize pagination parameters
 */
export const sanitizePaginationParams = (
  page?: string | number,
  limit?: string | number
): PaginationParams => {
  const sanitizedPage = Math.max(1, parseInt(String(page || 1), 10) || 1);
  const sanitizedLimit = Math.min(
    Math.max(1, parseInt(String(limit || 10), 10) || 10),
    100 // Maximum limit of 100 items per page
  );
  
  return {
    page: sanitizedPage,
    limit: sanitizedLimit
  };
};

/**
 * Create standardized API response structure
 */
export const createApiResponse = <T>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success
  };
  
  if (data !== undefined) {
    response.data = data;
  }
  
  if (message) {
    response.message = message;
  }
  
  if (error) {
    response.error = error;
  }
  
  return response;
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  data?: T,
  message?: string
): void => {
  sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send unauthorized response (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized'
): void => {
  sendError(res, message, 401);
};

/**
 * Send forbidden response (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden'
): void => {
  sendError(res, message, 403);
};

/**
 * Send not found response (404)
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found'
): void => {
  sendError(res, message, 404);
};

/**
 * Send conflict response (409)
 */
export const sendConflict = (
  res: Response,
  message: string = 'Resource already exists'
): void => {
  sendError(res, message, 409);
};

/**
 * Send validation error response (422)
 */
export const sendValidationError = (
  res: Response,
  errors: any[],
  message: string = 'Validation failed'
): void => {
  const response = {
    success: false,
    error: message,
    details: errors
  };
  
  res.status(422).json(response);
};

/**
 * Send internal server error response (500)
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error'
): void => {
  sendError(res, message, 500);
};