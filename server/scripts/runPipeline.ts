import dotenv from 'dotenv';
import mongoose from 'mongoose';
import DataPipeline from '../jobs/dataPipeline';
import connectDB from '../config/db';

async function main() {
  dotenv.config();
  await connectDB();
  const pipeline = new DataPipeline({ autoStart: false });
  await pipeline.updateTokenPrices();
  console.log('Token prices updated.');
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
