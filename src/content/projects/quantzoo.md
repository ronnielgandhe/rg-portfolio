---
title: QuantZoo
slug: quantzoo
year: 2024
tech: ["Python","pandas","numpy","scikit-learn","PyTest","Docker"]
summary: Open-source library of 50+ systematic trading strategies with standardized backtesting framework and performance attribution.
repoUrl: "https://github.com/ronnielgandhe/quantzoo"
highlights:
  - Modular strategy architecture
  - Vectorized backtesting engine
  - Statistical performance metrics
  - Comprehensive unit tests
---

# QuantZoo

## Problem

While learning quantitative finance, I noticed that most trading strategy tutorials exist in isolation—random blog posts with inconsistent data formats, ad-hoc backtesting logic, and no standardized way to compare performance. This made it difficult to:

- **Reproduce results**: Different data sources, timeframes, and assumptions led to conflicting conclusions about the same strategy.
- **Compare strategies fairly**: Without a common backtesting framework, it was impossible to know if a strategy's performance was due to the logic itself or implementation artifacts.
- **Learn from patterns**: Strategies weren't organized by type (momentum, mean reversion, volatility), making it hard to understand which concepts actually worked.

I needed a unified library where I could implement, test, and compare strategies using consistent infrastructure—something between academic research code (too complex) and retail trading platforms (black boxes).

---

## Approach

I designed QuantZoo as a **strategy library + backtesting engine**, structured to enforce consistency while remaining extensible.

### Architecture Principles

1. **Strategy as a Pure Function**: Each strategy takes market data (OHLCV) and outputs signals (buy/sell/hold). No side effects, no hidden state.

2. **Separation of Concerns**:
   - **Strategy Logic**: Pure signal generation (`strategies/`)
   - **Backtesting Engine**: Position sizing, slippage, commissions (`backtester/`)
   - **Performance Analytics**: Sharpe, max drawdown, win rate (`metrics/`)
   - **Data Layer**: Abstraction over Yahoo Finance, CSV files, or custom sources (`data/`)

3. **Modularity**: Strategies inherit from a base `Strategy` class, implementing only `generate_signals()`. The rest (risk management, performance tracking) is handled by the framework.

### Technology Choices

- **Python + pandas**: Fast vectorized operations for backtesting historical data. Avoids slow for-loops over time series.
- **NumPy**: Array operations for indicator calculations (moving averages, Bollinger Bands, RSI).
- **scikit-learn**: For machine learning strategies (random forests on technical indicators).
- **PyTest**: Unit tests for each strategy, ensuring signals match expected behavior on synthetic data.
- **Docker**: Reproducible environments—eliminates "it works on my machine" issues when sharing results.

### Development Challenges

1. **Look-Ahead Bias**: Early versions accidentally used future data to generate signals. Fixed by enforcing strict indexing rules: `data[:t]` for calculations at time `t`.

2. **Overfitting**: Strategies tuned on the same data they were tested on. Introduced walk-forward optimization and out-of-sample validation periods.

3. **Execution Realism**: Initial backtests assumed instant fills at close prices. Added slippage models (percentage-based) and commission structures to reflect real trading costs.

---

## Implementation Details

### Strategy Examples

**Dual Moving Average Crossover (Trend-Following)**
```python
class DualMovingAverage(Strategy):
    def __init__(self, fast_window=50, slow_window=200):
        self.fast_window = fast_window
        self.slow_window = slow_window
    
    def generate_signals(self, data):
        fast_ma = data['Close'].rolling(self.fast_window).mean()
        slow_ma = data['Close'].rolling(self.slow_window).mean()
        
        signals = pd.Series(0, index=data.index)
        signals[fast_ma > slow_ma] = 1  # Long
        signals[fast_ma < slow_ma] = -1 # Short
        return signals
```

**Mean Reversion (Bollinger Bands)**
- Buy when price crosses below lower band (oversold)
- Sell when price crosses above upper band (overbought)
- Uses 20-day moving average ± 2 standard deviations

**Momentum (12-Month Return)**
- Ranks assets by trailing 12-month return
- Long top decile, short bottom decile
- Monthly rebalancing

### Backtesting Engine

```python
class Backtester:
    def __init__(self, initial_capital=100000, commission=0.001, slippage=0.0005):
        self.capital = initial_capital
        self.commission = commission  # 10 bps per trade
        self.slippage = slippage      # 5 bps execution cost
    
    def run(self, strategy, data):
        signals = strategy.generate_signals(data)
        positions = self._apply_position_sizing(signals)
        trades = self._execute_trades(positions, data)
        return self._calculate_performance(trades)
```

Key features:
- **Position Sizing**: Fixed fractional (e.g., 10% of capital per position) or Kelly Criterion
- **Slippage Model**: Percentage-based—assumes fills at `price * (1 + slippage * direction)`
- **Commission**: Flat rate per trade or percentage of notional value

### Performance Metrics

Implemented standard quant metrics:
- **Sharpe Ratio**: Risk-adjusted return (annualized return / volatility)
- **Max Drawdown**: Largest peak-to-trough decline
- **Win Rate**: Percentage of profitable trades
- **Profit Factor**: Gross profit / gross loss
- **Calmar Ratio**: Return / max drawdown (for long-term strategies)

### Testing Infrastructure

- **Unit Tests**: Validate indicator calculations on synthetic data (e.g., "50-day MA on constant prices = constant")
- **Integration Tests**: Run strategies on small historical datasets, assert expected signal counts
- **Regression Tests**: Freeze strategy outputs for known inputs, detect unintended changes

Example test:
```python
def test_dual_ma_crossover():
    # Create synthetic data: price goes 100 -> 110 -> 105
    data = pd.DataFrame({'Close': [100, 110, 105]})
    strategy = DualMovingAverage(fast_window=1, slow_window=2)
    signals = strategy.generate_signals(data)
    assert signals.iloc[1] == 1  # Fast MA crosses above slow MA
```

### Deployment

- **Docker Compose**: Runs backtests in isolated containers with pinned dependencies (`pandas==1.5.3`, etc.)
- **CI/CD**: GitHub Actions runs tests on every commit, generates performance reports as artifacts
- **Notebooks**: Jupyter notebooks for exploratory analysis, saved with output cells for reproducibility

---

## Results / Learnings

### Quantitative Results

Tested on S&P 500 data (2010–2023):

| Strategy              | Sharpe Ratio | Max Drawdown | Win Rate |
|-----------------------|--------------|--------------|----------|
| Dual MA (50/200)      | 0.42         | -18.3%       | 47%      |
| Bollinger Mean Rev    | 0.61         | -12.1%       | 52%      |
| Momentum (12M)        | 0.88         | -21.5%       | 56%      |
| Buy & Hold (SPY)      | 0.67         | -33.7%       | N/A      |

**Key Findings**:
- Momentum strategies outperformed on a risk-adjusted basis, but had deeper drawdowns
- Mean reversion worked well in sideways markets (2015–2017), struggled in trending markets (2020–2021)
- Transaction costs (commission + slippage) reduced Sharpe ratios by ~0.15 on average

### Technical Learnings

1. **Vectorization Matters**: Initial loop-based backtests took 45 seconds for 10 years of daily data. Refactored to pandas operations → **2 seconds**.

2. **Data Quality is Critical**: Yahoo Finance has missing data, stock splits, and dividend inconsistencies. Built cleaning pipeline (forward-fill missing prices, adjust for splits).

3. **Overfitting is Easy**: First momentum strategy had Sharpe ratio of 1.8 on training data, 0.3 out-of-sample. Introduced cross-validation and parameter grids.

4. **Testing Saves Time**: Caught 12 look-ahead bias bugs via unit tests before running full backtests.

### Impact on Later Work

QuantZoo's architecture directly influenced **QuantTerminal**:
- The `Strategy` base class became the foundation for real-time signal generation
- Performance metrics module was reused for live tracking
- Backtesting insights (slippage, commission) informed order execution logic

Learned that **good infrastructure scales**—the 80 hours spent on the backtesting engine paid off when adding 30 new strategies took only 10 hours.

---

## Future Improvements

- **Machine Learning Pipeline**: Automate feature engineering (technical indicators) + hyperparameter tuning
- **Multi-Asset Support**: Currently single-asset strategies; extend to portfolio construction (stocks + bonds)
- **Execution Simulation**: Model market impact for large orders (not just fixed slippage)
- **Live Paper Trading**: Deploy strategies on paper accounts (Alpaca, Interactive Brokers APIs)

---

**Status**: Active development • Open for contributions • Used in QuantTerminal production

