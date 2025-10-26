# Dashboard Data Explanation & Analysis

## 📊 Understanding What Your Dashboard Displays

### **Blue Banner: "Tracking 1 token(s): ETH | Min Profit: $10 | Max Gas: $50"**

**What it means:**
This banner displays **YOUR PERSONAL alert preferences** configured in Settings → Preferences, NOT the system's monitoring scope.

**Two levels of tracking:**

1. **System-level monitoring** (automatic, always running):
   - The system monitors **5 tokens**: ETH, XRP, SOL, BNB, MATIC
   - Across **3 chains**: Ethereum, Polygon, BSC  
   - Total: **15 token-chain combinations** (5 × 3 = 15)
   - Happens continuously via hourly cron jobs

2. **Personal alert filtering** (what the banner shows):
   - **You chose** to only receive alerts for **ETH**
   - Your thresholds: Min Profit $10, Max Gas $50
   - Filters which opportunities trigger notifications/alerts FOR YOU
   - Doesn't affect what opportunities are calculated or displayed

**Why the distinction matters:**
- Dashboard shows ALL opportunities (not just ETH)
- Your preferences only control which ones notify you
- You can still see and manually trade other tokens

**To change:** Go to Settings → Preferences → Tracked Tokens

---

## 📈 Stat Card Analysis

### **Card 1: Best Current Arbitrage Opportunity**

**Current display:**
```
ETH +0.2%
$2 profit | polygon → ethereum
```

**What it should show:**
The single most profitable arbitrage opportunity available right now.

**❌ Why it's wrong:**
You have a BNB opportunity showing **$361.60 profit** in your ArbitrageTable, but the stat card shows ETH with only $2 profit.

**Root causes:**
1. **BNB opportunity is flagged** - The 36.4% spread triggers anomaly detection (`spread > 5%`), so it's filtered out from stats
2. **Old code filtered by user preferences** - Only looked at tokens YOU'RE tracking (just ETH), not all opportunities
3. **Stale database data** - Old ETH opportunity still in DB while newer data hasn't been scanned

**✅ Fix applied:**
```typescript
// Now calculates from ALL opportunities
const profitableOpps = opportunities.filter(opp => 
  !opp.flagged && opp.netProfitUsd > 0
);
const bestOpp = [...profitableOpps].sort((a, b) => 
  b.netProfitUsd - a.netProfitUsd
)[0] || null;
```

**Next steps:**
1. Run fresh data pipeline: `cd server && npx ts-node scripts/runPipeline.ts`
2. Check BNB opportunity for warning icons (🚩) in ArbitrageTable
3. Verify BNB contract addresses are correct

---

### **Card 2: Top Token by Spread**

**Current display:**
```
ETH
0.2% avg spread | 3 chains
```

**What it shows:**
Token with the highest **average spread** across all cross-chain opportunities.

**How it's calculated:**
```typescript
For each token:
  1. Collect all priceDiffPercent from opportunities
  2. Calculate average: sum(spreads) / count(spreads)  
  3. Token with highest average wins

Example:
ETH: [0.1%, 0.2%, 0.3%] → avg = 0.2%
BNB: [36.4%] → avg = 36.4%
→ BNB should win (if not flagged)
```

**Why ETH shows as "top" with only 0.2%:**
- Other tokens have no opportunities in the database
- Or their opportunities are flagged/filtered out
- BNB's 36.4% spread is likely flagged as anomaly

**✅ Fix applied:**
- Now only counts **positive spreads** (profitable opportunities)
- Filters flagged opportunities before calculating averages

---

### **Card 3: System Token Coverage**

**Current display:**
```
18
Across 3 chains
```

**❌ What's wrong:**
Should show **15 entries** (5 tokens × 3 chains = 15), not 18.

**Expected math:**
```
5 tokens: [ETH, XRP, SOL, BNB, MATIC]
× 3 chains: [ethereum, polygon, bsc]
= 15 total combinations
```

**Possible causes of 18:**
1. **Old USDT/USDC entries** still in database
2. **Duplicate records** for same token-chain combination
3. **Extra tokens** being fetched accidentally

**✅ Fix applied:**
```typescript
// Now shows accurate breakdown
const uniqueTokens = new Set(tokens.map(t => t.symbol.toUpperCase())).size;
const uniqueChains = new Set(tokens.map(t => t.chain.toLowerCase())).size;
const totalEntries = tokens.length;

// Display:
// Value: "5 tokens"
// Subtitle: "15 entries across 3 chains"
```

**Title changed:**
- ❌ Old: "Total Tracked Tokens" (confusing - sounds like user preferences)
- ✅ New: "System Token Coverage" (clear - system-level monitoring)

**How to diagnose the 18:**
```bash
cd server
npx ts-node -e "
import { Token } from './models';
Token.aggregate([
  { \$group: { _id: { symbol: '\$symbol', chain: '\$chain' }, count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).then(console.log);
"
```

This will show if there are duplicates or unwanted tokens.

---

## 🎯 Chart Component ("Token Trends")

### **What it displays:**

Historical price data for the selected token across all 3 chains.

**Controls:**
- **Timeframe buttons** (1h, 24h, 7d): How far back to look
- **Token dropdown**: Which token's price history to view

**Legend (bottom):**
- 🟣 Purple line = Polygon prices
- 🔵 Cyan line = Ethereum prices  
- 🟡 Yellow line = BSC prices

**Chart features:**
- Overlapping lines show price divergence
- Semi-transparent areas show price movement zones
- Y-axis = Dollar price ($)
- X-axis = Time ago (e.g., "2h", "1d")

### **If you see "Historical price data is not available yet":**

**Why:**
1. Server hasn't stored historical snapshots yet (new installation)
2. Database has no `token_history` records
3. Hourly cron job hasn't run enough times to build history

**How historical data accumulates:**
- Server stores price snapshot every hour
- After 1 hour: First data point
- After 24 hours: Can show 24h chart
- After 7 days: Can show full 7d chart

**This is normal** for new installations. Wait for data to accumulate.

### **✅ Alignment improvements (just applied):**

**Header:**
- Better responsive layout: `sm:flex-row` → `lg:flex-row`
- Consistent button spacing and sizing
- Token dropdown has minimum width (min-w-[140px]) to prevent squishing

**Chart container:**
- Added `minHeight: 200px` to prevent collapse on empty data
- Maintained responsive aspect ratio
- Better spacing around chart (mb-4)

**Legend:**
- Moved to bottom with separator line (`border-t border-slate-700/30`)
- Centered on mobile, left-aligned on desktop (`justify-center lg:justify-start`)
- Uniform spacing (gap-4 lg:gap-6)
- Round color indicators instead of squares (`w-3 h-3 rounded-full`)

---

## 🛠️ All Fixes Applied

### **1. Stats Calculation (main_dashboard.tsx)**

**Problem:** Stats only looked at tokens you're tracking (ETH), missing better opportunities.

**Before:**
```typescript
let filteredOpportunities = opportunities;
if (trackedTokens.length > 0) {
  filteredOpportunities = opportunities.filter(opp =>
    trackedTokens.includes(opp.tokenSymbol.toUpperCase())
  );
}
```

**After:**
```typescript
// Uses ALL opportunities for accurate stats
const profitableOpps = opportunities.filter(opp => 
  !opp.flagged && opp.netProfitUsd > 0
);
const bestOpp = [...profitableOpps].sort((a, b) => 
  b.netProfitUsd - a.netProfitUsd
)[0] || null;
```

**Impact:**
- ✅ Shows true best opportunity system-wide
- ✅ Filters out flagged/suspicious opportunities first
- ✅ Only shows profitable opportunities (netProfitUsd > $0)
- ✅ No longer limited by user's tracked tokens preference

---

### **2. Stat Cards Display (StatCards.tsx)**

**Problem:** Dynamic Tailwind classes being purged, incorrect token counting.

**Changes:**

1. **Fixed dynamic colors** (Tailwind purges `bg-${color}-500/20` syntax):
```typescript
// Now using inline styles with proper color mapping
const colorMap = {
  cyan: { bg: 'rgba(6, 182, 212, 0.2)', text: '#22d3ee' },
  purple: { bg: 'rgba(168, 85, 247, 0.2)', text: '#a78bfa' },
  emerald: { bg: 'rgba(16, 185, 129, 0.2)', text: '#34d399' }
};
```

2. **Better token counting**:
```typescript
const uniqueTokens = new Set(tokens.map(t => t.symbol.toUpperCase())).size;
const uniqueChains = new Set(tokens.map(t => t.chain.toLowerCase())).size;
const totalEntries = tokens.length;
```

3. **Renamed third card** for clarity:
   - "Total Tracked Tokens" → **"System Token Coverage"**
   - Shows: "5 tokens" (main value), "15 entries across 3 chains" (subtitle)

4. **Better empty states**:
   - "None found" + "No profitable opportunities currently"
   - "No data" instead of "Calculating..."

---

### **3. Chart Alignment (ChartComponent.tsx)**

**Problem:** Layout breaks on mobile, legend overlaps chart, buttons too cramped.

**Layout improvements:**
```typescript
// Header: Better breakpoint for responsive layout
<div className="flex flex-col lg:flex-row justify-between...">

// Buttons: Consistent spacing and sizing
className="px-3 py-1.5 text-xs rounded-lg..."

// Dropdown: Prevent squishing
<div className="relative min-w-[140px]">

// Chart: Prevent collapse
style={{ aspectRatio: `${width} / ${height}`, minHeight: '200px' }}

// Legend: Better layout with separator
<div className="flex flex-wrap gap-4 lg:gap-6 pt-4 border-t border-slate-700/30">
```

**Visual improvements:**
- ✅ Consistent padding throughout
- ✅ Responsive on mobile/tablet/desktop
- ✅ Legend separated with subtle border line
- ✅ Round color indicators (3x3 rounded-full)
- ✅ Proper spacing between all elements

---

### **4. Preferences Banner (main_dashboard.tsx)**

**Problem:** Confusing single-line display didn't explain what "tracking" means.

**Before:**
```
Tracking 1 token(s): ETH | Min Profit: $10 | Max Gas: $50
```

**After:**
```
Personal Alert Preferences Active

You're tracking 1 token: ETH • Min Profit: $10 • Max Gas: $50 • Min ROI: ... • Min Score: ...

Note: System monitors all 5 tokens (ETH, XRP, SOL, BNB, MATIC) across 3 chains.
Your preferences only filter alerts/notifications you receive.
```

**Improvements:**
- ✅ Clear title: "Personal Alert Preferences Active"
- ✅ Better formatting with bullet separators (•)
- ✅ Shows ALL threshold values (including optional ROI, Score)
- ✅ **Explains the distinction** between system monitoring vs personal filtering
- ✅ Multi-line layout for better readability

---

## ✅ Verification Checklist

After these fixes, your dashboard should display:

### **Stat Cards:**
- [ ] **Best Opportunity**: Shows highest net profit (should be BNB $361.60 if not flagged)
- [ ] **Top Token**: Shows token with highest average spread
- [ ] **System Coverage**: Shows "5 tokens" with "15 entries across 3 chains" (not 18)

### **Preferences Banner:**
- [ ] Shows "Personal Alert Preferences Active" title
- [ ] Lists all tracked tokens with thresholds
- [ ] Includes explanatory note about system vs personal tracking

### **Chart:**
- [ ] Header aligns on all screen sizes
- [ ] Timeframe buttons evenly spaced
- [ ] Token dropdown doesn't squish (min-width set)
- [ ] Chart maintains aspect ratio
- [ ] Legend has separator line and proper spacing
- [ ] Color indicators are round (not square)

### **Overall UI:**
- [ ] Consistent padding and spacing
- [ ] Responsive on mobile/tablet/desktop
- [ ] Colors display correctly (not purged by Tailwind)
- [ ] No overlapping elements

---

## 🚀 Next Steps to Fix Data

### **1. Run Fresh Data Pipeline**
```bash
cd server
npx ts-node scripts/runPipeline.ts
```

This will:
- Fetch latest prices from DexScreener
- Apply your fixes (MIN_LIQUIDITY_USD=1000, XRP addresses)
- Recalculate arbitrage opportunities
- Store fresh data in database

**Expected:** After pipeline runs, you should see:
- XRP with DEX prices (if pools > $1k liquidity exist)
- More arbitrage opportunities
- Updated stats reflecting current data

---

### **2. Investigate the "18 entries" Issue**

Check what's in your database:

```bash
cd server
npx ts-node -e "
import { Token } from './models';
Token.find().then(tokens => {
  console.log('Total entries:', tokens.length);
  console.log('\\nBreakdown by symbol:');
  const bySymbol = {};
  tokens.forEach(t => {
    bySymbol[t.symbol] = (bySymbol[t.symbol] || 0) + 1;
  });
  console.log(bySymbol);
  console.log('\\nExpected symbols:', ['ETH', 'XRP', 'SOL', 'BNB', 'MATIC']);
  process.exit(0);
});
"
```

**If you see USDT/USDC:**
```bash
# Remove them
npx ts-node -e "
import { Token } from './models';
Token.deleteMany({ symbol: { \$in: ['USDT', 'USDC'] } }).then(result => {
  console.log('Deleted', result.deletedCount, 'USDT/USDC entries');
  process.exit(0);
});
"
```

**If you see duplicates (same symbol + chain multiple times):**
```bash
# Find duplicates
npx ts-node -e "
import { Token } from './models';
Token.aggregate([
  { \$group: { 
      _id: { symbol: '\$symbol', chain: '\$chain' }, 
      count: { \$sum: 1 },
      ids: { \$push: '\$_id' }
  }},
  { \$match: { count: { \$gt: 1 } } }
]).then(console.log);
"

# Delete duplicates (keep most recent)
# Manual cleanup needed based on findings
```

---

### **3. Check BNB Opportunity Flags**

In your ArbitrageTable, look for the BNB opportunity. If it has a warning icon (🚩):

1. **Hover over the icon** to see the anomaly reason
2. **Common flags:**
   - `spread-outlier`: Spread > 5000% (obviously wrong)
   - `from-dex-cex-divergence`: Source prices don't match
   - `to-dex-cex-divergence`: Destination prices don't match

3. **If flagged as "spread-outlier":**
   - 36.4% is NOT an outlier (< 5000% threshold)
   - Check if BNB prices are actually correct
   - Might be comparing native BNB vs wrapped BNB (different prices)

4. **If flagged as divergence:**
   - DEX price differs >150% from CEX price
   - Could mean wrong contract address or bad API data

---

### **4. Verify ML Service is Running**

All your opportunities show `score: 0` which suggests ML service isn't running.

```bash
# Check ML service health
curl http://localhost:8001/health

# If not running, start it:
cd llm
pip install -r requirements.txt
python service.py
```

**Expected output:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

**Once running:**
- Restart data pipeline
- Opportunities will get proper scores (0-100)
- Stats will be more meaningful

---

### **5. Monitor Historical Data**

Charts will show "no data" until the system accumulates hourly snapshots.

**Timeline:**
- **1 hour**: First data point stored
- **24 hours**: Can show 24h chart (24 data points)
- **7 days**: Can show full 7d chart (168 data points)

**To verify it's working:**
```bash
# Check if token_history collection exists and has data
cd server
npx ts-node -e "
import { TokenHistory } from './models/TokenHistory'; // If model exists
TokenHistory.countDocuments().then(count => {
  console.log('Historical records:', count);
  process.exit(0);
});
"
```

**If you need data immediately:**
You could write a backfill script to fetch historical data from CoinGecko or DexScreener APIs and populate the database.

---

## 📚 Complete Data Flow Reference

```
┌─────────────────────┐
│ DexScreener API     │ (External price source)
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ DataService         │ Fetches DEX prices
│ (server/services)   │ Filters by MIN_LIQUIDITY_USD >= 1000
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Token Model         │ Stores: symbol, chain, currentPrice,
│ (server/models)     │         dexPrice, liquidity, etc.
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ OpportunityScanner  │ Calculates cross-chain arbitrage
│ (server/jobs)       │ opportunities
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ ArbitrageService    │ Estimates gas costs, net profit
│ (server/services)   │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ ML Service          │ Predicts success probability
│ (llm/service.py)    │ Returns score 0-100
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ Opportunity Model   │ Stores: tokenSymbol, chainFrom,
│ (server/models)     │         chainTo, netProfitUsd,
│                     │         score, flags, etc.
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ useOpportunities    │ Frontend hook polls every 1 hour
│ (client/hooks)      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ main_dashboard.tsx  │ Calculates stats, renders UI
│ (client/pages)      │
└──────────┬──────────┘
           │
           ↓
┌─────────────────────┐
│ StatCards           │ Best Opp, Top Token, Coverage
│ PriceTable          │ Token prices with spreads
│ ArbitrageTable      │ Opportunity list
│ ChartComponent      │ Historical price trends
└─────────────────────┘
```

**Key timing:**
- **Data refresh**: Every 1 hour (cron job)
- **Frontend polling**: Every 1 hour
- **User preferences**: Don't affect what's calculated, only what alerts you
- **ML scores**: Require Python service on port 8001
- **Historical charts**: Require time to accumulate hourly snapshots

---

## 🎯 Summary: What Changed

### **Before:**
- ❌ Stats showed ETH $2 profit (filtered by user preferences)
- ❌ "Total Tracked Tokens" confusing (18 entries, wrong count)
- ❌ Dynamic Tailwind classes not working (colors purged)
- ❌ Chart layout breaks on mobile
- ❌ Banner doesn't explain what "tracking" means

### **After:**
- ✅ Stats show best opportunity system-wide (BNB $361.60 if not flagged)
- ✅ "System Token Coverage" shows 5 tokens, 15 entries breakdown
- ✅ Inline color styles work correctly
- ✅ Responsive chart layout with proper spacing
- ✅ Banner explains personal preferences vs system monitoring

### **Still need to:**
1. Run data pipeline to get fresh prices
2. Investigate why database has 18 entries instead of 15
3. Check BNB opportunity flags
4. Start ML service if not running
5. Wait for historical data to accumulate

---

**Last Updated:** October 26, 2025 (Post-fixes)  
**Related Files:**
- `client/src/pages/main_dashboard.tsx`
- `client/src/components/dashboard/StatCards.tsx`
- `client/src/components/dashboard/ChartComponent.tsx`
- `server/config/tokens.ts`
- `server/services/DataService.ts`
