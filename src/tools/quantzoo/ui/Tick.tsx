import { useEffect, useRef, useState } from 'react';

export function Tick({ value, format }: { value: number; format: (x: number) => string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);
  useEffect(() => {
    if (!Number.isFinite(value)) {
      setShown(value);
      return;
    }
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    const a = Number.isFinite(from.current) ? from.current : value;
    if (reduce || a === value) {
      from.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 480);
      const e = 1 - Math.pow(1 - p, 3);
      const v = a + (value - a) * e;
      from.current = v;
      setShown(v);
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{format(shown)}</>;
}
