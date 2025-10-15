import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import axios from 'axios';
import MLService from '../services/MLService';

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

export default { getHealth };
