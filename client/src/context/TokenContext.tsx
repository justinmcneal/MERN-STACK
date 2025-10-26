import { createContext } from 'react';
import type { ReactNode } from 'react';
import { useTokens } from '../hooks/useTokens';
import type { TokenDto } from '../services/TokenService';

type TokenContextValue = {
  tokens: TokenDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
};

const TokenContext = createContext<TokenContextValue | undefined>(undefined);

export const TokenProvider = ({ children, pollIntervalMs }: { children: ReactNode; pollIntervalMs?: number }) => {
  const { tokens, loading, error, refresh, isRefreshing } = useTokens(pollIntervalMs);

  return (
    <TokenContext.Provider value={{ tokens, loading, error, refresh, isRefreshing }}>
      {children}
    </TokenContext.Provider>
  );
};

export default TokenContext;
