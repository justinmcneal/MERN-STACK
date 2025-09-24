# llm/service.py
from fastapi import FastAPI
from pydantic import BaseModel
from predict import predict_opportunity

app = FastAPI()


class OppInput(BaseModel):
    token: str
    chain: str
    price: float
    gas: float

@app.post("/predict")
def get_prediction(data: OppInput):
    result = predict_opportunity(
        token=data.token,
        chain=data.chain,
        price=data.price,
        gas=data.gas
    )
    return result
