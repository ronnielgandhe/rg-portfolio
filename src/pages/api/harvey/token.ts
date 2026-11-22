import type { APIRoute } from 'astro';
import { AccessToken, RoomAgentDispatch, RoomConfiguration } from 'livekit-server-sdk';

export const prerender = false;

const UPSTREAM = 'https://harvey-two.vercel.app/api/token';
const WINDOW_MS = 10 * 60 * 1000;
const PER_IP = 5;
const GLOBAL = 60;
const BRAINS = new Set(['opus', 'sonnet', 'haiku']);

const hits = new Map<string, number[]>();
let globalHits: number[] = [];

function allow(ip: string): boolean {
  const now = Date.now();
  const fresh = (list: number[]) => list.filter((t) => now - t < WINDOW_MS);
  globalHits = fresh(globalHits);
  const mine = fresh(hits.get(ip) ?? []);
  if (mine.length >= PER_IP || globalHits.length >= GLOBAL) {
    hits.set(ip, mine);
    return false;
  }
  mine.push(now);
  globalHits.push(now);
  hits.set(ip, mine);
  if (hits.size > 5000) hits.clear();
  return true;
}

function env(name: string): string | undefined {
  return (import.meta.env[name] as string | undefined) || process.env[name] || undefined;
}

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  });
}

function clientIp(request: Request, clientAddress: () => string): string {
  const fwd = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (fwd) return fwd;
  try { return clientAddress() || 'unknown'; } catch { return 'unknown'; }
}

async function mintLocal(brain: string, key: string, secret: string, url: string) {
  const roomName = `harvey-room-${Date.now()}`;
  const identity = `client-${Math.random().toString(36).slice(2, 10)}`;
  const at = new AccessToken(key, secret, { identity, ttl: 60 * 10, attributes: brain ? { 'harvey.brain': brain } : {} });
  at.addGrant({ room: roomName, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });
  const agentName = env('HARVEY_AGENT_NAME');
  if (agentName) at.roomConfig = new RoomConfiguration({ agents: [new RoomAgentDispatch({ agentName })] });
  return { token: await at.toJwt(), url, roomName, identity };
}

async function proxy(brain: string) {
  const res = await fetch(brain ? `${UPSTREAM}?brain=${brain}` : UPSTREAM, { cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if (res.status === 429) return { status: 429 as const };
  if (!res.ok) return { status: 502 as const };
  const data = (await res.json()) as { token?: unknown; url?: unknown; roomName?: unknown; identity?: unknown };
  if (typeof data.token !== 'string' || typeof data.url !== 'string') return { status: 502 as const };
  return { status: 200 as const, body: { token: data.token, url: data.url, roomName: data.roomName, identity: data.identity } };
}

export const GET: APIRoute = async ({ request, url, clientAddress }) => {
  if (!allow(clientIp(request, () => clientAddress))) {
    return json({ error: 'too many calls from here. give it a few minutes.' }, 429, { 'Retry-After': '600' });
  }

  const requested = url.searchParams.get('brain') ?? '';
  const brain = BRAINS.has(requested) ? requested : '';

  const key = env('LIVEKIT_API_KEY');
  const secret = env('LIVEKIT_API_SECRET');
  const lkUrl = env('LIVEKIT_URL') || env('PUBLIC_LIVEKIT_URL');

  try {
    if (key && secret && lkUrl) return json(await mintLocal(brain, key, secret, lkUrl));
    const up = await proxy(brain);
    if (up.status === 429) return json({ error: 'harvey is busy right now. try again in a few minutes.' }, 429, { 'Retry-After': '600' });
    if (up.status !== 200) return json({ error: 'could not reach harvey. try again in a minute.' }, 502);
    return json(up.body);
  } catch {
    return json({ error: 'could not reach harvey. try again in a minute.' }, 502);
  }
};
