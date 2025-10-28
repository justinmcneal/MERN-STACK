import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ProfileService } from '../services/ProfileService';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendUpdateSuccess, sendDeleteSuccess } from '../utils/responseHelpers';
import logger from '../utils/logger';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const profile = await ProfileService.getProfile(req.user._id);
  
  sendSuccess(res, profile);
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const profile = await ProfileService.updateProfile(req.user._id, req.body);
  
  sendUpdateSuccess(res, profile, 'Profile updated successfully');
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  await ProfileService.changePassword(req.user._id, req.body);
  
  sendSuccess(res, undefined, 'Password changed successfully');
});

export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const stats = await ProfileService.getUserStats(req.user._id);
  
  sendSuccess(res, stats);
});

export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  await ProfileService.deleteAccount(req.user._id, req.body.password);
  
  sendDeleteSuccess(res, 'Account deleted successfully');
});

export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  logger.info('Upload request received', { userId: req.user?._id });
  
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  if (!req.file) {
    throw createError('No file uploaded', 400);
  }

  logger.info('File uploaded', {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });

  const profilePictureUrl = req.file.path;
  const updatedUser = await ProfileService.updateProfile(req.user._id, {
    profilePicture: profilePictureUrl
  });

  logger.success('Profile picture uploaded successfully');

  sendSuccess(res, {
    profilePicture: profilePictureUrl,
    user: {
      _id: updatedUser.user._id,
      name: updatedUser.user.name,
      email: updatedUser.user.email,
      profilePicture: updatedUser.user.profilePicture
    }
  }, 'Profile picture uploaded successfully');
});
