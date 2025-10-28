import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import MLService from '../services/MLService';
import { EmailService } from '../services/EmailService';

export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const mlService = MLService.getInstance();

  const mlHealthy = await mlService.isHealthy();
  res.json({
    success: true,
    services: {
      ml_service: mlHealthy
    },
    timestamp: new Date()
  });
});

export const debugSMTP = asyncHandler(async (req: Request, res: Response) => {
  try {
    await EmailService.sendEmail({ to: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'test@example.com', subject: 'SMTP Debug', html: '<p>SMTP Debug</p>' });
    res.json({ success: true, message: 'SMTP verification succeeded (email send attempted).' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'SMTP verification failed. Check server logs for details.', error: err && err.message ? err.message : err });
  }
});

export default { getHealth, debugSMTP };
