// controllers/authController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/AuthService';
import { createError } from '../middleware/errorMiddleware';

// POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const registrationResponse = await AuthService.register(req.body);
    res.status(201).json(registrationResponse);
  } catch (error: any) {
    throw error; // Let the error middleware handle it
  }
});

// POST /api/auth/login
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const authResponse = await AuthService.login(req.body);
    
    // Set cookies with remember me support
    AuthService.setAuthCookies(res, authResponse.refreshToken || '', authResponse.csrfToken, req.body.rememberMe || false);
    
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
    });
  } catch (error: any) {
    throw error; // Let the error middleware handle it
  }
});

// GET /api/auth/me (protected)
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

// POST /api/auth/refresh
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'] as string;

  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    throw createError('CSRF token mismatch', 403);
  }

  try {
    const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(token, csrfCookie);
    
    // Set new refresh token cookie
    AuthService.setAuthCookies(res, newRefreshToken, csrfCookie);
    
    res.json({ accessToken });
  } catch (error: any) {
    throw error; // Let the error middleware handle it
  }
});

// GET /api/auth/csrf - Get fresh CSRF token
export const getCSRFToken = asyncHandler(async (req: Request, res: Response) => {
  try {
    const csrfToken = AuthService.generateCSRFToken();
    
    // Set CSRF token cookie
    res.cookie('csrfToken', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    
    res.json({ csrfToken });
  } catch (error: any) {
    throw error; // Let the error middleware handle it
  }
});

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  
  if (token) {
    await AuthService.logout(token);
  }
  
  AuthService.clearAuthCookies(res);
  res.status(200).json({ message: 'Logged out' });
});

// GET /api/auth/verify-email
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      throw createError('Verification token is required', 400);
    }

    const result = await AuthService.verifyEmail(token);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    throw error;
  }
});

// POST /api/auth/resend-verification
export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw createError('Email is required', 400);
    }

    const result = await AuthService.resendVerificationEmail(email);
    
    res.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    throw error;
  }
});