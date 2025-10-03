import api from '../api';

export interface TokenPrice {
  id?: string;
  token: string;
  chain: string;
  currentPrice: string;
  change24h?: string;
  changePercent?: string;
  lastUpdated: string;
  volume?: string;
}

export interface PriceFilters {
  tokens?: string[];
  chains?: string[];
  limit?: number;
}

export interface PriceStats {
  totalTracked: number;
  avgPrice: number;
  totalVolume: number;
  topGainer: string;
  topLoser: string;
}

class PricesService {
  /**
   * Fetch current token prices
   */
  async getPrices(filters?: PriceFilters): Promise<TokenPrice[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.tokens) params.append('tokens', filters.tokens.join(','));
      if (filters?.chains) params.append('chains', filters.chains.join(','));
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/tokens/prices?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch prices:', error);
      throw error;
    }
  }

  /**
   * Get price for specific token on specific chain
   */
  async getPrice(token: string, chain: string): Promise<TokenPrice> {
    try {
      const response = await api.get(`/tokens/${token}/chains/${chain}/price`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch price for ${token} on ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalPrices(
    token: string,
    chain: string,
    timeframe: '1h' | '24h' | '7d' | '30d' = '24h'
  ): Promise<Array<{ timestamp: string; price: number; volume: number }>> {
    try {
      const response = await api.get(
        `/tokens/${token}/chains/${chain}/history?timeframe=${timeframe}`
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch historical prices for ${token}:`, error);
      throw error;
    }
  }

  /**
   * Get price statistics
   */
  async getPriceStats(): Promise<PriceStats> {
    try {
      const response = await api.get('/tokens/prices/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch price stats:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time price updates
   */
  subscribeToUpdates(
    tokens: string[],
    callback: (priceUpdate: TokenPrice) => void
  ): () => void {
    // This would integrate with WebSocket service when implemented
    console.log('Price updates subscription requested for:', tokens);
    return () => console.log('Price updates subscription cancelled');
  }
}

export const pricesService = new PricesService();
