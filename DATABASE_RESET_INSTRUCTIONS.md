# Database Reset Instructions

## Problem
The database contains old/stale data for tokens that are no longer tracked (USDT, USDC, etc.), causing them to appear in the Price Table even though they shouldn't.

## Solution
Use the database reset script to:
1. Clear all old token, token history, and opportunity data
2. Populate fresh data for only the supported tokens (ETH, BNB, MATIC, XRP, SOL)
3. Create clean initial records with current prices

## How to Reset the Database

### Step 1: Navigate to Server Directory
```bash
cd server
```

### Step 2: Run the Reset Script
```bash
npm run db:reset
```

### Step 3: What the Script Does

The script will:
1. **Connect to MongoDB** - Uses your MONGODB_URI from `.env`
2. **Clear existing data**:
   - All Token records
   - All TokenHistory records
   - All Opportunity records
3. **Fetch fresh prices** from CoinGecko API for:
   - ETH (Ethereum)
   - BNB (Binance Coin)
   - MATIC (Polygon)
   - XRP (Ripple)
   - SOL (Solana)
4. **Create token records** for each token on each supported chain:
   - ethereum
   - polygon
   - bsc
5. **Create history records** for price tracking

### Step 4: Expected Output

You should see output like this:

```
🚀 Starting database reset...

🔌 Connecting to MongoDB...
✅ Connected to MongoDB

🧹 Clearing existing data...
   Found 18 tokens, 150 history records, 25 opportunities
✅ Cleared all existing data

🔄 Fetching fresh token data for supported tokens...
   Supported tokens: ETH, XRP, SOL, BNB, MATIC

   Processing ETH...
      - Creating ETH on ethereum...
      ✅ ETH on ethereum: $3960.0000
      - Creating ETH on polygon...
      ✅ ETH on polygon: $3960.0000
      - Creating ETH on bsc...
      ✅ ETH on bsc: $3960.0000

   Processing XRP...
      - Creating XRP on ethereum...
      ✅ XRP on ethereum: $2.6300
      ...

📈 Summary:
   ✅ Created 15 token records
   ✅ Created 15 history records
   ✅ Success: 15

✨ Database reset complete!

💡 Next steps:
   1. Start the server: npm run dev
   2. The opportunity scanner will run automatically
   3. Check the dashboard for fresh data

📌 Note: DEX prices and liquidity will be populated by the opportunity scanner
```

### Step 5: Start the Server

After the database is reset, start the server:

```bash
npm run dev
```

The opportunity scanner will automatically run and populate:
- DEX prices
- Liquidity data
- Arbitrage opportunities

## What Gets Removed

The following old tokens will be **permanently deleted**:
- USDT (Tether)
- USDC (USD Coin)
- Any other tokens not in the `SUPPORTED_TOKENS` list

## What Gets Created

Fresh records for only these tokens:
- **ETH** (Ethereum) - on ethereum, polygon, bsc
- **BNB** (Binance Coin) - on ethereum, polygon, bsc
- **MATIC** (Polygon) - on ethereum, polygon, bsc
- **XRP** (Ripple) - on ethereum, polygon, bsc
- **SOL** (Solana) - on ethereum, polygon, bsc

## Configuration

The supported tokens and chains are defined in `server/config/tokens.ts`:

```typescript
export const SUPPORTED_TOKENS = ['ETH', 'XRP', 'SOL', 'BNB', 'MATIC'];
export const SUPPORTED_CHAINS = ['ethereum', 'polygon', 'bsc'];
```

## Troubleshooting

### Error: Cannot connect to MongoDB
- Check your `.env` file has `MONGODB_URI` set correctly
- Make sure MongoDB is running (if local)
- Verify network connection (if remote)

### Error: Rate limit exceeded
- The script has built-in delays (1.5s between tokens)
- If you still get rate limited, increase the delay in `resetDatabase.ts`

### Some tokens show "No data available"
- This usually means CoinGecko API temporarily unavailable
- Run the script again after a few minutes
- The opportunity scanner will fill in missing data

### No opportunities after reset
- This is normal - the reset script only creates token price records
- The opportunity scanner runs every 15 minutes and will populate opportunities
- Or manually trigger the scanner after starting the server

## Manual Verification

After reset, verify the database:

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use crypto-arbitrage

# Check token count (should be 15 for 5 tokens × 3 chains)
db.tokens.countDocuments()

# See all tokens
db.tokens.find({}, { symbol: 1, chain: 1, currentPrice: 1 }).pretty()

# Verify no stablecoins
db.tokens.find({ symbol: { $in: ['USDT', 'USDC', 'DAI', 'BUSD'] } }).count()
// Should return 0
```

## Files Modified

1. **Created**: `server/scripts/resetDatabase.ts` - The reset script
2. **Updated**: `server/package.json` - Added `db:reset` command
3. **Reverted**: Client-side filter code (no longer needed)
4. **Reverted**: Server-side filter code (no longer needed)

## Benefits of Database Reset vs Filters

**Before (Filters)**:
- ❌ Old data still in database
- ❌ Filters in multiple places (client + server)
- ❌ Performance overhead filtering on every request
- ❌ Risk of data inconsistency

**After (Clean Database)**:
- ✅ No stale data
- ✅ No filtering needed
- ✅ Better performance
- ✅ Single source of truth

## Regular Maintenance

Consider running the reset script:
- When adding/removing supported tokens
- If you notice stale or incorrect data
- After configuration changes
- As part of deployment process

## Next Steps

After successful database reset:
1. ✅ Price Table will only show ETH, BNB, MATIC, XRP, SOL
2. ✅ No more USDT/USDC appearing
3. ✅ Fresh data from CoinGecko
4. ✅ Opportunity scanner will populate DEX data
5. ✅ Dashboard will show accurate, current information
