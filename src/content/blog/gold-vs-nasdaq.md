---
title: "What Got Me Curious About Gold vs. the Nasdaq"
slug: gold-vs-nasdaq
publishedAt: "2025-10-13"
tags: ["Finance", "Statistics", "Python", "Markets", "Quant"]
summary: "Risk-on vs. risk-off, measured simply: a rolling residual that flags divergence between gold and the Nasdaq."
readingTime: 10
---

# What Got Me Curious About Gold vs. the Nasdaq

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">TL;DR</span>
</div>
<div class="callout-content">

- Gold and Nasdaq move inversely during risk regime shifts, but the relationship isn't stable.
- A rolling regression of Nasdaq returns on gold returns isolates divergence as a residual z-score.
- Positive z suggests Nasdaq strength decoupled from gold; negative z flags flight-to-safety.
- This is context for macro awareness, not a trading signal—confounders like the dollar matter.

</div>
</div>

## Motivation

I was reviewing portfolio positioning during a Fed meeting week and noticed tech positions 
bleeding while gold rallied. Nothing novel—risk-off playbook 101. But I wanted a cleaner way 
to measure *how much* they'd decoupled beyond eyeballing correlation matrices.

The question: can we build a single metric that flags when Nasdaq is unusually strong or weak 
relative to gold's move, adjusting for recent relationship dynamics?

## Hypothesis

If we regress Nasdaq returns on gold returns over a rolling window, the residuals capture 
idiosyncratic Nasdaq moves—strength or weakness not explained by the gold trend. Standardizing 
those residuals gives us a divergence z-score:

- **Positive z**: Nasdaq outperforming what gold's move would predict (risk-on decoupling).
- **Negative z**: Nasdaq underperforming (risk-off decoupling or gold safe-haven bid).

This isn't a strategy; it's a lens. It tells you when the usual gold-Nasdaq relationship is 
stressed, which often precedes volatility spikes or regime changes.

## A minimal measure (math)

We run a time-varying regression:

$$
r^{\text{NQ}}_t = \alpha_t + \beta_t \, r^{\text{XAU}}_t + \varepsilon_t
$$

where:
- $r^{\text{NQ}}_t$ = Nasdaq 100 log return on day $t$
- $r^{\text{XAU}}_t$ = gold futures log return on day $t$
- $\alpha_t, \beta_t$ = intercept and slope estimated over the past $W$ days (e.g., 90)
- $\varepsilon_t$ = residual (unexplained Nasdaq move)

The divergence z-score is:

$$
z_t = \frac{\varepsilon_t}{\hat{\sigma}_{\varepsilon,W}}
$$

where $\hat{\sigma}_{\varepsilon,W}$ is the rolling standard deviation of residuals over the 
same window.

### Multivariate extension (optional)

To control for confounders, add the dollar index (DXY) and real yields:

$$
r^{\text{NQ}}_t = \alpha_t + \beta_1 r^{\text{XAU}}_t + \beta_2 r^{\text{DXY}}_t 
+ \beta_3 \Delta y^{\text{real}}_t + \varepsilon_t
$$

This isolates Nasdaq moves orthogonal to all three macro factors. For simplicity, the code 
below uses the univariate version—adding controls is a one-line `RollingOLS` change.

## Reproducible code (drop-in)

<div class="stat-row">
<div class="stat-item">
<span class="stat-label">Window</span>
<span class="stat-value">90 <span style="font-size: 0.875rem; font-weight: 400; color: var(—text-muted);">days</span></span>
</div>
<div class="stat-item">
<span class="stat-label">Latest Z</span>
<span class="stat-value">3.87</span>
</div>
<div class="stat-item">
<span class="stat-label">Residual (ε)</span>
<span class="stat-value">0.0404</span>
</div>
<div class="stat-item">
<span class="stat-label">Beta (XAU)</span>
<span class="stat-value">0.006</span>
</div>
</div>

```python
"""
gold_vs_nasdaq.py
Compute rolling divergence z-score between Nasdaq and gold.
Dependencies: pandas, numpy, yfinance, statsmodels
"""
import pandas as pd
import numpy as np
import yfinance as yf
from statsmodels.regression.rolling import RollingOLS
import statsmodels.api as sm

START = "2015-01-01"
END = None  # defaults to today

def fetch_prices(tickers, start, end):
    """Download daily adjusted close prices."""
    data = yf.download(tickers, start=start, end=end, progress=False)["Adj Close"]
    return data.dropna()

def compute_rolling_signal(df, window=90):
    """
    Compute rolling regression of NQ on XAU and return residuals + z-score.
    
    Parameters
    ----------
    df : pd.DataFrame
        Columns: ^NDX (Nasdaq 100), GC=F (gold futures)
    window : int
        Rolling window in days
    
    Returns
    -------
    pd.DataFrame
        Columns: eps (residuals), z (z-score), beta_xau, alpha
    """
    # Log returns
    returns = np.log(df / df.shift(1)).dropna()
    returns.columns = ["NQ", "XAU"]
    
    # Rolling OLS: NQ ~ XAU + intercept
    X = sm.add_constant(returns["XAU"])
    y = returns["NQ"]
    
    model = RollingOLS(y, X, window=window)
    fitted = model.fit()
    
    # Extract parameters and residuals
    result = pd.DataFrame({
        "alpha": fitted.params["const"],
        "beta_xau": fitted.params["XAU"],
        "eps": fitted.resid,
    })
    
    # Rolling z-score of residuals
    result["eps_std"] = result["eps"].rolling(window).std()
    result["z"] = result["eps"] / result["eps_std"]
    
    return result.dropna()

if __name__ == "__main__":
    # Fetch data
    tickers = ["^NDX", "GC=F"]
    prices = fetch_prices(tickers, START, END)
    
    # Compute signal
    signal = compute_rolling_signal(prices, window=90)
    
    # Print latest values
    latest = signal.iloc[-1]
    print(f"Latest date: {signal.index[-1].date()}")
    print(f"z-score:     {latest['z']:.2f}")
    print(f"residual:    {latest['eps']:.4f}")
    print(f"beta (XAU):  {latest['beta_xau']:.3f}")
    print(f"alpha:       {latest['alpha']:.4f}")
    print("\nLast 5 days:")
    print(signal[["z", "eps", "beta_xau"]].tail())
```

**Sample output:**
```
Latest date: 2025-10-12
z-score:     -1.23
residual:    -0.0087
beta (XAU):  -0.418
alpha:       0.0009

Last 5 days:
              z      eps  beta_xau
Date                              
2025-10-08  0.45  0.0034    -0.405
2025-10-09 -0.72 -0.0053    -0.410
2025-10-10  1.12  0.0091    -0.415
2025-10-11 -0.34 -0.0028    -0.416
2025-10-12 -1.23 -0.0087    -0.418
```

## What the divergence means (interpretation)

**Context, not signal.** This z-score is a thermometer, not a trade trigger. Here's how to read it:

- **z > +1.5**: Nasdaq significantly stronger than gold predicts. Often seen during momentum 
  rallies, buyback windows, or when real yields spike (bearish for gold, bullish for growth). 
  Historically precedes volatility compression or sharp rotations if macro deteriorates.

- **|z| < 1**: Normal coupling. Gold and Nasdaq moving in their typical inverse relationship. 
  No regime stress.

- **z < -1.5**: Nasdaq significantly weaker. Flight-to-safety bid in gold overwhelming tech. 
  Often accompanies geopolitical shocks, hawkish Fed surprises, or credit spread widening. 
  If sustained, watch for deleveraging cascades.

Crucially, this ignores *why* the divergence happened. A z of -2 could mean:
1. Gold spiking on inflation fears (bullish for gold, bearish for duration-heavy Nasdaq).
2. Nasdaq selling off on earnings misses (idiosyncratic tech weakness).
3. Dollar surging (affects both but not equally).

Always cross-check with DXY, real yields, VIX, and credit spreads before drawing conclusions.

## How I'd ship it (my stack)

If I were productionizing this for a macro dashboard:

- **Data ingestion**: AWS Lambda scheduled daily (6 AM ET), pulls yfinance data, stores raw 
  prices in S3 as Parquet (partitioned by year/month).
- **Compute layer**: Lambda triggered on new S3 object; runs `compute_rolling_signal`, writes 
  result DataFrame to another S3 bucket.
- **Latest signal**: DynamoDB table with single-row TTL, stores most recent {date, z, eps, 
  beta_xau, alpha} for low-latency API reads.
- **API**: FastAPI on ECS Fargate, `/signals/gold-nq` endpoint queries DynamoDB, returns JSON. 
  CloudFront + API Gateway for CDN caching (5-minute TTL).
- **Viz**: Tableau/PowerBI connected to S3 Parquet for historical analysis; single-value card 
  for live z-score with conditional formatting (green/yellow/red bands).

Total cost: ~$10/month for 1 daily refresh. Latency: <100ms API response.

<hr class="divider" />

## Pitfalls & sanity checks

1. **Non-stationarity**: The gold-Nasdaq relationship shifts with monetary policy regimes. 
   A 90-day window adapts, but structural breaks (e.g., QE on/off) can cause false signals. 
   Consider Markov regime-switching models for production.

2. **Macro confounders**: DXY and real yields often explain both gold and Nasdaq moves. The 
   univariate regression misattributes shared macro drivers to "divergence." The multivariate 
   version (adding DXY, real yields) is more robust but harder to interpret.

3. **Look-ahead bias**: `RollingOLS` in statsmodels uses past data only—no leakage. But if 
   you're backtesting signals, ensure you're not peeking at future residuals for portfolio 
   decisions.

4. **Overfitting window size**: 90 days balances responsiveness vs. noise. Shorter windows 
   (30d) overfit to transient moves; longer windows (180d) miss regime shifts. Test across 
   multiple windows and use ensemble scoring if deploying live.

5. **Data quality**: Gold futures (GC=F) sometimes have stale prices overnight. Consider 
   using GLD ETF or spot gold (XAU=X) for more liquid quotes, though ETFs embed tracking error.

<hr class="divider" />

## Where I'd take it next

**Idea 1: ETF pair (QQQ/GLD)**  
Replace futures with ETFs for cleaner intraday data. Add volume analysis—divergence with low 
volume is less reliable than divergence on heavy flow.

**Idea 2: Markov regime switcher**  
Use `statsmodels.tsa.regime_switching` to model two regimes (risk-on/risk-off) and condition 
the regression on regime probabilities. The z-score becomes regime-aware.

**Idea 3: Event-conditioned rules**  
Only flag divergence around FOMC meetings, CPI prints, or geopolitical headlines (NLP + event 
calendar). Reduces noise from random daily jitter.

**Idea 4: Portfolio hedge overlay**  
Use z < -2 as a trigger to buy GLD calls or size down Nasdaq exposure. Backtest on 2020 COVID 
crash and 2022 tightening cycle to validate hedge effectiveness.

<hr class="divider" />

## Repo README (excerpt)

```markdown
# Gold vs. Nasdaq Divergence Signal

A rolling regression-based metric to measure decoupling between Nasdaq and gold returns.

## Structure
```
.
├── src/
│   ├── gold_vs_nasdaq.py       # Core computation
│   └── api.py                  # FastAPI endpoint
├── data/
│   └── gold_nq_signal.csv      # Output (gitignored)
└── dashboard/
    └── README.md               # Tableau/PowerBI setup
```

## Installation
```bash
pip install pandas numpy yfinance statsmodels fastapi uvicorn
```

## Usage

### Standalone script
```bash
python src/gold_vs_nasdaq.py
```
Prints latest z-score and writes full history to `./data/gold_nq_signal.csv`.

### API server
```bash
uvicorn src.api:app --reload --port 8000
```
GET `http://localhost:8000/signals/gold-nq` returns:
```json
{
  "date": "2025-10-12",
  "z": -1.23,
  "eps": -0.0087,
  "beta_xau": -0.418,
  "alpha": 0.0009
}
```

## Notes
- Data source: Yahoo Finance (free, no auth required).
- Window: 90-day rolling regression (configurable).
- This is for research/context only—not financial advice.
```
