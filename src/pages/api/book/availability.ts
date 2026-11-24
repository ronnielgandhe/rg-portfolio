import type { APIRoute } from 'astro';
import { CalendlyError, PUBLIC_URL, configured, ipOf, json, limited, mockAllowed, mockMonth, month, monthRange } from './_calendly';

export const prerender = false;

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  const key = url.searchParams.get('month') ?? '';
  if (!monthRange(key)) return json({ status: 'invalid', error: 'month must be YYYY-MM within the booking window' }, 400);
  if (mockAllowed(url)) return json({ status: 'ok', month: key, mock: true, ...mockMonth(key) });
  if (!configured()) return json({ status: 'unconfigured', month: key, url: PUBLIC_URL }, 200, 'public, s-maxage=300, stale-while-revalidate=600');
  if (limited(`a:${ipOf(request, clientAddress)}`, 40, 60_000)) return json({ status: 'limited' }, 429, 'no-store');
  const fresh = url.searchParams.has('fresh');
  try {
    const m = await month(key, fresh);
    return json({ status: 'ok', month: key, ...m }, 200, fresh ? 'no-store' : 'public, s-maxage=60, stale-while-revalidate=120');
  } catch (e) {
    const status = e instanceof CalendlyError ? e.status : 0;
    console.error('book/availability failed', status || (e as Error).name);
    return json({ status: 'error', month: key, url: PUBLIC_URL }, 502);
  }
};
