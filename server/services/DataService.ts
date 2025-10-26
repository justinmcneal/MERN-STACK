// services/DataService.ts
import * as axios from 'axios';
import fs from 'fs';
import path from 'path';
import {
  SUPPORTED_TOKENS,
  SUPPORTED_CHAINS,
  TOKEN_CONTRACTS,
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

  // Backoff state persisted to disk so it survives restarts
  private readonly cacheDir = path.resolve(__dirname, '..', '.cache');
  // Etherscan API fallback for gas (requires ETHERSCAN_API_KEY)
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
      console.warn('Failed to ensure cache dir:', err);
    }
  }

  private async fetchDexScreenerPrice(chain: SupportedChain, address: string): Promise<number | null> {
    const normalizedAddress = address.toLowerCase();

    try {
      // Rate limiting: 300ms delay between requests
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

      return best?.price ?? null;
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn(`⚠️  DexScreener rate limit hit for ${normalizedAddress}, waiting 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`DexScreener price fetch failed for ${normalizedAddress} on ${chain}: ${message}`);
      return null;
    }
  }

  private async fetchDexScreenerPrices(): Promise<Map<SupportedToken, Record<string, number>>> {
    const priceMap = new Map<SupportedToken, Record<string, number>>();
    let successCount = 0;
    let failCount = 0;

    for (const token of SUPPORTED_TOKENS as readonly SupportedToken[]) {
      const chainMap = TOKEN_CONTRACTS[token] || {};
      for (const chain of SUPPORTED_CHAINS as readonly SupportedChain[]) {
        const address = chainMap[chain];
        if (!address) continue;

        const price = await this.fetchDexScreenerPrice(chain, address);
        if (price === null) {
          failCount++;
          continue;
        }

        successCount++;
        if (!priceMap.has(token)) {
          priceMap.set(token, {});
        }
        priceMap.get(token)![chain] = price;
      }
    }

    console.log(`📊 DexScreener Results: ${successCount} prices fetched, ${failCount} failed`);
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
    console.log('💰 Fetching token prices from DexScreener...');
    
    const timestamp = new Date();
    const priceMap = await this.fetchDexScreenerPrices();

    // Log summary
    const tokensWithPrices = Array.from(priceMap.keys()).length;
    console.log(`✅ Retrieved prices for ${tokensWithPrices} tokens from DexScreener`);

    // Build result array
    return (SUPPORTED_TOKENS as readonly SupportedToken[]).map((token) => {
      const chainPrices = priceMap.get(token) || {};
      const primaryPrice = chainPrices['ethereum'] ?? Object.values(chainPrices)[0] ?? 0;

      if (primaryPrice === 0) {
        console.warn(`⚠️  No price data available for ${token}`);
      }

      return {
        symbol: token,
        price: primaryPrice,
        timestamp,
        chainPrices
      };
    });
  }

  /**
   * Fetch chain-specific DEX prices from DexScreener API
   * Maps chain names to DexScreener chain IDs and fetches prices for each token
   */
  async fetchDexPrices(): Promise<DexPrice[]> {
    const chainIdMap: Record<string, string> = {
      ethereum: 'ethereum',
      polygon: 'polygon',
      bsc: 'bsc'
    };

    const dexPrices: DexPrice[] = [];
    const timestamp = new Date();

    // Import TOKEN_CONTRACTS to get contract addresses
    const { TOKEN_CONTRACTS } = await import('../config/tokens');

    for (const chain of SUPPORTED_CHAINS) {
      const chainId = chainIdMap[chain];
      if (!chainId) {
        console.warn(`No DexScreener chainId mapping for ${chain}`);
        continue;
      }

      for (const symbol of SUPPORTED_TOKENS) {
        try {
          const tokenContracts = TOKEN_CONTRACTS[symbol];
          const contractAddr = tokenContracts?.[chain];

          if (!contractAddr || contractAddr === 'NATIVE') {
            // For native tokens, use wrapped token pairs (WETH, WBNB, WMATIC)
            const wrappedAddresses: Record<string, string> = {
              'ethereum-ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
              'bsc-BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // WBNB
              'polygon-MATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270' // WMATIC
            };
            const wrappedKey = `${chain}-${symbol}`;
            const wrappedAddr = wrappedAddresses[wrappedKey];
            
            if (wrappedAddr) {
              const price = await this.fetchDexPriceForToken(chainId, wrappedAddr, symbol, chain);
              if (price) dexPrices.push({ ...price, timestamp });
            } else {
              console.warn(`No wrapped address for native token ${symbol} on ${chain}`);
            }
          } else {
            // Regular ERC20 tokens
            const price = await this.fetchDexPriceForToken(chainId, contractAddr, symbol, chain);
            if (price) dexPrices.push({ ...price, timestamp });
          }

          // Rate limit: 300ms delay between requests to avoid hitting DexScreener limits
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (err) {
          console.error(`Error fetching DEX price for ${symbol} on ${chain}:`, err);
        }
      }
    }

    console.info(`Fetched ${dexPrices.length} DEX prices from DexScreener`);
    return dexPrices;
  }

  /**
   * Helper method to fetch price for a specific token from DexScreener
   */
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
        console.warn(`No DEX pairs found for ${symbol} (${tokenAddress}) on ${chain}`);
        return null;
      }

      // Filter pairs for the specific chain and sort by liquidity
      const chainPairs = response.data.pairs.filter((pair: DexScreenerPair) => 
        pair.chainId === chainId
      );

      if (chainPairs.length === 0) {
        console.warn(`No pairs on ${chainId} for ${symbol}`);
        return null;
      }

      // Sort by liquidity and take the most liquid pair
      const sortedPairs = chainPairs.sort((a: DexScreenerPair, b: DexScreenerPair) => {
        const liqA = a.liquidity?.usd || 0;
        const liqB = b.liquidity?.usd || 0;
        return liqB - liqA;
      });

      const bestPair = sortedPairs[0];
      const priceUsd = parseFloat(bestPair.priceUsd);

      if (isNaN(priceUsd) || priceUsd <= 0) {
        console.warn(`Invalid price for ${symbol} on ${chain}: ${bestPair.priceUsd}`);
        return null;
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
        console.warn(`Token ${symbol} (${tokenAddress}) not found on DexScreener for ${chain}`);
      } else {
        console.error(`DexScreener API error for ${symbol} on ${chain}:`, err?.message || err);
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
        { timeout: 5000 } // Reduced timeout
      );

      return {
        chain: 'bsc',
        gasPrice: response.data.standard,
        timestamp: new Date()
      };
    } catch (error) {
      console.warn('BSC gas API failed, using fallback value (5 gwei)');
      // Fallback to reasonable default for BSC (typically 3-5 gwei)
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
      console.error('Error fetching gas prices:', error);
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
