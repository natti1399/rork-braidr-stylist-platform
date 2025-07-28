import { Request, Response, NextFunction } from 'express';
import '../types/express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database';
import { config } from '../config';
import { ApiResponse } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    userType: 'customer' | 'stylist' | 'both';
    iat?: number;
    exp?: number;
  };
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      const response: ApiResponse = {
        success: false,
        error: 'Access token required'
      };
      res.status(401).json(response);
      return;
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    
    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, user_type, is_verified')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid token or user not found'
      };
      res.status(401).json(response);
      return;
    }

    if (!user.is_verified) {
      const response: ApiResponse = {
        success: false,
        error: 'Email not verified'
      };
      res.status(401).json(response);
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      userType: user.user_type as 'customer' | 'stylist' | 'both'
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Invalid token'
    };
    res.status(401).json(response);
  }
};

export const requireStylist = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      error: 'Authentication required'
    };
    res.status(401).json(response);
    return;
  }

  if (req.user.userType !== 'stylist' && req.user.userType !== 'both') {
    const response: ApiResponse = {
      success: false,
      error: 'Stylist access required'
    };
    res.status(403).json(response);
    return;
  }

  next();
};

export const requireCustomer = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      error: 'Authentication required'
    };
    res.status(401).json(response);
    return;
  }

  if (req.user.userType !== 'customer' && req.user.userType !== 'both') {
    const response: ApiResponse = {
      success: false,
      error: 'Customer access required'
    };
    res.status(403).json(response);
    return;
  }

  next();
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret) as any;
      
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id, email, user_type')
        .eq('id', decoded.userId)
        .single();

      if (user) {
        req.user = {
          userId: user.id,
          email: user.email,
          userType: user.user_type as 'customer' | 'stylist' | 'both'
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};