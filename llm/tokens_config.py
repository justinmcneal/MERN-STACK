# llm/tokens_config.py
# Shared configuration for tokens and chains (Python version)

# Supported tokens and chains
SUPPORTED_TOKENS = ["ETH", "USDT", "USDC", "BNB", "MATIC"]
SUPPORTED_CHAINS = ["ethereum", "polygon", "bsc"]

# Human-readable token names
TOKEN_NAMES = {
    "ETH": "Ethereum",
    "USDT": "Tether", 
    "USDC": "USD Coin",
    "BNB": "Binance Coin",
    "MATIC": "Polygon"
}

# CoinGecko API token IDs
COINGECKO_TOKEN_IDS = {
    "ETH": "ethereum",
    "USDT": "tether",
    "USDC": "usd-coin", 
    "BNB": "binancecoin",
    "MATIC": "matic-network"
}

# Chain display names
CHAIN_NAMES = {
    "ethereum": "Ethereum",
    "polygon": "Polygon", 
    "bsc": "Binance Smart Chain"
}

def is_valid_token(token: str) -> bool:
    """Check if token is supported"""
    return token in SUPPORTED_TOKENS

def is_valid_chain(chain: str) -> bool:
    """Check if chain is supported"""
    return chain in SUPPORTED_CHAINS

def get_token_name(symbol: str) -> str:
    """Get human-readable token name with fallback"""
    return TOKEN_NAMES.get(symbol, symbol)

def get_chain_name(chain: str) -> str:
    """Get human-readable chain name with fallback"""
    return CHAIN_NAMES.get(chain, chain)

def get_coingecko_token_id(symbol: str) -> str:
    """Get CoinGecko token ID"""
    return COINGECKO_TOKEN_IDS.get(symbol, symbol)
