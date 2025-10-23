import { apiClient } from './api';

export interface OpportunityDto {
  id: string;
  tokenSymbol: string;
  tokenName?: string;
  chainFrom: string;
  chainTo: string;
  priceDiffUsd: number;
  priceDiffPerTokenUsd?: number;
  priceDiffPercent?: number;
  gasCostUsd: number;
  netProfitUsd: number;
  grossProfitUsd: number;
  score: number;
  roi?: number | null;
  tradeVolumeUsd?: number;
  tradeTokenAmount?: number;
  priceFrom?: number;
  priceTo?: number;
  updatedAt?: string;
}

export interface OpportunityQuery {
  status?: string;
  chainFrom?: string;
  chainTo?: string;
  minProfit?: number;
  minScore?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface OpportunityApiResponse {
  success: boolean;
  count: number;
  total: number;
  data: Array<{
    _id: string;
    chainFrom: string;
    chainTo: string;
    priceDiff: number;
    priceDiffPerToken?: number;
    priceDiffPercent?: number;
    gasCost: number;
    estimatedProfit: number;
    score: number;
    roi?: number;
    netProfit?: number;
    volume?: number;
    priceFrom?: number;
    priceTo?: number;
    updatedAt?: string;
    tokenId?: {
      _id: string;
      symbol?: string;
      name?: string;
      chain?: string;
      currentPrice?: number;
    } | null;
  }>;
}

const OpportunityService = {
  async listOpportunities(query?: OpportunityQuery): Promise<OpportunityDto[]> {
    const response = await apiClient.get<OpportunityApiResponse>('/opportunities', {
      params: {
        status: 'active',
        sortBy: 'score',
        sortOrder: 'desc',
        limit: 25,
        ...query
      }
    });

    const items = response.data?.data ?? [];

    return items.map((item) => {
      const tokenSymbol = item.tokenId?.symbol;
      const tokenName = item.tokenId?.name;
      const priceDiffPercent = item.priceDiffPercent ?? undefined;
      const netProfitUsd = typeof item.netProfit === 'number'
        ? item.netProfit
        : item.estimatedProfit - item.gasCost;

      return {
        id: item._id,
        tokenSymbol: tokenSymbol ?? 'UNKNOWN',
        tokenName: tokenName ?? undefined,
        chainFrom: item.chainFrom,
        chainTo: item.chainTo,
        priceDiffUsd: item.priceDiff,
        priceDiffPerTokenUsd: item.priceDiffPerToken,
        priceDiffPercent,
        gasCostUsd: item.gasCost,
        netProfitUsd,
        grossProfitUsd: item.priceDiff ?? item.estimatedProfit,
        score: item.score,
        roi: item.roi ?? null,
        tradeVolumeUsd: item.volume ?? undefined,
        tradeTokenAmount: item.volume && item.priceFrom
          ? Number.isFinite(item.volume / item.priceFrom)
            ? item.volume / item.priceFrom
            : undefined
          : undefined,
        priceFrom: item.priceFrom,
        priceTo: item.priceTo,
        updatedAt: item.updatedAt
      } satisfies OpportunityDto;
    });
  },

  async triggerScan(forceRefresh: boolean = true): Promise<void> {
    await apiClient.post('/opportunities/scan', { forceRefresh });
  }
};

export default OpportunityService;
