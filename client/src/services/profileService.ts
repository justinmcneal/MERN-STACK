// services/profileService.ts
import { apiClient } from './api';

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  profilePicture: string | null;
  avatar: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreference {
  _id: string;
  userId: string;
  tokensTracked: string[];
  alertThresholds: {
    minProfit: number;
    maxGasCost: number;
    minROI: number;
    minScore: number;
  };
  notificationSettings: {
    email: boolean;
    dashboard: boolean;
    telegram?: boolean;
    discord?: boolean;
  };
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
}

export interface ProfileResponse {
  user: ProfileData;
  preferences: UserPreference | null;
}

export interface UserStats {
  totalOpportunities: number;
  totalAlerts: number;
  accountAge: number;
  lastLogin: string;
}

export interface UpdateProfileData {
  name?: string;
  profilePicture?: string;
  avatar?: number;
  // email?: string; // Email changes are disabled for security
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePreferencesData {
  tokensTracked?: string[];
  alertThresholds?: Partial<UserPreference['alertThresholds']>;
  notificationSettings?: Partial<UserPreference['notificationSettings']>;
  refreshInterval?: number;
  theme?: 'light' | 'dark' | 'auto';
  currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
}

export interface DeleteAccountData {
  password: string;
}

class ProfileService {
  /**
   * Get user profile with preferences
   */
  static async getProfile(): Promise<ProfileResponse> {
    try {
      const response = await apiClient.get<{ success: boolean; data: ProfileResponse }>('/profile');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: UpdateProfileData): Promise<ProfileResponse> {
    try {
      const response = await apiClient.put<{ success: boolean; data: ProfileResponse; message: string }>('/profile', data);
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.put<{ success: boolean; message: string }>('/profile/password', data);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserStats }>('/profile/stats');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(data: DeleteAccountData): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>('/profile', { data });
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<UserPreference> {
    try {
      const response = await apiClient.get<{ success: boolean; data: UserPreference }>('/preferences');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(data: UpdatePreferencesData): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>('/preferences', data);
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update tracked tokens
   */
  static async updateTrackedTokens(tokens: string[]): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>('/preferences/tokens', { tokens });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update alert thresholds
   */
  static async updateAlertThresholds(alertThresholds: UserPreference['alertThresholds']): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>('/preferences/alerts', { alertThresholds });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(notificationSettings: UserPreference['notificationSettings']): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>('/preferences/notifications', { notificationSettings });
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Update appearance settings
   */
  static async updateAppearanceSettings(
    theme?: 'light' | 'dark' | 'auto', 
    refreshInterval?: number,
    currency?: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP'
  ): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/appearance', 
        { theme, refreshInterval, currency }
      );
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset preferences to defaults
   */
  static async resetPreferences(): Promise<UserPreference> {
    try {
      const response = await apiClient.post<{ success: boolean; data: UserPreference; message: string }>('/preferences/reset');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get supported tokens
   */
  static async getSupportedTokens(): Promise<Array<{ symbol: string; name: string }>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Array<{ symbol: string; name: string }> }>('/preferences/supported-tokens');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available themes
   */
  static async getAvailableThemes(): Promise<Array<{ value: string; label: string }>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Array<{ value: string; label: string }> }>('/preferences/available-themes');
      return response.data.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: any): Error {
    // Handle Axios errors
    if (error.response) {
      const { status, data } = error.response;
      
      // Server responded with error status - handle different error formats
      
      // Format 1: { error: { message: "..." } } - from error middleware
      if (data?.error?.message) {
        return new Error(data.error.message);
      }
      
      // Format 2: { error: "Validation Error", message: "..." } - from validation middleware
      if (data?.message && typeof data.message === 'string') {
        return new Error(data.message);
      }
      
      // Format 3: { error: "string" } - direct error string
      if (data?.error && typeof data.error === 'string') {
        return new Error(data.error);
      }
      
      // Handle specific HTTP status codes
      switch (status) {
        case 400:
          return new Error('Invalid request. Please check your input.');
        case 401:
          return new Error('Please log in to continue.');
        case 403:
          return new Error('Access denied. Please contact support.');
        case 404:
          return new Error('Profile not found.');
        case 429:
          return new Error('Too many attempts. Please try again later.');
        case 500:
          return new Error('Server error. Please try again later.');
        default:
          return new Error(`Server error (${status}). Please try again.`);
      }
    }
    
    // Handle network errors
    if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    // Handle other errors
    if (error.message) {
      return new Error(error.message);
    }
    
    return new Error('An unexpected error occurred. Please try again.');
  }
}

export default ProfileService;
