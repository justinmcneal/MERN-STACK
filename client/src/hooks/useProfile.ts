// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import ProfileService from '../services/profileService';
import type { 
  ProfileResponse, 
  UpdateProfileData, 
  ChangePasswordData, 
  UserStats,
  DeleteAccountData 
} from '../services/profileService';
import ErrorHandler from '../utils/errorHandler';

export interface ProfileFormData {
  name: string;
  email: string;
}

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});

  // Load profile data
  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const profileData = await ProfileService.getProfile();
      setProfile(profileData);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Load user stats
  const loadUserStats = async () => {
    try {
      const stats = await ProfileService.getUserStats();
      setUserStats(stats);
    } catch (error: any) {
      console.error('Failed to load user stats:', error);
    }
  };

  // Update profile
  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedProfile = await ProfileService.updateProfile(data);
      setProfile(updatedProfile);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Change password
  const changePassword = async (data: ChangePasswordData) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      await ProfileService.changePassword(data);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete account
  const deleteAccount = async (data: DeleteAccountData) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      await ProfileService.deleteAccount(data);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Validate profile form
  const validateProfileForm = (formData: ProfileFormData): boolean => {
    const newErrors: ProfileErrors = {};

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must not exceed 50 characters';
    }

    // Validate email
    const emailError = ErrorHandler.handleValidationError('email', formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = (formData: PasswordFormData): boolean => {
    const newErrors: ProfileErrors = {};

    // Validate current password
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    // Validate new password
    const passwordError = ErrorHandler.handleValidationError('password', formData.newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load data on mount
  useEffect(() => {
    loadProfile();
    loadUserStats();
  }, []);

  return {
    profile,
    userStats,
    isLoading,
    isUpdating,
    errors,
    loadProfile,
    loadUserStats,
    updateProfile,
    changePassword,
    deleteAccount,
    validateProfileForm,
    validatePasswordForm,
    setErrors
  };
};
