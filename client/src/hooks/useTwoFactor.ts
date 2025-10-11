// hooks/useTwoFactor.ts
import { useState, useEffect } from 'react';
import { TwoFactorService } from '../services/twoFactorService';
import type { TwoFactorStatus, TwoFactorSetupResponse } from '../services/twoFactorService';

export interface TwoFactorErrors {
  general?: string;
  token?: string;
  password?: string;
}

export const useTwoFactor = () => {
  const [status, setStatus] = useState<TwoFactorStatus | null>(null);
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<TwoFactorErrors>({});

  // Load 2FA status
  const loadStatus = async () => {
    try {
      setIsLoading(true);
      setErrors({});
      const statusData = await TwoFactorService.getStatus();
      setStatus(statusData);
    } catch (error: any) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup 2FA
  const setup = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUpdating(true);
      setErrors({});
      const setupData = await TwoFactorService.setup();
      setSetupData(setupData);
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Verify 2FA setup
  const verifySetup = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUpdating(true);
      setErrors({});
      await TwoFactorService.verifySetup(token);
      setSetupData(null);
      await loadStatus(); // Reload status
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ token: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Disable 2FA
  const disable = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsUpdating(true);
      setErrors({});
      await TwoFactorService.disable(password);
      await loadStatus(); // Reload status
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ password: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Regenerate backup codes
  const regenerateBackupCodes = async (): Promise<{ success: boolean; codes?: string[]; error?: string }> => {
    try {
      setIsUpdating(true);
      setErrors({});
      const codes = await TwoFactorService.regenerateBackupCodes();
      await loadStatus(); // Reload status
      return { success: true, codes };
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors({ general: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear setup data
  const clearSetupData = () => {
    setSetupData(null);
    setErrors({});
  };

  // Load status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  return {
    status,
    setupData,
    isLoading,
    isUpdating,
    errors,
    setup,
    verifySetup,
    disable,
    regenerateBackupCodes,
    clearSetupData,
    loadStatus
  };
};
