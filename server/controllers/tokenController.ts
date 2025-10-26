import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Token from '../models/Token';
import TokenHistory from '../models/TokenHistory';
import DataService from '../services/DataService';
import { getTokenName, TOKEN_CONTRACTS } from '../config/tokens';

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

// POST /api/tokens/refresh - Refresh token prices from DexScreener API
export const refreshTokenPrices = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  
  try {
    // Fetch latest prices from DexScreener
    const priceData = await dataService.fetchTokenPrices();
    
  let updatedCount = 0;
  let createdCount = 0;
  const snapshotTime = new Date();
  const historyBatch: Array<{ symbol: string; chain: string; price: number; collectedAt: Date; source: string }> = [];

    if (!priceData || priceData.length === 0) {
      res.json({
        success: true,
        message: 'No price data available from DexScreener.',
        updated: 0,
        created: 0,
        timestamp: new Date()
      });
      return;
    }

  // Update/create tokens only for chains where the token has a contract mapping
  const supportedChains = dataService.getSupportedChains();

    for (const priceInfo of priceData) {
      const tokenContracts = TOKEN_CONTRACTS[priceInfo.symbol as keyof typeof TOKEN_CONTRACTS] || {};
      for (const chain of supportedChains) {
        // Skip chains where this token has no contract mapping
        if (!Object.prototype.hasOwnProperty.call(tokenContracts, chain)) {
          continue;
        }
        // Use atomic upsert to avoid race conditions and reduce DB calls
        const chainPrice = priceInfo.chainPrices?.[chain];
        if (chainPrice === undefined || chainPrice === null) {
          continue;
        }
        const update = {
          symbol: priceInfo.symbol,
          chain: chain,
          currentPrice: chainPrice,
          lastUpdated: priceInfo.timestamp,
          name: getTokenName(priceInfo.symbol)
        } as any;

        const result = await Token.findOneAndUpdate(
          { symbol: priceInfo.symbol, chain },
          { $set: update },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();

        // If the document existed prior to this operation, count as updated, else created
        // We can infer creation if the createdAt timestamp is very recent or if the returned doc has no previous updatedAt.
        // Mongoose does not return a flag for upsert creation here, so we'll approximate by checking timestamps.
        if (result) {
          // If createdAt is within 5 seconds of lastUpdated, assume it was newly created by upsert
          const createdAt = (result as any).createdAt as Date | undefined;
          if (createdAt && Math.abs(createdAt.getTime() - new Date().getTime()) < 5000) {
            createdCount++;
          } else {
            updatedCount++;
          }
        }

        historyBatch.push({
          symbol: priceInfo.symbol,
          chain,
          price: chainPrice,
          collectedAt: snapshotTime,
          source: 'dexscreener'
        });
      }
    }

    if (historyBatch.length > 0) {
      try {
        await TokenHistory.insertMany(historyBatch, { ordered: false });
      } catch (historyErr: any) {
        console.error('Error recording token history during manual refresh:', historyErr?.message || historyErr);
      }
    }

    res.json({
      success: true,
      message: 'Token prices refreshed successfully',
      updated: updatedCount,
      created: createdCount,
      timestamp: new Date()
    });
    return;
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

// GET /api/tokens/:symbol/:chain/history?tf=24h
export const getTokenHistory = async (req: Request, res: Response) => {
  const { symbol, chain } = req.params;
  const { tf = '7d' } = req.query;

  const timeframe = String(tf).toLowerCase();
  const now = Date.now();

  const timeframeWindows: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    'all': 0
  };

  const targetPoints: Record<string, number> = {
    '1h': 60,
    '24h': 96,
    '7d': 168,
    '30d': 240,
    '90d': 360,
    'all': 480
  };

  const normalizedSymbol = symbol.toUpperCase();
  const normalizedChain = chain.toLowerCase();
  const lookbackMs = timeframeWindows[timeframe] ?? timeframeWindows['7d'];
  const desiredPoints = targetPoints[timeframe] ?? targetPoints['7d'];

  const query: Record<string, any> = {
    symbol: normalizedSymbol,
    chain: normalizedChain
  };

  if (lookbackMs > 0) {
    query.collectedAt = { $gte: new Date(now - lookbackMs) };
  }

  try {
    type HistoryPoint = { price: number; source?: string; collectedAt: Date };

    const rawHistory = await TokenHistory.find(query)
      .sort({ collectedAt: -1 })
      .limit(Math.max(desiredPoints * 4, 200))
      .lean()
      .exec();

    const historyPoints = (rawHistory as HistoryPoint[]) ?? [];
    const ordered = historyPoints.slice().reverse();

    const downsampleSeries = <T>(series: T[], maxPoints: number): T[] => {
      if (series.length <= maxPoints) {
        return series;
      }

      const step = Math.ceil(series.length / maxPoints);
      const sampled: T[] = [];
      for (let i = 0; i < series.length; i += step) {
        sampled.push(series[i]);
      }

      const last = series[series.length - 1];
      if (sampled[sampled.length - 1] !== last) {
        sampled.push(last);
      }

      return sampled;
    };

    const sampled: HistoryPoint[] = downsampleSeries<HistoryPoint>(ordered, desiredPoints);

    if (sampled.length === 0) {
      res.set('Cache-Control', 'public, max-age=60');
      res.status(200).json({
        success: false,
        symbol: normalizedSymbol,
        chain: normalizedChain,
        timeframe: timeframe,
        count: 0,
        data: [],
        message: 'No historical price data recorded yet for this token on the selected chain.'
      });
      return;
    }

    const payload = sampled.map((entry: HistoryPoint) => ({
      price: entry.price,
      source: entry.source ?? 'dexscreener',
      collectedAt: entry.collectedAt
    }));

    res.set('Cache-Control', 'public, max-age=120');
    res.status(200).json({
      success: true,
      symbol: normalizedSymbol,
      chain: normalizedChain,
      timeframe: timeframe,
      count: payload.length,
      data: payload,
      latest: payload[payload.length - 1]?.price ?? null,
      message: payload.length < desiredPoints ? 'Limited historical samples available for this range.' : undefined
    });
  } catch (error: any) {
    console.error('Error retrieving token history:', error);
    res.status(500).json({
      success: false,
      symbol: normalizedSymbol,
      chain: normalizedChain,
      timeframe: timeframe,
      count: 0,
      data: [],
      message: 'Failed to retrieve historical data.'
    });
  }
};

