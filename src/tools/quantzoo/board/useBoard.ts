import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryData, NewsData, OddsData, TapeData } from './types.ts';

export interface Slot<T> {
  data: T | null;
  error: string | null;
  loadedAt: number;
}

const empty = <T,>(): Slot<T> => ({ data: null, error: null, loadedAt: 0 });

const EVERY = 5 * 60_000;
const BASE = '/api/quantzoo/board/';

export function useBoard() {
  const [tape, setTape] = useState<Slot<TapeData>>(empty);
  const [odds, setOdds] = useState<Slot<OddsData>>(empty);
  const [news, setNews] = useState<Slot<NewsData>>(empty);
  const [history, setHistory] = useState<Slot<HistoryData>>(empty);
  const last = useRef(0);

  const load = useCallback(async () => {
    last.current = Date.now();
    const down = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('down') : null;
    const q = down ? `?down=${encodeURIComponent(down)}` : '';
    const one = async <T,>(path: string, set: (f: (s: Slot<T>) => Slot<T>) => void) => {
      try {
        const res = await fetch(BASE + path + q);
        const body = await res.json();
        if (!res.ok || body.error) throw new Error(body.error || `${res.status}`);
        set(() => ({ data: body as T, error: null, loadedAt: Date.now() }));
      } catch (e) {
        set((s) => ({ ...s, error: e instanceof Error ? e.message : String(e) }));
      }
    };
    await Promise.all([one('tape', setTape), one('odds', setOdds), one('news', setNews), one('history', setHistory)]);
  }, []);

  useEffect(() => {
    load();
    const tick = () => {
      if (document.visibilityState === 'visible' && Date.now() - last.current >= EVERY) load();
    };
    const id = window.setInterval(tick, 30_000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [load]);

  return { tape, odds, news, history, every: EVERY };
}

export function useNow(ms = 30_000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

export function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') return setSeen(true);
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}
