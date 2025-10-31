import cron from 'node-cron';
import { Opportunity, Token, UserPreference, User } from '../models';
import { dataService, webSocketService } from '../services';
import { EmailService } from '../services/EmailService';
import { TOKEN_CONTRACTS, type SupportedChain, type SupportedToken } from '../config/tokens';
import { Alert } from '../models';
import {
  buildArbitrageContext,
  evaluateOpportunity,
  isOpportunityProfitable,
  upsertOpportunity,
  type ArbitrageContext
} from '../services/ArbitrageService';

interface ScanResult {
  opportunitiesFound: number;
  opportunitiesUpdated: number;
  opportunitiesExpired: number;
  errors: string[];
}

class OpportunityScanner {
  private isRunning: boolean = false;
  private lastScanTime: Date | null = null;
  private scanInterval: number = 60; // minutes

  constructor() {
    this.startScheduledScans();
  }

  public startScheduledScans(): void {
    cron.schedule('0 * * * *', async () => {
      if (!this.isRunning) {
        await this.scanAllOpportunities();
      }
    });

    console.log('🔄 Opportunity scanner started - running every hour');
  }

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

      const context = await buildArbitrageContext();

      // Get all active opportunities to check for expiration
      const activeOpportunities = await Opportunity.find({ status: 'active' });
      for (const opportunity of activeOpportunities) {
        const isStillProfitable = await this.checkOpportunityProfitability(opportunity, context);
        if (!isStillProfitable) {
          opportunity.status = 'expired';
          await opportunity.save();
          result.opportunitiesExpired++;
        }
      }

      // Scan for new opportunities across all chain directions
      for (const tokenSymbol of supportedTokens as SupportedToken[]) {
        for (const chainFrom of supportedChains as SupportedChain[]) {
          for (const chainTo of supportedChains as SupportedChain[]) {
            if (chainFrom === chainTo) {
              continue;
            }

            try {
              const opportunityResult = await this.scanTokenPair(tokenSymbol, chainFrom, chainTo, context);
              if (opportunityResult) {
                if (opportunityResult.isNew) {
                  result.opportunitiesFound++;
                  await this.createOpportunityAlerts(opportunityResult.opportunity);
                } else {
                  result.opportunitiesUpdated++;
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
      // Fetch CEX prices
      const prices = await dataService.fetchTokenPrices();
      const supportedChains = dataService.getSupportedChains();

      for (const priceInfo of prices) {
        const tokenContracts = TOKEN_CONTRACTS[priceInfo.symbol as keyof typeof TOKEN_CONTRACTS] || {};
        for (const chain of supportedChains) {
          if (!Object.prototype.hasOwnProperty.call(tokenContracts, chain)) {
            continue;
          }

          const chainPrice = priceInfo.chainPrices?.[chain] ?? priceInfo.price;
          if (chainPrice === undefined || chainPrice === null) {
            continue;
          }

          await Token.findOneAndUpdate(
            { symbol: priceInfo.symbol, chain: chain },
            {
              currentPrice: chainPrice,
              lastUpdated: new Date(),
              name: priceInfo.symbol,
              decimals: 18,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      }

      // Fetch chain-specific DEX prices for real arbitrage detection
      console.log('🔄 Fetching DEX prices for arbitrage detection...');
      const dexPrices = await dataService.fetchDexPrices();
      
      for (const dexPrice of dexPrices) {
        await Token.findOneAndUpdate(
          { symbol: dexPrice.symbol, chain: dexPrice.chain },
          {
            dexPrice: dexPrice.price,
            dexName: dexPrice.dexName,
            liquidity: dexPrice.liquidity,
            lastUpdated: new Date()
          },
          { new: true }
        );
      }

      console.log(`✅ Refreshed ${prices.length} CEX prices and ${dexPrices.length} DEX prices`);
    } catch (error) {
      console.error('Error refreshing token prices:', error);
      throw error;
    }
  }

  /**
   * Scan a specific token pair for arbitrage opportunities
   */
  private async scanTokenPair(
    tokenSymbol: SupportedToken,
    chainFrom: SupportedChain,
    chainTo: SupportedChain,
    context: ArbitrageContext
  ): Promise<{ opportunity: any; isNew: boolean } | null> {
    try {
      const evaluation = await evaluateOpportunity(tokenSymbol, chainFrom, chainTo, context);
      if (!evaluation) {
        return null;
      }

      const { opportunity, isNew } = await upsertOpportunity(evaluation, context);
      if (!opportunity) {
        return null;
      }

      return evaluation.profitable ? { opportunity, isNew } : null;
    } catch (error) {
      console.error(`Error scanning ${tokenSymbol} ${chainFrom}->${chainTo}:`, error);
      throw error;
    }
  }

  /**
   * Check if an existing opportunity is still profitable
   */
  private async checkOpportunityProfitability(opportunity: any, context: ArbitrageContext): Promise<boolean> {
    try {
      return await isOpportunityProfitable(opportunity, context);
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
          const netProfit = typeof opportunity.netProfit === 'number'
            ? opportunity.netProfit
            : (opportunity.estimatedProfit ?? 0) - (opportunity.gasCost ?? 0);

          const message = `New arbitrage opportunity: ${(opportunity.tokenId as any)?.symbol} ${opportunity.chainFrom} → ${opportunity.chainTo}. Net profit: $${netProfit.toFixed(2)} (${opportunity.roi?.toFixed(1)}% ROI)`;
          
          // Create in-app alert
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
              profit: netProfit,
              roi: opportunity.roi,
            }
          });

          // Send email notification if enabled
          if (preference.notificationSettings?.email) {
            try {
              const user = await User.findById(preference.userId);
              if (user?.email && user?.name) {
                await EmailService.sendOpportunityAlert(
                  user.email,
                  user.name,
                  (opportunity.tokenId as any)?.symbol || opportunity.tokenSymbol,
                  this.formatChainName(opportunity.chainFrom),
                  this.formatChainName(opportunity.chainTo),
                  netProfit,
                  opportunity.roi || 0,
                  opportunity.priceFrom,
                  opportunity.priceTo
                );
                console.log(`📧 Sent opportunity email to ${user.email}`);
              }
            } catch (emailError) {
              console.error('Failed to send opportunity email:', emailError);
              // Continue processing other alerts even if email fails
            }
          }
        }
      }
    } catch (error) {
      console.error('Error creating opportunity alerts:', error);
    }
  }

  /**
   * Format chain name for display
   */
  private formatChainName(chain: string): string {
    const chainMap: Record<string, string> = {
      'polygon': 'Polygon',
      'ethereum': 'Ethereum',
      'bsc': 'BSC',
      'arbitrum': 'Arbitrum',
      'optimism': 'Optimism',
      'avalanche': 'Avalanche'
    };
    return chainMap[chain.toLowerCase()] || chain.charAt(0).toUpperCase() + chain.slice(1);
  }

  /**
   * Check if opportunity meets user's alert thresholds
   */
  private meetsUserThresholds(opportunity: any, preference: any): boolean {
    const thresholds = preference.alertThresholds;
    const netProfit = typeof opportunity.netProfit === 'number'
      ? opportunity.netProfit
      : (opportunity.estimatedProfit ?? 0) - (opportunity.gasCost ?? 0);
    
    return (
      netProfit >= thresholds.minProfit &&
      opportunity.gasCost <= thresholds.maxGasCost &&
      (opportunity.roi || 0) >= thresholds.minROI &&
      opportunity.score >= thresholds.minScore
    );
  }

  /**
   * Determine alert priority based on opportunity metrics
   */
  private getAlertPriority(opportunity: any): 'low' | 'medium' | 'high' | 'urgent' {
    const netProfit = typeof opportunity.netProfit === 'number'
      ? opportunity.netProfit
      : (opportunity.estimatedProfit ?? 0) - (opportunity.gasCost ?? 0);

    if (netProfit > 1000 || (opportunity.roi || 0) > 50) {
      return 'urgent';
    } else if (netProfit > 500 || (opportunity.roi || 0) > 25) {
      return 'high';
    } else if (netProfit > 100 || (opportunity.roi || 0) > 10) {
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
      nextScanIn: this.isRunning ? 'Running now' : '30 minutes'
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
