import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Opportunity from '../models/Opportunity';
import Token from '../models/Token';
import DataService from '../services/DataService';
import { TOKEN_CONTRACTS, type SupportedChain, type SupportedToken } from '../config/tokens';
import {
  buildArbitrageContext,
  evaluateOpportunity,
  upsertOpportunity
} from '../services/ArbitrageService';
import { createError } from '../middleware/errorMiddleware';
import { sendSuccess, sendPaginatedSuccess, sendUpdateSuccess } from '../utils/responseHelpers';
import { buildSortObject, parsePaginationParams, buildRangeFilter, toArray, parseBoolean } from '../utils/queryHelpers';
import { filterOpportunities } from '../utils/opportunityHelpers';
import logger from '../utils/logger';

export const getOpportunities = asyncHandler(async (req: Request, res: Response) => {
  const { 
    status = 'active',
    tokenId,
    chainFrom,
    chainTo,
    minProfit,
    maxProfit,
    minScore,
    maxScore,
    includeFlagged
  } = req.query;

  const { limit, skip, sortBy, sortOrder } = parsePaginationParams(req.query);

  const query: any = {};

  if (status) {
    query.status = status;
  }

  if (chainFrom) {
    query.chainFrom = chainFrom as string;
  }

  if (chainTo) {
    query.chainTo = chainTo as string;
  }

  Object.assign(query, buildRangeFilter('estimatedProfit', minProfit as any, maxProfit as any));
  Object.assign(query, buildRangeFilter('score', minScore as any, maxScore as any));

  if (tokenId) {
    query.tokenId = String(tokenId);
  }

  const sort = buildSortObject(sortBy, sortOrder);

  const opportunities = await Opportunity.find(query)
    .populate('tokenId', 'symbol chain name currentPrice')
    .sort(sort)
    .limit(limit)
    .skip(skip);

  const total = await Opportunity.countDocuments(query);

  const allowFlagged = parseBoolean(includeFlagged);
  const filtered = filterOpportunities(opportunities.map((opportunity) => opportunity.toObject()), allowFlagged);

  sendPaginatedSuccess(res, filtered, total);
});

export const getOpportunityById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findById(id)
    .populate('tokenId', 'symbol chain name currentPrice');

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  const flagged = filterOpportunities([opportunity.toObject()], true)[0];

  sendSuccess(res, flagged);
});

export const scanOpportunities = asyncHandler(async (req: Request, res: Response) => {
  const { tokens, chains, forceRefresh = false } = req.body;

  try {
    const dataService = DataService.getInstance();
    const supportedChains = dataService.getSupportedChains() as SupportedChain[];
    const supportedTokens = dataService.getSupportedTokens() as SupportedToken[];

    if (forceRefresh) {
      logger.info('Refreshing prices (CEX + DEX)');
      
      const priceData = await dataService.fetchTokenPrices();
      
      for (const priceInfo of priceData) {
        const tokenContracts =
          TOKEN_CONTRACTS[priceInfo.symbol as keyof typeof TOKEN_CONTRACTS] || {};

        for (const chain of supportedChains) {
          if (!Object.prototype.hasOwnProperty.call(tokenContracts, chain)) {
            continue;
          }

          const chainPrice = priceInfo.chainPrices?.[chain] ?? priceInfo.price;
          if (chainPrice === undefined || chainPrice === null) {
            continue;
          }

          await Token.findOneAndUpdate(
            { symbol: priceInfo.symbol, chain },
            {
              currentPrice: chainPrice,
              lastUpdated: priceInfo.timestamp
            },
            { upsert: true }
          );
        }
      }

      logger.info('Fetching chain-specific DEX prices');
      const dexPrices = await dataService.fetchDexPrices();
      
      let dexUpdated = 0;
      for (const dexPrice of dexPrices) {
        await Token.findOneAndUpdate(
          { symbol: dexPrice.symbol, chain: dexPrice.chain },
          {
            dexPrice: dexPrice.price,
            dexName: dexPrice.dexName,
            liquidity: dexPrice.liquidity,
            lastUpdated: new Date()
          },
          { new: true }
        );
        dexUpdated++;
      }
      logger.info(`Updated ${dexPrices.length} CEX prices and ${dexUpdated} DEX prices`);
    }

    const tokensToAnalyze = (() => {
      const filtered = toArray<string>(tokens)
        .map((token) => String(token).toUpperCase())
        .filter((token): token is SupportedToken =>
          supportedTokens.includes(token as SupportedToken)
        );
      return filtered.length > 0 ? filtered : [...supportedTokens];
    })();

    const chainsToAnalyze = (() => {
      const filtered = toArray<string>(chains)
        .map((chain) => String(chain).toLowerCase())
        .filter((chain): chain is SupportedChain =>
          supportedChains.includes(chain as SupportedChain)
        );
      return filtered.length > 0 ? filtered : [...supportedChains];
    })();

    const context = await buildArbitrageContext();

    let opportunitiesFound = 0;
    let opportunitiesUpdated = 0;
    const results: Array<{
      token: SupportedToken;
      chainFrom: SupportedChain;
      chainTo: SupportedChain;
      profitable: boolean;
      priceDiffPerTokenUsd: number;
      netProfitUsd: number;
      grossProfitUsd: number;
      priceDiffUsd: number;
      priceDiffPercent: number;
      gasCostUsd: number;
      gasCostBreakdown: {
        outboundUsd: number;
        inboundUsd: number;
      };
      tradeUsdAmount: number;
      tradeTokenAmount: number;
      roi: number | null;
      score: number;
      priceFrom: number;
      priceTo: number;
      opportunityId?: string;
    }> = [];

    for (const tokenSymbol of tokensToAnalyze) {
      for (const chainFrom of chainsToAnalyze) {
        for (const chainTo of chainsToAnalyze) {
          if (chainFrom === chainTo) continue;

          try {
            const evaluation = await evaluateOpportunity(
              tokenSymbol,
              chainFrom,
              chainTo,
              context
            );

            if (!evaluation) {
              continue;
            }

            const { opportunity, isNew } = await upsertOpportunity(evaluation, context);

            let opportunityId: string | undefined;
            if (opportunity) {
              opportunityId = opportunity._id.toString();
              if (isNew) {
                opportunitiesFound++;
              } else {
                opportunitiesUpdated++;
              }
            }

            results.push({
              token: tokenSymbol,
              chainFrom,
              chainTo,
              profitable: evaluation.profitable,
              priceDiffPerTokenUsd: evaluation.priceDiffPerTokenUsd,
              netProfitUsd: evaluation.netProfitUsd,
              grossProfitUsd: evaluation.grossProfitUsd,
              priceDiffUsd: evaluation.priceDiffUsd,
              priceDiffPercent: evaluation.priceDiffPercent,
              gasCostUsd: evaluation.gasCostUsd,
              gasCostBreakdown: evaluation.gasCostBreakdown,
              tradeUsdAmount: evaluation.tradeUsdAmount,
              tradeTokenAmount: evaluation.tradeTokenAmount,
              roi: evaluation.roi,
              score: evaluation.score,
              priceFrom: evaluation.priceFrom,
              priceTo: evaluation.priceTo,
              opportunityId
            });
          } catch (error) {
            logger.error(`Error analyzing ${tokenSymbol} ${chainFrom} -> ${chainTo}`, error);
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Opportunity scan completed',
      opportunitiesFound,
      opportunitiesUpdated,
      tokensAnalyzed: tokensToAnalyze.length,
      chainPairsAnalyzed: results.length,
      results: results.slice(0, 25)
    });
  } catch (error: any) {
    logger.error('Error scanning opportunities', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan opportunities',
      error: error?.message ?? 'Unknown error'
    });
  }
});

export const markOpportunityAsExpired = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findByIdAndUpdate(
    id,
    { status: 'expired' },
    { new: true }
  );

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  sendUpdateSuccess(res, opportunity, 'Opportunity marked as expired');
});

export const markOpportunityAsExecuted = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findByIdAndUpdate(
    id,
    { status: 'executed' },
    { new: true }
  );

  if (!opportunity) {
    throw createError('Opportunity not found', 404);
  }

  sendUpdateSuccess(res, opportunity, 'Opportunity marked as executed');
});

export const getOpportunityStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Opportunity.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgProfit: { $avg: '$netProfit' },
      avgGrossProfit: { $avg: '$estimatedProfit' },
      avgScore: { $avg: '$score' },
      avgROI: { $avg: '$roi' },
      avgTradeVolume: { $avg: '$volume' }
    }}
  ]);

  const profitableOpportunities = await Opportunity.countDocuments({
    status: 'active',
    netProfit: { $gt: 0 }
  });

  const totalOpportunities = await Opportunity.countDocuments({});

  sendSuccess(res, {
    byStatus: stats,
    profitableOpportunities,
    totalOpportunities
  });
});

export const getSupportedChainPairs = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const chains = dataService.getSupportedChains();
  const pairs: string[] = [];

  for (let i = 0; i < chains.length; i++) {
    for (let j = 0; j < chains.length; j++) {
      if (i !== j) {
        pairs.push(`${chains[i]} -> ${chains[j]}`);
      }
    }
  }

  sendSuccess(res, pairs);
});
