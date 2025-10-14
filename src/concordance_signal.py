"""
concordance_signal.py
Compute concordance score and logit model for equities + safe havens.
Dependencies: pandas, numpy, yfinance, statsmodels
"""
import pandas as pd
import numpy as np
import yfinance as yf
import statsmodels.api as sm
from pathlib import Path

START = "2020-01-01"
END = None  # defaults to today

def fetch_prices():
    """Download daily prices for equities, gold, bonds, USD, VIX."""
    tickers = {
        "EQ": "QQQ",       # Nasdaq proxy
        "XAU": "GLD",      # Gold ETF (more liquid than GC=F for daily)
        "UST": "TLT",      # 20Y+ Treasury ETF
        "DXY": "UUP",      # Dollar index ETF
        "VIX": "^VIX",     # VIX index
        "REAL": "^TNX",    # 10Y nominal yield (we'll proxy real yield)
    }
    
    # Download with error handling
    try:
        data = yf.download(list(tickers.values()), start=START, end=END, progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data = data["Adj Close"]
        data.columns = list(tickers.keys())
        
        # Check if we got valid data
        if len(data) == 0:
            raise ValueError("No data retrieved from yfinance")
        
        return data.dropna()
    except Exception as e:
        print(f"Error fetching data: {e}")
        print("This may be due to API rate limits or network issues.")
        print("If running this repeatedly, consider caching data or adding delays.")
        raise

def compute_concordance(df, window=90):
    """
    Compute concordance indicator I_t and rolling score S_t.
    
    Parameters
    ----------
    df : pd.DataFrame
        Columns: EQ, XAU, UST, DXY, VIX, REAL
    window : int
        Rolling window in days
    
    Returns
    -------
    pd.DataFrame
        Columns: I (indicator), S (rolling score), returns, real yield change
    """
    # Log returns
    returns = np.log(df / df.shift(1)).dropna()
    
    # Proxy real yield change: we'll use negative TLT return as a simple heuristic
    # (Rising bond prices = falling yields; more rigorous: use TIPS or TNX - breakeven)
    # For simplicity: delta_real_yield ≈ -r_TLT (rough but keeps code minimal)
    returns["dRealY"] = -returns["UST"]  # Proxy: bond selloff = rising real yield
    
    # Concordance indicator: EQ up AND (XAU up OR UST up)
    returns["I"] = (
        (returns["EQ"] > 0) & ((returns["XAU"] > 0) | (returns["UST"] > 0))
    ).astype(int)
    
    # Rolling concordance score
    returns["S"] = returns["I"].rolling(window).mean()
    
    return returns.dropna()

def fit_logit(df):
    """
    Fit logistic regression: P(I=1) ~ dRealY + rDXY + rVIX.
    
    Parameters
    ----------
    df : pd.DataFrame
        Must have columns: I, dRealY, DXY, VIX
    
    Returns
    -------
    model : statsmodels.LogitResults
    """
    # Drop any remaining NaNs (VIX can have gaps)
    data = df[["I", "dRealY", "DXY", "VIX"]].dropna()
    
    # Independent variables
    X = data[["dRealY", "DXY", "VIX"]]
    X = sm.add_constant(X)
    y = data["I"]
    
    # Fit logit
    model = sm.Logit(y, X).fit(disp=0)
    return model

if __name__ == "__main__":
    try:
        # Fetch data
        print("Fetching prices...")
        prices = fetch_prices()
        
        # Compute concordance
        print("Computing concordance score...")
        signal = compute_concordance(prices, window=90)
        
        # Fit logit model
        print("Fitting logit model...")
        model = fit_logit(signal)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        print("\nNote: This script requires internet access and may fail due to:")
        print("  - Yahoo Finance API rate limits or downtime")
        print("  - Network connectivity issues")
        print("  - Insufficient data after filtering")
        print("\nFor production use, implement caching and retry logic.")
        import sys
        sys.exit(1)
    
    # Print coefficients
    print("\n" + "="*60)
    print("LOGIT MODEL: P(I=1) ~ dRealY + rDXY + rVIX")
    print("="*60)
    print(model.summary().tables[1])
    
    # Latest values
    latest = signal.iloc[-1]
    latest_X = sm.add_constant(signal[["dRealY", "DXY", "VIX"]].iloc[-1])
    latest_prob = model.predict(latest_X)[0]
    
    print("\n" + "="*60)
    print("LATEST SIGNAL")
    print("="*60)
    print(f"Date:              {signal.index[-1].date()}")
    print(f"Concordance (I):   {int(latest['I'])}")
    print(f"Rolling Score (S): {latest['S']:.3f}")
    print(f"dRealY (proxy):    {latest['dRealY']:.4f}")
    print(f"rDXY:              {latest['DXY']:.4f}")
    print(f"rVIX:              {latest['VIX']:.4f}")
    print(f"P(I=1) predicted:  {latest_prob:.3f}")
    
    # Last 10 days summary
    print("\n" + "="*60)
    print("LAST 10 DAYS")
    print("="*60)
    summary = signal[["I", "S", "dRealY", "DXY"]].tail(10)
    # Compute predicted probs for last 10
    X_last10 = sm.add_constant(signal[["dRealY", "DXY", "VIX"]].tail(10))
    summary["P(I=1)"] = model.predict(X_last10)
    print(summary.to_string())
    
    # Save to CSV if data folder exists
    data_dir = Path("./data")
    if data_dir.exists():
        out_path = data_dir / "concordance_signal.csv"
        signal.to_csv(out_path)
        print(f"\n✓ Saved full history to {out_path}")
    else:
        print("\n(data/ folder not found; skipping CSV export)")
