import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens';

// POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
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
    secure: process.env.NODE_ENV === 'production' ? true : false, // false in dev for HTTP
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

  const user = await User.create({ name, email, password });
  if (user) {
    const accessToken = sendTokens(res, user._id.toString());
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
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
  if (user && await user.matchPassword(password)) {
    const accessToken = sendTokens(res, user._id.toString());
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      accessToken,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
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
  console.log('[Refresh] Received refresh token:', token || '[missing]');
  if (!token) {
    res.status(401);
    throw new Error('No refresh token provided');
  }
  try {
    // Decode without verifying to inspect payload
    const decodedRaw = jwt.decode(token, { complete: true });
    console.log('[Refresh] Decoded raw token:', decodedRaw);
    // Now verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string, exp?: number };
    console.log('[Refresh] Token verified:', decoded);
    if (decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      console.log(`[Refresh] Token expires in ${decoded.exp - now} seconds`);
    }
    const accessToken = generateAccessToken(decoded.id);
    res.json({ accessToken });
  } catch (err: any) {
    console.error('[Refresh] Invalid/expired refresh token:', err.message);
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});