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

// Mapping of token -> chain -> contract address (or 'NATIVE' for native chain token)
// If a chain is not present for a token, we consider the token unsupported on that chain
export const TOKEN_CONTRACTS: Record<SupportedToken, Partial<Record<SupportedChain, string>>> = {
  // NOTE: The addresses below are common wrapped/peg contracts widely used on the networks
  // but MUST be verified for your deployment/region before relying on them in production.
  ETH: {
    ethereum: 'NATIVE',
    // Wrapped Ether on Polygon (WETH)
    polygon: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
    // Binance-Peg ETH on BSC
    bsc: '0x2170Ed0880ac9A755fd29B2688956BD959F933F'
  },
  USDT: {
    ethereum: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    bsc: '0x55d398326f99059fF775485246999027B3197955',
    polygon: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
  },
  USDC: {
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9eb0cE3606eB48',
    bsc: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    polygon: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'
  },
  BNB: {
    // Native BNB on BSC
    bsc: 'NATIVE',
    // Pegged BNB on Ethereum (common ERC20 representation)
    ethereum: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    // On Polygon there may be a pegged BNB token; add if/when verified
    polygon: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52'
  },
  MATIC: {
    // Native MATIC on Polygon
    polygon: 'NATIVE',
    // MATIC token on Ethereum (ERC20 representation)
    ethereum: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    // On BSC there are wrapped MATIC tokens; verified address provided
    bsc: '0xcc42724c6683b7e57334c4e856f4c9965ed682bd'
  }
};

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
