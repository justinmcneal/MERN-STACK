import { useEffect, useState, useRef, useCallback } from 'react';
import TokenService from '../services/TokenService';
import type { TokenDto } from '../services/TokenService';

export function useTokens(pollIntervalMs?: number) {
  const [tokens, setTokens] = useState<TokenDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await TokenService.listTokens();
      setTokens(list || []);
    } catch (err: unknown) {
      let message = 'Failed to load tokens';
      const isErrWithMessage = (e: unknown): e is { message: string } => {
        if (typeof e !== 'object' || e === null) return false;
        const r = e as Record<string, unknown>;
        return 'message' in r && typeof r['message'] === 'string';
      };
      if (isErrWithMessage(err)) {
        message = err.message || message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message || 'Failed to load tokens');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();

    if (pollIntervalMs && pollIntervalMs > 0) {
      intervalRef.current = window.setInterval(() => {
        fetch();
      }, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [fetch, pollIntervalMs]);

  return { tokens, loading, error, refresh: fetch };
}
