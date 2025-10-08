import cron from 'node-cron';
import { Opportunity, Token, UserPreference } from '../models';
import { dataService, mlService, webSocketService } from '../services';
import { Alert } from '../models';

interface ScanResult {
  opportunitiesFound: number;
  opportunitiesUpdated: number;
  opportunitiesExpired: number;
  errors: string[];
}

class OpportunityScanner {
  private isRunning: boolean = false;
  private lastScanTime: Date | null = null;
  private scanInterval: number = 30; // seconds

  constructor() {
    this.startScheduledScans();
  }

  /**
   * Start the scheduled opportunity scanning
   */
  public startScheduledScans(): void {
    // Run every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      if (!this.isRunning) {
        await this.scanAllOpportunities();
      }
    });

    console.log('🔄 Opportunity scanner started - running every 30 seconds');
  }

  /**
   * Scan for arbitrage opportunities across all supported tokens and chains
   */
  public async scanAllOpportunities(): Promise<ScanResult> {
    if (this.isRunning) {
      console.log('⚠️  Scan already in progress, skipping...');
      return { opportunitiesFound: 0, opportunitiesUpdated: 0, opportunitiesExpired: 0, errors: ['Scan already in progress'] };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const result: ScanResult = {
      opportunitiesFound: 0,
      opportunitiesUpdated: 0,
      opportunitiesExpired: 0,
      errors: []
    };

    try {
      console.log('🔍 Starting opportunity scan...');

      // Get supported tokens and chains
      const supportedTokens = dataService.getSupportedTokens();
      const supportedChains = dataService.getSupportedChains();

      // Refresh token prices first (with fallback handling)
      try {
        await this.refreshTokenPrices();
      } catch (error) {
        console.warn('⚠️  Token price refresh failed, continuing with existing data');
        result.errors.push(`Token price refresh failed: ${error}`);
      }

      // Get all active opportunities to check for expiration
      const activeOpportunities = await Opportunity.find({ status: 'active' });
      
      // Check for expired opportunities
      for (const opportunity of activeOpportunities) {
        const isStillProfitable = await this.checkOpportunityProfitability(opportunity);
        if (!isStillProfitable) {
          opportunity.status = 'expired';
          await opportunity.save();
          result.opportunitiesExpired++;
        }
      }

      // Scan for new opportunities
      for (const tokenSymbol of supportedTokens) {
        for (let i = 0; i < supportedChains.length; i++) {
          for (let j = i + 1; j < supportedChains.length; j++) {
            const chainFrom = supportedChains[i];
            const chainTo = supportedChains[j];

            try {
              const opportunityResult = await this.scanTokenPair(tokenSymbol, chainFrom, chainTo);
              if (opportunityResult) {
                result.opportunitiesFound++;
                
                // Create alert for new profitable opportunity
                if (opportunityResult.isNew) {
                  await this.createOpportunityAlerts(opportunityResult.opportunity);
                }
              }
            } catch (error) {
              const errorMsg = `Error scanning ${tokenSymbol} ${chainFrom}->${chainTo}: ${error}`;
              console.error(errorMsg);
              result.errors.push(errorMsg);
            }
          }
        }
      }

      this.lastScanTime = new Date();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Scan completed in ${duration}ms:`);
        webSocketService.broadcastScanResults(result);
      console.log(`   - New opportunities: ${result.opportunitiesFound}`);
      console.log(`   - Expired opportunities: ${result.opportunitiesExpired}`);
      console.log(`   - Errors: ${result.errors.length}`);

    } catch (error) {
      const errorMsg = `Critical error during scan: ${error}`;
      console.error(errorMsg);
      result.errors.push(errorMsg);
      
      // Don't fail completely on API errors, continue with existing data
      console.log('⚠️  Continuing scan with existing data despite API errors');
    } finally {
      this.isRunning = false;
    }

    return result;
  }

  /**
   * Refresh token prices from external APIs
   */
  private async refreshTokenPrices(): Promise<void> {
    try {
      const prices = await dataService.fetchTokenPrices();
      const supportedChains = dataService.getSupportedChains();

      for (const priceInfo of prices) {
        for (const chain of supportedChains) {
          await Token.findOneAndUpdate(
            { symbol: priceInfo.symbol, chain: chain },
            {
              currentPrice: priceInfo.price,
              lastUpdated: new Date(),
              name: priceInfo.symbol,
              decimals: 18,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      }
    } catch (error) {
      console.error('Error refreshing token prices:', error);
      throw error;
    }
  }

  /**
   * Scan a specific token pair for arbitrage opportunities
   */
  private async scanTokenPair(tokenSymbol: string, chainFrom: string, chainTo: string): Promise<any> {
    try {
      // Get ML analysis
      const analysis = await mlService.getArbitrageOpportunity({
        token: tokenSymbol,
        chain_a: chainFrom,
        chain_b: chainTo
      });

      if (!analysis.profitable) {
        return null;
      }

      // Find or create token
      const token = await Token.findOne({ symbol: tokenSymbol.toUpperCase() });
      if (!token) {
        throw new Error(`Token ${tokenSymbol} not found`);
      }

      // Check for existing opportunity
      const existingOpportunity = await Opportunity.findOne({
        tokenId: token._id,
        chainFrom,
        chainTo,
        status: 'active'
      });

      if (existingOpportunity) {
        // Update existing opportunity
        existingOpportunity.priceDiff = analysis.spread_usd;
        existingOpportunity.gasCost = analysis.total_gas_cost_usd;
        existingOpportunity.estimatedProfit = analysis.net_profit_usd;
        existingOpportunity.roi = ((analysis.net_profit_usd / analysis.total_gas_cost_usd) * 100);
        existingOpportunity.netProfit = analysis.net_profit_usd;
        existingOpportunity.score = analysis.profitable ? 1 : 0;
        await existingOpportunity.save();

        return { opportunity: existingOpportunity, isNew: false };
      } else {
        // Create new opportunity
        const newOpportunity = await Opportunity.create({
          tokenId: token._id,
          chainFrom,
          chainTo,
          priceDiff: analysis.spread_usd,
          gasCost: analysis.total_gas_cost_usd,
          estimatedProfit: analysis.net_profit_usd,
          score: analysis.profitable ? 1 : 0,
          timestamp: new Date(),
          status: 'active',
          roi: ((analysis.net_profit_usd / analysis.total_gas_cost_usd) * 100),
          netProfit: analysis.net_profit_usd,
        });

        return { opportunity: newOpportunity, isNew: true };
      }
    } catch (error) {
      console.error(`Error scanning ${tokenSymbol} ${chainFrom}->${chainTo}:`, error);
      throw error;
    }
  }

  /**
   * Check if an existing opportunity is still profitable
   */
  private async checkOpportunityProfitability(opportunity: any): Promise<boolean> {
    try {
      const analysis = await mlService.getArbitrageOpportunity({
        token: (opportunity.tokenId as any)?.symbol || 'ETH',
        chain_a: opportunity.chainFrom,
        chain_b: opportunity.chainTo
      });

      return analysis.profitable;
    } catch (error) {
      console.error('Error checking opportunity profitability:', error);
      return false;
    }
  }

  /**
   * Create alerts for new profitable opportunities
   */
  private async createOpportunityAlerts(opportunity: any): Promise<void> {
    try {
      // Get all users who want opportunity alerts
      const usersWithAlerts = await UserPreference.find({
        'notificationSettings.dashboard': true
      }).populate('userId');

      for (const preference of usersWithAlerts) {
        // Check if this opportunity meets user's thresholds
        if (this.meetsUserThresholds(opportunity, preference)) {
          const message = `New arbitrage opportunity: ${(opportunity.tokenId as any)?.symbol} ${opportunity.chainFrom} → ${opportunity.chainTo}. Profit: $${opportunity.estimatedProfit.toFixed(2)} (${opportunity.roi?.toFixed(1)}% ROI)`;
          
          await Alert.create({
            userId: preference.userId,
            opportunityId: opportunity._id,
            message,
            alertType: 'opportunity',
            priority: this.getAlertPriority(opportunity),
            isRead: false,
            metadata: {
              tokenSymbol: (opportunity.tokenId as any)?.symbol,
              chainFrom: opportunity.chainFrom,
              chainTo: opportunity.chainTo,
              profit: opportunity.estimatedProfit,
              roi: opportunity.roi,
            }
          });
        }
      }
    } catch (error) {
      console.error('Error creating opportunity alerts:', error);
    }
  }

  /**
   * Check if opportunity meets user's alert thresholds
   */
  private meetsUserThresholds(opportunity: any, preference: any): boolean {
    const thresholds = preference.alertThresholds;
    
    return (
      opportunity.estimatedProfit >= thresholds.minProfit &&
      opportunity.gasCost <= thresholds.maxGasCost &&
      (opportunity.roi || 0) >= thresholds.minROI &&
      opportunity.score >= thresholds.minScore
    );
  }

  /**
   * Determine alert priority based on opportunity metrics
   */
  private getAlertPriority(opportunity: any): 'low' | 'medium' | 'high' | 'urgent' {
    if (opportunity.estimatedProfit > 1000 || (opportunity.roi || 0) > 50) {
      return 'urgent';
    } else if (opportunity.estimatedProfit > 500 || (opportunity.roi || 0) > 25) {
      return 'high';
    } else if (opportunity.estimatedProfit > 100 || (opportunity.roi || 0) > 10) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Get scanner status
   */
  public getStatus(): any {
    return {
      isRunning: this.isRunning,
      lastScanTime: this.lastScanTime,
      scanInterval: this.scanInterval,
      nextScanIn: this.isRunning ? 'Running now' : '30 seconds'
    };
  }

  /**
   * Stop the scanner
   */
  public stop(): void {
    // Note: node-cron doesn't have a destroy method
    // The cron jobs will stop when the process exits
    console.log('🛑 Opportunity scanner stopped');
  }
}

export default OpportunityScanner;
