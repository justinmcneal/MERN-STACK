import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
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

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error occurred', {
      message: error.message,
      stack: error.stack,
      statusCode,
      url: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};