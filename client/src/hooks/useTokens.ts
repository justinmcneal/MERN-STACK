import { useEffect, useState, useRef, useCallback } from 'react';
import TokenService from '../services/TokenService';
import type { TokenDto } from '../services/TokenService';

type FetchOptions = {
  forceExternalRefresh?: boolean;
  initial?: boolean;
};

const getErrorMessage = (err: unknown, fallback: string) => {
  if (err instanceof Error && err.message) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  if (typeof err === 'object' && err !== null) {
    const record = err as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }
  }
  return fallback;
};

export function useTokens(pollIntervalMs?: number) {
  const [tokens, setTokens] = useState<TokenDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);
  const isInitialLoadRef = useRef<boolean>(true);

  const runFetch = useCallback(async (options?: FetchOptions) => {
    const shouldForceRefresh = Boolean(options?.forceExternalRefresh);
    const isInitial = options?.initial ?? isInitialLoadRef.current;

    if (isInitial) {
      setLoading(true);
    }
    if (shouldForceRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    let refreshError: string | null = null;

    if (shouldForceRefresh) {
      try {
        await TokenService.refreshTokens();
      } catch (err) {
        refreshError = getErrorMessage(err, 'Failed to refresh token prices; showing cached data.');
      }
    }

    try {
      const list = await TokenService.listTokens({
        fields: 'symbol,chain,name,currentPrice,dexPrice,dexName,liquidity,lastUpdated,contractAddress'
      });
      setTokens(list || []);
      if (refreshError) {
        setError(refreshError);
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Failed to load tokens');
      setError(refreshError ? `${refreshError} ${message}` : message);
    } finally {
      if (isInitial) {
        setLoading(false);
        isInitialLoadRef.current = false;
      }
      if (shouldForceRefresh) {
        setIsRefreshing(false);
      }
    }
  }, []);

  const manualRefresh = useCallback(async () => {
    await runFetch({ forceExternalRefresh: true });
  }, [runFetch]);

  useEffect(() => {
    runFetch({ initial: true }).catch(() => {
      /* handled via state updates */
    });

    if (pollIntervalMs && pollIntervalMs > 0) {
      intervalRef.current = window.setInterval(() => {
        runFetch().catch(() => {
          /* handled via state updates */
        });
      }, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [pollIntervalMs, runFetch]);

  return { tokens, loading, error, refresh: manualRefresh, isRefreshing };
}
