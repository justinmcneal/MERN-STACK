import { Router } from 'express';
import {
  getTokens,
  getTokenBySymbol,
  getTokenBySymbolAndChain,
  refreshTokenPrices,
  getSupportedTokens,
  getSupportedChains,
  getTokenHistory
} from '../controllers/tokenController';

const router = Router();

router.get('/', getTokens);
router.get('/supported', getSupportedTokens);
router.get('/chains', getSupportedChains);
router.get('/:symbol/:chain/history', getTokenHistory);
router.get('/:symbol/:chain', getTokenBySymbolAndChain);
router.get('/:symbol', getTokenBySymbol);
router.post('/refresh', refreshTokenPrices);

export default router;
