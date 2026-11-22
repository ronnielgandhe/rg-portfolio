import { useCallback, useRef, useState } from 'react';
import { AHEAD, PUBLIC_URL, addMonths, cmpYM, ymKey, type MonthData, type YM } from './lib';

const nowUtc = (): YM => { const d = new Date(); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1 }; };

export function inWindow(ym: YM) {
  const base = nowUtc();
  return cmpYM(ym, base) >= 0 && cmpYM(ym, addMonths(base, AHEAD)) <= 0;
}

export function useMonths(mock: boolean) {
  const [data, setData] = useState<Record<string, MonthData>>({});
  const asked = useRef(new Set<string>());

  const load = useCallback(async (ym: YM, fresh = false) => {
    const key = ymKey(ym);
    if (!inWindow(ym) || (!fresh && asked.current.has(key))) return;
    asked.current.add(key);
    if (!fresh) setData((d) => ({ ...d, [key]: { status: 'loading' } }));
    const q = new URLSearchParams({ month: key });
    if (mock) q.set('mock', '1');
    if (fresh) q.set('fresh', String(Date.now()));
    try {
      const res = await fetch(`/api/book/availability?${q}`, { cache: fresh ? 'no-store' : 'default' });
      const body = await res.json();
      const next: MonthData = body.status === 'ok'
        ? { status: 'ok', slots: body.slots, duration: body.duration, mock: body.mock }
        : { status: body.status === 'unconfigured' ? 'unconfigured' : 'error', url: body.url ?? PUBLIC_URL };
      setData((d) => ({ ...d, [key]: next }));
    } catch {
      asked.current.delete(key);
      setData((d) => ({ ...d, [key]: { status: 'error', url: PUBLIC_URL } }));
    }
  }, [mock]);

  const ensure = useCallback((local: YM) => {
    load(local);
    load(addMonths(local, 1));
    load(addMonths(local, -1));
  }, [load]);

  const retry = useCallback((local: YM) => {
    [-1, 0, 1].forEach((n) => asked.current.delete(ymKey(addMonths(local, n))));
    ensure(local);
  }, [ensure]);

  return { data, ensure, retry, refresh: (ym: YM) => load(ym, true) };
}
