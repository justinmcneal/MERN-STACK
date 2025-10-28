import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db';
import OpportunityScanner from '../jobs/opportunityScanner';

async function main() {
  dotenv.config();
  await connectDB();
  
  console.log('🔄 Re-scanning opportunities with ML scoring...');
  const scanner = new OpportunityScanner();
  const result = await scanner.scanAllOpportunities();
  
  console.log('\n📊 Scan Results:');
  console.log(`   New opportunities: ${result.opportunitiesFound}`);
  console.log(`   Updated opportunities: ${result.opportunitiesUpdated}`);
  console.log(`   Expired opportunities: ${result.opportunitiesExpired}`);
  console.log(`   Errors: ${result.errors.length}`);
  
  if (result.errors.length > 0) {
    console.log('\n❌ Errors:');
    result.errors.forEach((err: string) => console.log(`   - ${err}`));
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Done!');
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
