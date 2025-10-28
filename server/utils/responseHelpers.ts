import { Response } from 'express';

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  count?: number;
  total?: number;
  [key: string]: any;
}

export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  additionalFields?: Record<string, any>
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
    ...additionalFields,
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return res.json(response);
};

export const sendPaginatedSuccess = <T = any>(
  res: Response,
  data: T[],
  total: number,
  message?: string
): Response => {
  return res.json({
    success: true,
    count: data.length,
    total,
    data,
    ...(message && { message }),
  });
};

export const sendCreatedSuccess = <T = any>(
  res: Response,
  data: T,
  message?: string
): Response => {
  return res.status(201).json({
    success: true,
    message: message || 'Resource created successfully',
    data,
  });
};

export const sendDeleteSuccess = (
  res: Response,
  message: string = 'Resource deleted successfully'
): Response => {
  return res.json({
    success: true,
    message,
  });
};

export const sendUpdateSuccess = <T = any>(
  res: Response,
  data: T,
  message: string = 'Resource updated successfully'
): Response => {
  return res.json({
    success: true,
    message,
    data,
  });
};
