// services/AuthService.ts
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import PendingUser from '../models/PendingUser';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { createError } from '../middleware/errorMiddleware';
import { EmailService } from './EmailService';
import { TokenService } from './TokenService';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    isEmailVerified: boolean;
  };
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  message?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  email: string;
  expiresAt: Date;
}

export class AuthService {
  private static readonly MAX_FAILED_ATTEMPTS = 5;
  private static readonly LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  /**
   * Validate password strength
   */
  static validatePassword(password: string): boolean {
    return this.PASSWORD_REGEX.test(password);
  }

  /**
   * Generate CSRF token
   */
  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Set authentication cookies with remember me support
   */
  static setAuthCookies(res: any, refreshToken: string, csrfToken: string, rememberMe: boolean = false): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' as const,
    };

    // Extended expiry for remember me: 30 days vs 7 days
    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 7 * 24 * 60 * 60 * 1000; // 7 days

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge,
    });

    res.cookie('csrfToken', csrfToken, {
      ...cookieOptions,
      httpOnly: false,
      maxAge: refreshTokenMaxAge,
    });
  }

  /**
   * Clear authentication cookies
   */
  static clearAuthCookies(res: any): void {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('csrfToken', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
  }

  /**
   * Register a new user with email verification
   */
  static async register(data: RegisterData): Promise<RegistrationResponse> {
    const { name, email, password } = data;

    if (!name || !email || !password) {
      throw createError('Please provide name, email and password', 400);
    }

    if (!this.validatePassword(password)) {
      throw createError('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();

    console.log('🔐 [AuthService] Starting user registration process...');
    console.log('🔐 [AuthService] Registration data:', {
      name: normalizedName,
      email: normalizedEmail,
      hasPassword: !!password
    });

    const existingUser = await User.findOne({ email: normalizedEmail });
    let passwordHash: string;

    if (existingUser) {
      console.log('🔐 [AuthService] Found existing user record:', {
        email: normalizedEmail,
        isEmailVerified: existingUser.isEmailVerified,
      });

      if (existingUser.isEmailVerified) {
        console.log('🔐 [AuthService] Existing user is already verified. Aborting registration.');
        throw createError('User already exists', 400);
      }

      console.log('🔐 [AuthService] Existing user is unverified. Migrating to pending user store...');
      passwordHash = existingUser.password;

      console.log('🔐 [AuthService] Removing legacy unverified user record...');
      await User.deleteOne({ _id: existingUser._id });
    } else {
      console.log('🔐 [AuthService] No existing user found, proceeding with new registration...');
      passwordHash = await bcrypt.hash(password, 10);
    }

    const emailVerificationToken = TokenService.generateEmailVerificationToken();
    const emailVerificationExpires = TokenService.getEmailVerificationExpiry();
    const hashedToken = TokenService.hashToken(emailVerificationToken);

    console.log('🔐 [AuthService] Generated verification token and expiry:', {
      rawToken: emailVerificationToken,
      hashedToken: hashedToken,
      tokenLength: emailVerificationToken.length,
      expiresAt: emailVerificationExpires
    });

    // Store raw token temporarily for debugging (remove in production)
    (global as any).debugTokens = (global as any).debugTokens || {};
    (global as any).debugTokens[normalizedEmail] = {
      rawToken: emailVerificationToken,
      hashedToken: hashedToken,
      expiresAt: emailVerificationExpires
    };

    console.log('🔐 [AuthService] Creating/updating pending user record...');
    await PendingUser.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name: normalizedName,
        email: normalizedEmail,
        passwordHash,
        verificationToken: hashedToken,
        verificationExpires: emailVerificationExpires,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('🔐 [AuthService] Pending user record created successfully');

    try {
      console.log('🔐 [AuthService] Attempting to send verification email...');
      await EmailService.sendVerificationEmail(normalizedEmail, normalizedName, emailVerificationToken);
      console.log('🔐 [AuthService] Verification email sent successfully!');
    } catch (error) {
      console.error('🔐 [AuthService] Failed to send verification email:', error);
      console.log('🔐 [AuthService] Cleaning up pending user record...');
      await PendingUser.deleteOne({ email: normalizedEmail });
      throw createError('Failed to send verification email. Please try again.', 500);
    }

    return {
      success: true,
        message: 'A LINK HAS BEEN SENT TO YOUR EMAIL',
      email: normalizedEmail,
      expiresAt: emailVerificationExpires,
    };
  }

  /**
   * Login user with remember me support
   */
  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password, rememberMe = false } = data;

    console.log('🔐 [AuthService] Starting login process...');
    console.log('🔐 [AuthService] Login data:', {
      email,
      hasPassword: !!password,
      rememberMe
    });

    if (!email || !password) {
      throw createError('Please provide email and password', 400);
    }

    console.log('🔐 [AuthService] Looking up user by email...');
    const user = await User.findOne({ email });
    if (!user) {
      console.log('🔐 [AuthService] User not found:', email);
      throw createError('Invalid email or password', 401);
    }

    console.log('🔐 [AuthService] User found:', {
      id: user._id,
      email: user.email,
      failedLoginAttempts: user.failedLoginAttempts,
      lockUntil: user.lockUntil,
      isLocked: user.isLocked()
    });

    // Check if account is locked
    if (user.isLocked()) {
      console.log('🔐 [AuthService] Account is locked for user:', email);
      throw createError('Account is temporarily locked due to too many failed login attempts. Please try again later.', 403);
    }

    console.log('🔐 [AuthService] Checking password...');
    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('🔐 [AuthService] Password mismatch for user:', email);
      // Increment failed attempts
      user.failedLoginAttempts += 1;
      console.log('🔐 [AuthService] Updated failed attempts:', user.failedLoginAttempts);
      
      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockUntil = Date.now() + this.LOCK_TIME;
        console.log('🔐 [AuthService] Account locked until:', new Date(user.lockUntil));
      }
      
      console.log('🔐 [AuthService] Saving user with updated failed attempts...');
      await user.save();
      console.log('🔐 [AuthService] User saved successfully');

      const errorMessage = user.isLocked()
        ? 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        : 'Invalid email or password';
      
      console.log('🔐 [AuthService] Throwing error:', errorMessage);
      throw createError(errorMessage, user.isLocked() ? 403 : 401);
    }

    console.log('🔐 [AuthService] Password match successful, resetting failed attempts...');
    // Reset failed attempts and lock
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    // Clean up old refresh tokens (keep only last 5)
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4); // Keep last 4, we'll add 1 more
    }

    // Generate tokens
    const refreshToken = generateRefreshToken(user._id.toString());
    const accessToken = generateAccessToken(user._id.toString());
    const csrfToken = this.generateCSRFToken();

    // Save refresh token to user
    user.refreshTokens.push(refreshToken);
    console.log('🔐 [AuthService] Saving user with reset failed attempts and new refresh token...');
    await user.save();
    console.log('🔐 [AuthService] User saved successfully');

    console.log('🔐 [AuthService] Login successful for user:', email);
    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
      csrfToken,
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string, csrfToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    if (!refreshToken) {
      throw createError('No refresh token provided', 401);
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      
      if (!user || !user.refreshTokens.includes(refreshToken)) {
        throw createError('Refresh token not recognized', 401);
      }

      // Remove old token and add new one (rotation)
      user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
      const newRefreshToken = generateRefreshToken(decoded.id);
      const newAccessToken = generateAccessToken(decoded.id);
      
      user.refreshTokens.push(newRefreshToken);
      await user.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw createError('Invalid or expired refresh token', 401);
    }
  }

  /**
   * Logout user
   */
  static async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) return;

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        await user.save();
      }
    } catch (error) {
      // Ignore errors during logout
    }
  }

  /**
   * Verify email address
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    console.log('🔐 [AuthService] Starting email verification process...');
    console.log('🔐 [AuthService] Raw token received:', token);
    
    if (!token) {
      console.log('🔐 [AuthService] Error: No token provided');
      throw createError('Verification token is required', 400);
    }

    // Find user by verification token
    const hashedToken = TokenService.hashToken(token);
    console.log('🔐 [AuthService] Hashed token for lookup:', hashedToken);
    
    // Debug: Check all pending users and their tokens
    const allPendingUsers = await PendingUser.find({});
    console.log('🔐 [AuthService] All pending users:', allPendingUsers.map(u => ({
      email: u.email,
      verificationToken: u.verificationToken,
      expiresAt: u.verificationExpires
    })));
    
    const pendingUser = await PendingUser.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: new Date() },
    });
    
    console.log('🔐 [AuthService] Pending user found:', !!pendingUser);
    if (pendingUser) {
      console.log('🔐 [AuthService] Pending user details:', {
        email: pendingUser.email,
        hasToken: !!pendingUser.verificationToken,
        expiresAt: pendingUser.verificationExpires
      });
    }

    // Check if user is already verified by looking up any user with this token hash
    // This handles cases where verification succeeded but the request is retried
    const existingVerifiedUser = await User.findOne({ 
      emailVerificationToken: hashedToken,
      isEmailVerified: true 
    });
    
    if (existingVerifiedUser) {
      console.log('🔐 [AuthService] User already verified, returning success');
      return {
        success: true,
        message: 'Email already verified! You can log in.',
      };
    }

    if (pendingUser) {
      const existingUser = await User.findOne({ email: pendingUser.email });

      if (existingUser) {
        if (!existingUser.isEmailVerified) {
          existingUser.isEmailVerified = true;
          existingUser.emailVerificationToken = null;
          existingUser.emailVerificationExpires = null;
          await existingUser.save();
        }

        await PendingUser.deleteOne({ _id: pendingUser._id });

        return {
          success: true,
          message: 'Email verified successfully! You can now log in.',
        };
      }

      const user = new User({
        name: pendingUser.name,
        email: pendingUser.email,
        password: pendingUser.passwordHash,
        refreshTokens: [],
        failedLoginAttempts: 0,
        lockUntil: null,
        isEmailVerified: true,
      });

      user.emailVerificationToken = null;
      user.emailVerificationExpires = null;
      await user.save();

      await PendingUser.deleteOne({ _id: pendingUser._id });

      return {
        success: true,
        message: 'Email verified successfully! You can now log in.',
      };
    }

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      console.log('🔐 [AuthService] Error: No pending user or valid user found with token');
      console.log('🔐 [AuthService] Token lookup failed for hashed token:', hashedToken);
      
      // Check if there's a recently verified user (within last 10 minutes)
      // This handles race conditions where verification succeeded but token is no longer valid
      const recentVerifiedUser = await User.findOne({
        isEmailVerified: true,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // Last 10 minutes
      });
      
      if (recentVerifiedUser) {
        console.log('🔐 [AuthService] Found recently verified user, returning success');
        return {
          success: true,
          message: 'Email already verified! You can log in.',
        };
      }
      
      throw createError('Invalid or expired verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    return {
      success: true,
      message: 'Email verified successfully! You can now log in.',
    };
  }

  /**
   * Regenerate verification token for existing pending user
   */
  static async regenerateVerificationToken(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
    if (!pendingUser) {
      throw createError('No pending user found with this email', 404);
    }

    // Generate new token
    const emailVerificationToken = TokenService.generateEmailVerificationToken();
    const emailVerificationExpires = TokenService.getEmailVerificationExpiry();
    const hashedToken = TokenService.hashToken(emailVerificationToken);

    console.log('🔐 [AuthService] Regenerated verification token:', {
      rawToken: emailVerificationToken,
      hashedToken: hashedToken,
      expiresAt: emailVerificationExpires
    });

    // Update pending user with new token
    pendingUser.verificationToken = hashedToken;
    pendingUser.verificationExpires = emailVerificationExpires;
    await pendingUser.save();

    // Send new verification email
    await EmailService.sendVerificationEmail(normalizedEmail, pendingUser.name, emailVerificationToken);

    return {
      success: true,
      message: 'New verification email sent successfully!',
    };
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw createError('Email is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailVerificationToken = TokenService.generateEmailVerificationToken();
    const hashedToken = TokenService.hashToken(emailVerificationToken);
    const emailVerificationExpires = TokenService.getEmailVerificationExpiry();

    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
    if (pendingUser) {
      pendingUser.verificationToken = hashedToken;
      pendingUser.verificationExpires = emailVerificationExpires;
      await pendingUser.save();

      try {
        await EmailService.sendVerificationEmail(normalizedEmail, pendingUser.name, emailVerificationToken);
      } catch (error) {
        throw createError('Failed to send verification email. Please try again.', 500);
      }

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      };
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw createError('Email is already verified', 400);
    }

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    try {
      await EmailService.sendVerificationEmail(normalizedEmail, user.name, emailVerificationToken);
    } catch (error) {
      throw createError('Failed to send verification email. Please try again.', 500);
    }

    return {
      success: true,
      message: 'Verification email sent! Please check your inbox.',
    };
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw createError('Email is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      // Don't reveal if user exists or not for security
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate password reset token
    const passwordResetToken = TokenService.generatePasswordResetToken();
    const hashedToken = TokenService.hashToken(passwordResetToken);
    const passwordResetExpires = TokenService.getPasswordResetExpiry();

    // Save token to user
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    try {
      await EmailService.sendPasswordResetEmail(normalizedEmail, user.name, passwordResetToken);
    } catch (error) {
      throw createError('Failed to send password reset email. Please try again.', 500);
    }

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!token || !newPassword) {
      throw createError('Token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: TokenService.hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw createError('Invalid or expired password reset token', 400);
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0; // Reset failed attempts
    user.lockUntil = null; // Unlock account
    await user.save();

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password -emailVerificationToken');
  }
}
