import { useState, useEffect } from 'react';
import { usePreferences } from './usePreferences';
import { useTheme } from '../context/ThemeContext';

export interface SettingsData {
  // General Settings
  themeMode: boolean; // true = dark, false = light (mapped from theme)
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
}

export interface SettingsErrors {
  themeMode?: string;
  defaultCurrency?: string;
  general?: string;
}

export const useSettings = () => {
  const {
    preferences,
    isLoading,
    isUpdating,
    updateAppearanceSettings
  } = usePreferences();

  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<SettingsData>({
    themeMode: true, // Default to dark mode
    defaultCurrency: 'USD'
  });

  const [errors, setErrors] = useState<SettingsErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Convert API data to settings format
  useEffect(() => {
    if (preferences) {
      const newSettings: SettingsData = {
        // Theme mapping: 'dark' -> true, 'light' -> false, 'auto' -> true (default to dark)
        themeMode: preferences.theme === 'dark' || preferences.theme === 'auto',
        defaultCurrency: preferences.currency || 'USD'
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
      
      // Prepare appearance settings update (includes currency)
      const appearanceUpdate = {
        theme: getThemeValue(settings.themeMode),
        currency: settings.defaultCurrency
      };

      // Update appearance settings
      const appearanceResult = await updateAppearanceSettings(
        appearanceUpdate.theme,
        undefined, // No refresh interval - server-controlled
        appearanceUpdate.currency
      );

      if (!appearanceResult.success) {
        throw new Error(appearanceResult.error || 'Failed to update appearance settings');
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
    setErrors({});
    return true;
  };

  // Reset to original values
  const resetSettings = () => {
    if (preferences) {
      const originalSettings: SettingsData = {
        themeMode: preferences.theme === 'dark' || preferences.theme === 'auto',
        defaultCurrency: preferences.currency || 'USD'
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
