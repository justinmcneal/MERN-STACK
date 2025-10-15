import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import MLService from '../services/MLService';
import { EmailService } from '../services/EmailService';

// GET /api/system/health - Check basic system health (CoinGecko + ML service)
export const getHealth = asyncHandler(async (req: Request, res: Response) => {
  const mlService = MLService.getInstance();

  // Lightweight CoinGecko ping
  let coingeckoHealthy = false;
  try {
    await axios.get('https://api.coingecko.com/api/v3/ping', { timeout: 3000 });
    coingeckoHealthy = true;
  } catch (err) {
    console.warn('CoinGecko ping failed:', (err as any).message || err);
    coingeckoHealthy = false;
  }

  const mlHealthy = await mlService.isHealthy();
  res.json({
    success: true,
    services: {
      coingecko: coingeckoHealthy,
      ml_service: mlHealthy
    },
    timestamp: new Date()
  });
});

// GET /api/system/debug-smtp - Verify SMTP transporter and return short result (for debugging only)
export const debugSMTP = asyncHandler(async (req: Request, res: Response) => {
  try {
    // EmailService.getTransporter is private; calling sendEmail with jsonTransport=false will trigger verify in our implementation
    // So we implement a lightweight verify call by creating a transporter via EmailService by calling its internal method indirectly.
    // To keep code minimal, we'll attempt to call EmailService.sendEmail with a no-op recipient that won't be delivered; errors will surface.
    await EmailService.sendEmail({ to: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'test@example.com', subject: 'SMTP Debug', html: '<p>SMTP Debug</p>' });
    res.json({ success: true, message: 'SMTP verification succeeded (email send attempted).' });
  } catch (err: any) {
    // EmailService already logs detailed errors. Return a short message here.
    res.status(500).json({ success: false, message: 'SMTP verification failed. Check server logs for details.', error: err && err.message ? err.message : err });
  }
});

export default { getHealth, debugSMTP };
