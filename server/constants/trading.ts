export const TRADE_CONSTANTS = {
  DEFAULT_TRADE_SIZE_USD: 1000,
  MIN_LIQUIDITY_USD: 1000,
  STABLE_PRICE_MIN: 0.8,
  STABLE_PRICE_MAX: 1.2,
} as const;

export const GAS_UNITS: Record<string, { outbound: number; inbound: number }> = {
  ethereum: { outbound: 450000, inbound: 220000 },
  polygon: { outbound: 320000, inbound: 160000 },
  bsc: { outbound: 360000, inbound: 200000 },
} as const;

export const ANOMALY_THRESHOLDS = {
  SPREAD_OUTLIER_PERCENT: 5000,
  DEX_CEX_DIVERGENCE: 1.5,
  GAS_PROFIT_RATIO: 0.0001,
} as const;

export const WRAPPED_NATIVE_ADDRESSES: Record<string, string> = {
  'ethereum-ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'bsc-BNB': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
  'polygon-MATIC': '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
} as const;

export const SEVERE_ANOMALY_FLAGS = new Set([
  'spread-outlier',
  'gas-vs-profit-outlier',
  'from-dex-cex-divergence',
  'to-dex-cex-divergence',
]);
