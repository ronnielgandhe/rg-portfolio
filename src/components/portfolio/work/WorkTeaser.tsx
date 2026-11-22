import { ELSEWHERE, ROLES } from './data';
import { Arrow, splitHead, WORK_CSS } from './ui';

export default function WorkTeaser() {
  return (
    <div className="wk wt-root">
      {ROLES.map((r) => {
        const top = r.positions.flatMap((p) => p.areas.flatMap((a) => a.items)).filter((h) => h.top && !h.draft).slice(0, 4);
        const p0 = r.positions[0];
        const years = r.positions.flatMap((p) => p.when.match(/\d{4}/g) ?? []).sort();
        const when = r.positions.length > 1 ? `${years[0]} to ${years[years.length - 1]}` : p0.when;
        const Head = r.page ? 'a' : 'div';
        return (
          <section key={r.slug} className="wt-role">
            <Head className="wt-head" {...(r.page ? { href: `/${r.slug}` } : {})}>
              <span className="wt-co">{r.company}{r.page && <Arrow />}</span>
              <span className="wt-when">{when}</span>
            </Head>
            <div className="wt-title">{r.positions.map((p) => p.title).join(' · ')}</div>
            {r.stats && (
              <div className="wt-stats">
                {r.stats.slice(0, 3).map((s) => (
                  <span key={s.label}><b>{s.value.toFixed(s.decimals ?? 0)}{s.suffix ?? ''}</b> {s.label}</span>
                ))}
              </div>
            )}
            <ul className="wt-list">
              {top.map((h) => {
                const [head, rest] = splitHead(h.text);
                const first = rest.split('. ')[0].replace(/\.$/, '') + '.';
                return <li key={h.text}>{head ? <><span className="wk-head">{head}</span> {first}</> : h.text}</li>;
              })}
            </ul>
          </section>
        );
      })}
      <div className="wt-else">
        <span className="wk-label">elsewhere</span>
        <span className="wk-links">
          {ELSEWHERE.map((l) => (
            <a key={l.href} className="wk-out" href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{l.label}<Arrow /></a>
          ))}
        </span>
      </div>
      <style>{`
        ${WORK_CSS}
        .wt-else { display: flex; align-items: baseline; gap: 16px; padding-top: 16px; border-top: 1px solid var(--rule); }
        .wt-root { width: 100%; max-width: 576px; display: flex; flex-direction: column; }
        .wt-role { padding: 20px 0 22px; border-top: 1px solid var(--rule); }
        .wt-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; color: var(--ink); text-decoration: none; }
        .wt-co { display: inline-flex; align-items: center; gap: 6px; font-size: 18px; line-height: 26px; font-weight: 400; letter-spacing: -0.015em; }
        .wt-co svg { color: var(--half); transition: transform 0.2s; }
        a.wt-head:hover .wt-co svg { transform: translate(1.5px, -1.5px); color: var(--ink); }
        .wt-when { font-size: 13px; line-height: 20px; color: var(--half); white-space: nowrap; }
        .wt-title { margin-top: 2px; font-size: 14px; line-height: 20px; color: var(--text); }
        .wt-stats { display: flex; flex-wrap: wrap; gap: 4px 18px; margin-top: 12px; font-size: 12px; line-height: 18px; color: var(--half); }
        .wt-stats b { font-size: 15px; font-weight: 400; color: var(--ink); letter-spacing: -0.01em; }
        .wt-list { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
        .wt-list li { position: relative; padding-left: 16px; font-size: 14px; line-height: 22px; color: var(--text); }
        .wt-list li::before { content: ''; position: absolute; left: 0; top: 11px; width: 8px; height: 1px; background: var(--faint); }
      `}</style>
    </div>
  );
}
