import type { PriceData } from '../components/features/tables';
import type { ArbitrageData } from '../components/features/tables';
import type { StatData } from '../components/features/dashboard';
import type { TokenPrice } from '../services/api/services/pricesService';
import type { ArbitrageOpportunity } from '../services/api/services/opportunitiesService';

/**
 * Centralized mock data generator for development and testing
 */
export class MockDataGenerator {
  private static instance: MockDataGenerator;
  
  static getInstance(): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator();
    }
    return MockDataGenerator.instance;
  }

  /**
   * Generate mock price data (legacy format)
   */
  generatePriceData(count: number = 6): PriceData[] {
    const tokens = ['ETH', 'USDT', 'USDC'];
    const chains = ['Ethereum', 'BSC', 'Polygon'];
    
    return Array.from({ length: count }, (_, i) => ({
      token: tokens[i % tokens.length],
      chain: chains[i % chains.length],
      currentPrice: `$${(Math.random() * 1000 + 100).toFixed(2)}`,
      lastUpdated: `${Math.floor(Math.random() * 60)}s ago`,
    }));
  }

  /**
   * Generate mock arbitrage opportunities (legacy format)
   */
  generateArbitrageData(count: number = 6): ArbitrageData[] {
    const tokens = ['ETH', 'USDT', 'USDC', 'BNB', 'MATIC'];
    const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum'];
    
    return Array.from({ length: count }, (_, i) => {
      const token = tokens[i % tokens.length];
      const fromChain = chains[i % chains.length];
      const toChain = chains[(i + 1) % chains.length];
      const priceDiff = `+${(Math.random() * 5 + 1).toFixed(1)}%`;
      const gasFee = `$${Math.floor(Math.random() * 20 + 1)}`;
      const estProfit = `$${Math.floor(Math.random() * 100 + 10)}`;
      const score = Math.floor(Math.random() * 25 + 75);
      
      return {
        token,
        from: fromChain,
        to: toChain,
        priceDiff,
        gasFee,
        estProfit,
        score,
      };
    });
  }

  /**
   * Generate mock stats data
   */
  generateStatsData(): StatData[] {
    return [
      {
        title: "Total Opportunities",
        value: "24",
        icon: (
          <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        ),
        color: "cyan" as const
      },
      {
        title: "Active Alerts",
        value: "8",
        icon: (
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 5.5L9 10l-4.5 4.5L0 10l4.5-4.5z" />
          </svg>
        ),
        color: "emerald" as const
      },
      {
        title: "Total Profit",
        value: "$2,847",
        icon: (
          <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        ),
        color: "purple" as const
      },
      {
        title: "Success Rate",
        value: "94%",
        icon: (
          <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: "orange" as const
      }
    ];
  }

  /**
   * Generate mock token prices (API format)
   */
  generateTokenPrices(count: number = 10): TokenPrice[] {
    const tokens = ['ETH', 'BTC', 'USDT', 'USDC', 'BNB', 'MATIC', 'AVAX', 'SOL'];
    const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum'];
    
    return Array.from({ length: count }, (_, i) => {
      const token = tokens[i % tokens.length];
      const chain = chains[i % chains.length];
      const price = Math.random() * 1000 + 100;
      
      return {
        id: `price_${i}`,
        token,
        chain,
        currentPrice: `$${price.toFixed(2)}`,
        change24h: `${(Math.random() - 0.5) * 20}`,
        changePercent: `${((Math.random() - 0.5) * 10).toFixed(2)}%`,
        lastUpdated: `${Math.floor(Math.random() * 60)}s ago`,
        volume: `$${(Math.random() * 1000000 + 100000).toLocaleString()}`,
      };
    });
  }

  /**
   * Generate mock arbitrage opportunities (API format)
   */
  generateArbitrageOpportunities(count: number = 8): ArbitrageOpportunity[] {
    const tokens = ['ETH', 'USDT', 'USDC', 'BNB', 'MATIC', 'AVAX'];
    const chains = ['Ethereum', 'BSC', 'Polygon', 'Arbitrum', 'Optimism'];
    
    return Array.from({ length: count }, (_, i) => {
      const token = tokens[i % tokens.length];
      const fromChain = chains[i % chains.length];
      const toChain = chains[(i + 1) % chains.length];
      const score = Math.floor(Math.random() * 25 + 75);
      
      return {
        id: `opp_${i}`,
        token,
        from: fromChain,
        to: toChain,
        priceDiff: `+${(Math.random() * 5 + 1).toFixed(1)}%`,
        gasFee: `$${Math.floor(Math.random() * 20 + 1)}`,
        estProfit: `$${Math.floor(Math.random() * 100 + 10)}`,
        score,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        status: Math.random() > 0.9 ? 'expired' : 'active' as const,
      };
    });
  }

  /**
   * Generate FAQ data
   */
  generateFAQData() {
    return [
      {
        question: "How does ArbiTrage Pro detect arbitrage opportunities?",
        answer: "Our AI-powered system continuously monitors prices across multiple exchanges and identifies profitable arbitrage opportunities in real-time. We analyze price differences, gas costs, and trading volumes to calculate the most profitable opportunities."
      },
      {
        question: "What is the minimum profit threshold for alerts?",
        answer: "You can set your minimum profit threshold in the settings. Our default recommendation is 1% to ensure profitable opportunities after gas fees and exchange fees."
      },
      {
        question: "Which blockchains are supported?",
        answer: "We currently support Ethereum, Binance Smart Chain (BSC), Polygon, Arbitrum, and Optimism. We're continuously adding support for new blockchains."
      },
      {
        question: "How real-time is the price data?",
        answer: "Our price data is updated every 2 seconds for most tokens and chains. For high-volume tokens, updates occur even more frequently."
      },
      {
        question: "Can I automate my arbitrage trading?",
        answer: "Currently, ArbiTrage Pro provides alerts and recommendations. Automated trading functionality is coming in future updates."
      },
      {
        question: "What are the subscription plans?",
        answer: "We offer a free tier with basic features and pro tiers with advanced analytics, higher frequency updates, and priority support."
      }
    ];
  }
}

// Export singleton instance for easy access
export const mockData = MockDataGenerator.getInstance();
