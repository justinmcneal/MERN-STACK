# Dashboard Data Analysis & Fixes

## Issues Identified

### 1. Missing DEX Prices (XRP, ETH on BSC, some USDT)

**Root Cause:**
- `MIN_LIQUIDITY_USD = 2500` in `DataService.ts` filters out illiquid pools
- XRP and ETH on certain chains don't have sufficient DEX liquidity
- Stablecoin price validation filters out anomalous prices

**Impact:**
- Tokens without DEX prices show "—" for Spread and Liquidity
- Can't calculate arbitrage opportunities for these tokens

**Solutions:**

#### Option A: Lower Liquidity Threshold (Quick Fix)
```typescript
// In server/services/DataService.ts line 13
const MIN_LIQUIDITY_USD = 1000; // Lower from 2500 to 1000
```
**Pros:** More DEX prices available
**Cons:** May include noisier/less reliable prices

#### Option B: Add Fallback Mechanism (Better)
```typescript
// Add a second-tier threshold for display purposes
const MIN_LIQUIDITY_FOR_TRADING = 2500;
const MIN_LIQUIDITY_FOR_DISPLAY = 500;
```
- Use higher threshold for actual arbitrage trading
- Use lower threshold for price display on dashboard

#### Option C: Add Multiple DEX Support
- Currently only queries one DEX per chain
- Add support for more DEXes: SushiSwap, Balancer, etc.

### 2. Only BNB Showing Arbitrage Opportunities

**Root Causes:**

1. **ML Service Returning Score = 0**
   - Check if ML service is running
   - Check logs for ML prediction errors
   - Fallback score calculation needed

2. **Incorrect Price Comparison**
   - System compares CEX prices across different chains
   - BNB price discrepancy ($1,119 vs $1,523) seems wrong
   - Wrapped tokens (WBNB, WETH) might have different prices than native

3. **Missing DEX Prices Block Arbitrage**
   - XRP: No DEX prices → No arbitrage detection
   - ETH on BSC: No DEX price → Can't calculate spread

**Solutions:**

#### Fix 1: Debug BNB Price Discrepancy
```bash
# Check current token prices in database
cd server
npx ts-node -e "
import Token from './models/Token';
import mongoose from 'mongoose';
mongoose.connect(process.env.MONGO_URI);
Token.find({ symbol: 'BNB' }).then(tokens => {
  console.log(JSON.stringify(tokens, null, 2));
  process.exit(0);
});
"
```

#### Fix 2: Add Fallback Scoring
```typescript
// In ArbitrageService.ts
if (!options?.skipScoring && profitable) {
  try {
    const prediction = await mlService.getPrediction({...});
    score = Math.max(0, Math.min(1, Number(prediction.score ?? 0)));
  } catch (error) {
    // Fallback: Simple heuristic scoring
    const profitRatio = netProfitUsd / tradeUsdAmount;
    score = Math.min(1, profitRatio * 2); // 50% profit = score of 1.0
  }
}
```

#### Fix 3: Better Logging
```typescript
// Add detailed logging to understand why opportunities are filtered
console.log(`[Arbitrage] ${symbol} ${chainFrom}→${chainTo}:`, {
  priceFrom,
  priceTo,
  spread: priceDiffPercent,
  profit: netProfitUsd,
  score,
  profitable,
  anomalies: anomalyFlags
});
```

### 3. Data Quality Issues

**Observations:**
- USDC on BSC shows $0.0000 (clearly wrong)
- USDT shows $0.00073 on some chains (also wrong)
- BNB price varies dramatically between chains

**Likely Causes:**
1. Token address mismatches (native vs wrapped)
2. Price feed returning stale/incorrect data
3. Decimal conversion issues

**Solutions:**

#### Verify Token Addresses
```typescript
// Check server/config/tokens.ts
// Ensure correct contract addresses for each chain
export const TOKEN_ADDRESSES = {
  BNB: {
    ethereum: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', // BNB token
    bsc: 'NATIVE', // Native BNB
    polygon: null // BNB doesn't exist on Polygon
  },
  // ...
};
```

#### Add Price Validation
```typescript
// Reject obviously wrong prices
if (priceUsd < 0.0001 || priceUsd > 1000000) {
  console.warn(`Rejecting suspicious price for ${symbol}: ${priceUsd}`);
  return null;
}
```

## Recommended Action Plan

### Phase 1: Quick Wins (Do First)
1. ✅ Lower MIN_LIQUIDITY_USD to 1000-1500
2. ✅ Add fallback scoring mechanism
3. ✅ Fix stablecoin price validation (allow $0.95-$1.05 range)

### Phase 2: Data Quality (High Priority)
1. Verify token addresses in config
2. Add comprehensive price validation
3. Check ML service health/logs
4. Add better error logging

### Phase 3: Feature Improvements
1. Support multiple DEXes per chain
2. Add price history validation (reject sudden 10x changes)
3. Implement proper logger (Winston)
4. Add database indexes for performance

## Testing Steps

1. **Check Current Data:**
   ```bash
   cd server
   npm run dev
   # Check logs for DexScreener responses
   ```

2. **Manually Trigger Scan:**
   ```bash
   npx ts-node scripts/runPipeline.ts
   ```

3. **Verify Database:**
   ```javascript
   // In MongoDB shell or Compass
   db.tokens.find({ symbol: "BNB" })
   db.opportunities.find({ status: "active" })
   ```

4. **Check ML Service:**
   ```bash
   cd ../llm
   python service.py  # Should start on port 8001
   ```

## Expected Results After Fixes

- **Price Table**: All tokens should show DEX prices (if pools exist)
- **Arbitrage Table**: More opportunities visible (ETH, MATIC if spreads exist)
- **Scores**: Non-zero scores for legitimate opportunities
- **Stablecoin Prices**: Show correct $0.99-$1.01 range
