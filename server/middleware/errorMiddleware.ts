import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500,
  isOperational: boolean = true
): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  return error;
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = createError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const shouldLogStack = process.env.NODE_ENV !== 'production';

  const logPayload = {
    message: error.message,
    statusCode,
    url: req.originalUrl,
    method: req.method,
    ...(shouldLogStack && { stack: error.stack }),
  };

  if (!error.isOperational || statusCode >= 500) {
    logger.error('Unhandled error encountered', logPayload);
  } else {
    logger.warn('Operational error encountered', logPayload);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(shouldLogStack && { stack: error.stack }),
    },
  });
};