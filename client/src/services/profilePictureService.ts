// services/profilePictureService.ts
import { apiClient } from './api';

export interface ProfilePictureUploadResponse {
  success: boolean;
  message: string;
  data: {
    profilePicture: string;
    user: {
      _id: string;
      name: string;
      email: string;
      profilePicture: string;
    };
  };
}

export class ProfilePictureService {
  /**
   * Upload profile picture
   */
  static async uploadProfilePicture(file: File): Promise<ProfilePictureUploadResponse> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiClient.post<ProfilePictureUploadResponse>('/profile/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Validate image file
   */
  static validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a valid image file (JPG, PNG, GIF, or WebP)'
      };
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Create image preview URL
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke preview URL to free memory
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }
}
