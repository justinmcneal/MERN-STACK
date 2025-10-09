// hooks/usePreferences.ts
import { useState, useEffect } from 'react';
import ProfileService from '../services/profileService';
import type { 
  UserPreference, 
  UpdatePreferencesData 
} from '../services/profileService';

export interface PreferencesErrors {
  tokensTracked?: string;
  alertThresholds?: string;
  notificationSettings?: string;
  refreshInterval?: string;
  theme?: string;
  general?: string;
}

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<UserPreference | null>(null);
  const [supportedTokens, setSupportedTokens] = useState<Array<{ symbol: string; name: string }>>([]);
  const [availableThemes, setAvailableThemes] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<PreferencesErrors>({});

  // Load preferences data
  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const preferencesData = await ProfileService.getPreferences();
      setPreferences(preferencesData);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Load supported tokens
  const loadSupportedTokens = async () => {
    try {
      const tokens = await ProfileService.getSupportedTokens();
      setSupportedTokens(tokens);
    } catch (error: any) {
      console.error('Failed to load supported tokens:', error);
    }
  };

  // Load available themes
  const loadAvailableThemes = async () => {
    try {
      const themes = await ProfileService.getAvailableThemes();
      setAvailableThemes(themes);
    } catch (error: any) {
      console.error('Failed to load available themes:', error);
    }
  };

  // Update preferences
  const updatePreferences = async (data: UpdatePreferencesData) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedPreferences = await ProfileService.updatePreferences(data);
      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Update tracked tokens
  const updateTrackedTokens = async (tokens: string[]) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedPreferences = await ProfileService.updateTrackedTokens(tokens);
      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Update alert thresholds
  const updateAlertThresholds = async (alertThresholds: UserPreference['alertThresholds']) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedPreferences = await ProfileService.updateAlertThresholds(alertThresholds);
      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Update notification settings
  const updateNotificationSettings = async (notificationSettings: UserPreference['notificationSettings']) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedPreferences = await ProfileService.updateNotificationSettings(notificationSettings);
      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Update appearance settings
  const updateAppearanceSettings = async (theme?: 'light' | 'dark' | 'auto', refreshInterval?: number) => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const updatedPreferences = await ProfileService.updateAppearanceSettings(theme, refreshInterval);
      setPreferences(updatedPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset preferences
  const resetPreferences = async () => {
    try {
      setIsUpdating(true);
      setErrors({});
      
      const defaultPreferences = await ProfileService.resetPreferences();
      setPreferences(defaultPreferences);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Validate preferences
  const validatePreferences = (data: UpdatePreferencesData): boolean => {
    const newErrors: PreferencesErrors = {};

    // Validate tokens tracked
    if (data.tokensTracked && data.tokensTracked.length === 0) {
      newErrors.tokensTracked = 'At least one token must be selected';
    }

    // Validate alert thresholds
    if (data.alertThresholds) {
      const { minProfit, maxGasCost, minROI, minScore } = data.alertThresholds;
      
      if (minProfit !== undefined && minProfit < 0) {
        newErrors.alertThresholds = 'Minimum profit must be 0 or greater';
      }
      if (maxGasCost !== undefined && maxGasCost < 0) {
        newErrors.alertThresholds = 'Maximum gas cost must be 0 or greater';
      }
      if (minROI !== undefined && (minROI < 0 || minROI > 100)) {
        newErrors.alertThresholds = 'Minimum ROI must be between 0 and 100';
      }
      if (minScore !== undefined && (minScore < 0 || minScore > 1)) {
        newErrors.alertThresholds = 'Minimum score must be between 0 and 1';
      }
    }

    // Validate refresh interval
    if (data.refreshInterval !== undefined && (data.refreshInterval < 5 || data.refreshInterval > 300)) {
      newErrors.refreshInterval = 'Refresh interval must be between 5 and 300 seconds';
    }

    // Validate theme
    if (data.theme && !['light', 'dark', 'auto'].includes(data.theme)) {
      newErrors.theme = 'Theme must be light, dark, or auto';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load data on mount
  useEffect(() => {
    loadPreferences();
    loadSupportedTokens();
    loadAvailableThemes();
  }, []);

  return {
    preferences,
    supportedTokens,
    availableThemes,
    isLoading,
    isUpdating,
    errors,
    loadPreferences,
    loadSupportedTokens,
    loadAvailableThemes,
    updatePreferences,
    updateTrackedTokens,
    updateAlertThresholds,
    updateNotificationSettings,
    updateAppearanceSettings,
    resetPreferences,
    validatePreferences,
    setErrors
  };
};
