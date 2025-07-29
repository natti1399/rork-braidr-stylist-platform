import { supabase, supabaseAdmin } from '../config/database';
import { User, UserType, StylistProfile, Address } from '../types';
import { hashPassword, comparePassword, generateTokenPair, TokenPayload } from '../utils/auth';
import { generateUUID, isValidEmail } from '../utils/helpers';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  /**
   * Register a new user
   */
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    userType: UserType;
  }) {
    const { email, password, firstName, lastName, phoneNumber, userType } = userData;

    // Validate email format
    if (!isValidEmail(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = generateUUID();
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        user_type: userType,
        is_email_verified: false,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create user', 500);
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type
    };

    const tokens = generateTokenPair(tokenPayload);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      tokens
    };
  }

  /**
   * Login user
   */
  static async login(email: string, password: string) {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      userType: user.user_type
    };

    const tokens = generateTokenPair(tokenPayload);

    // Return user data without password
    const { password_hash, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      tokens
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        stylist_profiles(*),
        addresses(*)
      `)
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      return null;
    }

    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updateData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
    bio?: string;
  }) {
    const { firstName, lastName, phoneNumber, profilePictureUrl, bio } = updateData;

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (firstName) updateFields.first_name = firstName;
    if (lastName) updateFields.last_name = lastName;
    if (phoneNumber) updateFields.phone_number = phoneNumber;
    if (profilePictureUrl) updateFields.profile_picture_url = profilePictureUrl;
    if (bio) updateFields.bio = bio;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateFields)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500);
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Get current user
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedNewPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      throw new AppError('Failed to update password', 500);
    }

    return { message: 'Password updated successfully' };
  }

  /**
   * Deactivate user account
   */
  static async deactivateAccount(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to deactivate account', 500);
    }

    return { message: 'Account deactivated successfully' };
  }

  /**
   * Get user addresses
   */
  static async getUserAddresses(userId: string): Promise<Address[]> {
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch addresses', 500);
    }

    return addresses || [];
  }

  /**
   * Add user address
   */
  static async addAddress(userId: string, addressData: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }): Promise<Address> {
    const { street, city, state, zipCode, country, isDefault = false } = addressData;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const addressId = generateUUID();
    const { data: address, error } = await supabase
      .from('addresses')
      .insert({
        id: addressId,
        user_id: userId,
        street,
        city,
        state,
        zip_code: zipCode,
        country,
        is_default: isDefault,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to add address', 500);
    }

    return address;
  }

  /**
   * Update address
   */
  static async updateAddress(userId: string, addressId: string, updateData: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<Address> {
    const { street, city, state, zipCode, country, isDefault } = updateData;

    // If this is set as default, unset other default addresses
    if (isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const updateFields: any = {
      updated_at: new Date().toISOString()
    };

    if (street) updateFields.street = street;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (zipCode) updateFields.zip_code = zipCode;
    if (country) updateFields.country = country;
    if (isDefault !== undefined) updateFields.is_default = isDefault;

    const { data: address, error } = await supabase
      .from('addresses')
      .update(updateFields)
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update address', 500);
    }

    return address;
  }

  /**
   * Delete address
   */
  static async deleteAddress(userId: string, addressId: string) {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) {
      throw new AppError('Failed to delete address', 500);
    }

    return { message: 'Address deleted successfully' };
  }

  /**
   * Search users (for admin purposes)
   */
  static async searchUsers(query: string, userType?: UserType, page: number = 1, limit: number = 10) {
    let queryBuilder = supabase
      .from('users')
      .select('id, email, first_name, last_name, user_type, is_active, created_at', { count: 'exact' })
      .eq('is_active', true);

    if (query) {
      queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`);
    }

    if (userType) {
      queryBuilder = queryBuilder.eq('user_type', userType);
    }

    const { data: users, error, count } = await queryBuilder
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to search users', 500);
    }

    return {
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    };
  }
}