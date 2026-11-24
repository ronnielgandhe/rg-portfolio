import { useEffect, useId, useRef, useState } from 'react';
import { getSummary, suggest, type Summary, type Suggestion } from './wiki';

const resolved = new Map<string, Summary>();

export function useSummary(title: string | null | undefined): Summary | null {
  const key = title ? title.replace(/_/g, ' ') : '';
  const [s, setS] = useState<Summary | null>(() => (key ? resolved.get(key) ?? null : null));
  useEffect(() => {
    if (!key) { setS(null); return; }
    const hit = resolved.get(key);
    if (hit) { setS(hit); return; }
    let live = true;
    getSummary(key).then((v) => { resolved.set(key, v); if (live) setS(v); });
    return () => { live = false; };
  }, [key]);
  return s && key ? s : null;
}

export function Thumb({ src, title, size, className = '' }: { src: string | null | undefined; title: string; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const style = size ? { width: size, height: size } : undefined;
  if (!src || broken) {
    return <span className={`clk-thumb clk-thumb-empty ${className}`} style={style} aria-hidden="true">{title.charAt(0).toUpperCase()}</span>;
  }
  return <img className={`clk-thumb ${loaded ? 'clk-thumb-on' : ''} ${className}`} style={style} src={src} alt="" loading="lazy" decoding="async" onLoad={() => setLoaded(true)} onError={() => setBroken(true)} />;
}

export function PageChip({ title, label, state = '' }: { title: string; label?: string; state?: string }) {
  const s = useSummary(title);
  return (
    <div className={`clk-chip ${state}`}>
      <Thumb src={s?.thumbnail} title={title} size={32} />
      <div className="clk-chip-text">
        {label && <div className="clk-chip-label">{label}</div>}
        <div className="clk-chip-title">{title}</div>
      </div>
    </div>
  );
}

export function Arrow({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function OutIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" aria-hidden="true">
      <path d="M8 4h12v12M20 4L5 19" />
    </svg>
  );
}

export function TitleInput({ label, value, onChange, placeholder, onEnter, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; onEnter?: () => void; autoFocus?: boolean;
}) {
  const id = useId();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const picked = useRef(value);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2 || q === picked.current) { setItems([]); return; }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      suggest(q, ctl.signal)
        .then((r) => {
          const seen = new Set<string>();
          setItems(r.filter((x) => !seen.has(x.title) && seen.add(x.title)));
          setActive(-1);
        })
        .catch(() => {});
    }, 220);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [value]);

  const choose = (title: string) => {
    picked.current = title;
    onChange(title);
    setItems([]);
    setOpen(false);
  };

  const show = open && items.length > 0;

  return (
    <div className="clk-field">
      <label className="clk-label" htmlFor={id}>{label}</label>
      <div className="clk-combo">
        <input
          id={id}
          className="clk-input"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={show}
          aria-controls={`${id}-list`}
          aria-activedescendant={show && active >= 0 ? `${id}-${active}` : undefined}
          onChange={(e) => { picked.current = ''; onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % items.length); }
            else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
            else if (e.key === 'Escape') setOpen(false);
            else if (e.key === 'Enter') {
              if (show && active >= 0) { e.preventDefault(); choose(items[active].title); }
              else if (onEnter) { e.preventDefault(); setOpen(false); onEnter(); }
            }
          }}
        />
        {show && (
          <ul className="clk-drop" id={`${id}-list`} role="listbox">
            {items.map((it, i) => (
              <li
                key={it.title}
                id={`${id}-${i}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? 'clk-opt clk-opt-on' : 'clk-opt'}
                onMouseDown={(e) => { e.preventDefault(); choose(it.title); }}
                onMouseEnter={() => setActive(i)}
              >
                <Thumb src={it.thumbnail} title={it.title} size={28} />
                <span className="clk-opt-text">
                  <span className="clk-opt-title">{it.title}</span>
                  {it.description && <span className="clk-opt-desc">{it.description}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function useElapsed(startedAt: number | null, finishedAt: number | null) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!startedAt || finishedAt) return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [startedAt, finishedAt]);
  if (!startedAt) return 0;
  return ((finishedAt ?? now) - startedAt) / 1000;
}

export const fmtSeconds = (s: number) => (s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`);
