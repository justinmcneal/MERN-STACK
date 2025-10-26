import { useCallback, useEffect, useRef, useState } from 'react';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'PHP'] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

type ExchangeRates = Record<SupportedCurrency, number>;

type CachedRates = {
  rates: ExchangeRates;
  timestamp: number;
};

export type CurrencyFormatOptions = {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
};

export type CurrencyFormatterFn = (valueUsd?: number | null, options?: CurrencyFormatOptions) => string;
export type UsdConverterFn = (valueUsd?: number | null) => number | null;

const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  PHP: '₱'
};

const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 155,
  PHP: 57
};

const CACHE_STORAGE_KEY = 'currency_rates_v1';
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const EXCHANGE_RATE_URL = 'https://open.er-api.com/v6/latest/USD';

const clampDigits = (min?: number, max?: number) => {
  const resolvedMin = typeof min === 'number' ? Math.max(0, min) : undefined;
  let resolvedMax = typeof max === 'number' ? Math.max(0, max) : undefined;

  if (resolvedMin !== undefined && resolvedMax !== undefined && resolvedMin > resolvedMax) {
    resolvedMax = resolvedMin;
  }

  return { min: resolvedMin, max: resolvedMax };
};

export const getCurrencySymbol = (currency: SupportedCurrency) => CURRENCY_SYMBOLS[currency];

export const useCurrencyFormatter = (currency: SupportedCurrency = 'USD') => {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }
    hasFetchedRef.current = true;

    let mounted = true;

    const loadFromCache = (): boolean => {
      if (typeof window === 'undefined') {
        return false;
      }

      const cachedRaw = window.sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (!cachedRaw) {
        return false;
      }

      try {
        const cached = JSON.parse(cachedRaw) as CachedRates;
        if (cached?.rates) {
          if (mounted) {
            setRates(cached.rates);
            if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
              setLoading(false);
              return true;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to parse cached currency rates', err);
      }

      return false;
    };

    const hasFreshCache = loadFromCache();

    const fetchRates = async () => {
      try {
        if (!hasFreshCache) {
          setLoading(true);
        }

        const response = await fetch(EXCHANGE_RATE_URL);
        if (!response.ok) {
          throw new Error(`Exchange rate request failed (${response.status})`);
        }

        const data = await response.json() as { result?: string; rates?: Record<string, number> };
        if (!data || data.result !== 'success' || !data.rates) {
          throw new Error('Unexpected exchange rate response');
        }

        const nextRates: ExchangeRates = {
          USD: 1,
          EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
          GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
          JPY: data.rates.JPY ?? FALLBACK_RATES.JPY,
          PHP: data.rates.PHP ?? FALLBACK_RATES.PHP
        };

        if (!mounted) {
          return;
        }

        setRates(nextRates);
        setError(null);
        setLoading(false);

        if (typeof window !== 'undefined') {
          const payload: CachedRates = {
            rates: nextRates,
            timestamp: Date.now()
          };
          window.sessionStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(payload));
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
        setLoading(false);
      }
    };

    void fetchRates();

    return () => {
      mounted = false;
    };
  }, []);

  const convertFromUsd = useCallback<UsdConverterFn>((valueUsd) => {
    if (valueUsd === undefined || valueUsd === null || Number.isNaN(valueUsd)) {
      return null;
    }

    const rate = rates[currency] ?? 1;
    return valueUsd * rate;
  }, [currency, rates]);

  const formatCurrency = useCallback<CurrencyFormatterFn>((valueUsd, options) => {
    const converted = convertFromUsd(valueUsd);
    if (converted === null || !Number.isFinite(converted)) {
      return '—';
    }

    const absValue = Math.abs(converted);
    const resolvedOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      currencyDisplay: options?.currencyDisplay ?? 'symbol'
    };

    if (options?.notation) {
      resolvedOptions.notation = options.notation;
    }

    if (options?.minimumFractionDigits !== undefined || options?.maximumFractionDigits !== undefined) {
      const { min, max } = clampDigits(options.minimumFractionDigits, options.maximumFractionDigits);
      if (min !== undefined) {
        resolvedOptions.minimumFractionDigits = min;
      }
      if (max !== undefined) {
        resolvedOptions.maximumFractionDigits = max;
      }
    } else if (resolvedOptions.notation === 'compact') {
      resolvedOptions.minimumFractionDigits = 0;
      resolvedOptions.maximumFractionDigits = currency === 'JPY' ? 0 : 1;
    } else if (currency === 'JPY') {
      resolvedOptions.minimumFractionDigits = 0;
      resolvedOptions.maximumFractionDigits = 0;
    } else if (absValue >= 1000) {
      resolvedOptions.minimumFractionDigits = 0;
      resolvedOptions.maximumFractionDigits = 0;
    } else if (absValue >= 1) {
      resolvedOptions.minimumFractionDigits = 2;
      resolvedOptions.maximumFractionDigits = 2;
    } else {
      resolvedOptions.minimumFractionDigits = 4;
      resolvedOptions.maximumFractionDigits = 6;
    }

    return new Intl.NumberFormat('en-US', resolvedOptions).format(converted);
  }, [convertFromUsd, currency]);

  return {
    currency,
    symbol: CURRENCY_SYMBOLS[currency],
    rates,
    loading,
    error,
    convertFromUsd,
    formatCurrency
  };
};
