const API = 'https://api.calendly.com';
const TOKEN = import.meta.env.CALENDLY_TOKEN || process.env.CALENDLY_TOKEN || '';
const EVENT_URI = import.meta.env.CALENDLY_EVENT_TYPE || process.env.CALENDLY_EVENT_TYPE || '';
const EVENT_SLUG = import.meta.env.CALENDLY_EVENT_SLUG || process.env.CALENDLY_EVENT_SLUG || '30min';

export const PUBLIC_URL = 'https://calendly.com/ronnielgandhe/30min';
export const configured = () => Boolean(TOKEN);
export const MAX_MONTHS_AHEAD = 3;

export class CalendlyError extends Error {
  constructor(public status: number, public body: unknown) { super(`calendly ${status}`); }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path.startsWith('http') ? path : API + path, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(7000),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new CalendlyError(res.status, body);
  return body as T;
}

type Question = { name: string; type: string; position: number; enabled: boolean; required: boolean };
type Location = { kind: string; location?: string };
export type EventType = { uri: string; name: string; duration: number; locations: Location[] | null; custom_questions: Question[]; scheduling_url: string; slug: string; active: boolean };

let eventCache: { at: number; value: EventType } | null = null;

export async function eventType(): Promise<EventType> {
  if (eventCache && Date.now() - eventCache.at < 600_000) return eventCache.value;
  let value: EventType | undefined;
  if (EVENT_URI) {
    value = (await call<{ resource: EventType }>(EVENT_URI)).resource;
  } else {
    const me = await call<{ resource: { uri: string } }>('/users/me');
    const list = await call<{ collection: EventType[] }>(`/event_types?user=${encodeURIComponent(me.resource.uri)}&count=100`);
    value = list.collection.find((e) => e.active && e.slug === EVENT_SLUG) ?? list.collection.find((e) => e.active);
  }
  if (!value) throw new CalendlyError(404, 'event type not found');
  eventCache = { at: Date.now(), value };
  return value;
}

export type Slot = { t: string; u: string };
export type Month = { duration: number; name: string; slots: Slot[] };

const monthCache = new Map<string, { at: number; value: Month }>();

export function monthRange(month: string): [Date, Date] | null {
  const m = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!m) return null;
  const start = new Date(Date.UTC(+m[1], +m[2] - 1, 1));
  const end = new Date(Date.UTC(+m[1], +m[2], 1));
  const now = new Date();
  const first = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const last = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + MAX_MONTHS_AHEAD + 1, 1));
  if (start < first || start >= last) return null;
  return [start, end];
}

export async function month(key: string, fresh = false): Promise<Month> {
  const hit = monthCache.get(key);
  if (!fresh && hit && Date.now() - hit.at < 60_000) return hit.value;
  const range = monthRange(key)!;
  const ev = await eventType();
  const from = new Date(Math.max(range[0].getTime(), Date.now() + 60_000));
  let slots: Slot[] = [];
  if (from < range[1]) {
    const q = new URLSearchParams({ event_type: ev.uri, start_time: from.toISOString(), end_time: range[1].toISOString() });
    const res = await call<{ collection: { status: string; start_time: string; scheduling_url: string }[] }>(`/event_type_available_times?${q}`);
    slots = res.collection.filter((s) => s.status === 'available').map((s) => ({ t: s.start_time, u: s.scheduling_url }));
  }
  const value = { duration: ev.duration, name: ev.name, slots };
  monthCache.set(key, { at: Date.now(), value });
  return value;
}

export const forget = (key: string) => monthCache.delete(key);

export type Booking = { start: string; name: string; email: string; note: string; tz: string };
export type Booked = { start: string; end: string; cancelUrl?: string; rescheduleUrl?: string };

export async function book(b: Booking): Promise<Booked> {
  const ev = await eventType();
  const qs = ev.custom_questions.filter((q) => q.enabled).sort((a, z) => a.position - z.position);
  const text = qs.find((q) => q.type === 'text' || q.type === 'string');
  if (qs.some((q) => q.required && q !== text) || (text?.required && !b.note)) throw new CalendlyError(422, 'required questions');
  const loc = ev.locations?.length === 1 ? ev.locations[0] : null;
  const payload: Record<string, unknown> = {
    event_type: ev.uri,
    start_time: new Date(b.start).toISOString(),
    invitee: { name: b.name, email: b.email, timezone: b.tz },
  };
  if (loc && !['ask_invitee', 'outbound_call'].includes(loc.kind)) payload.location = loc.location ? { kind: loc.kind, location: loc.location } : { kind: loc.kind };
  if (text && b.note) payload.questions_and_answers = [{ question: text.name, answer: b.note, position: text.position }];
  const res = await call<{ resource: { cancel_url?: string; reschedule_url?: string } }>('/invitees', { method: 'POST', body: JSON.stringify(payload) });
  const start = new Date(b.start);
  return {
    start: start.toISOString(),
    end: new Date(start.getTime() + ev.duration * 60_000).toISOString(),
    cancelUrl: res.resource.cancel_url,
    rescheduleUrl: res.resource.reschedule_url,
  };
}

const hits = new Map<string, number[]>();

export function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) { hits.set(key, list); return true; }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) hits.clear();
  return false;
}

export function ipOf(request: Request, clientAddress?: string) {
  return request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || clientAddress || 'local';
}

export const json = (body: unknown, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': cache } });

export const mockAllowed = (url: URL) => import.meta.env.DEV && url.searchParams.has('mock');

export function mockMonth(key: string): Month {
  const range = monthRange(key)!;
  const slots: Slot[] = [];
  for (let d = new Date(range[0]); d < range[1]; d = new Date(d.getTime() + 86_400_000)) {
    const dow = d.getUTCDay();
    const date = d.getUTCDate();
    if (dow === 0 || dow === 6 || date % 5 === 0) continue;
    for (let h = 17; h < 25; h++) {
      for (const m of [0, 30]) {
        if ((h + m + date) % 3 === 0) continue;
        const t = new Date(d.getTime() + h * 3_600_000 + m * 60_000);
        if (t.getTime() > Date.now() + 3_600_000) slots.push({ t: t.toISOString(), u: `${PUBLIC_URL}/${t.toISOString()}` });
      }
    }
  }
  return { duration: 30, name: '30 Minute Meeting', slots };
}
