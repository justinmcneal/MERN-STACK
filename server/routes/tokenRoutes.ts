import { Router } from 'express';
import {
  getTokens,
  getTokenBySymbol,
  getTokenBySymbolAndChain,
  refreshTokenPrices,
  getSupportedTokens,
  getSupportedChains
  , getTokenHistory
} from '../controllers/tokenController';

const router = Router();

// GET /api/tokens - Get all tokens with optional filtering
router.get('/', getTokens);

// GET /api/tokens/supported - Get supported tokens list
router.get('/supported', getSupportedTokens);

// GET /api/tokens/chains - Get supported chains list
router.get('/chains', getSupportedChains);

// More specific routes first to avoid accidental route shadowing
// GET /api/tokens/:symbol/:chain/history - Get historical price series
router.get('/:symbol/:chain/history', getTokenHistory);

// GET /api/tokens/:symbol/:chain - Get specific token on specific chain
router.get('/:symbol/:chain', getTokenBySymbolAndChain);

// GET /api/tokens/:symbol - Get token by symbol (across all chains)
router.get('/:symbol', getTokenBySymbol);

// POST /api/tokens/refresh - Refresh token prices from external API
router.post('/refresh', refreshTokenPrices);

export default router;
