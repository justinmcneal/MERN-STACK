// middleware/validationMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 [ValidationMiddleware] Validating request body:', req.body);
    const { error } = schema.validate(req.body);
    
    if (error) {
      console.log('❌ [ValidationMiddleware] Validation failed:', error.details);
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
      });
    }
    
    console.log('✅ [ValidationMiddleware] Validation passed');
    next();
  };
};

// Validation schemas
export const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(10).max(50).required().messages({
      'string.min': 'Name must be at least 10 characters long',
      'string.max': 'Name must not exceed 50 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
        'any.required': 'Password is required',
      }),
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required',
    }),
    rememberMe: Joi.boolean().optional().messages({
      'boolean.base': 'Remember Me must be true or false',
    }),
  }),

  resendVerification: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required().messages({
      'any.required': 'Reset token is required',
    }),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must include uppercase, lowercase, number, and special character',
        'any.required': 'Password is required',
      }),
  }),
};

// Profile validation schemas
export const profileSchemas = {
  updateProfile: Joi.object({
    name: Joi.string().min(10).max(50).optional().messages({
      'string.min': 'Name must be at least 10 characters long',
      'string.max': 'Name must not exceed 50 characters',
    }),
    profilePicture: Joi.string().uri().allow('').optional().messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),
    avatar: Joi.number().integer().min(0).max(5).optional().messages({
      'number.base': 'Avatar must be a number',
      'number.integer': 'Avatar must be an integer',
      'number.min': 'Avatar must be between 0 and 5',
      'number.max': 'Avatar must be between 0 and 5',
    }),
    // email: Joi.string().email().optional().messages({
    //   'string.email': 'Please provide a valid email address',
    // }), // Email changes are disabled for security
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'Current password is required',
    }),
    newPassword: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/)
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.pattern.base': 'New password must include uppercase, lowercase, number, and special character',
        'any.required': 'New password is required',
      }),
  }),

  deleteAccount: Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Password is required to delete account',
    }),
  }),
};
