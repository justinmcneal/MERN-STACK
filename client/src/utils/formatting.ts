/**
 * Comprehensive formatting utilities for the application
 */

/**
 * Format currency values
 */
export const formatCurrency = (
  value: number | string,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showSign?: boolean;
  } = {}
): string => {
  const {
    currency = 'USD',
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    showSign = false,
  } = options;

  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;

  if (isNaN(numValue)) return '$0.00';

  const formatted = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numValue);

  if (showSign && numValue > 0) {
    return `+${formatted}`;
  }

  return formatted;
};

/**
 * Format percentage values
 */
export const formatPercentage = (
  value: number | string,
  options: {
    decimals?: number;
    showSign?: boolean;
    asDecimal?: boolean;
  } = {}
): string => {
  const { decimals = 2, showSign = false, asDecimal = false } = options;
  
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[%]/g, '')) : value;
  
  if (isNaN(numValue)) return '0%';
  
  const formatted = numValue.toFixed(decimals);
  
  if (asDecimal) {
    return showSign && numValue > 0 ? `+${formatted}` : formatted;
  }
  
  return showSign && numValue > 0 ? `+${formatted}%` : `${formatted}%`;
};

/**
 * Format large numbers with K/M/B suffixes
 */
export const formatLargeNumber = (
  value: number | string,
  options: {
    currency?: boolean;
    suffix?: 'auto' | 'thousand' | 'million' | 'billion';
  } = {}
): string => {
  const { currency = false, suffix = 'auto' } = options;
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;

  if (isNaN(numValue)) return currency ? '$0' : '0';

  if (suffix === 'thousand' || (suffix === 'auto' && numValue >= 1000 && numValue < 1000000)) {
    const formatted = (numValue / 1000).toFixed(1);
    return currency ? `$${formatted}K` : `${formatted}K`;
  }

  if (suffix === 'million' || (suffix === 'auto' && numValue >= 1000000 && numValue < 1000000000)) {
    const formatted = (numValue / 1000000).toFixed(1);
    return currency ? `$${formatted}M` : `${formatted}M`;
  }

  if (suffix === 'billion' || (suffix === 'auto' && numValue >= 1000000000)) {
    const formatted = (numValue / 1000000000).toFixed(1);
    return currency ? `$${formatted}B` : `${formatted}B`;
  }

  return currency ? formatCurrency(numValue) : formatNumber(numValue);
};

/**
 * Format regular numbers
 */
export const formatNumber = (
  value: number | string,
  options: {
    decimals?: number;
    thousandsSeparator?: boolean;
    locale?: string;
  } = {}
): string => {
  const { decimals = 2, thousandsSeparator = true, locale = 'en-US' } = options;
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) return '0';

  const formatted = numValue.toFixed(decimals);
  
  if (thousandsSeparator && Math.abs(numValue) >= 1000) {
    return new Intl.NumberFormat(locale).format(numValue);
  }

  return formatted;
};

/**
 * Format time ago strings
 */
export const formatTimeAgo = (date: Date | string | number): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return pastDate.toLocaleDateString();
};

/**
 * Format relative time for recent activities
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  const pastDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - pastDate.getTime()) / 1000);

  if (diffInSeconds < 60) return 'now';
  if (diffInSeconds < 300) return `${diffInSeconds}s ago`; // 5 minutes
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return pastDate.toLocaleDateString();
};

/**
 * Format token symbols and addresses
 */
export const formatTokenSymbol = (symbol: string): string => {
  return symbol.toUpperCase();
};

export const formatTokenAddress = (address: string, length: number = 6): string => {
  if (!address || address.length <= length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length)}`;
};

/**
 * Format chain names
 */
export const formatChainName = (chain: string): string => {
  const chainMap: Record<string, string> = {
    'ethereum': 'Ethereum',
    'bsc': 'BSC',
    'polygon': 'Polygon',
    'arbitrum': 'Arbitrum',
    'optimism': 'Optimism',
    'avalanche': 'Avalanche',
  };

  return chainMap[chain.toLowerCase()] || chain;
};

/**
 * Format profit/loss with color indication
 */
export const formatProfitLoss = (
  value: number | string,
  options: {
    threshold?: number;
    showSign?: boolean;
  } = {}
): { text: string; isPositive: boolean } => {
  const { threshold = 0, showSign = true } = options;
  const numValue = typeof value === 'string' ? parseFloat(value.replace(/[,$]/g, '')) : value;
  
  const isPositive = numValue >= threshold;
  const prefix = showSign ? (isPositive ? '+' : '') : '';
  
  return {
    text: `${prefix}${formatCurrency(numValue)}`,
    isPositive,
  };
};

/**
 * Format score with thresholds
 */
export const formatScore = (score: number): { text: string; level: 'excellent' | 'good' | 'fair' | 'poor' } => {
  let level: 'excellent' | 'good' | 'fair' | 'Poor' = 'Poor';
  
  if (score >= 95) level = 'excellent';
  else if (score >= 85) level = 'good';
  else if (score >= 70) level = 'fair';

  return {
    text: score.toString(),
    level: level as 'excellent' | 'good' | 'fair' | 'poor',
  };
};
