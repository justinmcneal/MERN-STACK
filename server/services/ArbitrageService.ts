import DataService from './DataService';
import MLService from './MLService';
import Token, { type IToken } from '../models/Token';
import Opportunity, { type IOpportunity } from '../models/Opportunity';
import {
  CHAIN_NATIVE_TOKENS,
  SUPPORTED_TOKENS,
  type SupportedChain,
  type SupportedToken
} from '../config/tokens';

const GAS_UNITS_PER_TRANSFER = 21000;

const dataService = DataService.getInstance();
const mlService = MLService.getInstance();

export type TokenCacheKey = `${SupportedToken}-${SupportedChain}`;

export interface ArbitrageContext {
  tokenCache: Map<TokenCacheKey, IToken>;
  gasPriceMap: Map<SupportedChain, number>;
  nativePriceMap: Map<SupportedChain, number>;
}

export interface ArbitrageEvaluation {
  tokenSymbol: SupportedToken;
  chainFrom: SupportedChain;
  chainTo: SupportedChain;
  priceFrom: number;
  priceTo: number;
  priceDiffUsd: number;
  priceDiffPercent: number;
  gasCostUsd: number;
  netProfitUsd: number;
  roi: number | null;
  score: number;
  profitable: boolean;
}

const createTokenCacheKey = (symbol: SupportedToken, chain: SupportedChain): TokenCacheKey => {
  return `${symbol}-${chain}` as TokenCacheKey;
};

export async function buildArbitrageContext(): Promise<ArbitrageContext> {
  const tokens = await Token.find({ symbol: { $in: [...SUPPORTED_TOKENS] } }).exec();
  const tokenCache = new Map<TokenCacheKey, IToken>();
  tokens.forEach((token) => {
    const symbol = token.symbol as SupportedToken;
    const chain = token.chain as SupportedChain;
    tokenCache.set(createTokenCacheKey(symbol, chain), token);
  });

  const gasPrices = await dataService.fetchAllGasPrices();
  const gasPriceMap = new Map<SupportedChain, number>();
  gasPrices.forEach((entry) => {
    const chain = entry.chain as SupportedChain;
    gasPriceMap.set(chain, Number(entry.gasPrice) || 0);
  });

  const nativePriceMap = new Map<SupportedChain, number>();
  (Object.entries(CHAIN_NATIVE_TOKENS) as Array<[SupportedChain, SupportedToken]>).forEach(([chain, nativeSymbol]) => {
    const key = createTokenCacheKey(nativeSymbol, chain);
    const token = tokenCache.get(key);
    if (token?.currentPrice) {
      nativePriceMap.set(chain, Number(token.currentPrice));
    }
  });

  return {
    tokenCache,
    gasPriceMap,
    nativePriceMap
  };
}

export async function evaluateOpportunity(
  tokenSymbol: SupportedToken,
  chainFrom: SupportedChain,
  chainTo: SupportedChain,
  context: ArbitrageContext,
  options?: { skipScoring?: boolean }
): Promise<ArbitrageEvaluation | null> {
  const symbol = tokenSymbol.toUpperCase() as SupportedToken;

  const fromKey = createTokenCacheKey(symbol, chainFrom);
  const toKey = createTokenCacheKey(symbol, chainTo);
  const fromToken = context.tokenCache.get(fromKey);
  const toToken = context.tokenCache.get(toKey);

  if (!fromToken || !toToken) {
    return null;
  }

  const priceFrom = Number(fromToken.currentPrice);
  const priceTo = Number(toToken.currentPrice);

  if (!Number.isFinite(priceFrom) || !Number.isFinite(priceTo) || priceFrom <= 0 || priceTo <= 0) {
    return null;
  }

  const gasPriceFrom = context.gasPriceMap.get(chainFrom) ?? 0;
  const gasPriceTo = context.gasPriceMap.get(chainTo) ?? 0;
  const nativePriceFrom = context.nativePriceMap.get(chainFrom) ?? 0;
  const nativePriceTo = context.nativePriceMap.get(chainTo) ?? 0;

  if (gasPriceFrom <= 0 || gasPriceTo <= 0 || nativePriceFrom <= 0 || nativePriceTo <= 0) {
    return null;
  }

  const priceDiffUsd = priceTo - priceFrom;
  const priceDiffPercent = priceFrom > 0 ? (priceDiffUsd / priceFrom) * 100 : 0;

  const gasCostFromUsd = dataService.estimateGasCostUsd(chainFrom, gasPriceFrom, nativePriceFrom, GAS_UNITS_PER_TRANSFER);
  const gasCostToUsd = dataService.estimateGasCostUsd(chainTo, gasPriceTo, nativePriceTo, GAS_UNITS_PER_TRANSFER);
  const gasCostUsd = gasCostFromUsd + gasCostToUsd;

  const netProfitUsd = priceDiffUsd - gasCostUsd;
  const profitable = netProfitUsd > 0;
  const roi = gasCostUsd > 0 ? netProfitUsd / gasCostUsd * 100 : null;

  let score = 0;
  if (!options?.skipScoring && profitable) {
    try {
      const prediction = await mlService.getPrediction({
        token: symbol,
        chain: chainFrom,
        price: priceDiffUsd,
        gas: gasCostUsd
      });
      score = Math.max(0, Math.min(1, Number(prediction.score ?? 0)));
    } catch (error) {
      console.warn(`ML scoring failed for ${symbol} ${chainFrom}->${chainTo}:`, (error as Error)?.message || error);
      score = 0;
    }
  }

  return {
    tokenSymbol: symbol,
    chainFrom,
    chainTo,
    priceFrom,
    priceTo,
    priceDiffUsd,
    priceDiffPercent,
    gasCostUsd,
    netProfitUsd,
    roi: Number.isFinite(roi ?? NaN) ? (roi as number) : null,
    score,
    profitable
  };
}

export async function upsertOpportunity(
  evaluation: ArbitrageEvaluation,
  context: ArbitrageContext
): Promise<{ opportunity: IOpportunity | null; isNew: boolean }> {
  const tokenKey = createTokenCacheKey(evaluation.tokenSymbol, evaluation.chainFrom);
  const tokenDoc = context.tokenCache.get(tokenKey);
  if (!tokenDoc) {
    return { opportunity: null, isNew: false };
  }

  const existing = await Opportunity.findOne({
    tokenId: tokenDoc._id,
    chainFrom: evaluation.chainFrom,
    chainTo: evaluation.chainTo,
    status: 'active'
  }).exec();

  if (!evaluation.profitable) {
    if (existing) {
      existing.status = 'expired';
      await existing.save();
    }
    return { opportunity: null, isNew: false };
  }

  const payload = {
    priceDiff: evaluation.priceDiffUsd,
    gasCost: evaluation.gasCostUsd,
    estimatedProfit: evaluation.netProfitUsd,
    netProfit: evaluation.netProfitUsd,
    priceFrom: evaluation.priceFrom,
    priceTo: evaluation.priceTo,
    priceDiffPercent: evaluation.priceDiffPercent,
    score: evaluation.score,
    roi: evaluation.roi,
    timestamp: new Date(),
    status: 'active'
  };

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return { opportunity: existing, isNew: false };
  }

  const created = await Opportunity.create({
    tokenId: tokenDoc._id,
    chainFrom: evaluation.chainFrom,
    chainTo: evaluation.chainTo,
    ...payload
  });

  return { opportunity: created, isNew: true };
}

export async function isOpportunityProfitable(
  opportunity: IOpportunity,
  context?: ArbitrageContext
): Promise<boolean> {
  const workingContext = context ?? await buildArbitrageContext();
  const token = await Token.findById(opportunity.tokenId).exec();
  if (!token) {
    return false;
  }

  const evaluation = await evaluateOpportunity(
    token.symbol as SupportedToken,
    opportunity.chainFrom as SupportedChain,
    opportunity.chainTo as SupportedChain,
    workingContext,
    { skipScoring: true }
  );

  return Boolean(evaluation && evaluation.profitable);
}