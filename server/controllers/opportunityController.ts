import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Opportunity from '../models/Opportunity';
import Token from '../models/Token';
import DataService from '../services/DataService';
import MLService from '../services/MLService';

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

  try {
    const dataService = DataService.getInstance();
    const mlService = MLService.getInstance();

    // Refresh token prices first
    if (forceRefresh) {
      // This would typically be called separately, but we can refresh here too
      const priceData = await dataService.fetchTokenPrices();
      
      for (const priceInfo of priceData) {
        const supportedChains = dataService.getSupportedChains();
        for (const chain of supportedChains) {
          await Token.findOneAndUpdate(
            { symbol: priceInfo.symbol, chain: chain },
            { 
              currentPrice: priceInfo.price, 
              lastUpdated: priceInfo.timestamp 
            },
            { upsert: true }
          );
        }
      }
    }

    // Get tokens to analyze
    let tokensToAnalyze = tokens || dataService.getSupportedTokens();
    let chainsToAnalyze = chains || dataService.getSupportedChains();

    let opportunitiesFound = 0;
    const results: any[] = [];

    // Analyze each token on each directional chain pair
    for (const tokenSymbol of tokensToAnalyze) {
      for (let i = 0; i < chainsToAnalyze.length; i++) {
        for (let j = 0; j < chainsToAnalyze.length; j++) {
          if (i === j) continue; // Skip same chain pairs
          const chainFrom = chainsToAnalyze[i];
          const chainTo = chainsToAnalyze[j];

          try {
            // Get ML analysis from the FastAPI service
            const analysis = await mlService.getArbitrageOpportunity({
              token: tokenSymbol.toLowerCase(),
              chain_a: chainFrom,
              chain_b: chainTo
            });

            // Get token document
            const token = await Token.findOne({ symbol: tokenSymbol.toUpperCase() });
            if (!token) continue;

            // Check if opportunity already exists
            const existingOpportunity = await Opportunity.findOne({
              tokenId: token._id,
              chainFrom,
              chainTo,
              status: 'active'
            });

            if (existingOpportunity) {
              // Update existing opportunity If profitable, update score and additional info.
              if (analysis.profitable) {
                existingOpportunity.priceDiff = analysis.spread_usd;
                existingOpportunity.gasCost = analysis.total_gas_cost_usd;
                existingOpportunity.estimatedProfit = analysis.net_profit_usd;
                existingOpportunity.roi = ((analysis.net_profit_usd / analysis.total_gas_cost_usd) * 100);
                existingOpportunity.netProfit = analysis.net_profit_usd;
                await existingOpportunity.save();
                opportunitiesFound++;
              } else {
                // Mark as expired if no longer profitable.
                existingOpportunity.status = 'expired';
                await existingOpportunity.save();
              }
            } else {
              // Create new opportunity if profitable.
              if (analysis.profitable) {
                await Opportunity.create({
                  tokenId: token._id,
                  chainFrom,
                  chainTo,
                  priceDiff: analysis.spread_usd,
                  gasCost: analysis.total_gas_cost_usd,
                  estimatedProfit: analysis.net_profit_usd,
                  score: 0.7, // Default score, could be enhanced with ML prediction
                  roi: ((analysis.net_profit_usd / analysis.total_gas_cost_usd) * 100),
                  netProfit: analysis.net_profit_usd,
                  status: 'active'
                });
                opportunitiesFound++;
              }
            }

            results.push({
              token: tokenSymbol,
              chainFrom,
              chainTo,
              profitable: analysis.profitable,
              netProfit: analysis.net_profit_usd,
              spread: analysis.spread_usd,
              gasCost: analysis.total_gas_cost_usd
            });
          } catch (error) {
            console.error(`Error analyzing ${tokenSymbol} ${chainFrom} -> ${chainTo}:`, error);
            // Continue with other pairs even if one fails.
            continue;
          }
        }
      }
    }

    res.json({
      success: true,
      message: 'Opportunity scan completed',
      opportunitiesFound,
      tokensAnalyzed: tokensToAnalyze.length,
      chainPairsAnalyzed: results.length,
      results: results.slice(0, 10) // Return first 10 results for preview
    });
  } catch (error: any) {
    res.status(500);
    throw new Error(`Failed to scan opportunities: ${error.message}`);
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
