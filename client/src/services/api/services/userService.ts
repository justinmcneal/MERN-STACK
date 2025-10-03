import api from '../api';

export interface UserStats {
  totalOpportunities: number;
  activeAlerts: number;
  totalProfit: string;
  successRate: number;
  joinDate?: string;
}

export interface UserPreferences {
  themeMode: boolean;
  dataRefreshInterval: string;
  defaultCurrency: string;
  minProfitThreshold: number;
  maxGasFee: number;
  emailNotifications: boolean;
  dashboardPopup: boolean;
  tokensTracked: Record<string, boolean>;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  lastLogin?: string;
  preferences: UserPreferences;
}

class UserService {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get('/auth/profile');
      return (response as any);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const response = await api.put('/auth/profile', profileData);
      return (response as any);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return (response as any);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    try {
      const response = await api.get('/auth/stats');
      return (response as any);
    } catch (error) {
      // Fallback to mock data if API fails
      return this.getMockStats();
    }
  }

  /**
   * Mock stats data for development/testing
   */
  private getMockStats(): UserStats {
    return {
      totalOpportunities: 24,
      activeAlerts: 8,
      totalProfit: "$2,847",
      successRate: 94,
    };
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/auth/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return (response as any);
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
