import { ELSEWHERE, ROLES, type Role } from './data';
import { Arrow, splitHead, WORK_CSS } from './ui';

const yearsOf = (r: Role) => {
  const ys = r.positions.flatMap((p) => p.when.match(/\d{4}/g) ?? []).sort();
  return r.positions.length > 1 ? `${ys[0]} to ${ys[ys.length - 1]}` : r.positions[0].when;
};

const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {});

export default function WorkTeaser() {
  const [current, ...earlier] = ROLES;
  const top = current.positions.flatMap((p) => p.areas.flatMap((a) => a.items)).filter((h) => h.top && !h.draft).slice(0, 4);
  return (
    <div className="wk wt-root">
      <section className="wt-current">
        <a className="wt-head" href={`/${current.slug}`}>
          <span className="wt-co">{current.company}<Arrow /></span>
          <span className="wt-when">{current.positions[0].when}</span>
        </a>
        <div className="wt-title">{current.positions[0].title}</div>
        <ul className="wt-list">
          {top.map((h) => {
            const [head, rest] = splitHead(h.text);
            const first = rest.split('. ')[0].replace(/\.$/, '') + '.';
            return (
              <li key={h.text}>
                <span><span className="wk-head">{head}</span> {first}</span>
                {h.links?.[0] && <a className="wk-out wt-link" href={h.links[0].href} {...ext(h.links[0].href)}>{h.links[0].label}<Arrow /></a>}
              </li>
            );
          })}
        </ul>
      </section>

      {earlier.map((r) => (
        <a key={r.slug} className="wt-earlier" href={`/${r.slug}`}>
          <span className="wt-head">
            <span className="wt-co wt-co-sm">{r.company}<Arrow /></span>
            <span className="wt-when">{yearsOf(r)}</span>
          </span>
          {r.brief && <span className="wt-brief">{r.brief}</span>}
        </a>
      ))}

      <div className="wt-else">
        <span className="wk-label">elsewhere</span>
        <span className="wk-links">
          {ELSEWHERE.map((l) => (
            <a key={l.href} className="wk-out" href={l.href} {...ext(l.href)}>{l.label}<Arrow /></a>
          ))}
        </span>
      </div>
      <style>{`
        ${WORK_CSS}
        .wt-root { width: 100%; max-width: 576px; display: flex; flex-direction: column; }
        .wt-current { padding: 20px 0 24px; border-top: 1px solid var(--rule); }
        .wt-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; color: var(--ink); text-decoration: none; }
        .wt-co { display: inline-flex; align-items: center; gap: 6px; font-size: 20px; line-height: 28px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }
        .wt-co-sm { font-size: 16px; line-height: 24px; }
        .wt-co svg { color: var(--half); transition: transform 0.2s, color 0.2s; }
        a.wt-head:hover .wt-co svg, .wt-earlier:hover .wt-co svg { transform: translate(1.5px, -1.5px); color: var(--ink); }
        .wt-when { font-size: 13px; line-height: 20px; color: var(--half); white-space: nowrap; }
        .wt-title { margin-top: 2px; font-size: 14px; line-height: 20px; color: var(--text); }
        .wt-list { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .wt-list li { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 3px; padding-left: 16px; font-size: 14px; line-height: 22px; color: var(--text); }
        .wt-list li::before { content: ''; position: absolute; left: 0; top: 11px; width: 8px; height: 1px; background: var(--faint); }
        .wt-link { font-size: 12px; }
        .wt-earlier { display: flex; flex-direction: column; gap: 4px; padding: 16px 0; border-top: 1px solid var(--rule); color: inherit; text-decoration: none; }
        .wt-earlier:hover .wt-brief { color: var(--ink); }
        .wt-brief { transition: color 0.2s; }
        .wt-brief { font-size: 14px; line-height: 22px; color: var(--text); }
        .wt-else { display: flex; align-items: baseline; gap: 16px; padding-top: 16px; border-top: 1px solid var(--rule); }
      `}</style>
    </div>
  );
}
