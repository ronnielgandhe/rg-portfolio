---
title: "What Got Me Curious About Gold vs. the Nasdaq"
slug: gold-vs-nasdaq
publishedAt: "2025-10-13"
tags: ["Learning", "Finance", "Python", "Markets", "Exploration"]
summary: "Why do gold and tech sometimes move opposite directions, and what does it tell us about market mood?"
readingTime: 7
---

# What Got Me Curious About Gold vs. the Nasdaq

<div class="callout callout-info">
<div class="callout-header">
<span class="callout-icon">ℹ</span>
<span class="callout-title">What I'm Exploring</span>
</div>
<div class="callout-content">

- Gold and tech stocks often move in opposite directions when investors shift between "risky" and "safe" assets.
- I wanted to visualize this relationship and see when they decouple from the usual pattern.
- This isn't a trading strategy. Just a lens for understanding market sentiment shifts.
- The dollar and interest rates complicate things, so there's more to learn here.

</div>
</div>

## Why I Started Looking at This

I was reading about a Fed meeting where tech stocks dropped while gold rallied. The pattern made sense. Investors were nervous about rate hikes, so they moved money from growth stocks (nasdaq) to safer assets (gold). classic "risk-off" behavior.

But I wondered: how often does this happen? And more interestingly, when do they *both* go up at the same time? That would suggest something different is going on. Maybe falling interest rates that help both, or a weak dollar lifting all boats.

The question: can I plot these two assets together and spot the interesting moments when their relationship breaks the usual pattern?

## What I'm Curious About

The typical story is simple: when investors get nervous (Fed hawkish, geopolitical tensions, recession fears), money flows from risky tech stocks to safe gold. When optimism returns, the flow reverses.

But sometimes both rise together. That might mean:
- **Interest rates falling**: helps both gold (no opportunity cost) and tech (cheaper future cash flows)
- **Dollar weakening**: makes gold more attractive internationally and lifts all risk assets
- **Liquidity flooding**: central bank actions that boost everything

I wanted to visualize this relationship over time and see when the correlation changes.

## A Simple Approach

Instead of building a complicated model, I'm starting with basics:

1. **Fetch price data** for both assets using Python
2. **Calculate daily returns** to see percentage changes
3. **Plot them together** to spot patterns
4. **Look at correlation** over rolling windows to see when the relationship shifts

Here's the basic math for returns. If we have prices $P_t$ on day $t$, the simple return is:

$$
r_t = \frac{P_t - P_{t-1}}{P_{t-1}}
$$

Or in log form (which is often nicer for statistics):

$$
r_t = \log\left(\frac{P_t}{P_{t-1}}\right)
$$

Then we can measure correlation between Nasdaq returns ($r^{NQ}$) and gold returns ($r^{Gold}$) over the past 90 days to see if they're moving together or opposite.

## Fetching and Plotting the Data

```python
"""
gold_vs_nasdaq_simple.py
Visualize the relationship between Nasdaq and gold returns.
"""
import pandas as pd
import numpy as np
import yfinance as yf
import matplotlib.pyplot as plt

# Fetch data from Yahoo Finance (free, no API key needed)
START = "2020-01-01"
tickers = ["^NDX", "GC=F"]  # Nasdaq 100 and gold futures

print("Downloading price data...")
data = yf.download(tickers, start=START, progress=False)["Adj Close"]
data.columns = ["Nasdaq", "Gold"]

# Calculate daily returns (percentage change)
returns = data.pct_change().dropna()

# Calculate rolling 90-day correlation
correlation = returns['Nasdaq'].rolling(90).corr(returns['Gold'])

# Print recent stats
print(f"\nRecent correlation (90-day): {correlation.iloc[-1]:.2f}")
print(f"Nasdaq return (last month): {returns['Nasdaq'].iloc[-30:].mean()*100:.2f}%")
print(f"Gold return (last month): {returns['Gold'].iloc[-30:].mean()*100:.2f}%")

# Plot both normalized price series
fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

# Normalize prices to start at 100 for comparison
normalized = (data / data.iloc[0]) * 100
normalized.plot(ax=ax1, title="Nasdaq vs Gold (Normalized to 100)")
ax1.set_ylabel("Normalized Price")
ax1.legend(["Nasdaq", "Gold"])
ax1.grid(True, alpha=0.3)

# Plot rolling correlation
correlation.plot(ax=ax2, title="90-Day Rolling Correlation", color='purple')
ax2.axhline(0, color='black', linestyle='--', linewidth=0.8)
ax2.set_ylabel("Correlation")
ax2.set_xlabel("Date")
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig("gold_nasdaq_comparison.png", dpi=150)
print("\nChart saved as gold_nasdaq_comparison.png")
```

## What I Found Interesting

When I ran this, a few patterns jumped out:

**Negative correlation most of the time**: Over the past few years, the 90-day correlation often sits around -0.3 to -0.5. That confirms the "risk-on/risk-off" story. When one goes up, the other tends to go down.

**Correlation flips during rate cuts**: Around major Fed policy shifts (especially rate cuts or pivot expectations), the correlation sometimes goes positive. Both assets benefit from easier monetary policy.

**2020 COVID crash**: During the March 2020 selloff, both initially dropped together (everything sold), then gold recovered first while tech took longer. The correlation went wild during this period.

**Dollar matters a lot**: A strong dollar typically hurts both gold (priced in dollars) and tech stocks (multinational revenues). A weak dollar can lift both. That's why the correlation isn't perfectly stable.

<hr class="divider" />

## What I'm Still Wondering

A few things I want to explore next:

- **Why does the correlation change intensity?** Sometimes it's strongly negative (-0.7), sometimes weakly positive (+0.2). What drives those shifts beyond just "risk on/off"?

- **Can I add other factors?** The dollar index (DXY) and real interest rates seem important. Maybe plotting all three together would clarify the picture.

- **What about other safe havens?** Treasury bonds (TLT) behave differently than gold. Would be interesting to see how tech correlates with bonds vs. gold.

- **Is this useful for anything?** Right now it's just observation. Could you build a simple "market mood" indicator from this? Or is it too noisy to be actionable?

<hr class="divider" />

## Notes on the Code

The script uses:
- **yfinance**: Free library to download historical prices from Yahoo Finance. No API key needed.
- **pandas**: For handling time series data and calculating returns.
- **matplotlib**: For plotting the charts.

The correlation calculation is straightforward. Just pearson correlation between the two return series over a rolling 90-day window. nothing fancy, but it works for exploring the relationship.

This is a learning exercise, not financial advice. I'm just trying to understand how markets move and what drives different asset classes.
