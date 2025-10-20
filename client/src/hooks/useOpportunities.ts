import { useCallback, useEffect, useRef, useState } from 'react';
import OpportunityService, { type OpportunityDto, type OpportunityQuery } from '../services/OpportunityService';

export interface UseOpportunitiesOptions {
  pollIntervalMs?: number;
  query?: OpportunityQuery;
}

export function useOpportunities(options?: UseOpportunitiesOptions) {
  const { pollIntervalMs, query } = options ?? {};
  const [opportunities, setOpportunities] = useState<OpportunityDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const list = await OpportunityService.listOpportunities(query);
      setOpportunities(list);
    } catch (err: unknown) {
      let message = 'Failed to load opportunities';
      if (err instanceof Error && err.message) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch();

    if (pollIntervalMs && pollIntervalMs > 0) {
      intervalRef.current = window.setInterval(() => {
        fetch();
      }, pollIntervalMs);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [fetch, pollIntervalMs]);

  return { opportunities, loading, error, refresh: fetch };
}

export default useOpportunities;
