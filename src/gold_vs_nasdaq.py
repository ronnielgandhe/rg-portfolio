"""
gold_vs_nasdaq.py

Production-ready computation of rolling divergence z-score between Nasdaq and gold.

This script downloads daily price data for ^NDX (Nasdaq 100) and GC=F (gold futures),
computes log returns, and runs a rolling OLS regression to measure divergence.

Output: Latest z-score printed to console + full history saved to CSV.

Dependencies:
    pandas, numpy, yfinance, statsmodels

Usage:
    python gold_vs_nasdaq.py
"""

import pandas as pd
import numpy as np
import yfinance as yf
from statsmodels.regression.rolling import RollingOLS
import statsmodels.api as sm
import warnings
from pathlib import Path

warnings.filterwarnings("ignore", category=RuntimeWarning)

# Configuration
START = "2015-01-01"
END = None  # None defaults to today
TICKERS = ["^NDX", "GC=F"]
WINDOW = 90  # days
OUTPUT_DIR = Path("./data")
OUTPUT_FILE = OUTPUT_DIR / "gold_nq_signal.csv"


def fetch_prices(tickers, start, end):
    """
    Download daily adjusted close prices from Yahoo Finance.
    
    Parameters
    ----------
    tickers : list of str
        Yahoo Finance ticker symbols
    start : str
        Start date (YYYY-MM-DD)
    end : str or None
        End date (YYYY-MM-DD), None for today
    
    Returns
    -------
    pd.DataFrame
        Adjusted close prices with tickers as columns
    
    Raises
    ------
    ValueError
        If download fails or returns empty data
    """
    try:
        print(f"Fetching data for {', '.join(tickers)} from {start}...")
        data = yf.download(tickers, start=start, end=end, progress=False, auto_adjust=True)
        
        if data.empty:
            raise ValueError("No data returned from yfinance")
        
        # Handle multi-index columns (when multiple tickers)
        if isinstance(data.columns, pd.MultiIndex):
            data = data["Close"]
        else:
            # Single ticker case
            data = data[["Close"]]
            data.columns = tickers
        
        # Drop rows with any missing values
        data = data.dropna()
        
        if len(data) < WINDOW:
            raise ValueError(f"Insufficient data: {len(data)} days < {WINDOW} window")
        
        print(f"Downloaded {len(data)} days of data")
        return data
    
    except Exception as e:
        raise ValueError(f"Failed to fetch price data: {e}")


def compute_rolling_signal(df, window=90):
    """
    Compute rolling regression of Nasdaq on gold returns and extract divergence metrics.
    
    The regression is:
        r_NQ(t) = alpha(t) + beta(t) * r_XAU(t) + epsilon(t)
    
    where alpha, beta are estimated over a rolling window, and epsilon is the residual.
    The z-score is: z(t) = epsilon(t) / sigma_epsilon(window)
    
    Parameters
    ----------
    df : pd.DataFrame
        Columns: ^NDX (Nasdaq 100), GC=F (gold futures)
        Index: DatetimeIndex
    window : int
        Rolling window size in days
    
    Returns
    -------
    pd.DataFrame
        Columns:
            - eps: residuals (unexplained Nasdaq return)
            - z: z-score of residuals
            - beta_xau: rolling beta coefficient (Nasdaq sensitivity to gold)
            - alpha: rolling intercept
    """
    # Compute log returns
    returns = np.log(df / df.shift(1)).dropna()
    returns.columns = ["NQ", "XAU"]
    
    print(f"Computing rolling OLS with {window}-day window...")
    
    # Prepare data for regression
    X = sm.add_constant(returns["XAU"])  # Add intercept
    y = returns["NQ"]
    
    # Rolling OLS: NQ ~ const + XAU
    model = RollingOLS(y, X, window=window)
    fitted = model.fit()
    
    # Compute residuals manually: y - y_hat
    y_hat = fitted.params["const"] + fitted.params["XAU"] * returns["XAU"]
    residuals = y - y_hat
    
    # Extract results
    result = pd.DataFrame({
        "alpha": fitted.params["const"],
        "beta_xau": fitted.params["XAU"],
        "eps": residuals,
    }, index=returns.index)
    
    # Rolling standard deviation of residuals
    result["eps_std"] = result["eps"].rolling(window).std()
    
    # Z-score: standardized residual
    result["z"] = result["eps"] / result["eps_std"]
    
    # Drop rows with NaN (first window days)
    result = result.dropna()
    
    print(f"Generated {len(result)} signal observations")
    return result


def save_output(signal_df, output_path):
    """
    Save signal DataFrame to CSV.
    
    Parameters
    ----------
    signal_df : pd.DataFrame
        Signal data with DatetimeIndex
    output_path : Path
        Output file path
    """
    # Create output directory if it doesn't exist
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write to CSV
    signal_df.to_csv(output_path)
    print(f"\nSaved full history to {output_path}")


def print_summary(signal_df):
    """
    Print summary statistics and latest values.
    
    Parameters
    ----------
    signal_df : pd.DataFrame
        Signal data
    """
    latest = signal_df.iloc[-1]
    latest_date = signal_df.index[-1]
    
    print("\n" + "=" * 60)
    print("LATEST SIGNAL")
    print("=" * 60)
    print(f"Date:         {latest_date.date()}")
    print(f"Z-score:      {latest['z']:>7.2f}")
    print(f"Residual:     {latest['eps']:>7.4f}")
    print(f"Beta (XAU):   {latest['beta_xau']:>7.3f}")
    print(f"Alpha:        {latest['alpha']:>7.4f}")
    print("=" * 60)
    
    print("\nLast 5 observations:")
    print(signal_df[["z", "eps", "beta_xau", "alpha"]].tail().to_string())
    
    print("\nZ-score summary statistics:")
    print(signal_df["z"].describe().to_string())


def main():
    """
    Main execution flow.
    """
    try:
        # Step 1: Fetch price data
        prices = fetch_prices(TICKERS, START, END)
        
        # Step 2: Compute rolling signal
        signal = compute_rolling_signal(prices, window=WINDOW)
        
        # Step 3: Save to CSV
        save_output(signal, OUTPUT_FILE)
        
        # Step 4: Print summary
        print_summary(signal)
        
        print("\n✓ Script completed successfully")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        raise


if __name__ == "__main__":
    main()
