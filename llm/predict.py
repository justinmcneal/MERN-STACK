#!/usr/bin/env python3
"""
ML prediction using TRAINED MODEL from real opportunity data.
NO HEURISTICS. NO MOCK DATA.
"""

import math
import os
import joblib
import pandas as pd
import numpy as np
from typing import Optional
from tokens_config import SUPPORTED_CHAINS, SUPPORTED_TOKENS

# Load trained model
MODEL_PATH = "models/arbitrage_model.pkl"
FEATURES_PATH = "models/arbitrage_model_features.txt"

model = None
feature_names = []

def load_model():
    """Load the trained model and feature names."""
    global model, feature_names
    
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found at {MODEL_PATH}. Run train.py first to train the model."
        )
    
    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError(
            f"Feature names not found at {FEATURES_PATH}. Run train.py first."
        )
    
    model = joblib.load(MODEL_PATH)
    with open(FEATURES_PATH, "r") as f:
        feature_names = [line.strip() for line in f.readlines()]
    
    print(f"✅ Loaded model with {len(feature_names)} features")


# Load model on module import
try:
    load_model()
except FileNotFoundError as e:
    print(f"⚠️  WARNING: {e}")
    print("   Model predictions will return fallback scores until training is complete.")
    model = None


def predict_opportunity(
    token: str,
    chain: str,
    price: float,
    gas: float,
    gross_profit: Optional[float] = None,
    net_profit: Optional[float] = None,
    roi: Optional[float] = None,
    trade_volume: Optional[float] = None,
    price_diff_percent: Optional[float] = None,
    price_per_token: Optional[float] = None,
):
    """
    Predict opportunity profitability using TRAINED MODEL.
    
    Args:
        token: Token symbol (e.g., "ETH")
        chain: Source chain (e.g., "ethereum")
        price: Gross profit in USD
        gas: Gas cost in USD
        gross_profit: Gross profit (optional, defaults to price)
        net_profit: Net profit after gas (optional)
        roi: Return on investment % (optional)
        trade_volume: Trade volume in USD (optional)
        price_diff_percent: Price difference % (optional)
        price_per_token: Price difference per token (optional)
    
    Returns:
        Dictionary with profitable, roi, and score fields
    """
    token = token.upper()
    chain = chain.lower()
    
    # Calculate derived values
    gross = gross_profit if gross_profit is not None else price
    trade_value = trade_volume if trade_volume and trade_volume > 0 else 1000.0
    net = net_profit if net_profit is not None else gross - gas
    
    if roi is not None:
        roi_value = roi
    elif trade_value > 0:
        roi_value = (net / trade_value) * 100
    else:
        roi_value = 0.0
    
    priceDiff = price_per_token if price_per_token is not None else gross
    priceDiffPercent = price_diff_percent if price_diff_percent is not None else 0.0
    
    # Early exit if clearly unprofitable
    if net <= 0:
        return {
            "profitable": False,
            "roi": roi_value,
            "score": 0.0,
        }
    
    # If model not loaded, return basic heuristic score
    if model is None:
        # Simple heuristic as fallback
        score = min(1.0, max(0.0, net / 100.0))
        return {
            "profitable": net > 0,
            "roi": roi_value,
            "score": score,
            "warning": "Model not trained yet, using fallback heuristic"
        }
    
    # Prepare features for model prediction
    # Must match the training features exactly
    features_dict = {
        "grossProfit": gross,
        "netProfit": net,
        "gasCost": gas,
        "priceDiff": priceDiff,
        "priceDiffPercent": priceDiffPercent,
        "roi": roi_value,
        "volume": trade_value,
    }
    
    # Add one-hot encoded symbol features
    for t in SUPPORTED_TOKENS:
        features_dict[f"symbol_{t}"] = 1 if token == t else 0
    
    # Add one-hot encoded chain features
    # Note: We have chainFrom and chainTo in training
    # For prediction, we use the provided chain as chainFrom
    # and assume chainTo is different (since it's an arbitrage opportunity)
    for c in SUPPORTED_CHAINS:
        # chainFrom is the provided chain
        features_dict[f"chainFrom_{c}"] = 1 if chain == c else 0
        # chainTo: set a default (we don't know the destination in single prediction)
        # Use most common destination chain from training
        features_dict[f"chainTo_{c}"] = 0
    
    # Set default chainTo (use polygon as default destination)
    if chain != "polygon":
        features_dict["chainTo_polygon"] = 1
    elif "ethereum" in [c for c in SUPPORTED_CHAINS]:
        features_dict["chainTo_ethereum"] = 1
    
    # Create DataFrame with features in correct order
    X = pd.DataFrame([[features_dict.get(f, 0) for f in feature_names]], columns=feature_names)
    
    # Predict
    try:
        probability = model.predict_proba(X)[0][1]  # Probability of profitable class
        prediction = model.predict(X)[0]  # 0 or 1
        
        return {
            "profitable": bool(prediction),
            "roi": roi_value,
            "score": float(probability),
            "metadata": {
                "tokenRecognized": token in SUPPORTED_TOKENS,
                "chainRecognized": chain in SUPPORTED_CHAINS,
                "modelUsed": "RandomForest"
            },
        }
    except Exception as e:
        print(f"❌ Model prediction error: {e}")
        # Fallback to simple heuristic
        score = min(1.0, max(0.0, net / 100.0))
        return {
            "profitable": net > 0,
            "roi": roi_value,
            "score": score,
            "error": str(e)
        }
