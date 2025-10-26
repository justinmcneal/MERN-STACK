# Cryptocurrency & DeFi Glossary

A comprehensive guide to understanding the crypto-related concepts used in this arbitrage trading platform.

---

## 🔑 Core Concepts

### **Cryptocurrency (Crypto)**
Digital or virtual currency secured by cryptography, operating on decentralized networks based on blockchain technology.

**Examples in this app:**
- **ETH (Ethereum)**: The native token of the Ethereum blockchain
- **BNB (Binance Coin)**: Native token of Binance Smart Chain (BSC)
- **MATIC (Polygon)**: Native token of the Polygon network
- **XRP (Ripple)**: Digital payment protocol token
- **SOL (Solana)**: Native token of the Solana blockchain

---

### **Blockchain / Chain**
A distributed ledger technology that records transactions across multiple computers. Each blockchain is a separate network.

**Chains in this app:**
- **Ethereum**: The original smart contract platform, known for high security but expensive gas fees
- **Binance Smart Chain (BSC)**: Ethereum-compatible chain with lower fees
- **Polygon**: Layer 2 scaling solution for Ethereum with very low fees

**Why multiple chains matter:**
The same token (like ETH or BNB) can exist on different chains, sometimes at different prices, creating arbitrage opportunities.

---

## 💱 Trading & Exchanges

### **CEX (Centralized Exchange)**
Traditional cryptocurrency exchange operated by a company (like Binance, Coinbase, Kraken).

**Characteristics:**
- ✅ User-friendly interface
- ✅ High liquidity
- ✅ Fast execution
- ❌ Requires KYC (identity verification)
- ❌ You don't control your private keys ("Not your keys, not your coins")

**In this app:** CEX prices are used as baseline reference prices.

---

### **DEX (Decentralized Exchange)**
Peer-to-peer marketplace where users trade cryptocurrencies directly without intermediaries.

**Examples:**
- **Uniswap** (Ethereum, Polygon)
- **PancakeSwap** (BSC)
- **SushiSwap** (Multi-chain)
- **Curve Finance** (Stablecoins)

**Characteristics:**
- ✅ No KYC required
- ✅ You control your funds
- ✅ Transparent pricing (on-chain)
- ❌ Can have lower liquidity
- ❌ Higher slippage on large trades
- ❌ You pay gas fees for every transaction

**In this app:** DEX prices are fetched from DexScreener API to find price differences.

---

### **Liquidity**
The availability of assets in a market to be bought or sold without causing significant price changes.

**What does $32M liquidity mean?**
- There's $32 million worth of tokens available in a DEX pool
- High liquidity = easier to trade large amounts without affecting price
- Low liquidity = trades can cause significant price swings (slippage)

**Liquidity Threshold in this app:**
```typescript
MIN_LIQUIDITY_USD = 1000
```
This means we only consider DEX pools with at least $1,000 in liquidity to avoid:
- Unreliable prices from tiny pools
- High slippage that would eat into profits
- Pools that might be scams or honeypots

**Example from your dashboard:**
- BNB on Ethereum: **$232.4K liquidity** ✅ (reliable)
- MATIC on BSC: **$75.1K liquidity** ✅ (acceptable)
- A pool with $500 liquidity ❌ (filtered out, too risky)

---

### **Liquidity Pool**
A collection of funds locked in a smart contract, used to facilitate trading on a DEX.

**How it works:**
1. Users (Liquidity Providers) deposit pairs of tokens (e.g., ETH + USDC)
2. Traders swap between these tokens using the pool
3. Liquidity providers earn fees from trades

**Example:**
If you see "BNB/USDT PancakeSwap pool has $34.1M liquidity", it means:
- The pool contains $34.1M worth of BNB and USDT combined
- This pool is on PancakeSwap DEX
- Traders can swap BNB ↔ USDT using this pool

---

## 📊 Price & Trading Metrics

### **Spread**
The difference between the buy price and sell price of an asset.

**In your dashboard:**
```
BNB: CEX Price = $1,119, DEX Price = $1,118
Spread = -0.11%
```
This means the DEX price is 0.11% lower than the CEX price.

**Spread Formula:**
```
Spread % = ((DEX Price - CEX Price) / CEX Price) × 100
```

**What spread means for trading:**
- **Positive spread (+2%)**: DEX price is higher → buy on CEX, sell on DEX
- **Negative spread (-2%)**: DEX price is lower → buy on DEX, sell on CEX
- **Near zero (0.1%)**: Prices are aligned, no arbitrage opportunity

---

### **Arbitrage**
Simultaneously buying and selling an asset in different markets to profit from price differences.

**Example from your dashboard:**
```
BNB: BSC → Ethereum
Spread: +36.4%
Net Profit: $361.60
```

This means:
1. Buy BNB on BSC for $1,119
2. Sell BNB on Ethereum for $1,523
3. Profit: $404 - $42.40 (gas) = $361.60

**Types of arbitrage:**
- **Cross-Chain**: Between different blockchains (BSC → Ethereum)
- **Cross-Exchange**: Between different DEXes on the same chain
- **Triangular**: Trading through 3+ token pairs

**Why arbitrage exists:**
- Price discovery takes time
- Different markets have different supply/demand
- Liquidity fragmentation across chains and DEXes

---

### **ROI (Return on Investment)**
The percentage return on your invested capital.

**Formula:**
```
ROI % = (Net Profit / Investment) × 100
```

**Example:**
- Investment: $1,000
- Net Profit: $361.60
- ROI: 36.16%

**In this app:** Opportunities with higher ROI are ranked higher.

---

### **Slippage**
The difference between the expected price and the actual executed price of a trade.

**Example:**
- You try to buy $10,000 of BNB on a small DEX pool
- Expected price: $1,119
- Actual price you pay: $1,125 (due to your large order moving the market)
- Slippage: 0.54%

**Why it matters:**
- High slippage eats into arbitrage profits
- Low liquidity pools have higher slippage
- That's why we filter pools with liquidity < $1,000

---

## ⛽ Blockchain Operations

### **Gas Fee**
The fee paid to validators/miners to process your transaction on a blockchain.

**What affects gas fees:**
- **Network congestion**: More users = higher fees
- **Transaction complexity**: More computations = higher fees
- **Chain**: Ethereum fees are typically $5-50, Polygon < $0.01

**Gas Fee Components:**
```typescript
OUTBOUND_GAS_UNITS: {
  ethereum: 450,000  // Swap + bridge initiation
  polygon: 320,000
  bsc: 360,000
}

INBOUND_GAS_UNITS: {
  ethereum: 220,000  // Swap on destination chain
  polygon: 160,000
  bsc: 200,000
}
```

**Example calculation:**
```
Ethereum outbound: 450,000 units × 30 gwei × $3,953 ETH = $53.38
Polygon inbound: 160,000 units × 50 gwei × $0.1967 MATIC = $0.0016
Total gas cost: $53.38
```

**In your dashboard:**
```
BNB BSC → Ethereum
Gas Fee: $2.22
```

This is the total cost to execute the arbitrage trade (swap + bridge transfer).

---

### **Bridge**
A protocol that allows tokens to move between different blockchains.

**How it works:**
1. Lock tokens on Chain A
2. Mint equivalent tokens on Chain B
3. To move back: Burn tokens on Chain B, unlock on Chain A

**Why bridges are needed:**
- Blockchains don't natively communicate
- Tokens need to exist on the chain where you want to trade
- Arbitrage between chains requires bridging

**Risks:**
- Bridge smart contract vulnerabilities
- Time delays (minutes to hours)
- Bridge fees on top of gas fees

---

## 🔢 Token Types

### **Native Token**
The cryptocurrency that a blockchain runs on, used to pay gas fees.

**Examples:**
- **Ethereum → ETH**
- **BSC → BNB**
- **Polygon → MATIC**

---

### **Wrapped Token**
A token that represents another cryptocurrency on a different blockchain.

**Examples:**
- **WETH (Wrapped Ether)**: ETH on other chains or as ERC-20 on Ethereum
- **WBNB (Wrapped BNB)**: BNB as a BEP-20 token on BSC
- **WMATIC**: MATIC on Polygon for smart contract compatibility

**Why wrapping?**
Native tokens don't always work with smart contracts (like DEX swaps). Wrapping makes them compatible.

**Price relationship:**
```
1 ETH = 1 WETH (always)
1 BNB = 1 WBNB (always)
```
They should always be exactly equal. If not, instant arbitrage!

---

### **Pegged/Bridged Token**
A token representing an asset from another chain.

**Examples in your config:**
```typescript
XRP: {
  ethereum: '0x39fb...e1b9',  // Wrapped XRP on Ethereum
  bsc: '0x1d2f...7c8c',       // Binance-Peg XRP on BSC
  polygon: '0xda0e...53c3'     // XRP Token on Polygon
}
```

**Important:** These can have different prices than native XRP because:
- Different liquidity on each chain
- Bridge costs and delays
- Supply/demand variations

---

## 📈 Price Discovery

### **Oracle**
A service that provides real-world data (like prices) to blockchain smart contracts.

**Examples:**
- Chainlink
- Band Protocol
- DexScreener API (used in this app)

**Why needed:**
Blockchains can't access external data by themselves. Oracles bridge the gap.

---

### **DexScreener**
A platform that aggregates real-time DEX trading data across multiple chains.

**What this app uses it for:**
1. Fetch DEX prices for tokens
2. Get liquidity information
3. Find available trading pairs
4. Monitor price changes

**API Response Example:**
```json
{
  "pairs": [{
    "chainId": "ethereum",
    "dexId": "uniswap",
    "priceUsd": "3953.45",
    "liquidity": {
      "usd": 75100000
    }
  }]
}
```

---

## 🎯 Arbitrage Scoring

### **Score (0-100)**
A metric calculated by machine learning to predict arbitrage opportunity success.

**Factors considered:**
- **Spread percentage**: Higher spread = higher score
- **Liquidity**: Higher liquidity = more reliable
- **Gas cost vs profit**: Profit must exceed gas significantly
- **Historical success**: Similar opportunities that worked
- **Volatility**: Stable spread = better score

**Score Interpretation:**
- **85-100**: Excellent opportunity (green)
- **70-84**: Good opportunity (yellow)
- **0-69**: Marginal opportunity (gray)

**Example from your dashboard:**
```
BNB BSC → Ethereum
Score: 0
```
This low score could mean:
- ML service failed to calculate
- Anomalies detected (price might be wrong)
- Gas costs too high relative to profit

---

## 🚩 Anomaly Detection

### **Anomaly Flags**
Warnings when opportunity data looks suspicious.

**Flag Types:**
```typescript
'spread-outlier'              // Spread > 5000% (probably wrong)
'gas-vs-profit-outlier'       // Gas is suspiciously low
'from-dex-cex-divergence'     // Source prices don't match
'to-dex-cex-divergence'       // Destination prices don't match
```

**Example:**
```
BNB: CEX $1,119 vs DEX $2,200 on BSC
→ Flags: 'from-dex-cex-divergence'
```
This means the DEX price differs by >150% from CEX, suggesting data error.

**In your dashboard:**
Flagged opportunities show a ⚠️ warning icon with details on hover.

---

## 💰 Trade Sizing

### **Trade Size / Volume**
The amount of money used to evaluate an arbitrage opportunity.

**Default in this app:**
```typescript
DEFAULT_TRADE_SIZE_USD = $1,000
```

**Why it matters:**
- Larger trades earn more profit but cause more slippage
- Gas fees are fixed regardless of trade size
- $100 trade might lose money on gas, $10,000 trade is profitable

**Example:**
```
Spread: 2%
Trade size: $1,000
Gross profit: $20
Gas fee: $15
Net profit: $5 (only 0.5% ROI)

Trade size: $10,000
Gross profit: $200
Gas fee: $15
Net profit: $185 (1.85% ROI) ✅ Better!
```

---

## 🔐 Security & Validation

### **Stablecoin**
Cryptocurrency designed to maintain a stable value (typically $1.00).

**Examples:**
- USDT (Tether)
- USDC (USD Coin)
- DAI

**Price validation in this app:**
```typescript
STABLE_PRICE_MIN = 0.98  // $0.98
STABLE_PRICE_MAX = 1.02  // $1.02
```

If USDC shows a price of $0.50 or $2.00, it's rejected as invalid data.

**Why this matters:**
Prevents trading on obviously wrong prices that would result in losses.

---

### **Contract Address**
The unique identifier for a token's smart contract on a blockchain.

**Example:**
```
WETH on Ethereum: 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2
```

**Why accuracy matters:**
- Wrong address = wrong token = potential losses
- Each chain has different addresses for the same token
- Scam tokens can have similar names but different addresses

---

## 📊 Dashboard Metrics Explained

### Your Price Table Columns:

| Column | Meaning |
|--------|---------|
| **Token** | Token symbol (BNB, ETH, etc.) |
| **Chain** | Which blockchain it's on |
| **Price (Feed)** | CEX/reference price from CoinGecko/data feeds |
| **Price (DEX)** | Actual tradeable price on DEX |
| **Spread** | % difference between CEX and DEX |
| **Liquidity** | How much $ is in the DEX pool |
| **Last Updated** | When price was last fetched |

### Your Arbitrage Table Columns:

| Column | Meaning |
|--------|---------|
| **Token** | What to trade |
| **From → To** | Buy on "From" chain, sell on "To" chain |
| **Price Diff (%)** | Profit potential before costs |
| **Trade Size** | How much $ to trade ($1,000 default) |
| **Gas Fee** | Total cost to execute (both chains) |
| **Net Profit** | Money you keep after gas |
| **Score** | ML prediction of success (0-100) |

---

## 🔧 Common Issues Explained

### "Why no DEX price showing?"

**Possible reasons:**
1. **Low liquidity**: Pool has < $1,000 liquidity (filtered out)
2. **No pool exists**: Token not traded on that chain's DEXes
3. **Wrong contract**: Token address might be incorrect
4. **API failure**: DexScreener couldn't fetch data

**Example from your dashboard:**
```
XRP on all chains: "—"
```
This likely means XRP pools are too small or don't exist on these DEXes.

---

### "Why only 1-2 arbitrage opportunities?"

**Possible reasons:**
1. **Markets are efficient**: Bots quickly close price gaps
2. **High gas fees**: Most spreads < gas cost = unprofitable
3. **Low liquidity**: Not enough tokens to trade profitably
4. **Anomaly filtering**: ML flagged others as suspicious
5. **Missing DEX prices**: Can't calculate arbitrage without both prices

---

### "Why is spread 36% but score is 0?"

**This suggests:**
1. **ML service not running**: Can't calculate proper score
2. **Data anomaly**: Price might be wrong
3. **Severely flagged**: System doesn't trust the data

**The 36% BNB spread is suspicious because:**
- BNB shouldn't vary that much between chains
- Likely comparing wrong token pairs (native vs wrapped)
- Or incorrect price data from API

---

## 🚀 How This App Works (Overview)

### Data Flow:
```
1. Fetch CEX Prices (CoinGecko/others)
   ↓
2. Fetch DEX Prices (DexScreener)
   ↓
3. Filter low liquidity pools (< $1,000)
   ↓
4. Validate prices (check anomalies)
   ↓
5. Calculate spreads for all token pairs
   ↓
6. Estimate gas costs for each chain
   ↓
7. Calculate net profit (spread - gas)
   ↓
8. ML scores opportunities (0-100)
   ↓
9. Save profitable ones to database
   ↓
10. Display on dashboard
```

### Update Frequency:
- **Prices**: Every 1 hour (server cron job)
- **Opportunities**: Scanned every 1 hour
- **Dashboard**: Polls every 1 hour
- **Manual refresh**: Click "Refresh" button anytime

---

## 📚 Further Reading

### Recommended Resources:
- **[Uniswap Docs](https://docs.uniswap.org/)** - Learn how AMM DEXes work
- **[DexScreener](https://dexscreener.com/)** - Explore real DEX data
- **[Ethereum Gas Tracker](https://etherscan.io/gastracker)** - Monitor gas prices
- **[CoinGecko](https://www.coingecko.com/)** - Price tracking and education

### Key Concepts to Explore:
- Automated Market Makers (AMM)
- Impermanent Loss
- Layer 2 Solutions
- Cross-chain bridges
- MEV (Maximal Extractable Value)

---

## ❓ Quick FAQ

**Q: Why are gas fees so high on Ethereum?**
A: Ethereum is the most secure and used chain, creating network congestion. Layer 2 solutions like Polygon offer lower fees.

**Q: Can I execute these arbitrage trades manually?**
A: Technically yes, but by the time you execute manually, the opportunity likely disappeared. Bots do this in milliseconds.

**Q: Is $1,000 liquidity threshold too low?**
A: It's a balance. Higher (e.g., $10,000) = more reliable prices but fewer opportunities. Lower = more opportunities but riskier.

**Q: Why does the same token have different prices on different chains?**
A: Each chain is a separate market with its own supply, demand, and liquidity. Price gaps create arbitrage opportunities.

**Q: What's the difference between WETH and ETH?**
A: ETH is the native currency. WETH is an ERC-20 wrapper needed for smart contracts. They should always be exactly 1:1.

---

**Last Updated:** Based on your current dashboard implementation
**Questions?** Check the code comments in `/server/services/` for detailed implementation.
