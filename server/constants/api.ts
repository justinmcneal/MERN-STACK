export const API_ENDPOINTS = {
  DEXSCREENER: 'https://api.dexscreener.com/latest/dex',
  POLYGON_GAS: 'https://gasstation.polygon.technology/v2',
  BSC_GAS: 'https://bscgas.info/gas',
  BSCSCAN: 'https://api.bscscan.com/api',
  BLOCKNATIVE: 'https://api.blocknative.com/gasprices/blockprices',
  ETHERSCAN: 'https://api.etherscan.io/api',
  COINGECKO: 'https://api.coingecko.com/api/v3',
} as const;

export const API_TIMEOUTS = {
  DEFAULT: 10000,
  SHORT: 5000,
  LONG: 30000,
} as const;

export const RATE_LIMITS = {
  DEXSCREENER_DELAY: 300,
  DEXSCREENER_RETRY_DELAY: 1000,
  COINGECKO_DELAY: 1500,
} as const;

export const HTTP_STATUS = {
  RATE_LIMIT: 429,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  BAD_REQUEST: 400,
  SERVER_ERROR: 500,
} as const;
