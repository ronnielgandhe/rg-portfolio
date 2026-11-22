import { useEffect, useState, type CSSProperties } from 'react';

const ITEMS = [
  { id: 'intro', href: '#top' },
  { id: 'work', href: '#work' },
  { id: 'projects', href: '#projects' },
  { id: 'writing', href: '#writing' },
  { id: 'desktop', href: '#desktop' },
  { id: 'contact', href: '#contact' },
];

export default function SideIndex() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = window.innerHeight * 0.4;
      let i = 0;
      ITEMS.forEach((it, k) => {
        const el = k ? document.getElementById(it.id) : null;
        if (el && el.getBoundingClientRect().top <= line) i = k;
      });
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) i = ITEMS.length - 1;
      setActive(i);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <nav className="hm-idx" aria-label="sections" style={{ '--y': `${active * 28}px` } as CSSProperties}>
      <span className="hm-idx-mark" aria-hidden="true" />
      {ITEMS.map((it, k) => (
        <a key={it.id} href={it.href} className="hm-idx-a" aria-current={k === active ? 'true' : undefined}>{it.id}</a>
      ))}
    </nav>
  );
}
