// services/DataService.ts
import * as axios from 'axios';
import { 
  SUPPORTED_TOKENS, 
  SUPPORTED_CHAINS, 
  COINGECKO_TOKEN_IDS,
  getCoinGeckoTokenId 
} from '../config/tokens';

interface TokenPrice {
  symbol: string;
  price: number;
  timestamp: Date;
}

interface GasPrice {
  chain: string;
  gasPrice: number; // in gwei
  timestamp: Date;
}

interface CoinGeckoResponse {
  [tokenId: string]: {
    usd: number;
  };
}

interface PolygonGasResponse {
  standard: {
    maxFee: number;
  };
}

interface BSCGasResponse {
  standard: number;
}

interface BlocknativeResponse {
  blockPrices: Array<{
    estimatedPrices: Array<{
      confidence: number;
      maxFeePerGas: number;
    }>;
  }>;
}

export class DataService {
  private static instance: DataService;
  private readonly coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  private readonly polygonGasUrl = 'https://gasstation.polygon.technology/v2';
  private readonly bscGasUrl = 'https://bscgas.info/gas';
  private readonly blocknativeUrl = 'https://api.blocknative.com/gasprices/blockprices';

  private readonly tokenIdMap = COINGECKO_TOKEN_IDS;

  private constructor() {}

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  async fetchTokenPrices(): Promise<TokenPrice[]> {
    const tokenIds = Object.values(this.tokenIdMap).join(',');
    
    try {
      const response = await axios.get<CoinGeckoResponse>(
        `${this.coinGeckoBaseUrl}/simple/price`,
        {
          params: {
            ids: tokenIds,
            vs_currencies: 'usd'
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'ArbiTrader-Pro/1.0'
          }
        }
      );

      const prices: TokenPrice[] = [];
      const timestamp = new Date();

      Object.entries(this.tokenIdMap).forEach(([symbol, tokenId]) => {
        if (response.data[tokenId]?.usd) {
          prices.push({
            symbol,
            price: response.data[tokenId].usd,
            timestamp
          });
        }
      });

      return prices;
    } catch (error: any) {
      console.error('Error fetching token prices:', error);
      
      // Handle rate limiting - wait and retry once
      if (error.response?.status === 429) {
        console.warn('⚠️  CoinGecko rate limit hit, waiting 60 seconds before retry');
        await new Promise(resolve => setTimeout(resolve, 60000)); 
        console.log('🔄 Retrying CoinGecko API call...');
        return this.fetchTokenPrices(); 
      }
      
      throw new Error('Failed to fetch token prices from CoinGecko');
    }
  }

  async fetchEthereumGasPrice(): Promise<GasPrice> {
    try {
      const headers: { [key: string]: string } = {};
      const apiKey = process.env.BLOCKNATIVE_API_KEY;
      if (apiKey) {
        headers['Authorization'] = apiKey;
      }

      const response = await axios.get<BlocknativeResponse>(
        `${this.blocknativeUrl}?chainid=1`,
        { headers, timeout: 10000 }
      );

      const prices = response.data.blockPrices?.[0]?.estimatedPrices;
      if (!prices || prices.length === 0) {
        throw new Error('No gas prices found in Blocknative response');
      }

      // Find price with 70% confidence, fallback to first
      let gasPrice = prices[0].maxFeePerGas;
      const confidentPrice = prices.find(p => p.confidence === 70);
      if (confidentPrice) {
        gasPrice = confidentPrice.maxFeePerGas;
      }

      return {
        chain: 'ethereum',
        gasPrice,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching Ethereum gas price:', error);
      throw new Error('Failed to fetch Ethereum gas price');
    }
  }

  async fetchPolygonGasPrice(): Promise<GasPrice> {
    try {
      const response = await axios.get<PolygonGasResponse>(
        this.polygonGasUrl,
        { timeout: 10000 }
      );

      return {
        chain: 'polygon',
        gasPrice: response.data.standard.maxFee,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching Polygon gas price:', error);
      throw new Error('Failed to fetch Polygon gas price');
    }
  }

  async fetchBSCGasPrice(): Promise<GasPrice> {
    try {
      const response = await axios.get<BSCGasResponse>(
        this.bscGasUrl,
        { timeout: 10000 }
      );

      return {
        chain: 'bsc',
        gasPrice: response.data.standard,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching BSC gas price:', error);
      throw new Error('Failed to fetch BSC gas price');
    }
  }

  async fetchAllGasPrices(): Promise<GasPrice[]> {
    try {
      const [ethereum, polygon, bsc] = await Promise.all([
        this.fetchEthereumGasPrice(),
        this.fetchPolygonGasPrice(),
        this.fetchBSCGasPrice()
      ]);

      return [ethereum, polygon, bsc];
    } catch (error) {
      console.error('Error fetching gas prices:', error);
      throw new Error('Failed to fetch gas prices');
    }
  }

  getTokenId(symbol: string): string | null {
    return getCoinGeckoTokenId(symbol);
  }

  getSupportedTokens(): string[] {
    return [...SUPPORTED_TOKENS];
  }

  getSupportedChains(): string[] {
    return [...SUPPORTED_CHAINS];
  }
}

export default DataService;
