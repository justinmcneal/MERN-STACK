// services/DataService.ts
import * as axios from 'axios';
import fs from 'fs';
import path from 'path';
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
  // In-memory cooldown timestamp for CoinGecko rate limit (ms since epoch)
  private coinGeckoRateLimitUntil: number | null = null;
  // Backoff state persisted to disk so it survives restarts
  private readonly cacheDir = path.resolve(__dirname, '..', '.cache');
  private readonly coinGeckoBackoffFile = path.join(this.cacheDir, 'coingecko_backoff.json');
  private coinGeckoBackoff: { until: number; attempts: number } | null = null;
  // CryptoCompare API (fallback) - requires API key for higher rate limits
  private readonly cryptoCompareUrl = 'https://min-api.cryptocompare.com/data/pricemulti';
  // Etherscan API fallback for gas (requires ETHERSCAN_API_KEY)
  private readonly etherscanGasUrl = 'https://api.etherscan.io/api';

  private constructor() {}

  // Simple file-based cache for historical series
  private getHistoryCachePath(symbol: string, chain: string, timeframe: string) {
    this.ensureCacheDir();
    const safeSymbol = symbol.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeChain = chain.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeTf = timeframe.replace(/[^a-z0-9]/gi, '_');
    return path.join(this.cacheDir, `history_${safeSymbol}_${safeChain}_${safeTf}.json`);
  }

  // timeframe: '24h' | '7d' | '30d' | '90d' etc. We'll map to CoinGecko 'days' param
  private timeframeToDays(tf: string) {
    if (tf === '24h') return '1';
    if (tf === '7d') return '7';
    if (tf === '30d') return '30';
    if (tf === '90d') return '90';
    // default to 7 days
    return '7';
  }

  // TTL for history cache in milliseconds
  private readonly historyCacheTtl = 10 * 60 * 1000; // 10 minutes

  /**
   * Fetch historical price series for a token from CoinGecko and cache it.
   * Returns array of [timestamp(ms), price]
   */
  async fetchTokenHistory(symbol: string, chain: string, timeframe = '7d') : Promise<Array<[number, number]>> {
    // Resolve CoinGecko token id
    const tokenId = this.getTokenId(symbol);
    if (!tokenId) {
      console.warn(`No CoinGecko token id mapping for symbol ${symbol}; returning empty history`);
      return [];
    }

    const cachePath = this.getHistoryCachePath(symbol, chain, timeframe);
    try {
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed._meta && parsed._meta.fetchedAt && (Date.now() - parsed._meta.fetchedAt) < this.historyCacheTtl) {
          return parsed.data as Array<[number, number]>;
        }
      }
    } catch (err) {
      console.warn('Failed to read history cache:', err);
    }

    // Query CoinGecko market_chart endpoint
    const days = this.timeframeToDays(timeframe);
    try {
      const resp = await (axios as any).get(`${this.coinGeckoBaseUrl}/coins/${encodeURIComponent(tokenId)}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days,
          interval: 'hourly'
        },
        timeout: 15000
      });

      // CoinGecko returns { prices: [[ts, price], ...], market_caps: [...], total_volumes: [...] }
      const prices: Array<[number, number]> = resp.data?.prices || [];

      // Persist cache file with metadata
      try {
        const out = { _meta: { fetchedAt: Date.now(), tokenId, symbol, chain, timeframe }, data: prices };
        fs.writeFileSync(cachePath, JSON.stringify(out));
      } catch (writeErr) {
        console.warn('Failed to write history cache:', writeErr);
      }

      return prices;
    } catch (err: any) {
      console.error('Error fetching token history from CoinGecko:', err?.message || err);
      // As a fallback, if we have a cache file (stale allowed), return it
      try {
        if (fs.existsSync(cachePath)) {
          const raw = fs.readFileSync(cachePath, 'utf8');
          const parsed = JSON.parse(raw);
          if (parsed && parsed.data) {
            return parsed.data as Array<[number, number]>;
          }
        }
      } catch (cacheErr) {
        console.warn('Failed to read fallback history cache:', cacheErr);
      }

      // No cache available — return empty array so callers can fallback gracefully
      return [];
    }
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private ensureCacheDir() {
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (err) {
      console.warn('Failed to ensure cache dir:', err);
    }
  }

  private loadBackoffState() {
    try {
      this.ensureCacheDir();
      if (fs.existsSync(this.coinGeckoBackoffFile)) {
        const raw = fs.readFileSync(this.coinGeckoBackoffFile, 'utf8');
        this.coinGeckoBackoff = JSON.parse(raw);
        this.coinGeckoRateLimitUntil = this.coinGeckoBackoff?.until ?? null;
      }
    } catch (err) {
      console.warn('Failed to load CoinGecko backoff state:', err);
    }
  }

  private saveBackoffState() {
    try {
      this.ensureCacheDir();
      fs.writeFileSync(this.coinGeckoBackoffFile, JSON.stringify(this.coinGeckoBackoff || {}));
    } catch (err) {
      console.warn('Failed to save CoinGecko backoff state:', err);
    }
  }

  async fetchTokenPrices(): Promise<TokenPrice[]> {
    // Try to load persisted backoff state once per process lifetime
    if (this.coinGeckoBackoff === null) {
      this.loadBackoffState();
    }
    // If we recently detected a CoinGecko rate limit, and the cooldown hasn't expired,
    // avoid making another request to prevent blocking callers for a long period.
    const now = Date.now();
    if (this.coinGeckoRateLimitUntil && now < this.coinGeckoRateLimitUntil) {
      const waitSec = Math.ceil((this.coinGeckoRateLimitUntil - now) / 1000);
      console.warn(`CoinGecko is in cooldown for another ${waitSec}s; skipping fetch`);
      // Return empty list to let callers decide how to handle lack of prices.
      return [];
    }

  // Build token ID list only for configured tokens (avoid unknown tokens)
    const tokenIds = Object.values(this.tokenIdMap).filter(Boolean).join(',');

    const start = Date.now();
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

      const elapsedMs = Date.now() - start;
      console.info(`CoinGecko price fetch completed in ${elapsedMs}ms for ${tokenIds}`);

      const prices: TokenPrice[] = [];
      const timestamp = new Date();

      Object.entries(this.tokenIdMap).forEach(([symbol, tokenId]) => {
        if (!tokenId) return;
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
      const elapsedMs = Date.now() - start;
      console.error(`Error fetching token prices from CoinGecko (${elapsedMs}ms):`, error?.message || error);
      // Handle rate limiting - apply exponential backoff and persist state
      if (error.response?.status === 429) {
        const prev = this.coinGeckoBackoff || { until: 0, attempts: 0 };
        const attempts = Math.min(prev.attempts + 1, 6); // cap attempts
        const backoffMs = Math.pow(2, attempts) * 60 * 1000; // exponential minutes (2^n * 1min)
        const until = Date.now() + backoffMs;
        this.coinGeckoBackoff = { until, attempts };
        this.coinGeckoRateLimitUntil = until;
        this.saveBackoffState();
        console.warn(`CoinGecko rate limit hit; entering backoff for ${Math.round(backoffMs/1000)}s until ${new Date(until).toISOString()}`);
        return [];
      }

      // Non-rate-limit failures: try CryptoCompare as a fallback
      try {
        console.info('Attempting fallback to CryptoCompare for prices');
        const symbols = Object.keys(this.tokenIdMap).join(',');
        const ccApiKey = process.env.CRYPTOCOMPARE_API_KEY;
        const resp = await axios.get(`${this.cryptoCompareUrl}`, {
          params: {
            fsyms: symbols,
            tsyms: 'USD',
            api_key: ccApiKey
          },
          timeout: 8000
        });

        const timestamp = new Date();
        const prices: TokenPrice[] = [];
        Object.keys(this.tokenIdMap).forEach(symbol => {
          const data = (resp.data as any)[symbol];
          if (data && data.USD) {
            prices.push({ symbol, price: data.USD, timestamp });
          }
        });

        if (prices.length > 0) {
          console.info(`CryptoCompare fallback returned ${prices.length} prices`);
          return prices;
        }
      } catch (ccErr) {
        console.warn('CryptoCompare fallback failed:', (ccErr as any).message || ccErr);
      }

      throw new Error('Failed to fetch token prices from CoinGecko and fallbacks');
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
      console.error('Error fetching Ethereum gas price from Blocknative:', error);
      // Fallback to Etherscan gas oracle if API key provided or unauthenticated
      try {
        const etherscanKey = process.env.ETHERSCAN_API_KEY;
        const params: any = { module: 'gastracker', action: 'gasoracle' };
        if (etherscanKey) params.apikey = etherscanKey;
        const resp = await (axios as any).get(this.etherscanGasUrl, { params, timeout: 8000 });
        const result = resp.data?.result;
        const safeGas = Number(result?.SafeGasPrice || result?.ProposeGasPrice || result?.FastGasPrice) || 0;
        if (safeGas === 0) throw new Error('Etherscan returned no gas price');

        return {
          chain: 'ethereum',
          gasPrice: safeGas,
          timestamp: new Date()
        };
      } catch (esErr) {
        console.error('Etherscan fallback failed:', esErr);
        throw new Error('Failed to fetch Ethereum gas price');
      }
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
