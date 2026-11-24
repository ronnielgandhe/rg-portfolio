import type { APIRoute } from 'astro';
import { CalendlyError, PUBLIC_URL, book, configured, forget, ipOf, json, limited, month, mockAllowed } from './_calendly';

export const prerender = false;

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

function validTz(tz: string) {
  try { new Intl.DateTimeFormat('en', { timeZone: tz }); return true; } catch { return false; }
}

const monthKey = (iso: string) => iso.slice(0, 7);

export const POST: APIRoute = async ({ request, url, clientAddress }) => {
  if (!(request.headers.get('content-type') ?? '').includes('application/json')) return json({ status: 'invalid', error: 'json only' }, 415);
  const raw = await request.text();
  if (raw.length > 4000) return json({ status: 'invalid', error: 'too large' }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ status: 'invalid', error: 'bad json' }, 400); }

  const s = (k: string) => (typeof body[k] === 'string' ? (body[k] as string).trim() : '');
  const start = s('start'), name = s('name'), email = s('email'), note = s('note'), tz = s('tz');

  if (s('website')) return json({ status: 'ok', start, end: start });

  const fields: Record<string, string> = {};
  const t = Date.parse(start);
  if (!start || Number.isNaN(t) || t < Date.now()) fields.start = 'pick a time in the future';
  if (name.length < 1 || name.length > 80) fields.name = 'add your name';
  if (!EMAIL.test(email) || email.length > 254) fields.email = 'that email looks off';
  if (note.length > 1000) fields.note = 'keep it under 1000 characters';
  if (!validTz(tz)) fields.tz = 'unknown timezone';
  if (Object.keys(fields).length) return json({ status: 'invalid', fields }, 400);

  if (limited(`c:${ipOf(request, clientAddress)}`, 5, 600_000)) return json({ status: 'limited', error: 'too many attempts, try again in a few minutes' }, 429);

  const iso = new Date(t).toISOString();
  if (mockAllowed(url)) {
    await new Promise((r) => setTimeout(r, 700));
    if (email.startsWith('taken@')) return json({ status: 'taken' }, 409);
    return json({ status: 'ok', mock: true, start: iso, end: new Date(t + 30 * 60_000).toISOString() });
  }
  if (!configured()) return json({ status: 'unconfigured', url: PUBLIC_URL }, 503);

  const stillOpen = async () => {
    forget(monthKey(iso));
    const m = await month(monthKey(iso), true).catch(() => null);
    return m ? m.slots.find((x) => x.t === iso || Date.parse(x.t) === t) ?? null : undefined;
  };

  try {
    const slot = await stillOpen();
    if (slot === null) return json({ status: 'taken' }, 409);
    const booked = await book({ start: iso, name, email, note, tz });
    forget(monthKey(iso));
    return json({ status: 'ok', ...booked });
  } catch (e) {
    const status = e instanceof CalendlyError ? e.status : 0;
    console.error('book/create failed', status || (e as Error).name);
    if (status === 400 && (await stillOpen()) === null) return json({ status: 'taken' }, 409);
    if (status === 403 || status === 422 || status === 429) {
      const slot = await stillOpen();
      return json({ status: 'handoff', url: slot?.u ?? PUBLIC_URL }, 200);
    }
    return json({ status: 'error', url: PUBLIC_URL }, 502);
  }
};
