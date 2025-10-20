// services/DataService.ts
import * as axios from 'axios';
import fs from 'fs';
import path from 'path';
import {
  SUPPORTED_TOKENS,
  SUPPORTED_CHAINS,
  COINGECKO_TOKEN_IDS,
  COINGECKO_CHAIN_IDS,
  TOKEN_CONTRACTS,
  getCoinGeckoTokenId,
  type SupportedChain,
  type SupportedToken
} from '../config/tokens';

interface TokenPrice {
  symbol: string;
  price: number;
  timestamp: Date;
  chainPrices: Record<string, number>;
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

interface DexScreenerLiquidity {
  usd?: number;
}

interface DexScreenerPair {
  chainId?: string;
  priceUsd?: string | number;
  liquidity?: number | DexScreenerLiquidity | null;
}

interface DexScreenerTokenResponse {
  schemaVersion?: string;
  pairs?: DexScreenerPair[];
}

export class DataService {
  private static instance: DataService;
  private readonly coinGeckoBaseUrl = 'https://api.coingecko.com/api/v3';
  private readonly dexScreenerBaseUrl = 'https://api.dexscreener.com/latest/dex/tokens';
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

  private ensureCoinGeckoBackoffLoaded(): void {
    if (this.coinGeckoBackoff === null) {
      this.loadBackoffState();
    }
  }

  private isCoinGeckoBackoffActive(): boolean {
    this.ensureCoinGeckoBackoffLoaded();

    if (this.coinGeckoRateLimitUntil && Date.now() < this.coinGeckoRateLimitUntil) {
      const waitSec = Math.ceil((this.coinGeckoRateLimitUntil - Date.now()) / 1000);
      console.warn(`CoinGecko cooldown active for another ${waitSec}s; skipping CoinGecko fetch`);
      return true;
    }

    return false;
  }

  private clearCoinGeckoBackoff(): void {
    this.coinGeckoBackoff = { until: 0, attempts: 0 };
    this.coinGeckoRateLimitUntil = null;
    this.saveBackoffState();
  }

  private processCoinGeckoError(error: any, context: string): void {
    const status = error?.response?.status;
    const message = error instanceof Error ? error.message : String(error);

    if (status === 429) {
      const previous = this.coinGeckoBackoff || { until: 0, attempts: 0 };
      const attempts = Math.min((previous.attempts || 0) + 1, 6);
      const backoffMs = Math.pow(2, attempts) * 60 * 1000;
      const until = Date.now() + backoffMs;
      this.coinGeckoBackoff = { until, attempts };
      this.coinGeckoRateLimitUntil = until;
      this.saveBackoffState();
      console.warn(`CoinGecko rate limit encountered during ${context}; backing off for ${Math.round(backoffMs / 1000)}s until ${new Date(until).toISOString()}`);
    } else {
      console.error(`Error fetching CoinGecko data during ${context}:`, message);
    }
  }

  private async fetchDexScreenerPrice(chain: SupportedChain, address: string): Promise<number | null> {
    const normalizedAddress = address.toLowerCase();

    try {
      const response = await (axios as any).get(
        `${this.dexScreenerBaseUrl}/${normalizedAddress}`,
        { timeout: 10000 }
      );

      const pairs = (response?.data as DexScreenerTokenResponse | undefined)?.pairs;
      if (!Array.isArray(pairs) || pairs.length === 0) {
        return null;
      }

      const matches = pairs.filter((pair) => pair?.chainId?.toLowerCase() === chain.toLowerCase());
      if (matches.length === 0) {
        return null;
      }

      const best = matches
        .map((pair) => {
          const price = typeof pair.priceUsd === 'string' ? Number(pair.priceUsd) : Number((pair as any)?.priceUsd ?? 0);
          const liquidityField = pair.liquidity;
          const liquidityUsd = typeof liquidityField === 'number'
            ? liquidityField
            : Number((liquidityField as DexScreenerLiquidity | undefined)?.usd ?? 0);
          return { price, liquidityUsd };
        })
        .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
        .sort((a, b) => (b.liquidityUsd || 0) - (a.liquidityUsd || 0))[0];

      return best?.price ?? null;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`DexScreener price fetch failed for ${normalizedAddress} on ${chain}: ${message}`);
      return null;
    }
  }

  private async fetchDexScreenerPrices(): Promise<Map<SupportedToken, Record<string, number>>> {
    const priceMap = new Map<SupportedToken, Record<string, number>>();

    for (const token of SUPPORTED_TOKENS as readonly SupportedToken[]) {
      const chainMap = TOKEN_CONTRACTS[token] || {};
      for (const chain of SUPPORTED_CHAINS as readonly SupportedChain[]) {
        const address = chainMap[chain];
        if (!address) continue;

        const price = await this.fetchDexScreenerPrice(chain, address);
        if (price === null) continue;

        if (!priceMap.has(token)) {
          priceMap.set(token, {});
        }
        priceMap.get(token)![chain] = price;
      }
    }

    return priceMap;
  }

  private async fetchCoinGeckoChainTokenPrices(chain: SupportedChain, addresses: string[]): Promise<Record<string, number>> {
    if (addresses.length === 0) {
      return {};
    }

    if (this.isCoinGeckoBackoffActive()) {
      return {};
    }

    const chainId = COINGECKO_CHAIN_IDS[chain];
    if (!chainId) {
      return {};
    }

    try {
      const response = await (axios as any).get(
        `${this.coinGeckoBaseUrl}/simple/token_price/${chainId}`,
        {
          params: {
            contract_addresses: addresses.join(','),
            vs_currencies: 'usd'
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'ArbiTrader-Pro/1.0'
          }
        }
      );

      this.clearCoinGeckoBackoff();

      const result: Record<string, number> = {};
      const data = (response?.data || {}) as Record<string, { usd?: number }>;
      for (const [address, priceInfo] of Object.entries(data)) {
        if (priceInfo?.usd !== undefined) {
          result[address.toLowerCase()] = Number(priceInfo.usd);
        }
      }
      return result;
    } catch (error) {
      this.processCoinGeckoError(error, `token price lookup for ${chain}`);
      return {};
    }
  }

  private async fetchCoinGeckoSimplePrices(symbols: SupportedToken[]): Promise<Record<string, number>> {
    if (symbols.length === 0) {
      return {};
    }

    if (this.isCoinGeckoBackoffActive()) {
      return {};
    }

    const tokenIds = symbols
      .map((symbol) => this.tokenIdMap[symbol])
      .filter((id): id is string => Boolean(id));

    if (tokenIds.length === 0) {
      return {};
    }

    try {
      const response = await axios.get<CoinGeckoResponse>(
        `${this.coinGeckoBaseUrl}/simple/price`,
        {
          params: {
            ids: tokenIds.join(','),
            vs_currencies: 'usd'
          },
          timeout: 10000,
          headers: {
            'User-Agent': 'ArbiTrader-Pro/1.0'
          }
        }
      );

      this.clearCoinGeckoBackoff();

      const result: Record<string, number> = {};
      for (const symbol of symbols) {
        const tokenId = this.tokenIdMap[symbol];
        const price = tokenId ? response.data?.[tokenId]?.usd : undefined;
        if (price !== undefined) {
          result[symbol] = Number(price);
        }
      }

      return result;
    } catch (error) {
      this.processCoinGeckoError(error, 'simple price lookup');
      return {};
    }
  }

  async fetchTokenPrices(): Promise<TokenPrice[]> {
    this.ensureCoinGeckoBackoffLoaded();

    const timestamp = new Date();
    const priceMap = await this.fetchDexScreenerPrices();

    const missingByChain: Record<SupportedChain, Array<{ token: SupportedToken; address: string }>> = {
      ethereum: [],
      polygon: [],
      bsc: []
    };

    for (const token of SUPPORTED_TOKENS as readonly SupportedToken[]) {
      const chainMap = TOKEN_CONTRACTS[token] || {};
      for (const chain of SUPPORTED_CHAINS as readonly SupportedChain[]) {
        const address = chainMap[chain];
        if (!address) continue;

        const chainPrices = priceMap.get(token);
        if (!chainPrices || chainPrices[chain] === undefined) {
          missingByChain[chain].push({ token, address });
        }
      }
    }

    const canQueryCoinGecko = !this.isCoinGeckoBackoffActive();

    if (canQueryCoinGecko) {
      for (const chain of SUPPORTED_CHAINS as readonly SupportedChain[]) {
        const items = missingByChain[chain];
        if (!items || items.length === 0) continue;

        const addresses = Array.from(new Set(items.map((item) => item.address.toLowerCase())));
        const chainPrices = await this.fetchCoinGeckoChainTokenPrices(chain, addresses);

        if (Object.keys(chainPrices).length === 0) continue;

        for (const item of items) {
          const price = chainPrices[item.address.toLowerCase()];
          if (price === undefined) continue;
          if (!priceMap.has(item.token)) {
            priceMap.set(item.token, {});
          }
          priceMap.get(item.token)![chain] = price;
        }
      }
    }

    const tokensMissingGlobal: SupportedToken[] = [];
    for (const token of SUPPORTED_TOKENS as readonly SupportedToken[]) {
      const chainPrices = priceMap.get(token);
      if (!chainPrices || Object.keys(chainPrices).length === 0) {
        tokensMissingGlobal.push(token);
      }
    }

    if (tokensMissingGlobal.length > 0 && canQueryCoinGecko) {
      const fallbackPrices = await this.fetchCoinGeckoSimplePrices(tokensMissingGlobal);

      for (const token of tokensMissingGlobal) {
        const fallbackPrice = fallbackPrices[token];
        if (fallbackPrice === undefined) continue;

        const chainMap = TOKEN_CONTRACTS[token] || {};
        if (!priceMap.has(token)) {
          priceMap.set(token, {});
        }
        for (const chain of SUPPORTED_CHAINS as readonly SupportedChain[]) {
          if (!chainMap[chain]) continue;
          priceMap.get(token)![chain] = fallbackPrice;
        }
      }
    }

    return (SUPPORTED_TOKENS as readonly SupportedToken[]).map((token) => {
      const chainPrices = priceMap.get(token) || {};
      const primaryPrice = chainPrices['ethereum'] ?? Object.values(chainPrices)[0] ?? 0;

      return {
        symbol: token,
        price: primaryPrice,
        timestamp,
        chainPrices
      };
    });
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
