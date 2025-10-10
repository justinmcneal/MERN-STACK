// services/TwoFactorService.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import User from '../models/User';
import { createError } from '../utils/errorHandler';

export interface TwoFactorSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  backupCodeUsed?: boolean;
}

export class TwoFactorService {
  private static readonly BACKUP_CODES_COUNT = 10;
  private static readonly BACKUP_CODE_LENGTH = 8;

  /**
   * Generate a new 2FA secret and QR code
   */
  static async setupTwoFactor(userId: string): Promise<TwoFactorSetupResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.twoFactorEnabled) {
      throw createError('Two-factor authentication is already enabled', 400);
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `ArbiTragePro (${user.email})`,
      issuer: 'ArbiTragePro',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store secret and backup codes (but don't enable 2FA yet)
    user.twoFactorSecret = secret.base32;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    return {
      secret: secret.base32,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify 2FA setup with TOTP code
   */
  static async verifyTwoFactorSetup(userId: string, token: string): Promise<TwoFactorVerifyResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorSecret) {
      throw createError('Two-factor authentication setup not initiated', 400);
    }

    if (user.twoFactorEnabled) {
      throw createError('Two-factor authentication is already enabled', 400);
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (!verified) {
      throw createError('Invalid verification code', 400);
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorVerifiedAt = new Date();
    await user.save();

    return { success: true };
  }

  /**
   * Verify 2FA token during login
   */
  static async verifyTwoFactorToken(userId: string, token: string): Promise<TwoFactorVerifyResponse> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw createError('Two-factor authentication is not enabled', 400);
    }

    if (!user.twoFactorSecret) {
      throw createError('Two-factor authentication secret not found', 400);
    }

    // Check if it's a backup code
    const backupCodeIndex = user.twoFactorBackupCodes.indexOf(token);
    if (backupCodeIndex !== -1) {
      // Remove used backup code
      user.twoFactorBackupCodes.splice(backupCodeIndex, 1);
      await user.save();
      return { success: true, backupCodeUsed: true };
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps tolerance
    });

    if (!verified) {
      throw createError('Invalid verification code', 400);
    }

    return { success: true };
  }

  /**
   * Disable 2FA for a user
   */
  static async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw createError('Two-factor authentication is not enabled', 400);
    }

    // Verify password before disabling
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      throw createError('Invalid password', 400);
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    user.twoFactorVerifiedAt = null;
    await user.save();
  }

  /**
   * Generate new backup codes
   */
  static async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.twoFactorEnabled) {
      throw createError('Two-factor authentication is not enabled', 400);
    }

    const backupCodes = this.generateBackupCodes();
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    return backupCodes;
  }

  /**
   * Get 2FA status for a user
   */
  static async getTwoFactorStatus(userId: string): Promise<{
    enabled: boolean;
    verifiedAt: Date | null;
    backupCodesCount: number;
  }> {
    const user = await User.findById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }

    return {
      enabled: user.twoFactorEnabled,
      verifiedAt: user.twoFactorVerifiedAt,
      backupCodesCount: user.twoFactorBackupCodes.length
    };
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      const code = crypto.randomBytes(this.BACKUP_CODE_LENGTH / 2).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Check if user has 2FA enabled
   */
  static async isTwoFactorEnabled(userId: string): Promise<boolean> {
    const user = await User.findById(userId);
    if (!user) {
      return false;
    }
    return user.twoFactorEnabled;
  }
}
