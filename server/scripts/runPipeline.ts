import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DataPipeline from '../jobs/dataPipeline';
import OpportunityScanner from '../jobs/opportunityScanner';
import connectDB from '../config/db';

async function main() {
  dotenv.config();
  await connectDB();
  
  console.log('🚀 Starting full data pipeline...\n');
  
  // Step 1: Update token prices (CEX + DEX)
  console.log('📊 Step 1: Updating token prices...');
  const pipeline = new DataPipeline({ autoStart: false });
  await pipeline.updateTokenPrices();
  console.log('✅ Token prices updated.\n');
  
  // Step 2: Scan for arbitrage opportunities
  console.log('🔍 Step 2: Scanning for arbitrage opportunities...');
  const scanner = new OpportunityScanner();
  const result = await scanner.scanAllOpportunities();
  console.log('✅ Opportunity scan complete:');
  console.log(`   - Found: ${result.opportunitiesFound}`);
  console.log(`   - Updated: ${result.opportunitiesUpdated}`);
  console.log(`   - Expired: ${result.opportunitiesExpired}`);
  if (result.errors.length > 0) {
    console.log(`   - Errors: ${result.errors.length}`);
    result.errors.forEach(err => console.log(`     ⚠️  ${err}`));
  }
  
  console.log('\n✅ Pipeline complete!');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('❌ Pipeline error:', err);
  process.exit(1);
});
