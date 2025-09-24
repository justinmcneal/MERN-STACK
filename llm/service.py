# llm/service.py
from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_opportunity

app = FastAPI()

class OppInput(BaseModel):
    price_diff: float
    gas_cost: float

@app.post("/predict")
def get_prediction(data: OppInput):
    result = predict_opportunity(data.price_diff, data.gas_cost)
    return result
