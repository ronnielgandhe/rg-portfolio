"""
api.py

FastAPI endpoint for gold vs. Nasdaq divergence signal.

Provides a simple REST API to query the latest divergence metrics.
For production, consider caching results in Redis/DynamoDB.

Dependencies:
    fastapi, uvicorn, pandas, numpy, yfinance, statsmodels

Usage:
    uvicorn api:app --reload --port 8000

Endpoints:
    GET /signals/gold-nq
        Returns latest divergence metrics as JSON
    
    GET /health
        Health check endpoint
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import pandas as pd

# Import our signal computation
import sys
from pathlib import Path

# Add parent directory to path to import gold_vs_nasdaq module
sys.path.append(str(Path(__file__).parent))

try:
    from gold_vs_nasdaq import fetch_prices, compute_rolling_signal, TICKERS, START, WINDOW
except ImportError:
    # Fallback if running from different directory
    import gold_vs_nasdaq
    fetch_prices = gold_vs_nasdaq.fetch_prices
    compute_rolling_signal = gold_vs_nasdaq.compute_rolling_signal
    TICKERS = gold_vs_nasdaq.TICKERS
    START = gold_vs_nasdaq.START
    WINDOW = gold_vs_nasdaq.WINDOW


# Initialize FastAPI app
app = FastAPI(
    title="Gold vs. Nasdaq Divergence API",
    description="REST API for querying gold-Nasdaq rolling divergence metrics",
    version="1.0.0"
)

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Response models
class SignalResponse(BaseModel):
    """Response model for divergence signal."""
    date: str
    z: float
    eps: float
    beta_xau: float
    alpha: float
    window_days: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-10-12",
                "z": -1.23,
                "eps": -0.0087,
                "beta_xau": -0.418,
                "alpha": 0.0009,
                "window_days": 90
            }
        }


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    timestamp: str


# Cache for signal data (simple in-memory cache)
# For production, use Redis or similar
_signal_cache = {
    "data": None,
    "timestamp": None
}


def get_latest_signal():
    """
    Fetch and compute the latest signal.
    
    In production, this should:
    1. Check cache TTL (e.g., 5 minutes)
    2. If stale, recompute and update cache
    3. Return cached result if fresh
    
    Returns
    -------
    dict
        Latest signal metrics
    
    Raises
    ------
    Exception
        If computation fails
    """
    # Simple time-based cache (5 minutes)
    now = datetime.utcnow()
    
    if (_signal_cache["data"] is not None and 
        _signal_cache["timestamp"] is not None):
        elapsed = (now - _signal_cache["timestamp"]).total_seconds()
        if elapsed < 300:  # 5 minutes
            return _signal_cache["data"]
    
    # Compute fresh signal
    try:
        prices = fetch_prices(TICKERS, START, None)
        signal = compute_rolling_signal(prices, window=WINDOW)
        
        # Extract latest row
        latest = signal.iloc[-1]
        latest_date = signal.index[-1]
        
        result = {
            "date": latest_date.strftime("%Y-%m-%d"),
            "z": round(float(latest["z"]), 4),
            "eps": round(float(latest["eps"]), 6),
            "beta_xau": round(float(latest["beta_xau"]), 4),
            "alpha": round(float(latest["alpha"]), 6),
            "window_days": WINDOW
        }
        
        # Update cache
        _signal_cache["data"] = result
        _signal_cache["timestamp"] = now
        
        return result
    
    except Exception as e:
        raise Exception(f"Failed to compute signal: {str(e)}")


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Gold vs. Nasdaq Divergence API",
        "version": "1.0.0",
        "endpoints": {
            "signal": "/signals/gold-nq",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    
    Returns server status and current timestamp.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/signals/gold-nq", response_model=SignalResponse, tags=["Signals"])
async def get_gold_nasdaq_signal():
    """
    Get the latest gold vs. Nasdaq divergence signal.
    
    Returns
    -------
    SignalResponse
        Latest divergence metrics including:
        - date: Signal date (YYYY-MM-DD)
        - z: Z-score of residuals (standardized divergence)
        - eps: Raw residual (unexplained Nasdaq return)
        - beta_xau: Rolling beta coefficient (Nasdaq sensitivity to gold)
        - alpha: Rolling intercept
        - window_days: Rolling window size
    
    Raises
    ------
    HTTPException
        500 if signal computation fails
    
    Notes
    -----
    - Positive z: Nasdaq stronger than gold predicts (risk-on)
    - Negative z: Nasdaq weaker than gold predicts (risk-off)
    - |z| > 1.5 typically indicates significant divergence
    - Results are cached for 5 minutes
    """
    try:
        signal = get_latest_signal()
        return signal
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("Starting Gold vs. Nasdaq Divergence API...")
    print("Docs available at: http://localhost:8000/docs")
    
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
