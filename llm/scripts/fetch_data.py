# ...existing code...
import os
from dotenv import load_dotenv
import requests
import csv
import time
from datetime import datetime

# --- CONFIG ---
# --- CONFIG ---
COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/v2/histohour"
TOKENS = {
    "ethereum": "ETH",
    "tether": "USDT",
    "usd-coin": "USDC",
    "binancecoin": "BNB",
    "matic-network": "MATIC"
}
VS_CURRENCY = "usd"

# Load environment variables from .env file
load_dotenv()

ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")

GAS_APIS = {
    "ethereum": f"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}",
    "polygon": f"https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}",
    "bsc": f"https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}"
}

def get_prices():
    ids = ",".join(TOKENS.keys())
    params = {
        "ids": ids,
        "vs_currencies": VS_CURRENCY
    }
    r = requests.get(COINGECKO_URL, params=params)
    r.raise_for_status()
    data = r.json()
    prices = {TOKENS[k]: data.get(k, {}).get(VS_CURRENCY, None) for k in TOKENS}
    return prices

# --- CryptoCompare Historical Data ---
def get_historical_prices():
    # Map token symbol to CryptoCompare symbol
    symbol_map = {
        "ETH": "ETH",
        "USDT": "USDT",
        "USDC": "USDC",
        "BNB": "BNB",
        "MATIC": "MATIC"
    }
    historical = {}
    for symbol in symbol_map.values():
        params = {
            "fsym": symbol,
            "tsym": "USD",
            "limit": 24  # last 24 hours
        }
        try:
            r = requests.get(CRYPTOCOMPARE_URL, params=params)
            r.raise_for_status()
            data = r.json()
            historical[symbol] = data["Data"]["Data"]  # List of dicts with 'time', 'close', etc.
        except Exception as e:
            historical[symbol] = []
    return historical

def get_gas_fees():
    gas = {}
    for chain, url in GAS_APIS.items():
        try:
            r = requests.get(url)
            r.raise_for_status()
            result = r.json().get("result", {})
            gas[chain] = result.get("ProposeGasPrice") or result.get("proposeGasPrice")
        except Exception as e:
            gas[chain] = None
    return gas


def main():
    # --- Real-time data ---
    with open("../data/raw/market_data.csv", "a", newline="") as f:
        writer = csv.writer(f)
        # Write header if file is empty
        f.seek(0, 2)
        if f.tell() == 0:
            writer.writerow([
                "timestamp",
                "ETH_price",
                "USDT_price",
                "USDC_price",
                "BNB_price",
                "MATIC_price",
                "eth_gas_gwei",
                "polygon_gas_gwei",
                "bsc_gas_gwei"
            ])
        # --- Historical data ---
        with open("../data/raw/historical_data.csv", "a", newline="") as hist_f:
            hist_writer = csv.writer(hist_f)
            # Write header if file is empty
            hist_f.seek(0, 2)
            if hist_f.tell() == 0:
                hist_writer.writerow([
                    "token", "timestamp", "close", "high", "low", "open", "volumefrom", "volumeto"
                ])
            while True:
                now = datetime.utcnow().isoformat()
                prices = get_prices()
                gas = get_gas_fees()
                row = [
                    now,
                    prices["ETH"],
                    prices["USDT"],
                    prices["USDC"],
                    prices["BNB"],
                    prices["MATIC"],
                    gas["ethereum"],
                    gas["polygon"],
                    gas["bsc"]
                ]
                writer.writerow(row)
                f.flush()
                # Fetch and write historical data
                historical = get_historical_prices()
                for token, data_points in historical.items():
                    for dp in data_points:
                        hist_writer.writerow([
                            token,
                            datetime.utcfromtimestamp(dp["time"]).isoformat(),
                            dp.get("close"),
                            dp.get("high"),
                            dp.get("low"),
                            dp.get("open"),
                            dp.get("volumefrom"),
                            dp.get("volumeto")
                        ])
                hist_f.flush()
                print(f"Saved snapshot at {now}")
                time.sleep(60)

if __name__ == "__main__":
    main()
