import cron from 'node-cron';
import { dataService, webSocketService } from '../services';
import { Token, TokenHistory } from '../models';
import { TOKEN_CONTRACTS } from '../config/tokens';

interface PipelineStatus {
  isRunning: boolean;
  lastPriceUpdate: Date | null;
  lastGasUpdate: Date | null;
  errors: string[];
  totalTokensUpdated: number;
}

class DataPipeline {
  private isRunning: boolean = false;
  private status: PipelineStatus = {
    isRunning: false,
    lastPriceUpdate: null,
    lastGasUpdate: null,
    errors: [],
    totalTokensUpdated: 0
  };

  constructor(options?: { autoStart?: boolean }) {
    // By default, autoStart is true to preserve existing behavior.
    const autoStart = options?.autoStart !== false;
    if (autoStart) {
      this.startDataPipeline();
      // Kick off an initial update so prices are available before the first cron tick.
      this.updateTokenPrices().catch((err) => {
        console.error('Initial token price update failed:', err);
        this.status.errors.push(`Initial token update failed: ${err instanceof Error ? err.message : err}`);
      });
    }
  }

  /**
   * Start the data pipeline with scheduled tasks
   */
  public startDataPipeline(): void {
    // Update token prices every hour
    cron.schedule('0 * * * *', async () => {
      await this.updateTokenPrices();
    });

    // Update gas prices every hour
    cron.schedule('0 * * * *', async () => {
      await this.updateGasPrices();
    });

    // Clean up old data every hour
    cron.schedule('0 * * * *', async () => {
      await this.cleanupOldData();
    });

    console.log('🔄 Data pipeline started:');
    console.log('   - Token prices: every hour');
    console.log('   - Gas prices: every hour');
    console.log('   - Data cleanup: every hour');
  }

  /**
   * Update token prices from external APIs
   */
  public async updateTokenPrices(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Price update already in progress, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log('💰 Updating token prices...');

      const prices = await dataService.fetchTokenPrices();
    const supportedChains = dataService.getSupportedChains();
    let tokensUpdated = 0;
    const snapshotTime = new Date();
    const historyBatch: Array<{ symbol: string; chain: string; price: number; collectedAt: Date; source: string }> = [];

      // Respect backoff / empty results
      if (!prices || prices.length === 0) {
        console.log('No price data returned (possible backoff). Skipping token upserts.');
      } else {
        for (const priceInfo of prices) {
          const tokenContracts = TOKEN_CONTRACTS[priceInfo.symbol as keyof typeof TOKEN_CONTRACTS] || {};
          for (const chain of supportedChains) {
            // Skip if token not mapped to this chain
            if (!Object.prototype.hasOwnProperty.call(tokenContracts, chain)) continue;

            const contractAddr = tokenContracts[chain as keyof typeof tokenContracts];
            const chainPrice = priceInfo.chainPrices?.[chain] ?? priceInfo.price;
            if (chainPrice === undefined || chainPrice === null) continue;
            const update: any = {
              currentPrice: chainPrice,
              lastUpdated: new Date(),
              name: priceInfo.symbol,
              decimals: 18,
            };

            if (contractAddr && contractAddr !== 'NATIVE') {
              update.contractAddress = contractAddr.toLowerCase();
            }

            const result = await Token.findOneAndUpdate(
              { symbol: priceInfo.symbol, chain: chain },
              update,
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (result) tokensUpdated++;

            historyBatch.push({
              symbol: priceInfo.symbol,
              chain,
              price: chainPrice,
              collectedAt: snapshotTime,
              source: 'dexscreener'
            });
          }
        }
      }

      if (historyBatch.length > 0) {
        try {
          await TokenHistory.insertMany(historyBatch, { ordered: false });
          console.log(`🗃️  Recorded ${historyBatch.length} historical price points.`);
        } catch (historyErr: any) {
          console.error('Error recording token history:', historyErr?.message || historyErr);
        }
      }

      this.status.lastPriceUpdate = new Date();
      this.status.totalTokensUpdated = tokensUpdated;
      this.status.errors = []; // Clear previous errors on success

      const duration = Date.now() - startTime;
      console.log(`✅ Updated ${tokensUpdated} CEX token prices in ${duration}ms`);

      // Now fetch DEX prices for chain-specific arbitrage
      await this.updateDexPrices();

    } catch (error) {
      const errorMsg = `Error updating token prices: ${error}`;
      console.error(errorMsg);
      this.status.errors.push(errorMsg);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Update DEX prices for chain-specific arbitrage detection
   */
  public async updateDexPrices(): Promise<void> {
    const startTime = Date.now();

    try {
      console.log('💱 Updating DEX prices from DexScreener...');

      const dexPrices = await dataService.fetchDexPrices();
      let tokensUpdated = 0;

      if (!dexPrices || dexPrices.length === 0) {
        console.log('No DEX price data returned. Skipping DEX price updates.');
        return;
      }

      // Update each token with its chain-specific DEX price
      for (const dexPrice of dexPrices) {
        try {
          const update = {
            dexPrice: dexPrice.price,
            dexName: dexPrice.dexName,
            liquidity: dexPrice.liquidity,
            lastUpdated: new Date()
          };

          const result = await Token.findOneAndUpdate(
            { symbol: dexPrice.symbol, chain: dexPrice.chain },
            update,
            { new: true }
          );

          if (result) {
            tokensUpdated++;
            // Only log if there's a significant price
            if (tokensUpdated <= 3 || dexPrice.price > 100) {
              console.log(`  ✓ ${dexPrice.symbol}/${dexPrice.chain}: $${dexPrice.price.toFixed(2)}`);
            }
          }
        } catch (err) {
          console.error(`Error updating DEX price for ${dexPrice.symbol}/${dexPrice.chain}:`, err);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Updated ${tokensUpdated} DEX token prices in ${duration}ms`);

    } catch (error) {
      const errorMsg = `Error updating DEX prices: ${error}`;
      console.error(errorMsg);
      this.status.errors.push(errorMsg);
    }
  }

  /**
   * Update gas prices for all supported chains
   */
  public async updateGasPrices(): Promise<void> {
    try {
      console.log('⛽ Updating gas prices...');

      const supportedChains = dataService.getSupportedChains();
      const gasPrices: { [chain: string]: number } = {};

      for (const chain of supportedChains) {
        try {
          let gasPrice: any;
          if (chain === 'ethereum') {
            gasPrice = await dataService.fetchEthereumGasPrice();
          } else if (chain === 'polygon') {
            gasPrice = await dataService.fetchPolygonGasPrice();
          } else if (chain === 'bsc') {
            gasPrice = await dataService.fetchBSCGasPrice();
          } else {
            throw new Error(`Unsupported chain: ${chain}`);
          }
          gasPrices[chain] = gasPrice.gasPrice;
        } catch (error) {
          console.error(`Error fetching gas price for ${chain}:`, error);
          this.status.errors.push(`Gas price error for ${chain}: ${error}`);
        }
      }

      this.status.lastGasUpdate = new Date();
      console.log('✅ Gas prices updated:', gasPrices);

    } catch (error) {
      const errorMsg = `Error updating gas prices: ${error}`;
      console.error(errorMsg);
      this.status.errors.push(errorMsg);
    }
  }

  /**
   * Clean up old data to maintain database performance
   */
  public async cleanupOldData(): Promise<void> {
    try {
      console.log('🧹 Starting data cleanup...');

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep data for 7 days

      // Clean up old expired opportunities
      const expiredOpportunities = await require('../models').Opportunity.deleteMany({
        status: 'expired',
        updatedAt: { $lt: cutoffDate }
      });

      // Clean up old read alerts
      const oldAlerts = await require('../models').Alert.deleteMany({
        isRead: true,
        createdAt: { $lt: cutoffDate }
      });

      const historyCutoff = new Date();
      historyCutoff.setDate(historyCutoff.getDate() - 90);
      const removedHistory = await TokenHistory.deleteMany({ collectedAt: { $lt: historyCutoff } });

      console.log(`✅ Cleanup completed:`);
      console.log(`   - Removed ${expiredOpportunities.deletedCount} old expired opportunities`);
      console.log(`   - Removed ${oldAlerts.deletedCount} old read alerts`);
      console.log(`   - Removed ${removedHistory.deletedCount} token history snapshots older than 90 days`);

    } catch (error) {
      const errorMsg = `Error during cleanup: ${error}`;
      console.error(errorMsg);
      this.status.errors.push(errorMsg);
    }
  }

  /**
   * Force update all data (for manual triggers)
   */
  public async forceUpdateAll(): Promise<void> {
    console.log('🔄 Force updating all data...');
    
    await Promise.all([
      this.updateTokenPrices(),
      this.updateGasPrices()
    ]);

    console.log('✅ Force update completed');
  }

  /**
   * Get pipeline status
   */
  public getStatus(): PipelineStatus {
    return {
      ...this.status,
      isRunning: this.isRunning
    };
  }

  /**
   * Get health check information
   */
  public getHealthCheck(): any {
    const now = new Date();
    const lastPriceUpdate = this.status.lastPriceUpdate;
    const lastGasUpdate = this.status.lastGasUpdate;

    return {
      status: 'healthy',
      isRunning: this.isRunning,
      lastPriceUpdate: lastPriceUpdate,
      lastGasUpdate: lastGasUpdate,
      priceUpdateAge: lastPriceUpdate ? Math.floor((now.getTime() - lastPriceUpdate.getTime()) / 1000) : null,
      gasUpdateAge: lastGasUpdate ? Math.floor((now.getTime() - lastGasUpdate.getTime()) / 1000) : null,
      totalTokensUpdated: this.status.totalTokensUpdated,
      recentErrors: this.status.errors.slice(-5), // Last 5 errors
      uptime: process.uptime()
    };
  }

  /**
   * Stop the data pipeline
   */
  public stop(): void {
    // Note: node-cron doesn't have a destroy method
    // The cron jobs will stop when the process exits
    this.isRunning = false;
    console.log('🛑 Data pipeline stopped');
  }
}

export default DataPipeline;
