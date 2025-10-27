import axios from 'axios';
import logger from '../utils/logger';

interface MLPredictionRequest {
  token: string;
  chain: string;
  price: number;
  gas: number;
  grossProfit?: number;
  netProfit?: number;
  roi?: number | null;
  tradeVolume?: number;
  pricePerToken?: number;
  priceDiffPercent?: number;
}

interface MLPredictionResponse {
  profitable: boolean;
  roi: number;
  score: number;
}

interface ArbitrageRequest {
  token: string;
  chain_a: string;
  chain_b: string;
}

interface ArbitrageResponse {
  token: string;
  chain_a: string;
  chain_b: string;
  price_a: number;
  price_b: number;
  gas_a_gwei: number;
  gas_b_gwei: number;
  cost_a_usd: number;
  cost_b_usd: number;
  total_gas_cost_usd: number;
  spread_usd: number;
  net_profit_usd: number;
  profitable: boolean;
}

export class MLService {
  private static instance: MLService;
  private readonly mlServiceUrl: string;

  private constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL!;
  }

  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  async getPrediction(request: MLPredictionRequest): Promise<MLPredictionResponse> {
    try {
      const response = await axios.post<MLPredictionResponse>(
        `${this.mlServiceUrl}/predict`,
        request,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get ML prediction');
      throw new Error('Failed to get ML prediction');
    }
  }

  async getArbitrageOpportunity(request: ArbitrageRequest): Promise<ArbitrageResponse> {
    try {
      const response = await axios.post<ArbitrageResponse>(
        `${this.mlServiceUrl}/arbitrage_opportunity`,
        request,
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Failed to get arbitrage opportunity');
      throw new Error('Failed to get arbitrage opportunity analysis');
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      await axios.get(`${this.mlServiceUrl}/health`, { timeout: 5000 });
      return true;
    } catch (error) {
      logger.error('ML service health check failed');
      return false;
    }
  }

  async getStatus(): Promise<{ healthy: boolean; url: string }> {
    const healthy = await this.isHealthy();
    return {
      healthy,
      url: this.mlServiceUrl
    };
  }
}

export default MLService;
