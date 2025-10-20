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

// GET /api/opportunities - Get all opportunities with filtering
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
    limit = 50,
    skip = 0,
    sortBy = 'score',
    sortOrder = 'desc'
  } = req.query;

  let query: any = {};

  if (status) {
    query.status = status;
  }

  if (tokenId) {
    query.tokenId = tokenId;
  }

  if (chainFrom) {
    query.chainFrom = chainFrom as string;
  }

  if (chainTo) {
    query.chainTo = chainTo as string;
  }

  if (minProfit) {
    query.estimatedProfit = { ...query.estimatedProfit, $gte: Number(minProfit) };
  }

  if (maxProfit) {
    query.estimatedProfit = { ...query.estimatedProfit, $lte: Number(maxProfit) };
  }

  if (minScore) {
    query.score = { ...query.score, $gte: Number(minScore) };
  }

  if (maxScore) {
    query.score = { ...query.score, $lte: Number(maxScore) };
  }

  // Build sort object
  const sort: any = {};
  sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

  const opportunities = await Opportunity.find(query)
    .populate('tokenId', 'symbol chain name currentPrice')
    .sort(sort)
    .limit(Number(limit))
    .skip(Number(skip));

  const total = await Opportunity.countDocuments(query);

  res.json({
    success: true,
    count: opportunities.length,
    total,
    data: opportunities
  });
});

// GET /api/opportunities/:id - Get opportunity by ID
export const getOpportunityById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findById(id)
    .populate('tokenId', 'symbol chain name currentPrice');

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  res.json({
    success: true,
    data: opportunity
  });
});

// POST /api/opportunities/scan - Trigger opportunity scan for all tokens
export const scanOpportunities = asyncHandler(async (req: Request, res: Response) => {
  const { tokens, chains, forceRefresh = false } = req.body;

  const toArray = <T,>(value: T | T[] | undefined): T[] => {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? value : [value];
  };

  try {
    const dataService = DataService.getInstance();
    const supportedChains = dataService.getSupportedChains() as SupportedChain[];
    const supportedTokens = dataService.getSupportedTokens() as SupportedToken[];

    if (forceRefresh) {
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
      netProfitUsd: number;
      priceDiffUsd: number;
      priceDiffPercent: number;
      gasCostUsd: number;
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
              netProfitUsd: evaluation.netProfitUsd,
              priceDiffUsd: evaluation.priceDiffUsd,
              priceDiffPercent: evaluation.priceDiffPercent,
              gasCostUsd: evaluation.gasCostUsd,
              roi: evaluation.roi,
              score: evaluation.score,
              priceFrom: evaluation.priceFrom,
              priceTo: evaluation.priceTo,
              opportunityId
            });
          } catch (error) {
            console.error(`Error analyzing ${tokenSymbol} ${chainFrom} -> ${chainTo}:`, error);
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
    console.error('Error scanning opportunities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan opportunities',
      error: error?.message ?? 'Unknown error'
    });
  }
});

// POST /api/opportunities/:id/expire - Mark opportunity as expired
export const markOpportunityAsExpired = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findByIdAndUpdate(
    id,
    { status: 'expired' },
    { new: true }
  );

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  res.json({
    success: true,
    message: 'Opportunity marked as expired',
    data: opportunity
  });
});

// POST /api/opportunities/:id/execute - Mark opportunity as executed
export const markOpportunityAsExecuted = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const opportunity = await Opportunity.findByIdAndUpdate(
    id,
    { status: 'executed' },
    { new: true }
  );

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  res.json({
    success: true,
    message: 'Opportunity marked as executed',
    data: opportunity
  });
});

// GET /api/opportunities/stats - Get opportunity statistics
export const getOpportunityStats = asyncHandler(async (req: Request, res: Response) => {
  const stats = await Opportunity.aggregate([
    { $group: {
      _id: '$status',
      count: { $sum: 1 },
      avgProfit: { $avg: '$estimatedProfit' },
      avgScore: { $avg: '$score' },
      avgROI: { $avg: '$roi' }
    }}
  ]);

  const profitableOpportunities = await Opportunity.countDocuments({
    status: 'active',
    estimatedProfit: { $gt: 0 }
  });

  const totalOpportunities = await Opportunity.countDocuments({});

  res.json({
    success: true,
    data: {
      byStatus: stats,
      profitableCount: profitableOpportunities,
      totalCount: totalOpportunities,
      profitabilityRate: totalOpportunities > 0 ? 
        (profitableOpportunities / totalOpportunities) * 100 : 0
    }
  });
});

// GET /api/opportunities/pairs - Get available chain pairs (all directional pairs)
export const getSupportedChainPairs = asyncHandler(async (req: Request, res: Response) => {
  const dataService = DataService.getInstance();
  const chains = dataService.getSupportedChains();
  const pairs: string[] = [];

  // Generate all directional pairs (A -> B and B -> A)
  for (let i = 0; i < chains.length; i++) {
    for (let j = 0; j < chains.length; j++) {
      if (i !== j) { // Don't include same chain pairs
        pairs.push(`${chains[i]} -> ${chains[j]}`);
      }
    }
  }

  res.json({
    success: true,
    data: pairs
  });
});
