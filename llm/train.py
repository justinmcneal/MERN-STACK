# llm/train.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os
from tokens_config import SUPPORTED_TOKENS, SUPPORTED_CHAINS


# ---- Step 1: Load real data ----
def load_market_data():
    market_path = "data/raw/market_data.csv"
    if not os.path.exists(market_path):
        raise FileNotFoundError(f"{market_path} not found. Run fetch_data.py first.")
    df = pd.read_csv(market_path)
    # Add chain and token columns for each price
    records = []
    for _, row in df.iterrows():
        for token in SUPPORTED_TOKENS:
            records.append({
                "timestamp": row["timestamp"],
                "token": token,
                "chain": "ethereum" if token in ["ETH", "USDT", "USDC"] else ("bsc" if token == "BNB" else "polygon"),
                "price": row[f"{token}_price"],
                "gas": row["eth_gas_gwei"] if token in ["ETH", "USDT", "USDC"] else (row["bsc_gas_gwei"] if token == "BNB" else row["polygon_gas_gwei"])
            })
    return pd.DataFrame(records)

def load_historical_data():
    hist_path = "data/raw/historical_data.csv"
    if not os.path.exists(hist_path):
        return None
    df = pd.read_csv(hist_path)
    return df

# ---- Step 2: Train model ----



market_df = load_market_data()
# Feature engineering
market_df["gas"] = pd.to_numeric(market_df["gas"], errors="coerce").fillna(0)
market_df["price"] = pd.to_numeric(market_df["price"], errors="coerce").fillna(0)
market_df["roi"] = market_df["price"] - market_df["gas"]
# Label: profitable if roi > 0
market_df["label"] = (market_df["roi"] > 0).astype(int)
# Encode categorical features
market_df = pd.get_dummies(market_df, columns=["token", "chain"])
# Select features
features = [c for c in market_df.columns if c not in ["timestamp", "label"]]
X = market_df[features]
y = market_df["label"]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
acc = model.score(X_test, y_test)
print(f"✅ Model trained on real data. Accuracy: {acc:.2f}")
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/arbitrage_model.pkl")
# Save feature names for prediction
with open("models/arbitrage_model_features.txt", "w") as f:
    for feat in features:
        f.write(feat + "\n")

