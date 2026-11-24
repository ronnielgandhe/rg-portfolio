# r/wallstreetbets ideas

1. one file per idea: `ideas/<slug>.md` with front matter `title`, `date`, `play` (e.g. `TQQQ long 34, UPRO long 33, SOXL long 33`), `benchmark`, `draft: true|false`.
2. four short sections under `## the idea`, `## why`, `## how i'd play it`, `## what would prove me wrong`; put tickers in brackets like (TQQQ) and they render small.
3. the page scores it from the first market open after `date`, on $1,000, fees in. drafts only show with `?draft=1`.
4. optional `versions: <slug>.versions.json` adds the "i changed my mind" history; `?tune=1` on the idea page opens the tune panel, and save appends a version (dev) or copies it (prod).
5. numbers from the terminal: `node scripts/quantzoo-research.mjs <slug>`; engine tests: `node --test src/tools/quantzoo/engine/engine.test.ts`.
