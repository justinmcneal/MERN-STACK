// services/twoFactorService.ts
import { apiClient } from './api';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorStatus {
  enabled: boolean;
  verifiedAt: string | null;
  backupCodesCount: number;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  backupCodeUsed?: boolean;
}

export class TwoFactorService {
  /**
   * Setup two-factor authentication
   */
  static async setup(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post('/auth/2fa/setup');
    return response.data.data;
  }

  /**
   * Verify two-factor authentication setup
   */
  static async verifySetup(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiClient.post('/auth/2fa/verify-setup', { token });
    return response.data.data;
  }

  /**
   * Verify two-factor authentication token
   */
  static async verifyToken(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiClient.post('/auth/2fa/verify', { token });
    return response.data.data;
  }

  /**
   * Disable two-factor authentication
   */
  static async disable(password: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { password });
  }

  /**
   * Regenerate backup codes
   */
  static async regenerateBackupCodes(): Promise<string[]> {
    const response = await apiClient.post('/auth/2fa/regenerate-backup-codes');
    return response.data.data.backupCodes;
  }

  /**
   * Get two-factor authentication status
   */
  static async getStatus(): Promise<TwoFactorStatus> {
    const response = await apiClient.get('/auth/2fa/status');
    return response.data.data;
  }
}
