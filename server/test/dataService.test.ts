import DataService from '../services/DataService';
import { SUPPORTED_TOKENS } from '../config/tokens';

describe('DataService helpers', () => {
  test('getSupportedTokens returns configured tokens', () => {
    const ds = DataService.getInstance();
    const supported = ds.getSupportedTokens();
    expect(Array.isArray(supported)).toBe(true);
    expect(supported.length).toBeGreaterThan(0);
    // ensure it contains known tokens
  expect(supported).toEqual(expect.arrayContaining(['ETH', 'XRP', 'SOL', 'BNB', 'MATIC']));
  });
});
