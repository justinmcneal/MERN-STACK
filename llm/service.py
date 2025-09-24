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
            resp = requests.get(url, params=params)
            try:
                resp.raise_for_status()
                data = resp.json()
                # Debug: print/log the response
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
            # Unified Etherscan V2 endpoint and chain IDs
            CHAIN_ID_MAP = {
                "ethereum": 1,
                "bsc": 56,
                "binance smart chain": 56,
                "polygon": 137
            }
            chainid = CHAIN_ID_MAP.get(chain)
            if not chainid:
                raise HTTPException(status_code=400, detail=f"Chain {chain} not supported.")
            api_key = os.getenv("ETHERSCAN_API_KEY")
            url = f'https://api.etherscan.io/v2/gasOracle?chainid={chainid}&apikey={api_key}'
            resp = requests.get(url)
            try:
                resp.raise_for_status()
                data = resp.json()
                print(f"Gas API response for {chain}: {data}")
                if not isinstance(data, dict) or "result" not in data or not isinstance(data["result"], dict) or "ProposeGasPrice" not in data["result"]:
                    raise Exception(f"Unexpected gas API response for {chain}: {data}")
                return float(data["result"]["ProposeGasPrice"])
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
