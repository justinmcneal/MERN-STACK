import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import DataPipeline from '../../server/jobs/dataPipeline';
import TokenModel from '../../server/models/Token';
import { TOKEN_CONTRACTS } from '../../server/config/tokens';

describe('DataPipeline integration', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  test('updateTokenPrices creates token documents with currentPrice and lastUpdated', async () => {
    // Mock CoinGecko response for simple/price
    const cgData = {
      data: {
        ethereum: { usd: 1800 },
        tether: { usd: 1 },
        'usd-coin': { usd: 1 },
        binancecoin: { usd: 300 },
        'matic-network': { usd: 0.8 }
      }
    };

    mockedAxios.get.mockImplementation((url: string) => {
      if (url.includes('/simple/price')) {
        return Promise.resolve(cgData as any);
      }
      // fallback for other calls
      return Promise.resolve({ data: {} } as any);
    });

  const pipeline = new DataPipeline({ autoStart: false });

    // Run updateTokenPrices directly
    await pipeline.updateTokenPrices();

    // Verify tokens created according to TOKEN_CONTRACTS
    const checks: Array<[string, string]> = [];
    for (const symbol of Object.keys(TOKEN_CONTRACTS)) {
      const mapping = (TOKEN_CONTRACTS as any)[symbol] || {};
      for (const chain of Object.keys(mapping)) {
        checks.push([symbol, chain]);
      }
    }

    // For each symbol-chain mapping, assert a Token doc exists and has price & lastUpdated
    for (const [symbol, chain] of checks) {
      const doc = await TokenModel.findOne({ symbol, chain });
      expect(doc).not.toBeNull();
      if (doc) {
        expect(typeof doc.currentPrice).toBe('number');
        expect(doc.lastUpdated).toBeInstanceOf(Date);
      }
    }
  }, 20000);
});
