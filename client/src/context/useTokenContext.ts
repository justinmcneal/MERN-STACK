import { useContext } from 'react';
import TokenContext from './TokenContext';

export const useTokenContext = () => {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useTokenContext must be used within TokenProvider');
  return ctx;
};

export default useTokenContext;
