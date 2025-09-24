# llm/predict.py

import joblib
import numpy as np
import pandas as pd

# Load trained model
model = joblib.load("models/arbitrage_model.pkl")
# Load feature names in correct order
with open("models/arbitrage_model_features.txt") as f:
    FEATURE_NAMES = [line.strip() for line in f.readlines()]

# List of all tokens and chains used in training
TOKENS = ["ETH", "USDT", "USDC", "BNB", "MATIC"]
CHAINS = ["ethereum", "polygon", "bsc"]

def predict_opportunity(token, chain, price, gas):
    # Prepare input features as in training
    roi = price - gas
    features = {
        "price": price,
        "gas": gas,
        "roi": roi,
    }
    for t in TOKENS:
        features[f"token_{t}"] = 1 if token == t else 0
    for c in CHAINS:
        features[f"chain_{c}"] = 1 if chain == c else 0
    # Ensure all features are present and in correct order
    X = pd.DataFrame([[features.get(feat, 0) for feat in FEATURE_NAMES]], columns=FEATURE_NAMES)
    prediction = model.predict(X)[0]
    probability = model.predict_proba(X)[0][1]  # probability it's profitable
    return {
        "profitable": bool(prediction),
        "roi": roi,
        "score": float(probability)
    }
