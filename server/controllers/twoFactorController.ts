import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TwoFactorService } from '../services/TwoFactorService';
import { validate } from '../middleware/validationMiddleware';
import Joi from 'joi';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess } from '../utils/responseHelpers';

const setupSchema = Joi.object({});

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

const verifyLoginSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
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

export const setupTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const result = await TwoFactorService.setupTwoFactor(userId);
  
  sendSuccess(res, result, 'Two-factor authentication setup initiated');
});

export const verifyTwoFactorSetup = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const { token } = req.body;
  const result = await TwoFactorService.verifyTwoFactorSetup(userId, token);
  
  sendSuccess(res, result, 'Two-factor authentication enabled successfully');
});

export const verifyTwoFactorToken = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const { token } = req.body;
  const result = await TwoFactorService.verifyTwoFactorToken(userId, token);
  
  sendSuccess(res, result, result.backupCodeUsed ? 'Login successful using backup code' : 'Login successful');
});

// POST /api/auth/2fa/verify-login
export const verifyTwoFactorLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, token } = req.body;
  
  if (!email || !token) {
    throw createError('Email and token are required', 400);
  }

  const User = require('../models/User').default;
  const user = await User.findOne({ email });
  if (!user) {
    throw createError('Invalid credentials', 401);
  }

  if (!user.twoFactorEnabled) {
    throw createError('Two-factor authentication is not enabled', 400);
  }

  const result = await TwoFactorService.verifyTwoFactorToken(user._id.toString(), token);
  
  if (!result.success) {
    throw createError('Invalid verification code', 401);
  }

  const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
  const refreshToken = generateRefreshToken(user._id.toString());
  const accessToken = generateAccessToken(user._id.toString());
  
  user.refreshTokens.push(refreshToken);
  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
    accessToken,
    refreshToken,
    message: result.backupCodeUsed ? 'Login successful using backup code' : 'Login successful'
  });
});

export const disableTwoFactor = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const { password } = req.body;
  await TwoFactorService.disableTwoFactor(userId, password);
  
  sendSuccess(res, undefined, 'Two-factor authentication disabled successfully');
});

export const regenerateBackupCodes = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const backupCodes = await TwoFactorService.regenerateBackupCodes(userId);
  
  sendSuccess(res, { backupCodes }, 'Backup codes regenerated successfully');
});

export const getTwoFactorStatus = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw createError('User not authenticated', 401);
  }

  const status = await TwoFactorService.getTwoFactorStatus(userId);
  
  sendSuccess(res, status);
});

export const twoFactorSchemas = {
  setup: setupSchema,
  verifySetup: verifySetupSchema,
  verifyToken: verifyTokenSchema,
  verifyLogin: verifyLoginSchema,
  disable: disableSchema
};
