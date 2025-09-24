# llm/predict.py
import joblib
import numpy as np

# NOT FINAL, INTIALIZATION ONLY
# Load trained model
model = joblib.load("models/arbitrage_model.pkl")

def predict_opportunity(price_diff, gas_cost):
    roi = price_diff - gas_cost
    features = np.array([[price_diff, gas_cost, roi]])
    prediction = model.predict(features)[0]
    probability = model.predict_proba(features)[0][1]  # probability it's profitable
    return {
        "profitable": bool(prediction),
        "roi": roi,
        "score": float(probability)
    }
