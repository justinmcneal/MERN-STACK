import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Token from '../models/Token';
import DataService from '../services/DataService';
import { getTokenName } from '../config/tokens';

// GET /api/tokens - Get all tokens
export const getTokens = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, chain, limit = 50, skip = 0 } = req.query;

  let query: any = {};
  
  if (symbol) {
    query.symbol = new RegExp(symbol as string, 'i');
  }
  
  if (chain) {
    query.chain = chain as string;
  }

  const tokens = await Token.find(query)
    .limit(Number(limit))
    .skip(Number(skip))
    .sort({ symbol: 1, chain: 1 });

  const total = await Token.countDocuments(query);

  res.json({
    success: true,
    count: tokens.length,
    total,
    data: tokens
  });
});

// GET /api/tokens/:symbol - Get token by symbol
export const getTokenBySymbol = asyncHandler(async (req: Request, res: Response) => {
  const { symbol } = req.params;

  const tokens = await Token.find({ 
    symbol: new RegExp(symbol as string, 'i') 
  }).sort({ chain: 1 });

  if (tokens.length === 0) {
    res.status(404);
    throw new Error('Token not found');
  }

  res.json({
    success: true,
    count: tokens.length,
    data: tokens
  });
});

// GET /api/tokens/:symbol/:chain - Get specific token on specific chain
export const getTokenBySymbolAndChain = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, chain } = req.params;

  const token = await Token.findOne({ 
    symbol: symbol.toUpperCase(),
    chain: chain.toLowerCase()
  });

  if (!token) {
    res.status(404);
    throw new Error('Token not found on specified chain');
  }

  res.json({
    success: true,
    data: token
  });
});

// POST /api/tokens/refresh - Refresh token prices from external API
export const refreshTokenPrices = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  
  try {
    // Fetch latest prices from CoinGecko
    const priceData = await dataService.fetchTokenPrices();
    
    let updatedCount = 0;
    let createdCount = 0;
    
    // Update/create tokens for each supported chain
    const supportedChains = dataService.getSupportedChains();
    
    for (const priceInfo of priceData) {
      for (const chain of supportedChains) {
        const existingToken = await Token.findOne({
          symbol: priceInfo.symbol,
          chain: chain
        });

        if (existingToken) {
          // Update existing token
          existingToken.currentPrice = priceInfo.price;
          existingToken.lastUpdated = priceInfo.timestamp;
          await existingToken.save();
          updatedCount++;
        } else {
          // Create new token
          await Token.create({
            symbol: priceInfo.symbol,
            chain: chain,
            currentPrice: priceInfo.price,
            lastUpdated: priceInfo.timestamp,
            name: getTokenName(priceInfo.symbol)
          });
          createdCount++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Token prices refreshed successfully',
      updated: updatedCount,
      created: createdCount,
      timestamp: new Date()
    });
  } catch (error: any) {
    res.status(500);
    throw new Error(`Failed to refresh token prices: ${error.message}`);
  }
});

// GET /api/tokens/supported - Get supported tokens list
export const getSupportedTokens = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();
  
  res.json({
    success: true,
    data: supportedTokens
  });
});

// GET /api/tokens/chains - Get supported chains list
export const getSupportedChains = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedChains = dataService.getSupportedChains();
  
  res.json({
    success: true,
    data: supportedChains
  });
});

