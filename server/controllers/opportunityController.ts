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

const SEVERE_ANOMALIES = new Set<string>([
  'spread-outlier',
  'gas-vs-profit-outlier',
  'from-dex-cex-divergence',
  'to-dex-cex-divergence'
]);

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
    sortOrder = 'desc',
    includeFlagged
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

  const allowFlagged = typeof includeFlagged === 'string'
    ? includeFlagged.toLowerCase() === 'true'
    : Array.isArray(includeFlagged)
      ? includeFlagged.some((value) => String(value).toLowerCase() === 'true')
      : false;

  const normalized = opportunities.map((opp) => {
    const plain = opp.toObject();
    const priceDiffPercent = plain.priceDiffPercent;
    const estimatedProfit = plain.estimatedProfit;
    const gasCost = plain.gasCost;

    const anomalies = new Set<string>();
    if (Array.isArray(plain.anomalyFlags)) {
      for (const flag of plain.anomalyFlags) {
        if (typeof flag === 'string' && flag.trim().length > 0) {
          anomalies.add(flag);
        }
      }
    }

    if (typeof priceDiffPercent === 'number' && Math.abs(priceDiffPercent) > 5000) {
      anomalies.add('spread-outlier');
    }

    if (
      typeof estimatedProfit === 'number' &&
      typeof gasCost === 'number' &&
      estimatedProfit > 0 &&
      gasCost >= 0 &&
      gasCost < estimatedProfit * 0.0001
    ) {
      anomalies.add('gas-vs-profit-outlier');
    }

    if (anomalies.size === 0) {
      return plain;
    }

    const flagReasons = Array.from(anomalies);
    return {
      ...plain,
      flagged: true,
      flagReason: flagReasons[0],
      flagReasons
    };
  });

  const filtered = allowFlagged
    ? normalized
    : normalized.filter((item) => {
        const reasons = Array.isArray((item as any).flagReasons) ? (item as any).flagReasons : [];
        if (reasons.length === 0 && !(item as any).flagged) {
          return true;
        }
        return !reasons.some((reason: string) => SEVERE_ANOMALIES.has(reason));
      });

  res.json({
    success: true,
    count: filtered.length,
    total,
    data: filtered
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

  const plain = opportunity.toObject();
  const priceDiffPercent = plain.priceDiffPercent;
  const estimatedProfit = plain.estimatedProfit;
  const gasCost = plain.gasCost;

  const responseBody = {
    ...plain
  } as typeof plain & { flagged?: boolean; flagReason?: string; flagReasons?: string[] };

  const anomalies = new Set<string>();
  if (Array.isArray(plain.anomalyFlags)) {
    for (const flag of plain.anomalyFlags) {
      if (typeof flag === 'string' && flag.trim().length > 0) {
        anomalies.add(flag);
      }
    }
  }

  if (typeof priceDiffPercent === 'number' && Math.abs(priceDiffPercent) > 5000) {
    anomalies.add('spread-outlier');
  }

  if (
    typeof estimatedProfit === 'number' &&
    typeof gasCost === 'number' &&
    estimatedProfit > 0 &&
    gasCost >= 0 &&
    gasCost < estimatedProfit * 0.0001
  ) {
    anomalies.add('gas-vs-profit-outlier');
  }

  if (anomalies.size > 0) {
    const flagReasons = Array.from(anomalies);
    responseBody.flagged = true;
    responseBody.flagReason = flagReasons[0];
    responseBody.flagReasons = flagReasons;
  }

  res.json({
    success: true,
    data: responseBody
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
      console.log('🔄 Refreshing prices (CEX + DEX)...');
      
      // Fetch CEX prices
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

      // Fetch DEX prices for real arbitrage
      console.log('💱 Fetching chain-specific DEX prices...');
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
      console.log(`✅ Updated ${dexPrices.length} CEX prices and ${dexUpdated} DEX prices`);
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
