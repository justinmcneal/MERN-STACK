import { Router } from 'express';
import {
  getTokens,
  getTokenBySymbol,
  getTokenBySymbolAndChain,
  refreshTokenPrices,
  getSupportedTokens,
  getSupportedChains
} from '../controllers/tokenController';

const router = Router();

// GET /api/tokens - Get all tokens with optional filtering
router.get('/', getTokens);

// GET /api/tokens/supported - Get supported tokens list
router.get('/supported', getSupportedTokens);

// GET /api/tokens/chains - Get supported chains list
router.get('/chains', getSupportedChains);

// GET /api/tokens/:symbol - Get token by symbol (across all chains)
router.get('/:symbol', getTokenBySymbol);

// GET /api/tokens/:symbol/:chain - Get specific token on specific chain
router.get('/:symbol/:chain', getTokenBySymbolAndChain);

// POST /api/tokens/refresh - Refresh token prices from external API
router.post('/refresh', refreshTokenPrices);

export default router;
