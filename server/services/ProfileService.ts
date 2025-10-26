import User, { IUser } from '../models/User';
import UserPreference, { IUserPreference } from '../models/UserPreference';
import { createError } from '../middleware/errorMiddleware';

export interface ProfileData {
  name: string;
  email: string;
}

export interface ProfileUpdateData {
  name?: string;
  profilePicture?: string;
  avatar?: number;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    avatar: number;
    createdAt: Date;
    updatedAt: Date;
  };
  preferences: IUserPreference | null;
}

export class ProfileService {
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  static validatePassword(password: string): boolean {
    return this.PASSWORD_REGEX.test(password);
  }

  static async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await User.findById(userId).select('-password -refreshTokens -failedLoginAttempts -lockUntil');
    if (!user) {
      throw createError('User not found', 404);
    }

    const preferences = await UserPreference.findOne({ userId });

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        avatar: user.avatar,
        createdAt: (user as any).createdAt,
        updatedAt: (user as any).updatedAt,
      },
      preferences,
    };
  }

  static async updateProfile(userId: string, data: ProfileUpdateData): Promise<ProfileResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if ('email' in data && data.email !== undefined) {
      throw createError('Email address cannot be changed. Please contact support if you need to update your email.', 400);
    }

    if (data.name) user.name = data.name;
    if (data.profilePicture !== undefined) user.profilePicture = data.profilePicture;
    if (data.avatar !== undefined) user.avatar = data.avatar;

    await user.save();

    return this.getProfile(userId);
  }

  static async changePassword(userId: string, data: PasswordChangeData): Promise<void> {
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      throw createError('Please provide current and new password', 400);
    }

    if (!this.validatePassword(newPassword)) {
      throw createError('New password must be at least 8 characters long and include uppercase, lowercase, number, and special character.', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const isCurrentPasswordValid = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw createError('Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
  }

  static async deleteAccount(userId: string, password: string): Promise<void> {
    if (!password) {
      throw createError('Password is required to delete account', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw createError('Password is incorrect', 400);
    }

    await UserPreference.deleteOne({ userId });

    await User.findByIdAndDelete(userId);
  }

  static async getUserStats(userId: string): Promise<{
    totalOpportunities: number;
    totalAlerts: number;
    accountAge: number;
    lastLogin: Date;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    // This would typically involve more complex queries to get actual stats
    // For now, returning mock data structure
    return {
      totalOpportunities: 0,
      totalAlerts: 0,
      accountAge: Math.floor((Date.now() - (user as any).createdAt.getTime()) / (1000 * 60 * 60 * 24)),
      lastLogin: (user as any).updatedAt,
    };
  }
}
