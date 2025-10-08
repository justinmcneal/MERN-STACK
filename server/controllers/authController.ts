// controllers/authController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/AuthService';
import { createError } from '../middleware/errorMiddleware';

// POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const authResponse = await AuthService.register(req.body);
    
    // Set cookies
    AuthService.setAuthCookies(res, req.cookies.refreshToken || '', authResponse.csrfToken);
    
    res.status(201).json({
      _id: authResponse.user._id,
      name: authResponse.user.name,
      email: authResponse.user.email,
      accessToken: authResponse.accessToken,
      csrfToken: authResponse.csrfToken,
    });
  } catch (error: any) {
    throw error; // Let the error middleware handle it
  }
});

// POST /api/auth/login
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const authResponse = await AuthService.login(req.body);
    
    // Set cookies
    AuthService.setAuthCookies(res, req.cookies.refreshToken || '', authResponse.csrfToken);
    
    res.json({
      _id: authResponse.user._id,
      name: authResponse.user.name,
      email: authResponse.user.email,
      accessToken: authResponse.accessToken,
      csrfToken: authResponse.csrfToken,
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

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  
  if (token) {
    await AuthService.logout(token);
  }
  
  AuthService.clearAuthCookies(res);
  res.status(200).json({ message: 'Logged out' });
});