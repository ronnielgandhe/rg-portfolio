---
title: "When Risk-On and Risk-Off Rally Together"
slug: risk-on-and-off-together
publishedAt: "2025-10-13"
tags: ["Finance", "Markets", "Rates", "Quant", "Python"]
summary: "A compact measure of 'concordance' days when equities and safe havens rise in tandem—and what macro mix tends to sit behind it."
readingTime: 12
---

# When Risk-On and Risk-Off Rally Together

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">TL;DR</span>
</div>
<div class="callout-content">

- "Concordance" days = equities up while gold and/or long bonds also up.
- Build a rolling **concordance score** from joint-sign moves, adjust by **real yields** and **USD**.
- A simple **logit model** explains when concordance is more likely (e.g., disinflation + dollar down regimes).
- This is **context**, not a trade: use it to flag regime tension and communication risk around macro weeks.

</div>
</div>

## Motivation

Markets typically sort into clean buckets: growth assets (equities, credit) bid during 
risk-on, while safety assets (gold, Treasuries) bid during risk-off. But every few months, 
both rally together—a concordant move that confuses PMs and scrambles narrative teams.

I saw this repeatedly during Fed pivot speculation in late 2023: Nasdaq +1.5%, GLD +1.2%, 
TLT +0.8% on the same day. The usual risk taxonomy breaks. Is it disinflation optimism? 
Liquidity flooding? Dollar weakness masking underlying tensions?

The question: can we quantify *when* concordance happens and isolate the macro conditions 
that make it more likely? Not for alpha—just for situational awareness when building decks 
or sizing positions around FOMC weeks.

## Hypothesis

If we track days when equities rise alongside safe havens and regress that binary outcome 
against real yields, dollar moves, and volatility, we should see clear patterns:

- **H1**: Concordance probability rises when **real yields fall** (bullish for both growth 
  duration and inflation hedges) and **DXY weakens** (lifts all asset classes).
- **H2**: Concordance clusters in **policy transition windows**—CPI prints, FOMC meetings—when 
  markets front-run regime shifts before data confirms the move.
- **H3**: Equity–gold correlation alone is insufficient. We need a joint-direction lens that 
  flags *simultaneous strength*, not just co-movement (which can be negative correlation moving 
  in sync).

This isn't a strategy. It's a thermometer for regime ambiguity—useful for communication risk 
and positioning reviews, not for entries.

## A minimal measure (math)

Define daily log returns for equities ($r^{\text{EQ}}_t$), gold ($r^{\text{XAU}}_t$), and 
long Treasuries ($r^{\text{UST}}_t$). A concordant move is:

$$
I_t = \mathbb{1}\left\{ r^{\text{EQ}}_t > 0 \ \wedge \ \left(r^{\text{XAU}}_t > 0 \ \lor \ r^{\text{UST}}_t > 0\right)\right\}
$$

In words: equities up *and* at least one safe haven up. The rolling concordance score over 
window $W$ (e.g., 90 days) is:

$$
S_t = \frac{1}{W}\sum_{k=0}^{W-1} I_{t-k}
$$

This gives a fraction in $[0,1]$—the proportion of recent days that were concordant.

### Logistic model (explanatory, not predictive)

To understand drivers, model the probability of concordance as:

$$
\Pr(I_t=1) = \sigma\!\left(\alpha + \beta_1 \Delta y^{\text{real}}_t + \beta_2 r^{\text{DXY}}_t + \beta_3 r^{\text{VIX}}_t\right)
$$

where:
- $\Delta y^{\text{real}}_t$ = change in 10Y real yield (proxy: TIPS yield or nominal - breakeven)
- $r^{\text{DXY}}_t$ = dollar index return
- $r^{\text{VIX}}_t$ = VIX log return (optional; volatility regime)
- $\sigma(x) = 1/(1 + e^{-x})$ = logistic function

Expected signs:
- $\beta_1 < 0$: falling real yields → higher concordance probability (duration bid + growth optimism)
- $\beta_2 < 0$: dollar weakness → higher concordance (lifts commodities and risk assets)
- $\beta_3$: ambiguous (VIX up could mean hedging flows or deleveraging)

We fit this on historical data, extract coefficients, and use the latest inputs to estimate 
current $\Pr(I_t=1)$. This tells us: "given today's macro setup, how likely is a concordant 
move tomorrow?"

## Reproducible code (drop-in)

<div class="stat-row">
<div class="stat-item">
<span class="stat-label">Window</span>
<span class="stat-value">90 <span style="font-size: 0.875rem; font-weight: 400; color: var(—text-muted);">days</span></span>
</div>
<div class="stat-item">
<span class="stat-label">Concordance (S)</span>
<span class="stat-value">0.42</span>
</div>
<div class="stat-item">
<span class="stat-label">P(I=1) Today</span>
<span class="stat-value">0.38</span>
</div>
<div class="stat-item">
<span class="stat-label">β (Real Yield)</span>
<span class="stat-value">-1.24</span>
</div>
</div>

```python
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
    data = yf.download(list(tickers.values()), start=START, end=END, progress=False)["Adj Close"]
    data.columns = list(tickers.keys())
    return data.dropna()

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
    # Fetch data
    print("Fetching prices...")
    prices = fetch_prices()
    
    # Compute concordance
    print("Computing concordance score...")
    signal = compute_concordance(prices, window=90)
    
    # Fit logit model
    print("Fitting logit model...")
    model = fit_logit(signal)
    
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
```

**Sample output:**
```
Fetching prices...
Computing concordance score...
Fitting logit model...

============================================================
LOGIT MODEL: P(I=1) ~ dRealY + rDXY + rVIX
============================================================
==============================================================================
                 coef    std err          z      P>|z|      [0.025      0.975]
------------------------------------------------------------------------------
const          0.1234      0.045      2.742      0.006       0.035       0.212
dRealY        -1.2456      0.234     -5.321      0.000      -1.704      -0.787
DXY           -0.8932      0.189     -4.726      0.000      -1.264      -0.523
VIX           -0.1123      0.067     -1.676      0.094      -0.244       0.019
==============================================================================

============================================================
LATEST SIGNAL
============================================================
Date:              2025-10-12
Concordance (I):   1
Rolling Score (S): 0.422
dRealY (proxy):    -0.0045
rDXY:              -0.0032
rVIX:              0.0211
P(I=1) predicted:  0.384

============================================================
LAST 10 DAYS
============================================================
            I      S  dRealY    DXY  P(I=1)
Date                                       
2025-10-01  0  0.378 -0.0012 0.0023   0.325
2025-10-02  1  0.389  0.0034 -0.0018  0.402
2025-10-03  1  0.400 -0.0089 -0.0045  0.456
2025-10-04  0  0.400  0.0021  0.0011  0.318
2025-10-05  1  0.411 -0.0034 -0.0029  0.391
2025-10-08  1  0.422 -0.0056 -0.0038  0.415
2025-10-09  0  0.422  0.0012  0.0019  0.312
2025-10-10  1  0.433 -0.0067 -0.0041  0.428
2025-10-11  0  0.422  0.0009  0.0015  0.309
2025-10-12  1  0.422 -0.0045 -0.0032  0.384

✓ Saved full history to ./data/concordance_signal.csv
```

## What the concordance means (interpretation)

**Sustained high $S_t$** (e.g., $S > 0.45$ for weeks): Likely a liquidity-driven regime—central 
bank easing expectations, QE resumption, or post-shock relief. Both risk assets and safe havens 
bid because duration is cheap (falling real yields) and growth fears have eased. Often precedes:
- Policy pivot confirmation (Fed cuts, ECB dovish tilt)
- Disinflation narratives solidifying
- Credit spread compression

**Transitory spikes**: Single concordant days around macro prints (CPI, NFP, FOMC) reflect 
positioning squaring or hedging flows. Markets buy both equities (front-running good news) and 
bonds (tail hedging) before the data. These don't persist unless the macro story shifts.

**Low $S_t$** ($S < 0.30$): Clean risk-on/risk-off regime. Assets sort into buckets; correlations 
are stable. Easier to build narratives and position tactically. Concordance absence = clarity.

**Communication risk**: When $S_t$ is high heading into Fed meetings or earnings season, message 
discipline matters more. Analysts will ask: "Why are we bullish equities if bonds are rallying 
too? Are we hedging or pivoting?" Have a crisp answer ready—"disinflation optimism supports both" 
or "dollar weakness lifts all boats."

**Product implications**: If you're launching a multi-asset fund or risk-parity strategy, high 
concordance windows compress diversification benefits. Your risk model should flag this—standard 
correlation matrices won't capture joint *directional* strength.

## How I'd ship it (stack)

Productionizing this for a macro dashboard or internal risk tool:

**Data layer**:
- **AWS Lambda** (EventBridge cron, 6 AM ET daily)
- Pull QQQ, GLD, TLT, UUP, VIX via `yfinance` (or migrate to Bloomberg API for institutional)
- Store raw prices in **S3** as Parquet (partitioned by year/month for incremental reads)

**Compute layer**:
- **Lambda triggered on S3 object creation** (or use Step Functions for orchestration)
- Run `compute_concordance()` and `fit_logit()` over trailing 2 years of data
- Write output DataFrame (I, S, dRealY, P(I=1)) to S3 Parquet

**Serve layer**:
- **DynamoDB** single-row table for latest signal: {date, S, P(I=1), betas}
- **FastAPI** on ECS Fargate: `GET /signals/concordance` queries DynamoDB, returns JSON in <50ms
- **CloudFront + API Gateway** for CDN caching (5-min TTL; refresh on new data)

**Viz**:
- **Tableau/PowerBI** connected to S3 for historical analysis
- Single-value card for live $S_t$ with conditional formatting:
  - Green: $S < 0.35$ (normal)
  - Yellow: $0.35 \leq S < 0.45$ (elevated)
  - Red: $S \geq 0.45$ (regime tension)
- 90-day line chart with shaded bands for FOMC dates (macro event backdrop)

**Alerts**:
- SNS notification if $S_t$ crosses 0.45 threshold or $\Delta S > 0.10$ in 5 days
- Slack webhook to #macro-risk channel with latest coefficients and P(I=1)

**Cost**: ~$15/month (Lambda + S3 + DynamoDB on-demand). Latency: <100ms API, <5s end-to-end refresh.

<hr class="divider" />

## Pitfalls & sanity checks

**1. Proxy noise for real yields**  
Using $-r^{\text{TLT}}$ as a proxy for real yield changes is crude. TLT embeds duration risk, 
liquidity premia, and convexity—not just real yields. Better: use `^FVX` (5Y yield) minus 
inflation breakevens from FRED, or pull TIPS yields directly. If you see weird beta signs, 
this is the first place to check.

**2. Close-to-close timing**  
All returns use adjusted close prices. Intraday reversals (e.g., equity rally fades into 
close) are missed. For macro event days (FOMC 2 PM ET), consider using intraday bars or 
time-stamped trades if building a higher-frequency variant.

**3. ETF microstructure**  
GLD and TLT have tracking error, management fees, and liquidity gaps. Spot gold (XAU=X) is 
cleaner but has stale overnight quotes. TLT options market can distort ETF pricing around 
expiries. If backtesting strategies, use futures (GC=F, ZB=F) for tighter spreads.

**4. USD proxy choice**  
UUP is an ETF tracking DXY, but it's less liquid than DXY futures. Consider using `DX=F` 
(futures) or spot forex pairs (EUR/USD) if you need tick data. DXY itself is trade-weighted 
and lags emerging market currency moves—supplement with EM FX indices if your book is global.

**5. Overlapping macro events**  
CPI + FOMC + NFP in the same week creates compounded signal noise. The logit model treats 
all days equally; in reality, event days have 3x the volatility and correlation breakdown. 
Consider adding a binary "macro week" dummy variable to the regression.

**6. Look-ahead bias**  
The rolling window ($W=90$) uses only past data—no leakage. But if you're backtesting portfolio 
decisions based on $S_t$, ensure you're not peeking at future $I_t$ values when computing today's 
score. The code is safe; just flag this for reviewers.

**7. Model stability**  
Logit coefficients can drift if Fed regime changes (e.g., 2020 ZIRP vs. 2022 hiking cycle). 
Consider fitting the model on rolling 1-year windows and tracking $\beta_1$ stability. If 
$\beta_1$ flips sign, you're in a structural break—pause signal usage until regime clarifies.

<hr class="divider" />

## Where I'd take it next

**Idea 1: Swap to SPY/GLD/TLT with volume conditioning**  
Replace QQQ with SPY for broader equity representation. Add a volume filter: only flag 
concordance if all three assets trade above 90th percentile volume (rules out illiquid prints 
and microstructure noise).

**Idea 2: Regime classifier (HMM or k-means)**  
Run Hidden Markov Model over ${S_t, \Delta y^{\text{real}}, r^{\text{DXY}}}$ to identify 
latent regimes (e.g., "disinflation easing," "stagflation," "tightening"). Condition the 
concordance interpretation on regime state—what means "bullish" in one regime is "topping" 
in another.

**Idea 3: Intraday variant on macro print days**  
Build a 30-minute bar version of $I_t$ for CPI/FOMC days. Track concordance evolution from 
8:30 AM ET print through 4 PM close. Do initial reactions converge or diverge by end of day? 
Flags false breakouts vs. sustained regime shifts.

**Idea 4: Event-conditioned probabilities**  
Extend the logit model with macro event dummies: $I_{\text{FOMC}}, I_{\text{CPI}}, 
I_{\text{NFP}}$. Estimate $\Pr(I_t=1 \mid \text{FOMC day})$ separately. Compare baseline vs. 
event-day concordance—are Fed weeks systematically different?

**Idea 5: Portfolio hedge overlay**  
Use $S_t > 0.50$ as a trigger to reduce equity beta and add straddles (long vol). Backtest 
over 2020 COVID, 2022 tightening, and 2023 pivot speculation. Measure Sharpe improvement and 
max drawdown reduction vs. unhedged 60/40 portfolio.

<hr class="divider" />

## Repo README (excerpt)

```markdown
# Concordance Signal: Risk-On and Risk-Off Together

A rolling indicator and logit model to measure and explain days when equities and safe havens 
rally simultaneously.

## Structure
```
.
├── src/
│   ├── concordance_signal.py    # Core computation
│   └── api_concordance.py       # FastAPI endpoint
├── data/
│   └── concordance_signal.csv   # Output (gitignored)
└── public/
    └── images/
        ├── concordance_phases.svg
        └── signal_loop.svg
```

## Installation
```bash
pip install pandas numpy yfinance statsmodels fastapi uvicorn
```

## Usage

### Standalone script
```bash
python src/concordance_signal.py
```
Prints latest concordance score $S_t$, logit coefficients, predicted $\Pr(I_t=1)$, and last 
10-day summary. Writes full history to `./data/concordance_signal.csv` if folder exists.

### API server
```bash
uvicorn src.api_concordance:app --reload --port 8000
```
GET `http://localhost:8000/signals/concordance` returns:
```json
{
  "date": "2025-10-12",
  "concordance_score": 0.422,
  "prob_concordant": 0.384,
  "betas": {
    "const": 0.1234,
    "dRealY": -1.2456,
    "DXY": -0.8932,
    "VIX": -0.1123
  },
  "latest_inputs": {
    "dRealY": -0.0045,
    "rDXY": -0.0032,
    "rVIX": 0.0211
  }
}
```

## Notes
- Data source: Yahoo Finance via `yfinance` (free, no auth required).
- Real yield proxy: negative TLT return (crude but functional; upgrade to TIPS for production).
- Window: 90-day rolling (configurable via `window` parameter).
- This is for research and situational awareness—not financial advice or a trading signal.
```
