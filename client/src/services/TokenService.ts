import { apiClient as client } from './api';

export type TokenDto = {
  _id?: string;
  symbol: string;
  chain: string;
  currentPrice: number;
  lastUpdated: string;
  name?: string;
  decimals?: number;
  contractAddress?: string;
}
type ListParams = {
  symbol?: string;
  chain?: string;
  limit?: number;
  skip?: number;
};

const listTokens = async (params?: ListParams): Promise<TokenDto[]> => {
  const res = await client.get('/tokens', { params });
  return res.data?.data || [];
};

const getToken = async (symbol: string, chain?: string): Promise<TokenDto[] | TokenDto | null> => {
  if (chain) {
    const res = await client.get(`/tokens/${symbol}/${chain}`);
    return res.data?.data || null;
  }
  const res = await client.get(`/tokens/${symbol}`);
  return res.data?.data || null;
};

const refreshTokens = async () => {
  const res = await client.post('/tokens/refresh');
  return res.data;
};

export default { listTokens, getToken, refreshTokens };
