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
  static async setup(): Promise<TwoFactorSetupResponse> {
    const response = await apiClient.post('/auth/2fa/setup');
    return response.data.data;
  }

  static async verifySetup(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiClient.post('/auth/2fa/verify-setup', { token });
    return response.data.data;
  }

  static async verifyToken(token: string): Promise<TwoFactorVerifyResponse> {
    const response = await apiClient.post('/auth/2fa/verify', { token });
    return response.data.data;
  }

  static async verifyLogin(email: string, token: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
    message: string;
  }> {
    const response = await apiClient.post('/auth/2fa/verify-login', { email, token });
    return response.data;
  }

  static async disable(password: string): Promise<void> {
    await apiClient.post('/auth/2fa/disable', { password });
  }

  static async regenerateBackupCodes(): Promise<string[]> {
    const response = await apiClient.post('/auth/2fa/regenerate-backup-codes');
    return response.data.data.backupCodes;
  }

  static async getStatus(): Promise<TwoFactorStatus> {
    const response = await apiClient.get('/auth/2fa/status');
    return response.data.data;
  }
}
