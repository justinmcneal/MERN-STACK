import { useState, useEffect, useCallback } from 'react';
import { pricesService, type TokenPrice, type PriceFilters } from '../services/api/services/pricesService';
import { mockData } from '../utils/mockData';

interface UsePriceDataState {
  prices: TokenPrice[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: PriceFilters) => void;
}

export function usePriceData(initialFilters?: PriceFilters): UsePriceDataState {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PriceFilters>(initialFilters || {});

  const fetchPrices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first, fallback to mock data
      try {
        const data = await pricesService.getPrices(filters);
        setPrices(data);
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock price data:', apiError);
        setPrices(mockData.generateTokenPrices(filters.limit || 15));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price data');
      // Even on error, provide some mock data
      setPrices(mockData.generateTokenPrices(10));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => fetchPrices(), [fetchPrices]);

  const updateFilters = useCallback((newFilters: PriceFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  return {
    prices,
    loading,
    error,
    refetch,
    updateFilters,
  };
}

export default usePriceData;
