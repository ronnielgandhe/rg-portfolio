import { useEffect, useRef, useState } from 'react';
import { CALENDLY, CALENDLY_EMBED } from './data';

export default function Book() {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const go = () => setOn(true);
    window.addEventListener('hm-book', go);
    if (!('IntersectionObserver' in window)) { go(); return () => window.removeEventListener('hm-book', go); }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { go(); io.disconnect(); } }, { rootMargin: '900px 0px' });
    io.observe(el);
    return () => { io.disconnect(); window.removeEventListener('hm-book', go); };
  }, []);

  return (
    <div ref={ref} className="hm-cal" data-ready={ready || undefined} data-reveal>
      <a className="hm-cal-ph" href={CALENDLY} target="_blank" rel="noopener noreferrer">open the calendar</a>
      {on && <iframe src={CALENDLY_EMBED} title="book a call with ronniel" onLoad={() => setReady(true)} />}
    </div>
  );
}
