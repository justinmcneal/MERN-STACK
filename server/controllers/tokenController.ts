import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Token from '../models/Token';
import TokenHistory from '../models/TokenHistory';
import DataService from '../services/DataService';
import { getTokenName, TOKEN_CONTRACTS } from '../config/tokens';
import logger from '../utils/logger';
import { createError } from '../middleware/errorMiddleware';
import { sendPaginatedSuccess, sendSuccess } from '../utils/responseHelpers';

type TimestampReadableDocument = {
  get: (path: string) => unknown;
} | null;

const determineUpsertEffect = (doc: TimestampReadableDocument): 'created' | 'updated' => {
  if (!doc) {
    return 'updated';
  }

  const createdAt = doc.get('createdAt') as Date | undefined;
  const updatedAt = doc.get('updatedAt') as Date | undefined;

  if (!createdAt || !updatedAt) {
    return 'updated';
  }

  return Math.abs(updatedAt.getTime() - createdAt.getTime()) < 1000 ? 'created' : 'updated';
};

export const getTokens = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, chain, limit = 50, skip = 0, fields } = req.query;

  const query: Record<string, any> = {};

  if (symbol) {
    query.symbol = new RegExp(symbol as string, 'i');
  }

  if (chain) {
    query.chain = chain as string;
  }

  const allowedFields = new Set([
    '_id',
    'symbol',
    'chain',
    'currentPrice',
    'dexPrice',
    'dexName',
    'liquidity',
    'lastUpdated',
    'name',
    'decimals',
    'contractAddress',
    'updatedAt',
    'createdAt',
  ]);

  let projection: string | undefined;
  if (typeof fields === 'string') {
    const requested = fields
      .split(',')
      .map((field) => field.trim())
      .filter((field) => allowedFields.has(field));
    if (requested.length > 0) {
      projection = requested.join(' ');
    }
  }

  const numericLimit = Math.min(Math.max(Number(limit) || 50, 1), 250);
  const numericSkip = Math.max(Number(skip) || 0, 0);

  let tokenQuery = Token.find(query);
  if (projection) {
    tokenQuery = tokenQuery.select(projection);
  }

  const tokens = await tokenQuery
    .limit(numericLimit)
    .skip(numericSkip)
    .sort({ symbol: 1, chain: 1 });

  const total = await Token.countDocuments(query);

  sendPaginatedSuccess(res, tokens, total);
});

export const getTokenBySymbol = asyncHandler(async (req: Request, res: Response) => {
  const { symbol } = req.params;

  const tokens = await Token.find({ 
    symbol: new RegExp(symbol as string, 'i') 
  }).sort({ chain: 1 });

  if (tokens.length === 0) {
    throw createError('Token not found', 404);
  }

  sendSuccess(res, tokens, undefined, { count: tokens.length });
});

export const getTokenBySymbolAndChain = asyncHandler(async (req: Request, res: Response) => {
  const { symbol, chain } = req.params;

  const token = await Token.findOne({ 
    symbol: symbol.toUpperCase(),
    chain: chain.toLowerCase()
  });

  if (!token) {
    throw createError('Token not found on specified chain', 404);
  }

  sendSuccess(res, token);
});

export const refreshTokenPrices = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();

  try {
    const priceData = await dataService.fetchTokenPrices();

    let updatedCount = 0;
    let createdCount = 0;
    let dexUpdatedCount = 0;
    const snapshotTime = new Date();
    const historyBatch: Array<{ symbol: string; chain: string; price: number; collectedAt: Date; source: string }> = [];

    if (!priceData || priceData.length === 0) {
      sendSuccess(res, undefined, 'No price data available from DexScreener.', {
        updated: 0,
        created: 0,
        dexUpdated: 0,
        timestamp: new Date(),
      });
      return;
    }

    const supportedChains = dataService.getSupportedChains();

    for (const priceInfo of priceData) {
      const tokenContracts = TOKEN_CONTRACTS[priceInfo.symbol as keyof typeof TOKEN_CONTRACTS] || {};

      for (const chain of supportedChains) {
        if (!Object.prototype.hasOwnProperty.call(tokenContracts, chain)) {
          continue;
        }

        const chainPrice = priceInfo.chainPrices?.[chain];
        if (chainPrice === undefined || chainPrice === null) {
          continue;
        }

        const update = {
          symbol: priceInfo.symbol,
          chain,
          currentPrice: chainPrice,
          lastUpdated: priceInfo.timestamp,
          name: getTokenName(priceInfo.symbol),
        };

        const result = await Token.findOneAndUpdate(
          { symbol: priceInfo.symbol, chain },
          { $set: update },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        ).exec();

  const effect = determineUpsertEffect(result as TimestampReadableDocument);
        if (effect === 'created') {
          createdCount++;
        } else {
          updatedCount++;
        }

        historyBatch.push({
          symbol: priceInfo.symbol,
          chain,
          price: chainPrice,
          collectedAt: snapshotTime,
          source: 'dexscreener',
        });
      }
    }

    try {
      const dexPrices = await dataService.fetchDexPrices();
      for (const dexPrice of dexPrices) {
        await Token.findOneAndUpdate(
          { symbol: dexPrice.symbol, chain: dexPrice.chain },
          {
            $set: {
              dexPrice: dexPrice.price,
              dexName: dexPrice.dexName,
              liquidity: dexPrice.liquidity,
              lastUpdated: dexPrice.timestamp ?? new Date(),
            },
          },
          { upsert: true, new: true }
        ).exec();
        dexUpdatedCount++;
      }
    } catch (dexErr: any) {
      logger.warn('Error refreshing DEX prices during manual refresh', dexErr);
    }

    if (historyBatch.length > 0) {
      try {
        await TokenHistory.insertMany(historyBatch, { ordered: false });
      } catch (historyErr: any) {
        logger.warn('Error recording token history during manual refresh', historyErr);
      }
    }

    sendSuccess(res, undefined, 'Token prices refreshed successfully', {
      updated: updatedCount,
      created: createdCount,
      dexUpdated: dexUpdatedCount,
      timestamp: new Date(),
    });
  } catch (error: any) {
    logger.error('Failed to refresh token prices', error);
    throw createError(`Failed to refresh token prices: ${error.message}`, 500);
  }
});

export const getSupportedTokens = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedTokens = dataService.getSupportedTokens();

  sendSuccess(res, supportedTokens);
});

export const getSupportedChains = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const supportedChains = dataService.getSupportedChains();

  sendSuccess(res, supportedChains);
});

export const getTokenHistory = asyncHandler(async (req: Request, res: Response) => {
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
    all: 0,
  };

  const targetPoints: Record<string, number> = {
    '1h': 60,
    '24h': 96,
    '7d': 168,
    '30d': 240,
    '90d': 360,
    all: 480,
  };

  const normalizedSymbol = symbol.toUpperCase();
  const normalizedChain = chain.toLowerCase();
  const lookbackMs = timeframeWindows[timeframe] ?? timeframeWindows['7d'];
  const desiredPoints = targetPoints[timeframe] ?? targetPoints['7d'];

  const query: Record<string, any> = {
    symbol: normalizedSymbol,
    chain: normalizedChain,
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
      sendSuccess(
        res,
        [],
        'No historical price data recorded yet for this token on the selected chain.',
        {
          symbol: normalizedSymbol,
          chain: normalizedChain,
          timeframe,
          count: 0,
          latest: null,
        }
      );
      return;
    }

    const payload = sampled.map((entry: HistoryPoint) => ({
      price: entry.price,
      source: entry.source ?? 'dexscreener',
      collectedAt: entry.collectedAt,
    }));

    res.set('Cache-Control', 'public, max-age=120');
    sendSuccess(res, payload, payload.length < desiredPoints ? 'Limited historical samples available for this range.' : undefined, {
      symbol: normalizedSymbol,
      chain: normalizedChain,
      timeframe,
      count: payload.length,
      latest: payload[payload.length - 1]?.price ?? null,
    });
  } catch (error: any) {
    logger.error('Error retrieving token history', error);
    throw createError('Failed to retrieve historical data.', 500);
  }
});

