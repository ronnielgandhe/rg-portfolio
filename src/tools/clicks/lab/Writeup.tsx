import type { ReactNode } from 'react';

type Block =
  | { t: 'h2' | 'h3' | 'p'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'chart'; name: string };

const CHART = /^\{\{chart:([a-z-]+)\}\}$/;

export function parse(md: string): Block[] {
  const out: Block[] = [];
  let para: string[] = [];
  let list: { t: 'ul' | 'ol'; items: string[] } | null = null;
  const flush = () => {
    if (para.length) out.push({ t: 'p', text: para.join(' ') });
    if (list) out.push(list);
    para = [];
    list = null;
  };
  for (const raw of md.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if (!line) { flush(); continue; }
    if ((m = line.match(CHART))) { flush(); out.push({ t: 'chart', name: m[1] }); continue; }
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) { flush(); out.push({ t: m[1].length <= 2 ? 'h2' : 'h3', text: m[2] }); continue; }
    if ((m = line.match(/^[-*]\s+(.*)$/)) || (m = line.match(/^\d+[.)]\s+(.*)$/))) {
      const t = /^\d/.test(line) ? 'ol' : 'ul';
      if (para.length) { out.push({ t: 'p', text: para.join(' ') }); para = []; }
      if (!list || list.t !== t) { if (list) out.push(list); list = { t, items: [] }; }
      list.items.push(m[1]);
      continue;
    }
    if (list && /^\s{2,}/.test(raw)) { list.items[list.items.length - 1] += ` ${line}`; continue; }
    if (list) { out.push(list); list = null; }
    para.push(line);
  }
  flush();
  return out;
}

const safeHref = (h: string) => (/^(https?:\/\/|\/|#|mailto:)/i.test(h) ? h : null);

export function inline(text: string, key = ''): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|<[^>]*>/g;
  let last = 0, m: RegExpExecArray | null, i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1] !== undefined) out.push(<code key={k}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={k}>{inline(m[2], k)}</strong>);
    else if (m[3] !== undefined) {
      const href = safeHref(m[4]);
      const ext = href ? /^https?:/i.test(href) : false;
      out.push(href ? <a key={k} href={href} target={ext ? '_blank' : undefined} rel={ext ? 'noopener noreferrer' : undefined}>{inline(m[3], k)}</a> : m[3]);
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Writeup({ md, charts }: { md: string; charts: Record<string, ReactNode> }) {
  const blocks = parse(md);
  return (
    <div className="lab-md">
      {blocks.map((b, i) => {
        switch (b.t) {
          case 'h2': return <h3 key={i} className="lab-md-h2">{inline(b.text, `h${i}`)}</h3>;
          case 'h3': return <h4 key={i} className="lab-md-h3">{inline(b.text, `h${i}`)}</h4>;
          case 'p': return <p key={i}>{inline(b.text, `p${i}`)}</p>;
          case 'ul': return <ul key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `l${i}-${j}`)}</li>)}</ul>;
          case 'ol': return <ol key={i}>{b.items.map((it, j) => <li key={j}>{inline(it, `l${i}-${j}`)}</li>)}</ol>;
          case 'chart': return charts[b.name] ? <div key={i} className="lab-md-chart">{charts[b.name]}</div> : null;
        }
      })}
    </div>
  );
}
