# Gold vs. Nasdaq Divergence Signal

A rolling regression-based metric to measure decoupling between Nasdaq and gold returns.

## Overview

This project implements a simple but effective measure of market regime shifts by tracking 
the residual divergence between Nasdaq 100 and gold futures returns. When the two decouple—
either Nasdaq rallying while gold drops (risk-on) or Nasdaq falling while gold rallies 
(risk-off)—the z-score flags the divergence magnitude.

**This is a research tool for market context, not a trading signal.**

## Project Structure

```
.
├── src/
│   ├── gold_vs_nasdaq.py       # Core computation script
│   └── api.py                  # FastAPI endpoint
├── data/
│   └── gold_nq_signal.csv      # Output (generated, gitignored)
├── dashboard/
│   └── README.md               # Tableau/Power BI setup instructions
└── README.md                   # This file
```

## Installation

### Requirements
- Python 3.8+
- Dependencies: pandas, numpy, yfinance, statsmodels, fastapi, uvicorn

### Setup
```bash
# Clone or download the repository
cd gold-vs-nasdaq

# Install dependencies
pip install pandas numpy yfinance statsmodels fastapi uvicorn

# (Optional) Create a virtual environment first
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install pandas numpy yfinance statsmodels fastapi uvicorn
```

## Usage

### 1. Standalone Script

Run the core computation to download data, compute the signal, and save results:

```bash
python src/gold_vs_nasdaq.py
```

**Output:**
- Prints latest z-score, residual, beta, and alpha to console
- Saves full historical signal to `./data/gold_nq_signal.csv`

**Sample output:**
```
Fetching data for ^NDX, GC=F from 2015-01-01...
Downloaded 2683 days of data
Computing rolling OLS with 90-day window...
Generated 2593 signal observations

============================================================
LATEST SIGNAL
============================================================
Date:         2025-10-12
Z-score:         -1.23
Residual:     -0.0087
Beta (XAU):     -0.418
Alpha:         0.0009
============================================================

Last 5 observations:
              z      eps  beta_xau    alpha
Date                                       
2025-10-08  0.45  0.0034    -0.405  0.0010
2025-10-09 -0.72 -0.0053    -0.410  0.0009
2025-10-10  1.12  0.0091    -0.415  0.0008
2025-10-11 -0.34 -0.0028    -0.416  0.0009
2025-10-12 -1.23 -0.0087    -0.418  0.0009

Z-score summary statistics:
count    2593.000000
mean        0.002145
std         1.000385
min        -3.821044
25%        -0.661239
50%         0.008472
75%         0.672851
max         3.445123

✓ Script completed successfully
```

### 2. API Server

Start the FastAPI server for programmatic access:

```bash
uvicorn src.api:app --reload --port 8000
```

**Endpoints:**

- `GET /` - API information
- `GET /health` - Health check
- `GET /signals/gold-nq` - Latest divergence signal

**Example request:**
```bash
curl http://localhost:8000/signals/gold-nq
```

**Example response:**
```json
{
  "date": "2025-10-12",
  "z": -1.23,
  "eps": -0.0087,
  "beta_xau": -0.418,
  "alpha": 0.0009,
  "window_days": 90
}
```

**Interactive docs:** http://localhost:8000/docs

### 3. Dashboard Visualization

See `dashboard/README.md` for detailed instructions on connecting Tableau or Power BI 
to the CSV output or API endpoint.

## How It Works

### The Math

We run a time-varying regression:

$$
r^{\text{NQ}}_t = \alpha_t + \beta_t \, r^{\text{XAU}}_t + \varepsilon_t
$$

where:
- $r^{\text{NQ}}_t$ = Nasdaq 100 log return on day $t$
- $r^{\text{XAU}}_t$ = gold futures log return on day $t$
- $\alpha_t, \beta_t$ = intercept and slope estimated over the past 90 days
- $\varepsilon_t$ = residual (unexplained Nasdaq move)

The divergence z-score is:

$$
z_t = \frac{\varepsilon_t}{\hat{\sigma}_{\varepsilon,90}}
$$

### Interpretation

- **z > +1.5**: Nasdaq significantly stronger than gold predicts (risk-on decoupling)
- **|z| < 1**: Normal coupling
- **z < -1.5**: Nasdaq significantly weaker (risk-off / flight-to-safety)

### Data Sources

- **Nasdaq 100**: Yahoo Finance ticker `^NDX`
- **Gold Futures**: Yahoo Finance ticker `GC=F`
- **Start date**: 2015-01-01 (configurable)
- **Update frequency**: Daily close prices

## Configuration

Edit constants at the top of `src/gold_vs_nasdaq.py`:

```python
START = "2015-01-01"  # Start date
END = None            # End date (None = today)
TICKERS = ["^NDX", "GC=F"]
WINDOW = 90           # Rolling window in days
OUTPUT_DIR = Path("./data")
```

## Production Deployment

For a production-grade dashboard, consider:

1. **AWS Lambda** for scheduled daily computation
2. **S3** for Parquet storage (partitioned by year/month)
3. **DynamoDB** for latest signal (low-latency reads)
4. **API Gateway + CloudFront** for API caching
5. **Tableau Server / Power BI Service** for visualization

Estimated cost: ~$10/month for daily refresh.

See the blog post for detailed architecture.

## Limitations & Caveats

1. **Non-stationarity**: Gold-Nasdaq relationship shifts with monetary policy regimes
2. **Macro confounders**: DXY and real yields often drive both assets
3. **Not a trading signal**: This measures context, not alpha
4. **Data quality**: Gold futures can have stale overnight prices
5. **Window sensitivity**: 90 days balances responsiveness vs. noise

## Blog Post

For full context, methodology, and interpretation, see the accompanying blog post:
- **Title**: "What Got Me Curious About Gold vs. the Nasdaq"
- **File**: `src/content/blog/gold-vs-nasdaq.md`

## License

MIT License - feel free to use, modify, and distribute.

## Disclaimer

This tool is for educational and research purposes only. It does not constitute 
financial advice. Markets can remain irrational longer than you can remain solvent. 
Past performance is not indicative of future results. Do your own research.

## Contributing

Suggestions and improvements welcome. Consider:
- Adding multivariate controls (DXY, real yields)
- Implementing Markov regime switching
- Supporting additional asset pairs (QQQ/GLD, SPY/TLT)
- Event-driven annotations (FOMC, CPI)

## Contact

For questions or feedback, open an issue on the repository.

---

**Quick Start:**
```bash
pip install pandas numpy yfinance statsmodels fastapi uvicorn
python src/gold_vs_nasdaq.py
```
