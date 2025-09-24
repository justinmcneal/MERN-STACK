# llm/service.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predict import predict_opportunity
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

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
    """
    try:
        token = data.token.lower()
        chain_a = data.chain_a.lower()
        chain_b = data.chain_b.lower()

        # Map for CoinGecko token ids
        TOKEN_ID_MAP = {
            "eth": "ethereum",
            "usdt": "tether",
            "usdc": "usd-coin",
            "bnb": "binancecoin",
            "matic": "matic-network"
        }
        token_id = TOKEN_ID_MAP.get(token)
        if not token_id:
            raise HTTPException(status_code=400, detail=f"Token {token} not supported.")

        # Fetch price from CoinGecko (only once, since per-chain price is not available)
        def fetch_token_price(token_id):
            url = "https://api.coingecko.com/api/v3/simple/price"
            params = {"ids": token_id, "vs_currencies": "usd"}
            print(f"Fetching CoinGecko price for {token_id}...")
            resp = requests.get(url, params=params, timeout=5)
            try:
                resp.raise_for_status()
                data = resp.json()
                print(f"CoinGecko response: {data}")
                if not isinstance(data, dict) or token_id not in data or not isinstance(data[token_id], dict) or "usd" not in data[token_id]:
                    raise HTTPException(status_code=502, detail=f"Unexpected CoinGecko response: {data}")
                return data[token_id]["usd"]
            except Exception as e:
                raise HTTPException(status_code=502, detail=f"CoinGecko error: {str(e)}; response: {getattr(resp, 'text', '')}")

        price = fetch_token_price(token_id)
        price_a = price
        price_b = price
        # Note: CoinGecko does not provide per-chain prices for stablecoins, so this is a simplification.

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

        # Estimate gas cost in USD (simple transfer, 21000 gas units)
        def estimate_gas_cost(chain, gas_price_gwei):
            # All use the same price for demo
            token_price = price
            return gas_price_gwei * 21000 * 1e-9 * token_price

        cost_a = estimate_gas_cost(chain_a, gas_a)
        cost_b = estimate_gas_cost(chain_b, gas_b)
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
