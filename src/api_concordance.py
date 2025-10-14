"""
api_concordance.py
FastAPI endpoint for concordance signal.
Run: uvicorn src.api_concordance:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
import pandas as pd
import numpy as np
import yfinance as yf
import statsmodels.api as sm

app = FastAPI(title="Concordance Signal API")

# CORS for local dev (allow all origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for data (in production, use Redis or DynamoDB)
_cache = {"data": None, "timestamp": None}

class ConcordanceResponse(BaseModel):
    """API response schema."""
    date: str
    concordance_score: float
    prob_concordant: float
    betas: Dict[str, float]
    latest_inputs: Dict[str, float]

def fetch_and_compute():
    """Fetch latest data and compute signal (cache for 5 min in prod)."""
    from concordance_signal import fetch_prices, compute_concordance, fit_logit
    
    # Fetch prices
    prices = fetch_prices()
    
    # Compute concordance
    signal = compute_concordance(prices, window=90)
    
    # Fit logit
    model = fit_logit(signal)
    
    # Latest values
    latest = signal.iloc[-1]
    latest_X = sm.add_constant(signal[["dRealY", "DXY", "VIX"]].iloc[-1])
    latest_prob = model.predict(latest_X)[0]
    
    # Extract coefficients
    betas = {
        "const": float(model.params["const"]),
        "dRealY": float(model.params["dRealY"]),
        "DXY": float(model.params["DXY"]),
        "VIX": float(model.params["VIX"]),
    }
    
    return {
        "date": str(signal.index[-1].date()),
        "concordance_score": float(latest["S"]),
        "prob_concordant": float(latest_prob),
        "betas": betas,
        "latest_inputs": {
            "dRealY": float(latest["dRealY"]),
            "rDXY": float(latest["DXY"]),
            "rVIX": float(latest["VIX"]),
        }
    }

@app.get("/")
def root():
    """Health check."""
    return {"status": "ok", "service": "concordance-signal"}

@app.get("/signals/concordance", response_model=ConcordanceResponse)
def get_concordance():
    """
    Get latest concordance signal and logit model predictions.
    
    Returns
    -------
    ConcordanceResponse
        Latest concordance score, P(I=1), betas, and macro inputs.
    """
    result = fetch_and_compute()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
