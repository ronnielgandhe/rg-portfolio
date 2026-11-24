import { createElement, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { normalize } from './pathfinder';
import { collectLinks, sanitizeArticle, type ANode } from './sanitize';
import { Arrow, OutIcon, Thumb, useSummary } from './ui';
import { PathRow } from './Result';
import { articleUrl, getArticleHtml, getPageLinks, getSummary, WikiError, type Summary } from './wiki';

interface Props {
  start: string;
  target: string;
  botPath: string[];
  botTotal: number;
  onGiveUp: () => void;
  onNew: () => void;
}

function renderNodes(nodes: ANode[], hop: (t: string) => void, target: string, keyBase = ''): ReactNode[] {
  return nodes.map((n, i) => {
    const key = `${keyBase}${i}`;
    if (typeof n === 'string') return n;
    if (n.tag === 'a' && 'title' in n) {
      const isTarget = normalize(n.title) === normalize(target);
      return (
        <a key={key} href={articleUrl(n.title)} className={isTarget ? 'clk-wl clk-wl-target' : 'clk-wl'} title={n.title}
          onClick={(e) => { if (e.metaKey || e.ctrlKey || e.shiftKey) return; e.preventDefault(); hop(n.title); }}>
          {renderNodes(n.children, hop, target, `${key}.`)}
        </a>
      );
    }
    if (n.tag === 'img' && 'src' in n) {
      return <img key={key} src={n.src} alt={n.alt} width={n.w} height={n.h} loading="lazy" decoding="async" />;
    }
    if (n.tag === 'br') return <br key={key} />;
    return createElement(n.tag, { key }, ...renderNodes((n as { children: ANode[] }).children, hop, target, `${key}.`));
  });
}

function TargetCard({ title }: { title: string }) {
  const s = useSummary(title);
  return (
    <div className="clk-target">
      <span className="clk-label">get to</span>
      <div className="clk-target-row">
        <Thumb src={s?.thumbnail} title={title} size={48} />
        <div>
          <div className="clk-target-title">{title}</div>
          <div className="clk-target-desc">{s?.description || ' '}</div>
        </div>
      </div>
    </div>
  );
}

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const w = (n: number) => WORDS[n] ?? String(n);

export default function Play({ start, target, botPath, botTotal, onGiveUp, onNew }: Props) {
  const botClicks = botPath.length - 1;
  const [path, setPath] = useState<string[]>([start]);
  const [total, setTotal] = useState(0);
  const [doc, setDoc] = useState<{ title: string; nodes: ANode[]; summary: Summary } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [filter, setFilter] = useState('');
  const [allLinks, setAllLinks] = useState<string[]>([]);
  const current = path[path.length - 1];
  const topRef = useRef<HTMLDivElement>(null);
  const clicks = path.length - 1;

  useEffect(() => {
    if (won) return;
    const ctl = new AbortController();
    setLoading(true);
    setError(null);
    setFilter('');
    setAllLinks([]);
    getPageLinks(current, ctl.signal).then(setAllLinks).catch(() => {});
    getArticleHtml(current, ctl.signal)
      .then(async (a) => {
        if (normalize(a.title) === normalize(target)) { setPath((p) => [...p.slice(0, -1), a.title]); setWon(true); return; }
        const nodes = sanitizeArticle(a.html);
        const summary = await getSummary(a.title);
        if (ctl.signal.aborted) return;
        if (summary.thumbnail) await new Promise<void>((r) => { const im = new Image(); im.onload = im.onerror = () => r(); im.src = summary.thumbnail!; setTimeout(r, 1500); });
        if (ctl.signal.aborted) return;
        setDoc({ title: a.title, nodes, summary });
        setLoading(false);
      })
      .catch((e) => {
        if (e.name === 'AbortError') return;
        setError(e instanceof WikiError ? e.message : 'could not load that article.');
        setLoading(false);
      });
    return () => ctl.abort();
  }, [current, target, won]);

  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > y) window.scrollTo({ top: y, behavior: 'auto' });
  }, [doc?.title]);

  const hop = (title: string) => {
    if (loading || won) return;
    setTotal((t) => t + 1);
    if (normalize(title) === normalize(target)) { setPath((p) => [...p, target]); setWon(true); return; }
    setPath((p) => [...p, title]);
  };
  const undo = () => { if (path.length > 1 && !won) setPath((p) => p.slice(0, -1)); };

  const links = useMemo(() => [...new Set([...(doc ? collectLinks(doc.nodes).keys() : []), ...allLinks])], [doc, allLinks]);
  const hasTargetLink = links.some((l) => normalize(l) === normalize(target));
  const matches = filter.trim().length >= 2 ? links.filter((l) => l.toLowerCase().includes(filter.trim().toLowerCase())).slice(0, 8) : [];
  const body = useMemo(() => (doc ? renderNodes(doc.nodes, hop, target) : null), [doc, loading, won]);

  if (won) {
    const diff = botClicks - clicks;
    const line = diff > 0 ? `you beat the bot by ${w(diff)} click${diff === 1 ? '' : 's'}.`
      : diff === 0 ? 'dead even with the bot.'
      : `the bot wins this one by ${w(-diff)}.`;
    return (
      <div className="clk-view">
        <div className="clk-head">
          <div className="clk-kicker">you made it</div>
          <h2 className="clk-title clk-title-pair">{start} <Arrow size={26} /> {target}</h2>
          <p className="clk-lede">{line} you opened {total} link{total === 1 ? '' : 's'} in total, the bot opened {botTotal} pages to find its path.</p>
        </div>
        <div className="clk-big">
          <div className="clk-big-cell"><span className="clk-big-num">{clicks}</span><span className="clk-label">your clicks</span><span className="clk-big-sub">{total} including undos</span></div>
          <div className="clk-big-cell"><span className="clk-big-num">{botClicks}</span><span className="clk-label">bot clicks</span><span className="clk-big-sub">{botTotal} pages opened</span></div>
        </div>
        <section className="clk-section"><div className="clk-label">your path</div><PathRow path={path} /></section>
        <section className="clk-section"><div className="clk-label">the bot's path</div><PathRow path={botPath} /></section>
        <div className="clk-actions">
          <button type="button" className="st-btn st-btn-primary" onClick={onNew}>new pair</button>
          <button type="button" className="st-btn" onClick={() => { setPath([start]); setTotal(0); setWon(false); setDoc(null); }}>play again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="clk-view clk-play">
      <div className="clk-play-main" ref={topRef}>
        <div className="clk-kicker">your turn, click {clicks + 1}</div>
        {error ? (
          <div className="clk-read-error">
            <p className="clk-error">{error}</p>
            {path.length > 1 && <button type="button" className="st-btn" onClick={undo}>go back</button>}
          </div>
        ) : !doc ? (
          <>
            <h2 className="clk-title">{current}</h2>
            <div className="clk-read-skel" aria-label="loading article">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ width: `${[96, 88, 92, 70, 94, 84, 60][i]}%` }} />)}</div>
          </>
        ) : (
          <div className={loading ? 'clk-doc clk-doc-wait' : 'clk-doc'} aria-busy={loading}>
            <div className="clk-fade" key={doc.title}>
              <h2 className="clk-title">{doc.title}</h2>
              <div className="clk-read-desc">{doc.summary.description || 'wikipedia article'}</div>
              {doc.summary.thumbnail && <figure className="clk-read-lead"><img src={doc.summary.thumbnail} alt="" /></figure>}
              <div className="clk-read">{body}</div>
              <p className="clk-attr">text and images from <a href={articleUrl(doc.title)} target="_blank" rel="noopener noreferrer">{doc.title} on wikipedia</a>, cc by-sa 4.0. tables, references and navigation boxes left out.</p>
            </div>
          </div>
        )}
      </div>

      <aside className="clk-side">
        <TargetCard title={target} />
        <div className="clk-side-stats">
          <div className="clk-stat"><span className="clk-stat-num">{clicks}</span><span className="clk-label">your clicks</span></div>
          <div className="clk-stat"><span className="clk-stat-num">{botClicks}</span><span className="clk-label">bot to beat</span></div>
        </div>
        {hasTargetLink && !loading && <div className="clk-hint">{target} is linked on this page</div>}
        <div className="clk-find">
          <label className="clk-label" htmlFor="clk-find">find a link on this page</label>
          <input id="clk-find" className="clk-input clk-input-sm" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`all ${links.length} links, same list the bot saw`} autoComplete="off" spellCheck={false} />
          {matches.length > 0 && (
            <ul className="clk-find-list">
              {matches.map((m) => <li key={m}><button type="button" onClick={() => hop(m)}>{m}</button></li>)}
            </ul>
          )}
        </div>
        <ol className="clk-yourpath">
          {path.map((p, i) => (
            <li key={`${i}-${p}`} className={i === path.length - 1 ? 'clk-yp-on' : ''}><span>{i === 0 ? 's' : i}</span>{p}</li>
          ))}
        </ol>
        <div className="clk-side-actions">
          <button type="button" className="st-btn" onClick={undo} disabled={path.length < 2}>undo</button>
          <button type="button" className="st-btn" onClick={onGiveUp}>give up</button>
          <a className="clk-out" href={articleUrl(current)} target="_blank" rel="noopener noreferrer">open on wikipedia <OutIcon /></a>
        </div>
      </aside>

      <div className="clk-dock">
        <span className="clk-dock-to">to <b>{target}</b></span>
        <span className="clk-dock-n">{clicks} / bot {botClicks}</span>
        <button type="button" className="st-btn" onClick={undo} disabled={path.length < 2}>undo</button>
      </div>
    </div>
  );
}
