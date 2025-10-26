import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Token from '../models/Token';
import TokenHistory from '../models/TokenHistory';
import Opportunity from '../models/Opportunity';
import { SUPPORTED_TOKENS, SUPPORTED_CHAINS, TOKEN_CONTRACTS, getTokenName, SupportedToken, SupportedChain } from '../config/tokens';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-arbitrage';

// CoinGecko API configuration
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const COINGECKO_IDS: Record<SupportedToken, string> = {
  ETH: 'ethereum',
  BNB: 'binancecoin',
  MATIC: 'matic-network',
  XRP: 'ripple',
  SOL: 'solana'
};

/**
 * Fetch token price from CoinGecko
 */
async function fetchTokenPrice(symbol: SupportedToken): Promise<number | null> {
  try {
    const coinId = COINGECKO_IDS[symbol];
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd'
      }
    });
    
    const data = response.data as Record<string, { usd?: number }>;
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error(`Failed to fetch price for ${symbol}:`, error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

/**
 * Reset Database Script
 * 
 * This script will:
 * 1. Clear all old token, token history, and opportunity data
 * 2. Populate fresh token data for supported tokens only (ETH, BNB, MATIC, XRP)
 * 3. Fetch current prices from APIs
 * 4. Create initial token history records
 */

async function resetDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Clear existing data
    console.log('\n🧹 Clearing existing data...');
    
    const tokenCount = await Token.countDocuments();
    const historyCount = await TokenHistory.countDocuments();
    const opportunityCount = await Opportunity.countDocuments();
    
    console.log(`   Found ${tokenCount} tokens, ${historyCount} history records, ${opportunityCount} opportunities`);
    
    await Token.deleteMany({});
    await TokenHistory.deleteMany({});
    await Opportunity.deleteMany({});
    
    console.log('✅ Cleared all existing data');

    // Step 2: Fetch fresh token data
    console.log('\n🔄 Fetching fresh token data for supported tokens...');
    console.log(`   Supported tokens: ${SUPPORTED_TOKENS.join(', ')}`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const symbol of SUPPORTED_TOKENS) {
      console.log(`\n   Processing ${symbol}...`);
      
      // Fetch current price from CoinGecko
      const currentPrice = await fetchTokenPrice(symbol);
      
      if (!currentPrice) {
        console.log(`      ⚠️  Could not fetch price for ${symbol}, skipping...`);
        errorCount++;
        continue;
      }
      
      const tokenName = getTokenName(symbol);
      const chains = Object.keys(TOKEN_CONTRACTS[symbol]) as SupportedChain[];
      
      for (const chain of chains) {
        try {
          console.log(`      - Creating ${symbol} on ${chain}...`);
          
          // Create token record with basic data
          const token = new Token({
            symbol: symbol,
            name: tokenName,
            chain: chain,
            currentPrice: currentPrice,
            dexPrice: null, // Will be populated by opportunity scanner
            dexName: null,
            liquidity: null,
            volume24h: null,
            priceChange24h: null,
            lastUpdated: new Date()
          });
          
          await token.save();
          
          // Create initial history record
          const history = new TokenHistory({
            symbol: symbol,
            chain: chain,
            price: currentPrice,
            timestamp: new Date()
          });
          
          await history.save();
          
          console.log(`      ✅ ${symbol} on ${chain}: $${currentPrice.toFixed(4)}`);
          successCount++;
        } catch (error) {
          console.error(`      ❌ ${symbol} on ${chain}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          errorCount++;
        }
      }
      
      // Add delay to respect CoinGecko rate limits
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Step 4: Summary
    console.log('\n📈 Summary:');
    const finalTokenCount = await Token.countDocuments();
    const finalHistoryCount = await TokenHistory.countDocuments();
    
    console.log(`   ✅ Created ${finalTokenCount} token records`);
    console.log(`   ✅ Created ${finalHistoryCount} history records`);
    console.log(`   ✅ Success: ${successCount}`);
    if (errorCount > 0) {
      console.log(`   ⚠️  Errors: ${errorCount}`);
    }

    console.log('\n✨ Database reset complete!');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the server: npm run dev');
    console.log('   2. The opportunity scanner will run automatically');
    console.log('   3. Check the dashboard for fresh data');
    console.log('\n📌 Note: DEX prices and liquidity will be populated by the opportunity scanner');


  } catch (error) {
    console.error('\n❌ Error resetting database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
console.log('🚀 Starting database reset...\n');
resetDatabase();
