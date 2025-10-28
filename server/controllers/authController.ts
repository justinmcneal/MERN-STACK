import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/AuthService';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendCreatedSuccess } from '../utils/responseHelpers';
import logger from '../utils/logger';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Registration request received', {
    name: req.body.name,
    email: req.body.email,
    hasPassword: !!req.body.password
  });
  
  const registrationResponse = await AuthService.register(req.body);
  logger.info('Registration successful', { email: registrationResponse.email });
  
  res.status(201).json(registrationResponse);
});

export const authUser = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Login request received', {
    email: req.body.email,
    hasPassword: !!req.body.password,
    rememberMe: req.body.rememberMe
  });
  
  const authResponse = await AuthService.login(req.body);
  
  if (!authResponse.requiresTwoFactor && authResponse.refreshToken && authResponse.csrfToken) {
    AuthService.setAuthCookies(res, authResponse.refreshToken, authResponse.csrfToken, req.body.rememberMe || false);
  }
  
  logger.info('Login successful', { email: req.body.email });
  
  res.json({
    user: {
      _id: authResponse.user._id,
      name: authResponse.user.name,
      email: authResponse.user.email,
      isEmailVerified: authResponse.user.isEmailVerified,
    },
    accessToken: authResponse.accessToken,
    csrfToken: authResponse.csrfToken,
    message: authResponse.message,
    requiresTwoFactor: authResponse.requiresTwoFactor,
  });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }
  
  const user = await AuthService.getUserById(req.user._id);
  if (!user) {
    throw createError('User not found', 404);
  }
  
  res.json(user);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'] as string;

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw createError('CSRF token mismatch', 403);
  }

  const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(token, csrfCookie);
  
  AuthService.setAuthCookies(res, newRefreshToken, csrfCookie);
  
  res.json({ accessToken });
});

export const getCSRFToken = asyncHandler(async (req: Request, res: Response) => {
  const csrfToken = AuthService.generateCSRFToken();
  
  res.cookie('csrfToken', csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  });
  
  res.json({ csrfToken });
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  
  if (token) {
    await AuthService.logout(token);
  }
  
  AuthService.clearAuthCookies(res);
  sendSuccess(res, undefined, 'Logged out');
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    throw createError('Verification token is required', 400);
  }

  const result = await AuthService.verifyEmail(token);
  
  sendSuccess(res, undefined, result.message);
});

export const regenerateVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw createError('Email is required', 400);
  }

  const result = await AuthService.regenerateVerificationToken(email);
  
  sendSuccess(res, undefined, result.message);
});

export const getDebugToken = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query;
  
  if (!email || typeof email !== 'string') {
    throw createError('Email is required', 400);
  }

  const debugTokens = (global as any).debugTokens || {};
  const tokenData = debugTokens[email.toLowerCase()];
  
  if (!tokenData) {
    throw createError('No debug token found for this email', 404);
  }

  sendSuccess(res, tokenData);
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw createError('Email is required', 400);
  }

  const result = await AuthService.resendVerificationEmail(email);
  
  sendSuccess(res, undefined, result.message);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    throw createError('Email is required', 400);
  }

  const result = await AuthService.requestPasswordReset(email);
  
  sendSuccess(res, undefined, result.message);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  
  if (!token || !password) {
    throw createError('Token and password are required', 400);
  }

  const result = await AuthService.resetPassword(token, password);
  
  sendSuccess(res, undefined, result.message);
});