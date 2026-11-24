import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import MonthGrid from './booking/MonthGrid';
import { BOOK_CSS } from './booking/styles';
import { useMonths, inWindow } from './booking/useMonths';
import {
  PUBLIC_URL, addMonths, dayLabel, downloadIcs, fullLabel, googleUrl, localDay, timeLabel, tzLabel, ymKey, zones,
  type Slot, type YM,
} from './booking/lib';
import { EMAIL } from './data';

type Step = 'cal' | 'form' | 'done' | 'handoff';
type Booked = { start: string; end: string; cancelUrl?: string; rescheduleUrl?: string; mock?: boolean };
type Problem = { kind: 'taken' | 'general'; text: string } | null;

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function useAutoHeight() {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | null>(null);
  useIso(() => {
    const el = inner.current;
    if (!el || !('ResizeObserver' in window)) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { inner, style: (h == null ? undefined : { height: h + 2 }) as CSSProperties | undefined };
}

export default function Book() {
  const root = useRef<HTMLDivElement>(null);
  const [mock, setMock] = useState(false);
  const [on, setOn] = useState(false);
  const [tz, setTz] = useState<string | null>(null);
  const [view, setView] = useState<YM | null>(null);
  const [dir, setDir] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('cal');
  const [slot, setSlot] = useState<Slot | null>(null);
  const [form, setForm] = useState({ name: '', email: '', note: '', website: '' });
  const [bad, setBad] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<Problem>(null);
  const [sending, setSending] = useState(false);
  const [booked, setBooked] = useState<Booked | null>(null);
  const [handoff, setHandoff] = useState(PUBLIC_URL);
  const jumped = useRef(false);
  const { data, ensure, retry, refresh } = useMonths(mock);
  const { inner, style } = useAutoHeight();

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const [y, m] = localDay(new Date(), zone).split('-').map(Number);
    setTz(zone);
    setView({ y, m });
    setMock(import.meta.env.DEV && new URLSearchParams(location.search).has('bookmock'));
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const go = () => setOn(true);
    const near = (e: Event) => { if ((e.target as Element | null)?.closest?.('a[href="#contact"]')) go(); };
    window.addEventListener('hm-book', go);
    document.addEventListener('pointerover', near, { passive: true });
    document.addEventListener('focusin', near);
    const idle = 'requestIdleCallback' in window ? requestIdleCallback(go, { timeout: 4000 }) : self.setTimeout(go, 2500);
    let io: IntersectionObserver | undefined;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) go(); }, { rootMargin: '1400px 0px' });
      io.observe(el);
    } else go();
    return () => {
      io?.disconnect();
      window.removeEventListener('hm-book', go);
      document.removeEventListener('pointerover', near);
      document.removeEventListener('focusin', near);
      if ('cancelIdleCallback' in window) cancelIdleCallback(idle as number); else clearTimeout(idle as number);
    };
  }, []);

  useEffect(() => { if (on && view) ensure(view); }, [on, view, ensure]);

  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    if (!tz) return map;
    for (const v of Object.values(data)) {
      if (v.status !== 'ok') continue;
      for (const s of v.slots) {
        const k = localDay(s.t, tz);
        const list = map.get(k);
        if (list) { if (!list.some((x) => x.t === s.t)) list.push(s); } else map.set(k, [s]);
      }
    }
    map.forEach((list) => list.sort((a, b) => a.t.localeCompare(b.t)));
    return map;
  }, [data, tz]);

  const open = useMemo(() => new Set(byDay.keys()), [byDay]);
  const here = view ? data[ymKey(view)] : undefined;
  const loading = !tz || !view || !here || here.status === 'loading';
  const offline = here && (here.status === 'unconfigured' || here.status === 'error') ? here : null;
  const okMonth = Object.values(data).find((v) => v.status === 'ok');
  const duration = okMonth?.status === 'ok' ? okMonth.duration : 30;
  const isMock = Object.values(data).some((v) => v.status === 'ok' && v.mock);
  const today = tz ? localDay(new Date(), tz) : '';

  useEffect(() => {
    if (jumped.current || loading || !view || offline) return;
    const prefix = ymKey(view);
    const next = data[ymKey(addMonths(view, 1))];
    if ([...open].some((k) => k.startsWith(prefix))) { jumped.current = true; return; }
    if (next?.status === 'ok') {
      jumped.current = true;
      const n = ymKey(addMonths(view, 1));
      if ([...open].some((k) => k.startsWith(n))) page(1);
    }
  }, [loading, view, data, open, offline]);

  function page(n: number) {
    if (!view) return;
    const next = addMonths(view, n);
    if (!inWindow(next)) return;
    setDir(n);
    setView(next);
  }

  function pickSlot(s: Slot) {
    setSlot(s);
    setProblem(null);
    setBad({});
    setStep('form');
  }

  function backToCal(reload = false) {
    setStep('cal');
    setProblem(null);
    if (reload && slot && view) {
      refresh({ y: +slot.t.slice(0, 4), m: +slot.t.slice(5, 7) });
      setSlot(null);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!slot || !tz || sending) return;
    const local: Record<string, string> = {};
    if (!form.name.trim()) local.name = 'add your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) local.email = 'that email looks off';
    setBad(local);
    if (Object.keys(local).length) return;
    setSending(true);
    setProblem(null);
    try {
      const res = await fetch(`/api/book/create${mock ? '?mock=1' : ''}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: slot.t, tz, ...form }),
      });
      const body = await res.json().catch(() => ({ status: 'error' }));
      if (body.status === 'ok') { setBooked(body); setStep('done'); }
      else if (body.status === 'taken') setProblem({ kind: 'taken', text: 'that time was just taken.' });
      else if (body.status === 'invalid') { setBad(body.fields ?? {}); if (!body.fields) setProblem({ kind: 'general', text: body.error ?? 'something looks off.' }); }
      else if (body.status === 'handoff' || body.status === 'unconfigured') { setHandoff(body.url ?? slot.u ?? PUBLIC_URL); setStep('handoff'); }
      else if (body.status === 'limited') setProblem({ kind: 'general', text: 'too many tries from here. give it a few minutes, or email me.' });
      else setProblem({ kind: 'general', text: 'that did not go through. try again, or email me.' });
    } catch {
      setProblem({ kind: 'general', text: 'network hiccup. try again.' });
    } finally {
      setSending(false);
    }
  }

  const slots = day ? byDay.get(day) ?? [] : [];
  const end = (iso: string) => new Date(Date.parse(iso) + duration * 60_000).toISOString();
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div ref={root} className="bk" style={style} data-reveal>
      <style>{BOOK_CSS}</style>
      <div ref={inner} className="bk-in">
        {isMock && <span className="bk-mock">dev mock</span>}

        {offline && step === 'cal' ? (
          <div className="bk-step bk-done" key="offline">
            <span className="bk-tag">book a call</span>
            <p className="bk-p">
              {offline.status === 'error' ? 'my calendar did not load just now. ' : ''}
              {duration} minutes on a video call. pick any open time and you will get an invite right away.
            </p>
            <div className="bk-actions">
              <a className="bk-btn" href={offline.url} target="_blank" rel="noopener noreferrer">pick a time</a>
              {offline.status === 'error' && view && <button type="button" className="bk-link" onClick={() => retry(view)}>try again</button>}
              <span className="bk-fine">opens calendly in a new tab, or email <a className="bk-link" href={`mailto:${EMAIL}`}>{EMAIL}</a></span>
            </div>
          </div>
        ) : step === 'cal' ? (
          <div className="bk-step" key="cal">
            <span className="bk-tag"><b>{duration} min</b> &nbsp;·&nbsp; video call</span>
            <div className="bk-split">
              <div>
                <MonthGrid
                  ym={view ?? { y: 2000, m: 1 }}
                  today={today}
                  open={open}
                  selected={day}
                  loading={loading}
                  dir={dir}
                  canPrev={!!view && inWindow(addMonths(view, -1))}
                  canNext={!!view && inWindow(addMonths(view, 1))}
                  onPage={page}
                  onSelect={(k) => setDay(k)}
                />
                {tz && (
                  <div className="bk-tz">
                    <label htmlFor="bk-tz">time zone</label>
                    <span className="bk-select">
                      <select id="bk-tz" value={tz} onChange={(e) => setTz(e.target.value)}>
                        {zones(tz).map((z) => <option key={z} value={z}>{tzLabel(z)}</option>)}
                      </select>
                    </span>
                  </div>
                )}
              </div>
              <div className="bk-side">
                {day && <div className="bk-daylabel">{dayLabel(day)}</div>}
                {day && slots.length ? (
                  <div className="bk-slots" data-in key={day + tz}>
                    {slots.map((s, i) => (
                      <button key={s.t} type="button" className="bk-slot" style={{ '--i': i } as CSSProperties} onClick={() => pickSlot(s)}>
                        {timeLabel(s.t, tz!)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="bk-hint">{loading ? 'loading open times…' : day ? 'nothing left that day.' : open.size ? 'pick a day to see times.' : 'no open times in this window. email me instead.'}</p>
                )}
              </div>
            </div>
          </div>
        ) : step === 'form' && slot && tz ? (
          <form className="bk-step" key="form" onSubmit={submit} noValidate>
            <div className="bk-sum">
              <div className="bk-when">
                {fullLabel(slot.t, tz)}
                <small>{timeLabel(slot.t, tz)} – {timeLabel(end(slot.t), tz)} · <span className="bk-nw">{tzLabel(tz)}</span></small>
              </div>
              <button type="button" className="bk-link" onClick={() => backToCal()}>change</button>
            </div>
            <div className="bk-form">
              <div className="bk-row2">
                <label className="bk-field" data-bad={bad.name ? '' : undefined}>
                  <span>name</span>
                  <input value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} required autoFocus />
                  {bad.name && <small>{bad.name}</small>}
                </label>
                <label className="bk-field" data-bad={bad.email ? '' : undefined}>
                  <span>email</span>
                  <input type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={254} required />
                  {bad.email && <small>{bad.email}</small>}
                </label>
              </div>
              <label className="bk-field" data-bad={bad.note ? '' : undefined}>
                <span>what's this about <em>optional</em></span>
                <textarea value={form.note} onChange={set('note')} maxLength={1000} />
                {bad.note && <small>{bad.note}</small>}
              </label>
              <label className="bk-hp" aria-hidden="true">website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
              {problem && (
                <div className="bk-err" role="alert">
                  {problem.text}
                  {problem.kind === 'taken'
                    ? <button type="button" onClick={() => backToCal(true)}>pick another time</button>
                    : <a className="bk-link" style={{ marginLeft: 6 }} href={`mailto:${EMAIL}`}>{EMAIL}</a>}
                </div>
              )}
              <div className="bk-actions">
                <button type="submit" className="bk-btn" disabled={sending}>
                  {sending && <span className="bk-spin" aria-hidden="true" />}
                  {sending ? 'booking' : 'book it'}
                </button>
                <span className="bk-fine">you'll get a calendar invite by email.</span>
              </div>
            </div>
          </form>
        ) : step === 'done' && booked && tz ? (
          <div className="bk-step bk-done" key="done" role="status">
            <span className="bk-check" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.5 7.5 5.5 10.5 11.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" /></svg></span>
            <div>
              <p className="bk-big">you're booked.</p>
              <p className="bk-p">
                {fullLabel(booked.start, tz)} · {timeLabel(booked.start, tz)} – {timeLabel(booked.end, tz)} · <span className="bk-nw">{tzLabel(tz)}</span>.
                {booked.mock ? ' dev mock: nothing was actually booked.' : ` an invite is on its way to ${form.email.trim()}.`}
              </p>
            </div>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={() => downloadIcs(booked.start, booked.end, [booked.rescheduleUrl ? `reschedule: ${booked.rescheduleUrl}` : '', booked.cancelUrl ? `cancel: ${booked.cancelUrl}` : ''].filter(Boolean))}>add to calendar</button>
              <a className="bk-btn bk-btn-2" href={googleUrl(booked.start, booked.end)} target="_blank" rel="noopener noreferrer">google calendar</a>
              {booked.rescheduleUrl && <a className="bk-link" href={booked.rescheduleUrl} target="_blank" rel="noopener noreferrer">reschedule</a>}
              {booked.cancelUrl && <a className="bk-link" href={booked.cancelUrl} target="_blank" rel="noopener noreferrer">cancel</a>}
            </div>
          </div>
        ) : step === 'handoff' && slot && tz ? (
          <div className="bk-step bk-done" key="handoff">
            <span className="bk-tag">one more step</span>
            <div>
              <p className="bk-big">finish on calendly.</p>
              <p className="bk-p">
                {fullLabel(slot.t, tz)} at {timeLabel(slot.t, tz)} is still open. confirmation finishes on calendly: it opens in a new tab with that time picked, where you add your name and email.
              </p>
            </div>
            <div className="bk-actions">
              <a className="bk-btn" href={handoff} target="_blank" rel="noopener noreferrer">finish on calendly</a>
              <button type="button" className="bk-link" onClick={() => backToCal()}>pick another time</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
