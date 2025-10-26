import csv
import os
import time
from datetime import datetime
from typing import Dict, List, Optional

import requests
from dotenv import load_dotenv

COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price"
CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/v2/histohour"
TOKENS = {
    "ethereum": "ETH",
    "ripple": "XRP",
    "solana": "SOL",
    "binancecoin": "BNB",
    "matic-network": "MATIC",
}
VS_CURRENCY = "usd"

load_dotenv()

ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY")

GAS_APIS = {
    "ethereum": (
        f"https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}"
        if ETHERSCAN_API_KEY
        else None
    ),
    "polygon": (
        f"https://api.polygonscan.com/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}"
        if ETHERSCAN_API_KEY
        else None
    ),
    "bsc": (
        f"https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey={ETHERSCAN_API_KEY}"
        if ETHERSCAN_API_KEY
        else None
    ),
}


def _open_csv_with_headers(path: str, headers: List[str]):
    should_write_header = not os.path.exists(path) or os.path.getsize(path) == 0
    handle = open(path, "a", newline="")
    writer = csv.writer(handle)
    if should_write_header:
        writer.writerow(headers)
        handle.flush()
    return writer, handle


def get_prices() -> Dict[str, Optional[float]]:
    response = requests.get(
        COINGECKO_URL,
        params={"ids": ",".join(TOKENS.keys()), "vs_currencies": VS_CURRENCY},
        timeout=10,
    )
    response.raise_for_status()
    payload = response.json()
    return {symbol: payload.get(token, {}).get(VS_CURRENCY) for token, symbol in TOKENS.items()}


def get_historical_prices() -> Dict[str, List[dict]]:
    historical: Dict[str, List[dict]] = {}
    for symbol in ("ETH", "XRP", "SOL", "BNB", "MATIC"):
        params = {"fsym": symbol, "tsym": "USD", "limit": 24}
        try:
            response = requests.get(CRYPTOCOMPARE_URL, params=params, timeout=10)
            response.raise_for_status()
            payload = response.json()
            data_points = payload.get("Data", {}).get("Data", [])
            historical[symbol] = data_points if isinstance(data_points, list) else []
        except (requests.RequestException, ValueError, TypeError):
            historical[symbol] = []
    return historical


def get_gas_fees() -> Dict[str, Optional[str]]:
    gas: Dict[str, Optional[str]] = {}
    for chain, url in GAS_APIS.items():
        if not url:
            gas[chain] = None
            continue
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            result = response.json().get("result", {})
            gas[chain] = result.get("ProposeGasPrice") or result.get("proposeGasPrice")
        except (requests.RequestException, ValueError, TypeError):
            gas[chain] = None
    return gas


def _resolve_timestamp(value: Optional[float]) -> str:
    if isinstance(value, (int, float)):
        return datetime.utcfromtimestamp(value).isoformat()
    return datetime.utcnow().isoformat()


def main() -> None:
    market_headers = [
        "timestamp",
        "ETH_price",
        "XRP_price",
        "SOL_price",
        "BNB_price",
        "MATIC_price",
        "eth_gas_gwei",
        "polygon_gas_gwei",
        "bsc_gas_gwei",
    ]
    historical_headers = [
        "token",
        "timestamp",
        "close",
        "high",
        "low",
        "open",
        "volumefrom",
        "volumeto",
    ]

    market_writer, market_handle = _open_csv_with_headers("data/raw/market_data.csv", market_headers)
    historical_writer, historical_handle = _open_csv_with_headers("data/raw/historical_data.csv", historical_headers)

    try:
        while True:
            timestamp = datetime.utcnow().isoformat()
            prices = get_prices()
            gas = get_gas_fees()

            market_writer.writerow(
                [
                    timestamp,
                    *[prices.get(symbol) for symbol in TOKENS.values()],
                    gas.get("ethereum"),
                    gas.get("polygon"),
                    gas.get("bsc"),
                ]
            )
            market_handle.flush()

            historical = get_historical_prices()
            for token, data_points in historical.items():
                for data_point in data_points:
                    historical_writer.writerow(
                        [
                            token,
                            _resolve_timestamp(data_point.get("time")),
                            data_point.get("close"),
                            data_point.get("high"),
                            data_point.get("low"),
                            data_point.get("open"),
                            data_point.get("volumefrom"),
                            data_point.get("volumeto"),
                        ]
                    )
            historical_handle.flush()
            time.sleep(60)
    finally:
        market_handle.close()
        historical_handle.close()


if __name__ == "__main__":
    main()
