import axios from 'axios';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import {
  SUPPORTED_TOKENS,
  SUPPORTED_CHAINS,
  TOKEN_CONTRACTS,
  type SupportedChain,
  type SupportedToken
} from '../config/tokens';

const MIN_LIQUIDITY_USD = 1000;
const STABLE_TOKENS = new Set<SupportedToken>();
const STABLE_PRICE_MIN = 0.8;
const STABLE_PRICE_MAX = 1.2;

interface TokenPrice {
  symbol: string;
  price: number;
  timestamp: Date;
  chainPrices: Record<string, number>;
}

interface GasPrice {
  chain: string;
  gasPrice: number;
  timestamp: Date;
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

interface DexPrice {
  symbol: string;
  chain: string;
  price: number;
  timestamp: Date;
  dexName?: string;
  liquidity?: number;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  priceUsd: string;
  liquidity?: {
    usd: number;
  };
  baseToken: {
    address: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    symbol: string;
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
}

export class DataService {
  private static instance: DataService;
  private readonly dexScreenerBaseUrl = 'https://api.dexscreener.com/latest/dex';
  private readonly polygonGasUrl = 'https://gasstation.polygon.technology/v2';
  private readonly bscGasUrl = 'https://bscgas.info/gas';
  private readonly blocknativeUrl = 'https://api.blocknative.com/gasprices/blockprices';
  private readonly cacheDir = path.resolve(__dirname, '..', '.cache');
  private readonly etherscanGasUrl = 'https://api.etherscan.io/api';

  private constructor() {}

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
      logger.warn('Failed to ensure cache dir');
    }
  }

  private async fetchDexScreenerPrice(
    chain: SupportedChain,
    address: string,
    token?: SupportedToken
  ): Promise<number | null> {
    const normalizedAddress = address.toLowerCase();

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const response = await (axios as any).get(
        `${this.dexScreenerBaseUrl}/tokens/${normalizedAddress}`,
        { 
          timeout: 10000,
          headers: {
            'User-Agent': 'ArbiTrader-Pro/1.0'
          }
        }
      );

      const pairs = (response?.data as DexScreenerResponse | undefined)?.pairs;
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
          const liquidityUsd = liquidityField?.usd ?? 0;
          return { price, liquidityUsd };
        })
        .filter((entry) => Number.isFinite(entry.price) && entry.price > 0)
        .sort((a, b) => (b.liquidityUsd || 0) - (a.liquidityUsd || 0))[0];

      if (!best) {
        return null;
      }

      if (!Number.isFinite(best.liquidityUsd) || (best.liquidityUsd ?? 0) < MIN_LIQUIDITY_USD) {
        logger.warn(`DexScreener skipping ${normalizedAddress} on ${chain}: liquidity below ${MIN_LIQUIDITY_USD}`);
        return null;
      }

      if (token && STABLE_TOKENS.has(token)) {
        if (best.price < STABLE_PRICE_MIN || best.price > STABLE_PRICE_MAX) {
          logger.warn(`DexScreener stablecoin price out of range for ${token} on ${chain}: ${best.price}`);
          return null;
        }
      }

      return best?.price ?? null;
    } catch (error: any) {
      if (error.response?.status === 429) {
        logger.warn(`DexScreener rate limit hit for ${normalizedAddress}, waiting 1s`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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

        const price = await this.fetchDexScreenerPrice(chain, address, token);
        if (price === null) continue;

        if (!priceMap.has(token)) {
          priceMap.set(token, {});
        }
        priceMap.get(token)![chain] = price;
      }
    }

    return priceMap;
  }

  estimateGasCostUsd(chain: SupportedChain, gasPriceGwei: number, nativeTokenPriceUsd: number, gasUnits = 21000): number {
    if (gasPriceGwei <= 0 || nativeTokenPriceUsd <= 0 || gasUnits <= 0) {
      return 0;
    }

    const gasPriceInNative = gasPriceGwei * 1e-9;
    return gasPriceInNative * gasUnits * nativeTokenPriceUsd;
  }

  async fetchTokenPrices(): Promise<TokenPrice[]> {
    logger.info('Fetching token prices from DexScreener');
    
    const timestamp = new Date();
    const priceMap = await this.fetchDexScreenerPrices();

    const tokensWithPrices = Array.from(priceMap.keys()).length;
    logger.success(`Retrieved prices for ${tokensWithPrices} tokens from DexScreener`);

    const results: TokenPrice[] = [];

    for (const token of SUPPORTED_TOKENS as readonly SupportedToken[]) {
      const rawChainPrices = priceMap.get(token) || {};
      const sanitizedEntries = Object.entries(rawChainPrices)
        .filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && value > 0)
        .map(([chain, value]) => [chain, Number(value)] as const);

      if (sanitizedEntries.length === 0) {
        logger.warn(`Skipping ${token}: no live price data`);
        continue;
      }

      const prices = sanitizedEntries.map(([, price]) => price).sort((a, b) => a - b);
      const median = prices.length % 2 === 1
        ? prices[(prices.length - 1) / 2]
        : (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2;

      const filteredEntries = sanitizedEntries.filter(([chain, price]) => {
        if (median > 0) {
          const ratio = price / median;
          if (ratio > 20 || ratio < 0.05) {
            logger.warn(`Dropping ${token} price on ${chain}: ${price} diverges from median ${median}`);
            return false;
          }
        }

        if (STABLE_TOKENS.has(token)) {
          if (price < STABLE_PRICE_MIN || price > STABLE_PRICE_MAX) {
            logger.warn(`Dropping stablecoin quote for ${token} on ${chain}: ${price}`);
            return false;
          }
        }

        return true;
      });

      if (filteredEntries.length === 0) {
        logger.warn(`All quotes discarded for ${token} after sanity checks`);
        continue;
      }

  const referenceEntries = filteredEntries;
  const preferred = referenceEntries.find(([chain]) => chain === 'ethereum') ?? referenceEntries[0];
  const [_, primaryPrice] = preferred;

      results.push({
        symbol: token,
        price: primaryPrice,
        timestamp,
        chainPrices: Object.fromEntries(filteredEntries)
      });
    }

    return results;
  }

  async fetchDexPrices(): Promise<DexPrice[]> {
    const chainIdMap: Record<string, string> = {
      ethereum: 'ethereum',
      polygon: 'polygon',
      bsc: 'bsc'
    };

    const dexPrices: DexPrice[] = [];
    const timestamp = new Date();

    const { TOKEN_CONTRACTS } = await import('../config/tokens');

    for (const chain of SUPPORTED_CHAINS) {
      const chainId = chainIdMap[chain];
      if (!chainId) {
        logger.warn(`No DexScreener chainId mapping for ${chain}`);
        continue;
      }

      for (const symbol of SUPPORTED_TOKENS) {
        try {
          const tokenContracts = TOKEN_CONTRACTS[symbol];
          const contractAddr = tokenContracts?.[chain];

          if (!contractAddr || contractAddr === 'NATIVE') {
            const wrappedAddresses: Record<string, string> = {
              'ethereum-ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
              'bsc-BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
              'polygon-MATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'
            };
            const wrappedKey = `${chain}-${symbol}`;
            const wrappedAddr = wrappedAddresses[wrappedKey];
            
            if (wrappedAddr) {
              const price = await this.fetchDexPriceForToken(chainId, wrappedAddr, symbol, chain);
              if (price) dexPrices.push({ ...price, timestamp });
            } else {
              logger.warn(`No wrapped address for native token ${symbol} on ${chain}`);
            }
          } else {
            const price = await this.fetchDexPriceForToken(chainId, contractAddr, symbol, chain);
            if (price) dexPrices.push({ ...price, timestamp });
          }

          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          logger.error(`Error fetching DEX price for ${symbol} on ${chain}`);
        }
      }
    }

    logger.info(`Fetched ${dexPrices.length} DEX prices from DexScreener`);
    return dexPrices;
  }

  private async fetchDexPriceForToken(
    chainId: string,
    tokenAddress: string,
    symbol: string,
    chain: string
  ): Promise<DexPrice | null> {
    try {
      const url = `${this.dexScreenerBaseUrl}/tokens/${tokenAddress}`;
      const response = await axios.get<DexScreenerResponse>(url, { timeout: 10000 });

      if (!response.data?.pairs || response.data.pairs.length === 0) {
        logger.warn(`No DEX pairs found for ${symbol} (${tokenAddress}) on ${chain}`);
        return null;
      }

      const chainPairs = response.data.pairs.filter((pair: DexScreenerPair) => 
        pair.chainId === chainId
      );

      if (chainPairs.length === 0) {
        logger.warn(`No pairs on ${chainId} for ${symbol}`);
        return null;
      }

      const sortedPairs = chainPairs.sort((a: DexScreenerPair, b: DexScreenerPair) => {
        const liqA = a.liquidity?.usd || 0;
        const liqB = b.liquidity?.usd || 0;
        return liqB - liqA;
      });

      const bestPair = sortedPairs[0];
      const priceUsd = parseFloat(bestPair.priceUsd);
      const liquidityUsd = bestPair.liquidity?.usd ?? 0;

      if (!Number.isFinite(liquidityUsd) || liquidityUsd < MIN_LIQUIDITY_USD) {
        logger.warn(`Dex price skipped for ${symbol} on ${chain}: liquidity ${liquidityUsd}`);
        return null;
      }

      if (isNaN(priceUsd) || priceUsd <= 0) {
        logger.warn(`Invalid price for ${symbol} on ${chain}: ${bestPair.priceUsd}`);
        return null;
      }

      if (STABLE_TOKENS.has(symbol as SupportedToken)) {
        if (priceUsd < STABLE_PRICE_MIN || priceUsd > STABLE_PRICE_MAX) {
          logger.warn(`Stablecoin price out of range for ${symbol} on ${chain}: ${priceUsd}`);
          return null;
        }
      }

      return {
        symbol,
        chain,
        price: priceUsd,
        timestamp: new Date(),
        dexName: bestPair.dexId,
        liquidity: bestPair.liquidity?.usd
      };
    } catch (err: any) {
      if (err.response?.status === 404) {
        logger.warn(`Token ${symbol} (${tokenAddress}) not found on DexScreener for ${chain}`);
      } else {
        logger.error(`DexScreener API error for ${symbol} on ${chain}`, { error: err?.message });
      }
      return null;
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
        throw new Error('No prices available');
      }

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
      logger.error('Error fetching Ethereum gas price from Blocknative');
      try {
        const apiKey = process.env.ETHERSCAN_API_KEY;
        const url = apiKey
          ? `${this.etherscanGasUrl}?module=gastracker&action=gasoracle&apikey=${apiKey}`
          : `${this.etherscanGasUrl}?module=gastracker&action=gasoracle`;

        const response = await axios.get(url, { timeout: 10000 });
        const result = (response.data as any)?.result;
        if (!result?.FastGasPrice) {
          throw new Error('Invalid Etherscan response');
        }

        return {
          chain: 'ethereum',
          gasPrice: Number(result.FastGasPrice),
          timestamp: new Date()
        };
      } catch (esErr) {
        logger.error('Etherscan gas oracle also failed');
        throw new Error('Failed to fetch Ethereum gas price from all sources');
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
      logger.error('Error fetching Polygon gas price');
      throw new Error('Failed to fetch Polygon gas price');
    }
  }

  async fetchBSCGasPrice(): Promise<GasPrice> {
    try {
      const response = await axios.get<BSCGasResponse>(
        this.bscGasUrl,
        { timeout: 5000 }
      );

      return {
        chain: 'bsc',
        gasPrice: response.data.standard,
        timestamp: new Date()
      };
    } catch (error) {
      logger.warn('BSC gas API failed, using fallback value (5 gwei)');
      return {
        chain: 'bsc',
        gasPrice: 5,
        timestamp: new Date()
      };
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
      logger.error('Error fetching gas prices');
      throw new Error('Failed to fetch gas prices');
    }
  }

  getSupportedTokens(): string[] {
    return [...SUPPORTED_TOKENS];
  }

  getSupportedChains(): string[] {
    return [...SUPPORTED_CHAINS];
  }
}

export default DataService;
