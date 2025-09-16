import crypto from 'crypto';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        await user.save();
      }
    } catch (err) {
      // ignore invalid token
    }
  }
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // always true in prod
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out' });
});

// Helper to set httpOnly cookie
const sendTokens = (res: Response, userId: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // always true in prod
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return accessToken;
};

// POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password, refreshTokens: [] });
  if (user) {
    // Generate refresh token and save to user
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshTokens.push(refreshToken);
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // always true in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Generate CSRF token and set as cookie (not httpOnly)
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', // always true in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const accessToken = generateAccessToken(user._id.toString());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
      csrfToken,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// POST /api/auth/login
export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked()) {
    res.status(403);
    throw new Error('Account is temporarily locked due to too many failed login attempts. Please try again later.');
  }

  // Check password
  const isMatch = await user.matchPassword(password);
  if (isMatch) {
    // Reset failed attempts and lock
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    // Generate refresh token and save to user
    const refreshToken = generateRefreshToken(user._id.toString());
    user.refreshTokens.push(refreshToken);
    await user.save();
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // always true in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Generate CSRF token and set as cookie (not httpOnly)
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production', // always true in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const accessToken = generateAccessToken(user._id.toString());
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
      csrfToken,
    });
  } else {
    // Increment failed attempts
    user.failedLoginAttempts += 1;
    // Lock account if max attempts reached
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = Date.now() + LOCK_TIME;
    }
    await user.save();
    res.status(401);
    throw new Error(user.isLocked()
      ? 'Account is temporarily locked due to too many failed login attempts. Please try again later.'
      : 'Invalid email or password');
  }
});

// GET /api/auth/me (protected)
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const user = await User.findById(req.user._id).select('-password');
  if (user) res.json(user);
  else {
    res.status(404);
    throw new Error('User not found');
  }
});

// POST /api/auth/refresh (optional endpoint to get new access token)
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  const csrfCookie = req.cookies.csrfToken;
  const csrfHeader = req.headers['x-csrf-token'];
  console.log('[Refresh] Received refresh token:', token || '[missing]');
  console.log('[Refresh] CSRF cookie:', csrfCookie);
  console.log('[Refresh] CSRF header:', csrfHeader);
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    res.status(403);
    throw new Error('CSRF token mismatch');
  }
  try {
    // Decode without verifying to inspect payload
    const decodedRaw = jwt.decode(token, { complete: true });
    console.log('[Refresh] Decoded raw token:', decodedRaw);
    // Now verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, exp?: number };
    console.log('[Refresh] Token verified:', decoded);
    // Find user and check if token is in user's refreshTokens
    const user = await User.findById(decoded.id);
    if (!user || !user.refreshTokens.includes(token)) {
      res.status(401);
      throw new Error('Refresh token not recognized');
    }
    // Remove old token and add new one (rotation)
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    const newRefreshToken = generateRefreshToken(decoded.id);
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // always true in prod
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    const accessToken = generateAccessToken(decoded.id);
    res.json({ accessToken });
  } catch (err: any) {
    console.error('[Refresh] Invalid/expired refresh token:', err.message);
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});