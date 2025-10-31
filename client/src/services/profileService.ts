// services/profileService.ts
import { apiClient } from './api';

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';

type ApiErrorResponse = Partial<Error> & {
  response?: {
    status?: number;
    data?: {
      error?: string | { message?: string | null } | null;
      message?: string | null;
      errors?: Array<{ msg?: string | null }> | null;
    };
  };
  request?: unknown;
};

const safeString = (value?: string | null): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const extractApiErrorMessage = (error: unknown): string | undefined => {
  const candidate = error as ApiErrorResponse | undefined;
  const data = candidate?.response?.data;

  if (!data) {
    return safeString(candidate?.message);
  }

  const nestedError = data.error;

  if (typeof nestedError === 'string') {
    return safeString(nestedError);
  }

  if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
    const message = (nestedError as { message?: string | null }).message;
    const resolvedNested = safeString(message ?? undefined);
    if (resolvedNested) {
      return resolvedNested;
    }
  }

  const message = safeString(data.message ?? undefined);
  if (message) {
    return message;
  }

  if (Array.isArray(data.errors)) {
    for (const validationError of data.errors) {
      const validationMessage = safeString(validationError?.msg ?? undefined);
      if (validationMessage) {
        return validationMessage;
      }
    }
  }

  return safeString(candidate?.message);
};

const statusMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please log in to continue.',
  403: 'Access denied. Please contact support.',
  404: 'Profile not found.',
  429: 'Too many attempts. Please try again later.',
  500: 'Server error. Please try again later.',
};

const getStatusMessage = (status?: number): string | undefined => {
  if (typeof status !== 'number') {
    return undefined;
  }

  return statusMessages[status] ?? `Server error (${status}). Please try again.`;
};

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
  };
  refreshInterval: number;
  currency: CurrencyCode;
  manualMonitoringMinutes: number | null;
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
  currency?: CurrencyCode;
  manualMonitoringMinutes?: number | null;
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   */
  static async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await apiClient.put<{ success: boolean; message: string }>('/profile/password', data);
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(data: DeleteAccountData): Promise<void> {
    try {
      await apiClient.delete<{ success: boolean; message: string }>('/profile', { data });
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
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
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Update alert thresholds
   */
  static async updateAlertThresholds(alertThresholds: UserPreference['alertThresholds']): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/alerts',
        { alertThresholds },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    notificationSettings: UserPreference['notificationSettings'],
  ): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/notifications',
        { notificationSettings },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Update manual monitoring time (in minutes)
   */
  static async updateManualMonitoringTime(manualMonitoringMinutes: number | null): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/manual-monitoring',
        { manualMonitoringMinutes },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Update appearance settings
   */
  static async updateAppearanceSettings(currency: CurrencyCode): Promise<UserPreference> {
    try {
      const response = await apiClient.put<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/appearance',
        { currency },
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Reset preferences to defaults
   */
  static async resetPreferences(): Promise<UserPreference> {
    try {
      const response = await apiClient.post<{ success: boolean; data: UserPreference; message: string }>(
        '/preferences/reset',
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Get supported tokens
   */
  static async getSupportedTokens(): Promise<Array<{ symbol: string; name: string }>> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Array<{ symbol: string; name: string }> }>(
        '/preferences/supported-tokens',
      );
      return response.data.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private static handleError(error: unknown): Error {
    const candidate = error as ApiErrorResponse | undefined;

    if (candidate?.request && !candidate?.response) {
      return new Error('Network error. Please check your internet connection.');
    }

    const message = extractApiErrorMessage(candidate);
    if (message) {
      return new Error(message);
    }

    const statusMessage = getStatusMessage(candidate?.response?.status);
    if (statusMessage) {
      return new Error(statusMessage);
    }

    if (error instanceof Error && error.message) {
      return new Error(error.message);
    }

    return new Error('An unexpected error occurred. Please try again.');
  }
}

export default ProfileService;
