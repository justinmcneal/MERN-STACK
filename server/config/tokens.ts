// config/tokens.ts
// Shared configuration for tokens and chains across the entire application

export const SUPPORTED_TOKENS = ['ETH', 'USDT', 'USDC', 'BNB', 'MATIC'] as const;
export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'bsc'] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];
export type SupportedChain = typeof SUPPORTED_CHAINS[number];

// Human-readable token names
export const TOKEN_NAMES: Record<SupportedToken, string> = {
  'ETH': 'Ethereum',
  'USDT': 'Tether',
  'USDC': 'USD Coin',
  'BNB': 'Binance Coin',
  'MATIC': 'Polygon'
} as const;

// CoinGecko API token IDs
export const COINGECKO_TOKEN_IDS: Record<SupportedToken, string> = {
  'ETH': 'ethereum',
  'USDT': 'tether',
  'USDC': 'usd-coin',
  'BNB': 'binancecoin',
  'MATIC': 'matic-network'
} as const;

// Chain display names
export const CHAIN_NAMES: Record<SupportedChain, string> = {
  'ethereum': 'Ethereum',
  'polygon': 'Polygon',
  'bsc': 'Binance Smart Chain'
} as const;

// Validation helpers
export function isValidToken(token: string): token is SupportedToken {
  return SUPPORTED_TOKENS.includes(token as SupportedToken);
}

export function isValidChain(chain: string): chain is SupportedChain {
  return SUPPORTED_CHAINS.includes(chain as SupportedChain);
}

// Get token name with fallback
export function getTokenName(symbol: string): string {
  return TOKEN_NAMES[symbol as SupportedToken] || symbol;
}

// Get chain name with fallback
export function getChainName(chain: string): string {
  return CHAIN_NAMES[chain as SupportedChain] || chain;
}

// Get CoinGecko token ID
export function getCoinGeckoTokenId(symbol: string): string | null {
  return COINGECKO_TOKEN_IDS[symbol as SupportedToken] || null;
}
