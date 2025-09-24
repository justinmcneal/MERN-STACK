# llm/train.py
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# ---- Step 1: Generate synthetic data ----
def generate_dataset(n=1000):
    price_diff = np.random.uniform(0, 1000, n)   # price differences
    gas_cost = np.random.uniform(1, 50, n)       # gas fees
    roi = price_diff - gas_cost                  # profit after gas
    label = (roi > 0).astype(int)                # profitable or not

    df = pd.DataFrame({
        "price_diff": price_diff,
        "gas_cost": gas_cost,
        "roi": roi,
        "label": label
    })
    return df

# ---- Step 2: Train model ----
def train_model():
    df = generate_dataset(5000)
    X = df[["price_diff", "gas_cost", "roi"]]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    acc = model.score(X_test, y_test)
    print(f"✅ Model trained. Accuracy: {acc:.2f}")

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, "models/arbitrage_model.pkl")

if __name__ == "__main__":
    train_model()
