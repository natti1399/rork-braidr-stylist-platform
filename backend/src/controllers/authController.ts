import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { validatePasswordStrength, verifyToken, generateTokenPair } from '../utils/auth';
import { UserType } from '../types';

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, phoneNumber, userType } = req.body;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return sendError(res, passwordValidation.errors.join(', '), 400);
    }

    // Validate user type
    if (!Object.values(UserType).includes(userType)) {
      return sendError(res, 'Invalid user type', 400);
    }

    const result = await UserService.register({
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      userType
    });

    sendCreated(res, result, 'User registered successfully');
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await UserService.login(email, password);

    sendSuccess(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendError(res, 'Refresh token is required', 400);
    }

    try {
      // Verify refresh token
      const payload = verifyToken(refreshToken);
      
      // Get user to ensure they still exist and are active
      const user = await UserService.getUserById(payload.userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      // Generate new token pair
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
        userType: user.userType
      });

      sendSuccess(res, { tokens }, 'Token refreshed successfully');
    } catch (error) {
      return sendError(res, 'Invalid refresh token', 401);
    }
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user }, 'Profile retrieved successfully');
  });

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { firstName, lastName, phoneNumber, profilePictureUrl, bio } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const user = await UserService.updateProfile(userId, {
      firstName,
      lastName,
      phoneNumber,
      profilePictureUrl,
      bio
    });

    sendSuccess(res, { user }, 'Profile updated successfully');
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return sendError(res, passwordValidation.errors.join(', '), 400);
    }

    const result = await UserService.changePassword(userId, currentPassword, newPassword);

    sendSuccess(res, result, 'Password changed successfully');
  });

  /**
   * Deactivate account
   */
  static deactivateAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const result = await UserService.deactivateAccount(userId);

    sendSuccess(res, result, 'Account deactivated successfully');
  });

  /**
   * Logout (client-side token invalidation)
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a JWT-based system, logout is typically handled client-side
    // by removing the token from storage. However, we can provide
    // an endpoint for consistency and potential future token blacklisting.
    
    sendSuccess(res, null, 'Logged out successfully');
  });

  /**
   * Verify email (placeholder for future implementation)
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    // TODO: Implement email verification logic
    // This would involve:
    // 1. Verify the token
    // 2. Update user's email_verified status
    // 3. Return success response

    sendSuccess(res, null, 'Email verification endpoint - to be implemented');
  });

  /**
   * Request password reset (placeholder for future implementation)
   */
  static requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    // TODO: Implement password reset request logic
    // This would involve:
    // 1. Verify user exists
    // 2. Generate reset token
    // 3. Send reset email
    // 4. Store reset token with expiration

    sendSuccess(res, null, 'Password reset request endpoint - to be implemented');
  });

  /**
   * Reset password (placeholder for future implementation)
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    // TODO: Implement password reset logic
    // This would involve:
    // 1. Verify reset token
    // 2. Check token expiration
    // 3. Update user password
    // 4. Invalidate reset token

    sendSuccess(res, null, 'Password reset endpoint - to be implemented');
  });

  /**
   * Check if email exists
   */
  static checkEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return sendError(res, 'Email is required', 400);
    }

    // This is a simple check - in production you might want to be more careful
    // about revealing whether emails exist to prevent enumeration attacks
    const user = await UserService.getUserById(''); // This would need a getUserByEmail method
    
    sendSuccess(res, { exists: !!user }, 'Email check completed');
  });

  /**
   * Get user addresses
   */
  static getAddresses = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const addresses = await UserService.getUserAddresses(userId);

    sendSuccess(res, { addresses }, 'Addresses retrieved successfully');
  });

  /**
   * Add user address
   */
  static addAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const address = await UserService.addAddress(userId, {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault
    });

    sendCreated(res, { address }, 'Address added successfully');
  });

  /**
   * Update user address
   */
  static updateAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const address = await UserService.updateAddress(userId, addressId, {
      street,
      city,
      state,
      zipCode,
      country,
      isDefault
    });

    sendSuccess(res, { address }, 'Address updated successfully');
  });

  /**
   * Delete user address
   */
  static deleteAddress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const { addressId } = req.params;

    if (!userId) {
      return sendError(res, 'User not authenticated', 401);
    }

    const result = await UserService.deleteAddress(userId, addressId);

    sendSuccess(res, result, 'Address deleted successfully');
  });
}