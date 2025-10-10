// controllers/twoFactorController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TwoFactorService } from '../services/TwoFactorService';
import { validate } from '../middleware/validationMiddleware';
import Joi from 'joi';

// Validation schemas
const setupSchema = Joi.object({
  // No body required for setup
});

const verifySetupSchema = Joi.object({
  token: Joi.string().length(6).pattern(/^\d+$/).required()
    .messages({
      'string.length': 'Verification code must be 6 digits',
      'string.pattern.base': 'Verification code must contain only numbers'
    })
});

const verifyTokenSchema = Joi.object({
  token: Joi.string().min(6).max(8).required()
    .messages({
      'string.min': 'Token must be at least 6 characters',
      'string.max': 'Token must be at most 8 characters'
    })
});

const disableSchema = Joi.object({
  password: Joi.string().required()
    .messages({
      'any.required': 'Password is required to disable two-factor authentication'
    })
});

// POST /api/auth/2fa/setup
export const setupTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const result = await TwoFactorService.setupTwoFactor(userId);
  
  res.json({
    success: true,
    data: result,
    message: 'Two-factor authentication setup initiated'
  });
});

// POST /api/auth/2fa/verify-setup
export const verifyTwoFactorSetup = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const { token } = req.body;
  const result = await TwoFactorService.verifyTwoFactorSetup(userId, token);
  
  res.json({
    success: true,
    data: result,
    message: 'Two-factor authentication enabled successfully'
  });
});

// POST /api/auth/2fa/verify
export const verifyTwoFactorToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const { token } = req.body;
  const result = await TwoFactorService.verifyTwoFactorToken(userId, token);
  
  res.json({
    success: true,
    data: result,
    message: result.backupCodeUsed ? 'Login successful using backup code' : 'Login successful'
  });
});

// POST /api/auth/2fa/disable
export const disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const { password } = req.body;
  await TwoFactorService.disableTwoFactor(userId, password);
  
  res.json({
    success: true,
    message: 'Two-factor authentication disabled successfully'
  });
});

// POST /api/auth/2fa/regenerate-backup-codes
export const regenerateBackupCodes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const backupCodes = await TwoFactorService.regenerateBackupCodes(userId);
  
  res.json({
    success: true,
    data: { backupCodes },
    message: 'Backup codes regenerated successfully'
  });
});

// GET /api/auth/2fa/status
export const getTwoFactorStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401);
    throw new Error('User not authenticated');
  }

  const status = await TwoFactorService.getTwoFactorStatus(userId);
  
  res.json({
    success: true,
    data: status
  });
});

// Export validation schemas
export const twoFactorSchemas = {
  setup: setupSchema,
  verifySetup: verifySetupSchema,
  verifyToken: verifyTokenSchema,
  disable: disableSchema
};
