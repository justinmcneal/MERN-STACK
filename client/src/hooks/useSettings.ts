import { useState, useEffect } from 'react';
import { usePreferences } from './usePreferences';

export interface SettingsData {
  defaultCurrency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'PHP';
}

export interface SettingsErrors {
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

  const [settings, setSettings] = useState<SettingsData>({
    defaultCurrency: 'USD'
  });

  const [errors, setErrors] = useState<SettingsErrors>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Convert API data to settings format
  useEffect(() => {
    if (preferences) {
      const newSettings: SettingsData = {
        defaultCurrency: preferences.currency || 'USD'
      };
      
      setSettings(newSettings);
      setHasChanges(false);
      setErrors({});
    }
  }, [preferences]);

  // Update individual settings
  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
    
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
        currency: settings.defaultCurrency
      };

      // Update appearance settings
      const appearanceResult = await updateAppearanceSettings(
        appearanceUpdate.currency
      );

      if (!appearanceResult.success) {
        throw new Error(appearanceResult.error || 'Failed to update appearance settings');
      }
      setHasChanges(false);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = (error && typeof error === 'object' && 'message' in error)
        ? String((error as Record<string, unknown>)['message'])
        : 'Failed to save settings';
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
