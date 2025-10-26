// config/tokens.ts
// Shared configuration for tokens and chains across the entire application

export const SUPPORTED_TOKENS = ['ETH', 'XRP', 'SOL', 'BNB', 'MATIC'] as const;
export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'bsc'] as const;

export type SupportedToken = typeof SUPPORTED_TOKENS[number];
export type SupportedChain = typeof SUPPORTED_CHAINS[number];

// Human-readable token names
export const TOKEN_NAMES: Record<SupportedToken, string> = {
  ETH: 'Ethereum',
  XRP: 'Ripple',
  SOL: 'Solana',
  BNB: 'Binance Coin',
  MATIC: 'Polygon'
} as const;

// Mapping of token -> chain -> contract address (or 'NATIVE' for native chain token)
// If a chain is not present for a token, we consider the token unsupported on that chain
export const TOKEN_CONTRACTS: Record<SupportedToken, Partial<Record<SupportedChain, string>>> = {
  // NOTE: The addresses below represent widely used wrapped / bridged versions of the assets
  // and should be validated for your deployment before using them in production.
  ETH: {
    // WETH on Ethereum
    ethereum: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    // Wrapped Ether on Polygon (WETH)
    polygon: '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
    // Binance-Peg ETH on BSC
    bsc: '0x2170ed0880ac9a755fd29b2688956bd959f933f'
  },
  XRP: {
    // Wrapped XRP on Ethereum - Updated to more liquid contract
    ethereum: '0x39fbbabf11738317a448031930706cd3e612e1b9',
    // Binance-Peg XRP Token on BSC - Updated address with proper checksum
    bsc: '0x1d2f0da169ceb9fc7c8ff4e343ad1b87ab7c8c',
    // XRP Token (PoS) on Polygon
    polygon: '0xda0ef8e6e6cd4c12cf09b92db1b2b1d4a93353c3'
  },
  SOL: {
    // Wrapped SOL (Wormhole) on Ethereum
    ethereum: '0x7d7a1c4f7b3d60f6b6dc31c2b8b09c64b7ad2bfc',
    // Binance-Peg SOL on BSC
    bsc: '0x570a5d26f7765ecb712c0924e4de545b89f14f5b',
    // Wrapped SOL (PoS) on Polygon
    polygon: '0x749f984d1f5cdd4f0af35782f0c79108b4823c5c'
  },
  BNB: {
    // WBNB on BSC
    bsc: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    // Pegged BNB on Ethereum
    ethereum: '0xb8c77482e45f1f44de1745f52c74426c631bdd52',
    // Pegged BNB on Polygon
    polygon: '0x3ba4c387f786bfee076a58914f5bd38d668b42c3'
  },
  MATIC: {
    // WMATIC on Polygon
    polygon: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    // MATIC on Ethereum (ERC20)
    ethereum: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    // MATIC on BSC (Binance-Peg)
    bsc: '0xcc42724c6683b7e57334c4e856f4c9965ed682bd'
  }
};

export const CHAIN_NATIVE_TOKENS: Record<SupportedChain, SupportedToken> = {
  ethereum: 'ETH',
  polygon: 'MATIC',
  bsc: 'BNB'
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
