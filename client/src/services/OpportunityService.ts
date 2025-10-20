import { apiClient } from './api';

export interface OpportunityDto {
  id: string;
  tokenSymbol: string;
  tokenName?: string;
  chainFrom: string;
  chainTo: string;
  priceDiffUsd: number;
  priceDiffPercent?: number;
  gasCostUsd: number;
  netProfitUsd: number;
  estimatedProfitUsd: number;
  score: number;
  roi?: number | null;
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
    priceDiffPercent?: number;
    gasCost: number;
    estimatedProfit: number;
    score: number;
    roi?: number;
    netProfit?: number;
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
        priceDiffPercent,
        gasCostUsd: item.gasCost,
        netProfitUsd,
        estimatedProfitUsd: item.estimatedProfit,
        score: item.score,
        roi: item.roi ?? null,
        updatedAt: item.updatedAt
      } satisfies OpportunityDto;
    });
  }
};

export default OpportunityService;
