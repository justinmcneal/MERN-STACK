// middleware/uploadMiddleware.ts
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Debug Cloudinary configuration
console.log('🔧 [UploadMiddleware] Cloudinary config:', {
  has_url: !!process.env.CLOUDINARY_URL,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'undefined',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'undefined'
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ],
    public_id: (req: any, file: any) => {
      // Generate unique filename with user ID and timestamp
      const userId = req.user?._id || 'anonymous';
      const timestamp = Date.now();
      return `profile_${userId}_${timestamp}`;
    }
  } as any
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any, false);
    }
  }
});

export const uploadProfilePicture = upload.single('profilePicture');

// Error handling middleware for multer
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Profile picture must be less than 5MB'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: 'Please use the correct field name for file upload'
      });
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: 'Only image files (JPG, PNG, GIF, WebP) are allowed'
    });
  }
  
  next(error);
};
