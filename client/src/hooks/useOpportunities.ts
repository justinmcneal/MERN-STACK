import { useState, useEffect, useCallback } from 'react';
import { opportunitiesService, type ArbitrageOpportunity, type OpportunitiesFilters } from '../services/api/services/opportunitiesService';
import { mockData } from '../utils/mockData';

interface UseOpportunitiesState {
  opportunities: ArbitrageOpportunity[];
  loading: boolean;
  error: string | null;
  total: number;
  refetch: () => Promise<void>;
  updateFilters: (filters: OpportunitiesFilters) => void;
}

export function useOpportunities(initialFilters?: OpportunitiesFilters): UseOpportunitiesState {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<OpportunitiesFilters>(initialFilters || {});

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API first, fallback to mock data
      try {
        const response = await opportunitiesService.getOpportunities(filters);
        setOpportunities(response.opportunities);
        setTotal(response.total);
      } catch (apiError) {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', apiError);
        const mockOpportunities = mockData.generateArbitrageOpportunities(filters.limit || 10);
        setOpportunities(mockOpportunities);
        setTotal(mockOpportunities.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      // Even on error, provide some mock data
      setOpportunities(mockData.generateArbitrageOpportunities(10));
      setTotal(10);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => fetchOpportunities(), [fetchOpportunities]);

  const updateFilters = useCallback((newFilters: OpportunitiesFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  return {
    opportunities,
    loading,
    error,
    total,
    refetch,
    updateFilters,
  };
}

export default useOpportunities;
