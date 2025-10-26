import mongoose from 'mongoose';
import DataService from '../services/DataService';

async function main() {
  try {
    const dataService = DataService.getInstance();
    const prices = await dataService.fetchTokenPrices();
    console.log('Prices:', JSON.stringify(prices, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

main();
