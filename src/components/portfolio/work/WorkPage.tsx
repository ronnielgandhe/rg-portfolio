import PageShell from '../PageShell';
import { roleBySlug } from './data';
import { CountUp, HighlightRow, useDraft, WORK_CSS } from './ui';

export default function WorkPage({ slug }: { slug: string }) {
  const role = roleBySlug(slug);
  const draft = useDraft();
  if (!role) return null;
  let n = 0;

  return (
    <PageShell activePage={slug} crumb={role.company.replace(/ \(.*\)$/, '')} back={{ href: '/', label: 'home' }}>
      <div className="wk wp">
        <div className="wk-kicker">work</div>
        <h1 className="wk-title">{role.company}</h1>
        <p className="wk-lede">{role.line}</p>

        {role.stats && (
          <div className="wp-stats">
            {role.stats.map((s, i) => (
              <div key={s.label} className="wp-stat wk-rise" style={{ ['--i' as string]: i }}>
                <div className="wp-num"><CountUp stat={s} /></div>
                <div className="wp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {role.positions.map((p) => (
          <section key={p.title} className="wp-pos">
            <div className="wk-rule" />
            <div className="wp-pos-head">
              <h2 className="wp-pos-title">{p.title}</h2>
              <div className="wp-pos-when">{p.when}</div>
            </div>
            <div className="wp-pos-where">{p.where}</div>
            {p.summary && <p className="wp-summary">{p.summary}</p>}

            {p.areas.map((a) => {
              const items = a.items.filter((h) => draft || !h.draft);
              if (!items.length) return null;
              return (
                <div key={a.label} className="wp-area">
                  <div className="wk-label wp-area-label">{a.label}<span className="wp-area-n">{items.filter((h) => !h.draft).length}</span></div>
                  <ul className="wk-rows">
                    {items.map((h) => <HighlightRow key={h.text} h={h} i={n++} />)}
                  </ul>
                </div>
              );
            })}
          </section>
        ))}

        {role.longVersion && (
          <a className="wp-long" href={role.longVersion.href}>
            <span className="wk-label">the long version</span>
            <span className="wp-long-title">{role.longVersion.label}, month by month</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.1" /></svg>
          </a>
        )}
      </div>

      <style>{`
        ${WORK_CSS}
        .wp-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-top: 40px; padding: 24px 0 0; border-top: 1px solid var(--rule); }
        .wp-num { font-size: 34px; line-height: 40px; font-weight: 300; letter-spacing: -0.04em; color: var(--ink); }
        .wp-stat-label { margin-top: 6px; font-size: 12px; line-height: 16px; color: var(--half); }
        .wp-pos { margin-top: 48px; }
        .wp-pos-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; margin-top: 20px; }
        .wp-pos-title { margin: 0; font-size: 20px; line-height: 28px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }
        .wp-pos-when { font-size: 13px; line-height: 20px; color: var(--half); white-space: nowrap; }
        .wp-pos-where { font-size: 13px; line-height: 20px; color: var(--faint); }
        .wp-summary { margin: 16px 0 0; font-size: 15px; line-height: 25px; color: var(--text); }
        .wp-area { margin-top: 36px; }
        .wp-area-label { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .wp-area-n { color: var(--faint); letter-spacing: 0.04em; }
        .wp-long { display: grid; grid-template-columns: 1fr auto; align-items: center; row-gap: 4px; margin-top: 56px; padding: 20px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); color: var(--ink); text-decoration: none; }
        .wp-long .wk-label { grid-column: 1; }
        .wp-long-title { grid-column: 1; font-size: 18px; line-height: 26px; font-weight: 300; letter-spacing: -0.015em; }
        .wp-long svg { grid-column: 2; grid-row: 1 / span 2; color: var(--half); transition: transform 0.2s, color 0.2s; }
        .wp-long:hover svg { transform: translateX(3px); color: var(--ink); }
        @media (max-width: 520px) {
            .wp-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 20px; }
          .wp-pos-head { flex-direction: column; gap: 0; }
        }
      `}</style>
    </PageShell>
  );
}
