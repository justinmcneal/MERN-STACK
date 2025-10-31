import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { createError } from './errorMiddleware';
import logger from '../utils/logger';

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Request body validation failed', { path: req.path, error: errorMessage });
      return next(createError(errorMessage, 400));
    }

    req.body = value;
    next();
  };
};

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

export const twoFactorSchemas = {
  setup: Joi.object({}),
  verifySetup: Joi.object({
    token: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
      'string.length': 'Verification code must be 6 digits',
      'string.pattern.base': 'Verification code must contain only numbers',
    }),
  }),
  verifyToken: Joi.object({
    token: Joi.string().min(6).max(8).required().messages({
      'string.min': 'Token must be at least 6 characters',
      'string.max': 'Token must be at most 8 characters',
    }),
  }),
  verifyLogin: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    token: Joi.string().min(6).max(8).required().messages({
      'string.min': 'Token must be at least 6 characters',
      'string.max': 'Token must be at most 8 characters',
    }),
  }),
  disable: Joi.object({
    password: Joi.string().required().messages({
      'any.required': 'Password is required to disable two-factor authentication',
    }),
  }),
};
