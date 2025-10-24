import { useState, useEffect } from 'react';
import { usePreferences } from './usePreferences';
import { useTheme } from '../context/ThemeContext';

export interface SettingsData {
  // General Settings
  themeMode: boolean; // true = dark, false = light (mapped from theme)
  defaultCurrency: string; // Client-side only for now
  
  // Monitoring Settings
  minProfitThreshold: number; // Mapped from alertThresholds.minProfit
  maxGasFee: number; // Mapped from alertThresholds.maxGasCost
}

export interface SettingsErrors {
  themeMode?: string;
  defaultCurrency?: string;
  minProfitThreshold?: string;
  maxGasFee?: string;
  general?: string;
}

export const useSettings = () => {
  const {
    preferences,
    isLoading,
    isUpdating,
    
    updateAppearanceSettings,
    updateAlertThresholds
  } = usePreferences();

  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<SettingsData>({
    themeMode: true, // Default to dark mode
    defaultCurrency: "USD ($)",
    minProfitThreshold: 1.5,
    maxGasFee: 75
  });

  const [errors, setErrors] = useState<SettingsErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Convert API data to settings format
  useEffect(() => {
    if (preferences) {
      const newSettings: SettingsData = {
        // Theme mapping: 'dark' -> true, 'light' -> false, 'auto' -> true (default to dark)
        themeMode: preferences.theme === 'dark' || preferences.theme === 'auto',
        
        // Default currency (client-side only for now)
        defaultCurrency: "USD ($)",
        
        // Alert thresholds mapping
        minProfitThreshold: preferences.alertThresholds.minProfit,
        maxGasFee: preferences.alertThresholds.maxGasCost
      };
      
      setSettings(newSettings);
      setHasChanges(false);
    }
  }, [preferences]);

  // Sync theme context with preferences
  useEffect(() => {
    if (preferences?.theme && preferences.theme !== theme) {
      setTheme(preferences.theme);
    }
  }, [preferences?.theme, theme, setTheme]);

  // Convert theme boolean to API format
  const getThemeValue = (themeMode: boolean): 'light' | 'dark' | 'auto' => {
    return themeMode ? 'dark' : 'light';
  };

  // Update individual settings
  const updateSetting = (key: keyof SettingsData, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
    
    // Update theme context immediately for theme changes
    if (key === 'themeMode') {
      const newTheme = value ? 'dark' : 'light';
      setTheme(newTheme);
    }
    
    // Clear any existing errors for this field
    if (errors[key]) {
      setErrors(prev => ({
        ...prev,
        [key]: undefined
      }));
    }
  };

  // Save all settings
  const saveSettings = async () => {
    try {
      setErrors({});
      
      // Prepare appearance settings update (no refresh interval - server-controlled)
      const appearanceUpdate = {
        theme: getThemeValue(settings.themeMode)
      };

      // Prepare alert thresholds update
      const alertThresholdsUpdate = {
        minProfit: settings.minProfitThreshold,
        maxGasCost: settings.maxGasFee,
        // Provide defaults for the missing fields expected by the API
        minROI: 0,
        minScore: 0
      };

      // Update appearance settings
      const appearanceResult = await updateAppearanceSettings(
        appearanceUpdate.theme,
        undefined // No refresh interval - server-controlled
      );

      if (!appearanceResult.success) {
        throw new Error(appearanceResult.error || 'Failed to update appearance settings');
      }

      // Update alert thresholds
      const alertResult = await updateAlertThresholds(alertThresholdsUpdate);

      if (!alertResult.success) {
        throw new Error(alertResult.error || 'Failed to update alert thresholds');
      }

      setHasChanges(false);
      return { success: true };
    } catch (error: unknown) {
  const errorMessage = (error && typeof error === 'object' && 'message' in error) ? String((error as Record<string, unknown>)['message']) : 'Failed to save settings';
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Validate settings
  const validateSettings = (): boolean => {
    const newErrors: SettingsErrors = {};

    // Validate profit threshold
    if (settings.minProfitThreshold < 0 || settings.minProfitThreshold > 10) {
      newErrors.minProfitThreshold = 'Profit threshold must be between 0 and 10%';
    }

    // Validate gas fee
    if (settings.maxGasFee < 0 || settings.maxGasFee > 1000) {
      newErrors.maxGasFee = 'Gas fee must be between 0 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Reset to original values
  const resetSettings = () => {
    if (preferences) {
      const originalSettings: SettingsData = {
        themeMode: preferences.theme === 'dark' || preferences.theme === 'auto',
        defaultCurrency: "USD ($)",
        minProfitThreshold: preferences.alertThresholds.minProfit,
        maxGasFee: preferences.alertThresholds.maxGasCost
      };
      
      setSettings(originalSettings);
      setHasChanges(false);
      setErrors({});
    }
  };

  return {
    settings,
    errors,
    isLoading,
    isUpdating,
    hasChanges,
    updateSetting,
    saveSettings,
    validateSettings,
    resetSettings
  };
};
