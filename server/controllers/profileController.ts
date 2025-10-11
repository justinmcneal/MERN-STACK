// controllers/profileController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ProfileService } from '../services/ProfileService';
import { createError } from '../middleware/errorMiddleware';

// GET /api/profile - Get user profile with preferences
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const profile = await ProfileService.getProfile(req.user._id);
  
  res.json({
    success: true,
    data: profile
  });
});

// PUT /api/profile - Update user profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const profile = await ProfileService.updateProfile(req.user._id, req.body);
  
  res.json({
    success: true,
    data: profile,
    message: 'Profile updated successfully'
  });
});

// PUT /api/profile/password - Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  await ProfileService.changePassword(req.user._id, req.body);
  
  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

// Note: Preferences are handled by /api/preferences routes in preferenceController.ts

// GET /api/profile/stats - Get user statistics
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  const stats = await ProfileService.getUserStats(req.user._id);
  
  res.json({
    success: true,
    data: stats
  });
});

// DELETE /api/profile - Delete user account
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw createError('Not authorized', 401);
  }

  await ProfileService.deleteAccount(req.user._id, req.body.password);
  
  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// POST /api/profile/upload-avatar - Upload profile picture
export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log('🔍 [ProfileController] Upload request received');
    
    if (!req.user) {
      console.log('❌ [ProfileController] No user found in request');
      throw createError('Not authorized', 401);
    }

    console.log('👤 [ProfileController] User:', req.user._id);

    if (!req.file) {
      console.log('❌ [ProfileController] No file uploaded');
      throw createError('No file uploaded', 400);
    }

    console.log('📁 [ProfileController] File uploaded:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    // Get the Cloudinary URL from the uploaded file
    const profilePictureUrl = req.file.path;
    console.log('🔗 [ProfileController] Profile picture URL:', profilePictureUrl);

    // Update user's profile picture in database
    console.log('💾 [ProfileController] Updating user profile...');
    const updatedUser = await ProfileService.updateProfile(req.user._id, {
      profilePicture: profilePictureUrl
    });

    console.log('✅ [ProfileController] Profile updated successfully');

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: {
        profilePicture: profilePictureUrl,
        user: {
          _id: updatedUser.user._id,
          name: updatedUser.user.name,
          email: updatedUser.user.email,
          profilePicture: updatedUser.user.profilePicture
        }
      }
    });
  } catch (error: any) {
    console.error('💥 [ProfileController] Upload error:', error);
    throw error;
  }
});
