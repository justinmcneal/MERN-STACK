import DataService from '../services/DataService';
import { COINGECKO_TOKEN_IDS } from '../config/tokens';

describe('DataService helpers', () => {
  test('getTokenId returns correct CoinGecko ID for supported tokens', () => {
    const ds = DataService.getInstance();
    const keys = Object.keys(COINGECKO_TOKEN_IDS);
    keys.forEach((k) => {
      const id = ds.getTokenId(k);
      expect(id).toBe(COINGECKO_TOKEN_IDS[k as keyof typeof COINGECKO_TOKEN_IDS]);
    });
  });

  test('getSupportedTokens returns configured tokens', () => {
    const ds = DataService.getInstance();
    const supported = ds.getSupportedTokens();
    expect(Array.isArray(supported)).toBe(true);
    expect(supported.length).toBeGreaterThan(0);
    // ensure it contains known tokens
    expect(supported).toEqual(expect.arrayContaining(['ETH', 'USDT', 'USDC', 'BNB', 'MATIC']));
  });
});
