import { DataService } from './DataService';
import { MLService } from './MLService';
import Token, { IToken } from '../models/Token';
import Opportunity, { IOpportunity } from '../models/Opportunity';
import logger from '../utils/logger';
import {
  CHAIN_NATIVE_TOKENS,
  SUPPORTED_TOKENS,
  type SupportedChain,
  type SupportedToken
} from '../config/tokens';

const DEFAULT_TRADE_SIZE_USD = 1000;

const OUTBOUND_GAS_UNITS: Record<SupportedChain, number> = {
  ethereum: 450000,
  polygon: 320000,
  bsc: 360000
};

const INBOUND_GAS_UNITS: Record<SupportedChain, number> = {
  ethereum: 220000,
  polygon: 160000,
  bsc: 200000
};

const dataService = DataService.getInstance();
const mlService = MLService.getInstance();

export type TokenCacheKey = `${SupportedToken}-${SupportedChain}`;

export interface ArbitrageContext {
  tokenCache: Map<TokenCacheKey, IToken>;
  gasPriceMap: Map<SupportedChain, number>;
  nativePriceMap: Map<SupportedChain, number>;
}

const SEVERE_ANOMALIES = new Set<string>([
  'spread-outlier',
  'gas-vs-profit-outlier',
  'from-dex-cex-divergence',
  'to-dex-cex-divergence'
]);

export interface OpportunityDiagnostics {
  priceDiffPercent: number;
  grossProfitUsd: number;
  gasCostUsd: number;
  chainFromPrice: number;
  chainToPrice: number;
  chainFromDexPrice?: number | null;
  chainToDexPrice?: number | null;
}

export interface ArbitrageEvaluation {
  tokenSymbol: SupportedToken;
  chainFrom: SupportedChain;
  chainTo: SupportedChain;
  priceFrom: number;
  priceTo: number;
  priceDiffPerTokenUsd: number;
  priceDiffUsd: number;
  priceDiffPercent: number;
  gasCostUsd: number;
  gasCostBreakdown: {
    outboundUsd: number;
    inboundUsd: number;
  };
  grossProfitUsd: number;
  netProfitUsd: number;
  roi: number | null;
  score: number;
  profitable: boolean;
  tradeUsdAmount: number;
  tradeTokenAmount: number;
  anomalyFlags: string[];
  diagnostics: OpportunityDiagnostics | null;
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
  options?: { skipScoring?: boolean; tradeAmountUsd?: number }
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

  const priceDiffPerTokenUsd = priceTo - priceFrom;
  const priceDiffPercent = priceFrom > 0 ? (priceDiffPerTokenUsd / priceFrom) * 100 : 0;

  const tradeUsdAmount = options?.tradeAmountUsd ?? DEFAULT_TRADE_SIZE_USD;
  if (tradeUsdAmount <= 0) {
    return null;
  }

  const tradeTokenAmount = tradeUsdAmount / priceFrom;
  if (!Number.isFinite(tradeTokenAmount) || tradeTokenAmount <= 0) {
    return null;
  }

  const outboundGasUnits = OUTBOUND_GAS_UNITS[chainFrom] ?? 300000;
  const inboundGasUnits = INBOUND_GAS_UNITS[chainTo] ?? 200000;

  const gasCostFromUsd = dataService.estimateGasCostUsd(chainFrom, gasPriceFrom, nativePriceFrom, outboundGasUnits);
  const gasCostToUsd = dataService.estimateGasCostUsd(chainTo, gasPriceTo, nativePriceTo, inboundGasUnits);
  const gasCostUsd = gasCostFromUsd + gasCostToUsd;

  const grossProfitUsd = priceDiffPerTokenUsd * tradeTokenAmount;
  const netProfitUsd = grossProfitUsd - gasCostUsd;
  const profitable = netProfitUsd > 0;
  const roi = tradeUsdAmount > 0 ? (netProfitUsd / tradeUsdAmount) * 100 : null;

  const anomalyFlags: string[] = [];
  const chainFromDexPrice = Number.isFinite(Number(fromToken.dexPrice)) ? Number(fromToken.dexPrice) : null;
  const chainToDexPrice = Number.isFinite(Number(toToken.dexPrice)) ? Number(toToken.dexPrice) : null;

  if (Math.abs(priceDiffPercent) > 5000) {
    anomalyFlags.push('spread-outlier');
  }

  if (chainFromDexPrice !== null && priceFrom > 0) {
    const divergence = Math.abs(chainFromDexPrice - priceFrom) / priceFrom;
    if (divergence > 1.5) {
      anomalyFlags.push('from-dex-cex-divergence');
    }
  }

  if (chainToDexPrice !== null && priceTo > 0) {
    const divergence = Math.abs(chainToDexPrice - priceTo) / priceTo;
    if (divergence > 1.5) {
      anomalyFlags.push('to-dex-cex-divergence');
    }
  }

  if (grossProfitUsd > 0 && gasCostUsd >= 0 && gasCostUsd < grossProfitUsd * 0.0001) {
    anomalyFlags.push('gas-vs-profit-outlier');
  }

  const diagnostics: OpportunityDiagnostics = {
    priceDiffPercent,
    grossProfitUsd,
    gasCostUsd,
    chainFromPrice: priceFrom,
    chainToPrice: priceTo,
    chainFromDexPrice,
    chainToDexPrice
  };

  if (anomalyFlags.length > 0) {
    logger.warn(`Anomaly detected for ${symbol} ${chainFrom}->${chainTo}: ${anomalyFlags.join(', ')}`);
  }

  if (anomalyFlags.some((flag) => SEVERE_ANOMALIES.has(flag))) {
    return null;
  }

  let score = 0;
  if (!options?.skipScoring && profitable) {
    try {
      const prediction = await mlService.getPrediction({
        token: symbol,
        chain: chainFrom,
        price: grossProfitUsd,
        gas: gasCostUsd,
        grossProfit: grossProfitUsd,
        netProfit: netProfitUsd,
        roi: roi ?? 0,
        tradeVolume: tradeUsdAmount,
        priceDiffPercent,
        pricePerToken: priceDiffPerTokenUsd
      });
      score = Math.max(0, Math.min(1, Number(prediction.score ?? 0)));
    } catch (error) {
      logger.warn(`ML scoring failed for ${symbol} ${chainFrom}->${chainTo}`);
      score = 0;
    }
  }

  return {
    tokenSymbol: symbol,
    chainFrom,
    chainTo,
    priceFrom,
    priceTo,
    priceDiffPerTokenUsd,
    priceDiffUsd: priceDiffPerTokenUsd * tradeTokenAmount,
    priceDiffPercent,
    gasCostUsd,
    gasCostBreakdown: {
      outboundUsd: gasCostFromUsd,
      inboundUsd: gasCostToUsd
    },
    grossProfitUsd,
    netProfitUsd,
    roi: Number.isFinite(roi ?? NaN) ? (roi as number) : null,
    score,
    profitable,
    tradeUsdAmount,
    tradeTokenAmount,
    anomalyFlags,
    diagnostics
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
    priceDiffPercent: evaluation.priceDiffPercent,
    priceDiffPerToken: evaluation.priceDiffPerTokenUsd,
    gasCost: evaluation.gasCostUsd,
    estimatedProfit: evaluation.grossProfitUsd,
    netProfit: evaluation.netProfitUsd,
    priceFrom: evaluation.priceFrom,
    priceTo: evaluation.priceTo,
    score: evaluation.score,
    roi: evaluation.roi,
    timestamp: new Date(),
    status: 'active',
    volume: evaluation.tradeUsdAmount,
    anomalyFlags: evaluation.anomalyFlags,
    diagnostics: evaluation.diagnostics
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
    {
      skipScoring: true,
      tradeAmountUsd: typeof opportunity.volume === 'number' && opportunity.volume > 0
        ? opportunity.volume
        : undefined
    }
  );

  return Boolean(evaluation && evaluation.profitable);
}