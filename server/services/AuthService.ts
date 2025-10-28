import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUser } from '../models/User';
import PendingUser from '../models/PendingUser';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';
import { createError } from '../middleware/errorMiddleware';
import { EmailService } from './EmailService';
import { TokenService } from './TokenService';
import logger from '../utils/logger';

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
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
  requiresTwoFactor?: boolean;
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
  private static readonly LOCK_TIME = 15 * 60 * 1000;
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  static validatePassword(password: string): boolean {
    return this.PASSWORD_REGEX.test(password);
  }

  static generateCSRFToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static setAuthCookies(res: any, refreshToken: string, csrfToken: string, rememberMe: boolean = false): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax' as const,
    };

    const refreshTokenMaxAge = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000
      : 7 * 24 * 60 * 60 * 1000;

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

    logger.info('Starting user registration process', {
      name: normalizedName,
      email: normalizedEmail,
      hasPassword: !!password
    });

    const existingUser = await User.findOne({ email: normalizedEmail });
    let passwordHash: string;

    if (existingUser) {
      logger.info('Found existing user record', {
        email: normalizedEmail,
        isEmailVerified: existingUser.isEmailVerified,
      });

      if (existingUser.isEmailVerified) {
        throw createError('User already exists', 400);
      }

      passwordHash = existingUser.password;
      await User.deleteOne({ _id: existingUser._id });
    } else {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const emailVerificationToken = TokenService.generateEmailVerificationToken();
    const emailVerificationExpires = TokenService.getEmailVerificationExpiry();
    const hashedToken = TokenService.hashToken(emailVerificationToken);

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

    try {
      await EmailService.sendVerificationEmail(normalizedEmail, normalizedName, emailVerificationToken);
    } catch (error) {
      logger.error('Failed to send verification email', { error });
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

  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password, rememberMe = false } = data;

    if (!email || !password) {
      throw createError('Please provide email and password', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw createError('Invalid email or password', 401);
    }

    if (user.isLocked()) {
      throw createError('Account is temporarily locked due to too many failed login attempts. Please try again later.', 403);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedLoginAttempts += 1;
      
      if (user.failedLoginAttempts >= this.MAX_FAILED_ATTEMPTS) {
        user.lockUntil = Date.now() + this.LOCK_TIME;
      }
      
      await user.save();

      const errorMessage = user.isLocked()
        ? 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        : 'Invalid email or password';
      
      throw createError(errorMessage, user.isLocked() ? 403 : 401);
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    if (user.twoFactorEnabled) {
      await user.save();
      
      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
        requiresTwoFactor: true,
        message: 'Two-factor authentication required'
      };
    }

    if (user.refreshTokens.length >= 5) {
      user.refreshTokens = user.refreshTokens.slice(-4);
    }

    const refreshToken = generateRefreshToken(user._id.toString());
    const accessToken = generateAccessToken(user._id.toString());
    const csrfToken = this.generateCSRFToken();

    user.refreshTokens.push(refreshToken);
    await user.save();

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
    }
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw createError('Verification token is required', 400);
    }

    const hashedToken = TokenService.hashToken(token);
    
    const pendingUser = await PendingUser.findOne({
      verificationToken: hashedToken,
      verificationExpires: { $gt: new Date() },
    });

    const existingVerifiedUser = await User.findOne({ 
      emailVerificationToken: hashedToken,
      isEmailVerified: true 
    });
    
    if (existingVerifiedUser) {
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
    if (!user) {
      const recentVerifiedUser = await User.findOne({
        isEmailVerified: true,
        createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) }
      });
      
      if (recentVerifiedUser) {
        return {
          success: true,
          message: 'Email already verified! You can log in.',
        };
      }
      
      throw createError('Invalid or expired verification token', 400);
    }
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

  static async regenerateVerificationToken(email: string): Promise<{ success: boolean; message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    
    const pendingUser = await PendingUser.findOne({ email: normalizedEmail });
    if (!pendingUser) {
      throw createError('No pending user found with this email', 404);
    }

    const emailVerificationToken = TokenService.generateEmailVerificationToken();
    const emailVerificationExpires = TokenService.getEmailVerificationExpiry();
    const hashedToken = TokenService.hashToken(emailVerificationToken);

    pendingUser.verificationToken = hashedToken;
    pendingUser.verificationExpires = emailVerificationExpires;
    await pendingUser.save();

    await EmailService.sendVerificationEmail(normalizedEmail, pendingUser.name, emailVerificationToken);

    return {
      success: true,
      message: 'New verification email sent successfully!',
    };
  }

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

  static async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    if (!email) {
      throw createError('Email is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    const passwordResetToken = TokenService.generatePasswordResetToken();
    const hashedToken = TokenService.hashToken(passwordResetToken);
    const passwordResetExpires = TokenService.getPasswordResetExpiry();

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

  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    if (!token || !newPassword) {
      throw createError('Token and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw createError('Password must be at least 6 characters long', 400);
    }

    const user = await User.findOne({
      passwordResetToken: TokenService.hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      throw createError('Invalid or expired password reset token', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    return {
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  static async getUserById(id: string): Promise<IUser | null> {
    return await User.findById(id).select('-password -emailVerificationToken');
  }
}
