import api from '../api';

export interface ArbitrageOpportunity {
  id: string;
  token: string;
  from: string;
  to: string;
  priceDiff: string;
  gasFee: string;
  estProfit: string;
  score: number;
  timestamp?: string;
  status?: 'active' | 'expired' | 'executed';
}

export interface OpportunitiesFilters {
  token?: string;
  minScore?: number;
  minProfit?: number;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface OpportunitiesResponse {
  opportunities: ArbitrageOpportunity[];
  total: number;
  limit: number;
  offset: number;
}

class OpportunitiesService {
  /**
   * Fetch arbitrage opportunities with filters
   */
  async getOpportunities(filters?: OpportunitiesFilters): Promise<OpportunitiesResponse> {
    try {
      const params = new URLSearchParams();
      if (filters?.token) params.append('token', filters.token);
      if (filters?.minScore) params.append('minScore', filters.minScore.toString());
      if (filters?.minProfit) params.append('minProfit', filters.minProfit.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/opportunities?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch opportunities:', error);
      throw error;
    }
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunityById(id: string): Promise<ArbitrageOpportunity> {
    try {
      const response = await api.get(`/opportunities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch opportunity ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get opportunity statistics
   */
  async getOpportunityStats(): Promise<{
    total: number;
    active: number;
    avgScore: number;
    avgProfit: number;
  }> {
    try {
      const response = await api.get('/opportunities/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch opportunity stats:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time opportunity updates
   */
  subscribeToUpdates(callback: (opportunity: ArbitrageOpportunity) => void): () => void {
    // This would integrate with WebSocket service when implemented
    console.log('Opportunity updates subscription requested');
    return () => console.log('Opportunity updates subscription cancelled');
  }
}

export const opportunitiesService = new OpportunitiesService();
