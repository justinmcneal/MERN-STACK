#!/usr/bin/env python3
"""
Train ML model using REAL opportunity data from MongoDB.
NO MOCK DATA. NO FALLBACKS.
"""

import os
import sys
import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib
from dotenv import load_dotenv
from tokens_config import SUPPORTED_TOKENS, SUPPORTED_CHAINS

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/MERN-STACK")
MIN_SAMPLES = 10  # Minimum samples needed for training


def load_opportunities_from_mongodb():
    """Load real opportunity data from MongoDB."""
    print(f"📡 Connecting to MongoDB: {MONGO_URI}")
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    
    # Fetch all opportunities (both active and expired)
    opportunities = list(db.opportunities.find({}))
    print(f"📊 Found {len(opportunities)} opportunities in database")
    
    if len(opportunities) == 0:
        print("❌ ERROR: No opportunities found in database!")
        print("   Run the data pipeline first: npx ts-node server/scripts/runPipeline.ts")
        sys.exit(1)
    
    # Fetch token info to map tokenId to symbol/chain
    tokens = {str(t["_id"]): t for t in db.tokens.find({})}
    print(f"📊 Found {len(tokens)} tokens in database")
    
    client.close()
    
    # Convert to training data
    records = []
    for opp in opportunities:
        token_id = str(opp.get("tokenId"))
        token_info = tokens.get(token_id)
        
        if not token_info:
            continue
        
        # Extract features
        record = {
            "symbol": token_info.get("symbol", "UNKNOWN"),
            "chainFrom": opp.get("chainFrom", "ethereum"),
            "chainTo": opp.get("chainTo", "polygon"),
            "grossProfit": float(opp.get("estimatedProfit", 0)),
            "netProfit": float(opp.get("netProfit", 0)),
            "gasCost": float(opp.get("gasCost", 0)),
            "priceDiff": float(opp.get("priceDiff", 0)),
            "priceDiffPercent": float(opp.get("priceDiffPercent", 0)),
            "roi": float(opp.get("roi", 0)) if opp.get("roi") is not None else 0.0,
            "volume": float(opp.get("volume", 1000)),
            "profitable": 1 if opp.get("status") == "active" else 0,
        }
        records.append(record)
    
    df = pd.DataFrame(records)
    print(f"✅ Loaded {len(df)} training samples")
    print(f"   Profitable: {df['profitable'].sum()}")
    print(f"   Not profitable: {(df['profitable'] == 0).sum()}")
    
    return df


def train_model(df: pd.DataFrame):
    """Train Random Forest model on real opportunity data."""
    
    if len(df) < MIN_SAMPLES:
        print(f"❌ ERROR: Need at least {MIN_SAMPLES} samples to train, got {len(df)}")
        print("   Run the opportunity scanner to generate more opportunities")
        sys.exit(1)
    
    # Feature engineering
    print("\n🔧 Engineering features...")
    
    # One-hot encode categorical features
    df_encoded = pd.get_dummies(df, columns=["symbol", "chainFrom", "chainTo"])
    
    # Separate features and labels
    feature_cols = [c for c in df_encoded.columns if c != "profitable"]
    X = df_encoded[feature_cols]
    y = df_encoded["profitable"]
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Samples: {len(X)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if len(y.unique()) > 1 else None
    )
    
    # Train model
    print("\n🤖 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        class_weight="balanced"
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"✅ Training accuracy: {train_score:.3f}")
    print(f"✅ Test accuracy: {test_score:.3f}")
    
    # Detailed metrics
    y_pred = model.predict(X_test)
    print("\n📊 Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Not Profitable", "Profitable"]))
    
    print("\n📊 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Feature importance
    print("\n📊 Top 10 Most Important Features:")
    feature_importance = pd.DataFrame({
        "feature": feature_cols,
        "importance": model.feature_importances_
    }).sort_values("importance", ascending=False)
    print(feature_importance.head(10).to_string(index=False))
    
    # Save model and features
    os.makedirs("models", exist_ok=True)
    model_path = "models/arbitrage_model.pkl"
    features_path = "models/arbitrage_model_features.txt"
    
    joblib.dump(model, model_path)
    print(f"\n💾 Saved model to {model_path}")
    
    with open(features_path, "w") as f:
        for feat in feature_cols:
            f.write(feat + "\n")
    print(f"💾 Saved features to {features_path}")
    
    return model, feature_cols


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Training ML Model with REAL MongoDB Data")
    print("=" * 60)
    
    # Load real data from MongoDB
    df = load_opportunities_from_mongodb()
    
    # Train model
    model, features = train_model(df)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Update predict.py to use the trained model")
    print("2. Start ML service: cd llm && uvicorn service:app --reload")
    print("3. Re-run opportunity scanner to score opportunities")

