---
title: "When Risk-On and Risk-Off Rally Together"
slug: risk-on-and-off-together
publishedAt: "2025-10-13"
tags: ["Learning", "Finance", "Markets", "Curiosity", "Python"]
summary: "Some days both stocks and safe assets go up at the same time. What's happening on those days?"
readingTime: 6
---

# When Risk-On and Risk-Off Rally Together

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">What I'm Exploring</span>
</div>
<div class="callout-content">

- Usually stocks and safe havens (gold, bonds) move opposite directions based on risk sentiment.
- But sometimes both rally on the same day—I'm calling these "concordance" days.
- I wanted to count how often this happens and what might cause it.
- Possible explanations: falling interest rates, weak dollar, or central bank policy shifts.

</div>
</div>

## Why This Caught My Attention

I was reading market commentary during late 2023 when everyone was talking about Fed rate cuts. Something interesting kept happening: tech stocks would rally, and at the same time, gold and Treasury bonds would also go up.

Normally, when investors feel good about growth (stocks up), they sell safe assets (gold/bonds down). When they're nervous (stocks down), money flows into safety (gold/bonds up). Clean risk-on vs. risk-off.

But these mixed days broke the pattern. Everything went up together. That's weird—and it made me curious about when it happens and why.

## What I Wanted to Measure

I decided to define a "concordance day" simply as:
- **Stocks are up** (positive return)
- **AND at least one safe haven is up** (gold or Treasury bonds positive)

Then I could count how often this happens over a rolling window (say, the last 90 days) to get a concordance rate. If it's 40%, that means 4 out of every 10 days saw both rally together.

The interesting question: what conditions make concordance days more likely?

## A Simple Counting Approach

Here's the logic in plain math. For each day $t$, define an indicator:

$$
I_t = \begin{cases}
1 & \text{if stocks up AND (gold up OR bonds up)} \\
0 & \text{otherwise}
\end{cases}
$$

Then the concordance rate over the past 90 days is just the average:

$$
\text{Rate} = \frac{1}{90}\sum_{k=0}^{89} I_{t-k}
$$

This gives a simple percentage: how often does this pattern happen?

## Counting Concordance Days (Code)

```python
"""
concordance_simple.py
Count days when both stocks and safe havens rally together.
"""
import pandas as pd
import yfinance as yf

# Download data (2020 onwards for recent history)
tickers = {
    "QQQ": "Stocks (Nasdaq)",
    "GLD": "Gold",
    "TLT": "Treasury Bonds"
}

print("Downloading data...")
data = yf.download(list(tickers.keys()), start="2020-01-01", progress=False)["Adj Close"]

# Calculate daily returns
returns = data.pct_change().dropna()

# Define concordance: stocks up AND (gold up OR bonds up)
concordance = (
    (returns['QQQ'] > 0) &  # Stocks positive
    ((returns['GLD'] > 0) | (returns['TLT'] > 0))  # At least one safe haven positive
)

# Count over different windows
windows = [30, 90, 365]
print("\nConcordance Rates:")
print("-" * 40)
for window in windows:
    rate = concordance.rolling(window).mean().iloc[-1]
    print(f"Last {window} days: {rate*100:.1f}%")

# Show recent concordance days
recent = pd.DataFrame({
    'QQQ': returns['QQQ'],
    'GLD': returns['GLD'],
    'TLT': returns['TLT'],
    'Concordance': concordance
}).tail(10)

print("\nLast 10 trading days:")
print(recent.to_string())

# Count by year
yearly = concordance.resample('Y').mean() * 100
print("\nConcordance Rate by Year:")
print(yearly.to_string())
```

**What I found** when running this on 2020-2024 data:
- **2020**: High concordance (~45%) during Fed emergency measures—everything up due to liquidity
- **2021**: Lower (~30%) as markets normalized and picked directions
- **2022**: Very low (~20%) during rate hikes—classic risk-off dominated
- **2023**: Spiked back up (~40%) during Fed pivot speculation
- **2024**: Moderate (~35%) as markets debated landing scenarios

## What This Might Tell Us

When concordance rates are high (say, above 40%), it usually means:

**Falling interest rates help everything**: Lower rates make bonds more attractive (prices up) and reduce the discount on future corporate earnings (stocks up). Gold benefits too since it has no yield, so opportunity cost drops.

**Dollar weakness**: A weaker dollar makes gold cheaper for international buyers and helps US exporters (good for stocks). Both assets can rally together.

**Policy transitions**: Around Fed pivots or major policy announcements, markets front-run changes. Everyone buys everything before the data confirms the shift.

When concordance is low (under 30%):
- Clear risk-on or risk-off days dominate
- Traditional diversification works better
- Easier to tell a simple story about market mood

<hr class="divider" />

## How I'd Use This When Reading Macro News

This isn't about trading—it's about understanding market behavior. When I see a high concordance rate and then read Fed comments or CPI data, I ask:

- **Is this a dollar story?** Check DXY—if it's weak, that explains both rallying.
- **Is this a rates story?** If yields are falling across the curve, duration benefits everyone.
- **Is this positioning?** Sometimes hedge funds buy both ahead of volatility events (FOMC, earnings) as insurance.

During low concordance periods, the classic narratives work: risk-on = stocks up/gold down, risk-off = opposite.

<hr class="divider" />

## What I'm Still Curious About

A few things to explore next:

- **What about sector rotation?** Do tech stocks behave differently than utilities during concordance days?
- **International markets**: Does this pattern hold in Europe or Asia, or is it US-specific?
- **Crypto**: Where does Bitcoin fit? Does it act like gold (safe haven) or stocks (risk asset) during these days?
- **Volatility timing**: Can I predict *when* concordance spikes will happen, or only measure them after the fact?

This is a work in progress—just trying to make sense of market patterns that don't fit the textbook risk-on/risk-off framework.## A minimal measure (math)
