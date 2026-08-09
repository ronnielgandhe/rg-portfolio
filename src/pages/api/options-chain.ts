import type { APIRoute } from 'astro';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// yahoo's options endpoint needs a session cookie + crumb since 2023.
// cache them at module level so warm lambdas skip the handshake.
let auth: { cookie: string; crumb: string; ts: number } | null = null;

async function getYahooAuth(): Promise<{ cookie: string; crumb: string } | null> {
  if (auth && Date.now() - auth.ts < 30 * 60 * 1000) return auth;
  try {
    const seed = await fetch('https://fc.yahoo.com', {
      headers: { 'User-Agent': UA },
      redirect: 'manual',
    });
    const cookie = seed.headers.get('set-cookie')?.split(';')[0] ?? '';
    if (!cookie) return null;
    const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
      headers: { 'User-Agent': UA, Cookie: cookie },
    });
    const crumb = (await crumbRes.text()).trim();
    if (!crumb || crumb.includes('<')) return null;
    auth = { cookie, crumb, ts: Date.now() };
    return auth;
  } catch {
    return null;
  }
}

interface ChainOption {
  strike: number;
  bid: number | null;
  ask: number | null;
  mid: number | null;
  last: number | null;
  iv: number | null;
  volume: number | null;
  openInterest: number | null;
}

export const GET: APIRoute = async ({ url }) => {
  const symbol = (url.searchParams.get('symbol') || 'QQQ').toUpperCase();
  const expiry = url.searchParams.get('expiry'); // YYYY-MM-DD

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });

  // spot always comes from the chart endpoint, which needs no auth
  let spot: number | null = null;
  let prevClose: number | null = null;
  let marketTime: number | null = null;
  try {
    const chartRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=5m&includePrePost=false`,
      { headers: { 'User-Agent': UA } }
    );
    const chart = await chartRes.json();
    const meta = chart?.chart?.result?.[0]?.meta;
    spot = meta?.regularMarketPrice ?? null;
    prevClose = meta?.chartPreviousClose ?? meta?.previousClose ?? null;
    marketTime = meta?.regularMarketTime ?? null;
  } catch {
    /* fall through, spot stays null */
  }

  let calls: ChainOption[] = [];
  let puts: ChainOption[] = [];
  let source: 'chain' | 'spot-only' = 'spot-only';

  const yAuth = await getYahooAuth();
  if (yAuth) {
    try {
      let optUrl = `https://query2.finance.yahoo.com/v7/finance/options/${symbol}?crumb=${encodeURIComponent(yAuth.crumb)}`;
      if (expiry) {
        // yahoo keys expiries by midnight UTC of the expiry date
        const ts = Math.floor(Date.parse(`${expiry}T00:00:00Z`) / 1000);
        optUrl += `&date=${ts}`;
      }
      const optRes = await fetch(optUrl, {
        headers: { 'User-Agent': UA, Cookie: yAuth.cookie },
      });
      if (optRes.ok) {
        const opt = await optRes.json();
        const result = opt?.optionChain?.result?.[0];
        const chain = result?.options?.[0];
        const mapOpt = (o: any): ChainOption => {
          const bid = typeof o.bid === 'number' ? o.bid : null;
          const ask = typeof o.ask === 'number' ? o.ask : null;
          return {
            strike: o.strike,
            bid,
            ask,
            mid: bid != null && ask != null && ask > 0 ? (bid + ask) / 2 : null,
            last: typeof o.lastPrice === 'number' ? o.lastPrice : null,
            iv: typeof o.impliedVolatility === 'number' ? o.impliedVolatility : null,
            volume: o.volume ?? null,
            openInterest: o.openInterest ?? null,
          };
        };
        calls = (chain?.calls ?? []).map(mapOpt);
        puts = (chain?.puts ?? []).map(mapOpt);
        if (calls.length || puts.length) source = 'chain';
        if (spot == null) spot = result?.quote?.regularMarketPrice ?? null;
      }
    } catch {
      /* chain unavailable, spot-only response */
    }
  }

  if (spot == null) return json({ error: 'quote unavailable' }, 502);
  return json({ symbol, expiry, spot, prevClose, marketTime, source, calls, puts });
};
