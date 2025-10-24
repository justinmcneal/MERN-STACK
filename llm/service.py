# llm/service.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predict import predict_opportunity
import requests
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

app = FastAPI()

# MongoDB connection for fetching chain-specific DEX prices
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/arbitrader")
mongo_client = None

def get_mongo_client():
    global mongo_client
    if mongo_client is None:
        mongo_client = MongoClient(MONGODB_URI)
    return mongo_client

class OppInput(BaseModel):
    token: str
    chain: str
    price: float
    gas: float

@app.post("/predict")
def get_prediction(data: OppInput):
    result = predict_opportunity(
        token=data.token,
        chain=data.chain,
        price=data.price,
        gas=data.gas
    )
    return result

# --- Cross-chain arbitrage endpoint ---
class ArbitrageInput(BaseModel):
    token: str
    chain_a: str
    chain_b: str

@app.post("/arbitrage_opportunity")
def arbitrage_opportunity(data: ArbitrageInput):
    """
    Returns arbitrage opportunity details for a token between two chains.
    Fetches chain-specific DEX prices from MongoDB database.
    """
    try:
        token = data.token.upper()  # Keep uppercase for MongoDB query
        chain_a = data.chain_a.lower()
        chain_b = data.chain_b.lower()

        # Fetch chain-specific DEX prices from MongoDB
        def fetch_dex_price(token_symbol, chain):
            try:
                client = get_mongo_client()
                db = client.get_database()
                tokens_collection = db['tokens']
                
                token_doc = tokens_collection.find_one({
                    'symbol': token_symbol,
                    'chain': chain
                })
                
                if token_doc:
                    # Prefer dexPrice over currentPrice for arbitrage
                    dex_price = token_doc.get('dexPrice')
                    if dex_price and dex_price > 0:
                        print(f"Found DEX price for {token_symbol} on {chain}: ${dex_price}")
                        return dex_price
                    
                    # Fallback to currentPrice if dexPrice not available
                    current_price = token_doc.get('currentPrice')
                    if current_price and current_price > 0:
                        print(f"Using CEX price for {token_symbol} on {chain}: ${current_price} (DEX price not available)")
                        return current_price
                
                raise HTTPException(
                    status_code=404, 
                    detail=f"No price found for {token_symbol} on {chain}. Price may not have been fetched yet."
                )
            except Exception as e:
                print(f"Error fetching price from MongoDB: {e}")
                raise HTTPException(status_code=502, detail=f"Database error: {str(e)}")

        price_a = fetch_dex_price(token, chain_a)
        price_b = fetch_dex_price(token, chain_b)

        # Fetch gas price (gwei) for each chain
        def fetch_gas_price(chain):
            try:
                if chain == "ethereum":
                    headers = {}
                    api_key = os.getenv("BLOCKNATIVE_API_KEY")
                    if api_key:
                        headers["Authorization"] = api_key
                    url = "https://api.blocknative.com/gasprices/blockprices?chainid=1"
                    print("Fetching Blocknative gas price for ethereum...")
                    resp = requests.get(url, headers=headers, timeout=5)
                    resp.raise_for_status()
                    data = resp.json()
                    print(f"Blocknative gas API response: {data}")
                    prices = data.get("blockPrices", [{}])[0].get("estimatedPrices", [])
                    if prices:
                        for p in prices:
                            if p.get("confidence") == 70:
                                return float(p["maxFeePerGas"])
                        return float(prices[0]["maxFeePerGas"])
                    raise Exception(f"No gas price found in Blocknative response: {data}")
                elif chain == "polygon":
                    url = "https://gasstation.polygon.technology/v2"
                    print("Fetching Polygon gas price...")
                    resp = requests.get(url, timeout=5)
                    resp.raise_for_status()
                    data = resp.json()
                    print(f"Polygon gas API response: {data}")
                    return float(data["standard"]["maxFee"])
                elif chain in ["bsc", "binance smart chain"]:
                    url = "https://bscgas.info/gas"
                    print("Fetching BSC gas price...")
                    resp = requests.get(url, timeout=5)
                    resp.raise_for_status()
                    data = resp.json()
                    print(f"BSC gas API response: {data}")
                    return float(data["standard"])
                else:
                    raise HTTPException(status_code=400, detail=f"Chain {chain} not supported.")
            except Exception as e:
                print(f"WARNING: Gas API failed for {chain} ({e}), using mock value 20 gwei.")
                return 20.0  # fallback mock value in gwei

        gas_a = fetch_gas_price(chain_a)
        gas_b = fetch_gas_price(chain_b)

        # Estimate gas cost in USD using native token prices
        def estimate_gas_cost(chain, gas_price_gwei, token_price):
            # For accurate gas costs, we need the native token price (ETH, BNB, MATIC)
            # Using the traded token price is incorrect - we should fetch native token prices
            # For now, use average native token prices as fallback
            native_prices = {
                'ethereum': 3900.0,  # ETH price
                'polygon': 0.80,     # MATIC price
                'bsc': 600.0         # BNB price
            }
            native_price = native_prices.get(chain, token_price)
            return gas_price_gwei * 21000 * 1e-9 * native_price

        cost_a = estimate_gas_cost(chain_a, gas_a, price_a)
        cost_b = estimate_gas_cost(chain_b, gas_b, price_b)
        total_gas_cost = cost_a + cost_b

        # Calculate spread and net profit
        spread = abs(price_a - price_b)
        net_profit = spread - total_gas_cost
        profitable = net_profit > 0

        # Debug prints for all calculated values
        print(f"DEBUG: price_a={price_a}, price_b={price_b}, gas_a={gas_a}, gas_b={gas_b}, cost_a={cost_a}, cost_b={cost_b}, total_gas_cost={total_gas_cost}, spread={spread}, net_profit={net_profit}, profitable={profitable}")

        return {
            "token": token,
            "chain_a": chain_a,
            "chain_b": chain_b,
            "price_a": price_a,
            "price_b": price_b,
            "gas_a_gwei": gas_a,
            "gas_b_gwei": gas_b,
            "cost_a_usd": cost_a,
            "cost_b_usd": cost_b,
            "total_gas_cost_usd": total_gas_cost,
            "spread_usd": spread,
            "net_profit_usd": net_profit,
            "profitable": profitable
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
