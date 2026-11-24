import PageShell from '../PageShell';
import { STORIES } from '../StoryPage';
import { BLUEJAY_MONTHS } from './data';
import { WORK_CSS } from './ui';

const story = STORIES.bluejay;
const peak = Math.max(...BLUEJAY_MONTHS.map((m) => m.prs));

export default function BluejayStory() {
  return (
    <PageShell activePage="writing" crumb="my time at bluejay" back={{ href: '/writing', label: 'writing' }}>
      <div className="wk bs">
        <div className="wk-kicker">writing</div>
        <h1 className="wk-title">my time at bluejay</h1>
        <p className="wk-lede">the long version, month by month. the short one is <a className="site-link" href="/bluejay">on the work page</a>.</p>

        {story.intro?.map((p, i) => <p key={i} className="site-p bs-intro">{p}</p>)}

        <ol className="bs-months">
          {(story.timeline ?? []).map((t, i) => {
            const [month, count = ''] = t.when.split(' · ');
            const prs = BLUEJAY_MONTHS[i]?.prs ?? 0;
            return (
              <li key={t.when} className="bs-month wk-rise" style={{ ['--i' as string]: i }}>
                <div className="bs-head">
                  <span className="bs-m">{month}</span>
                  <span className="bs-track"><span className="bs-bar" style={{ width: `${(prs / peak) * 100}%`, ['--i' as string]: i }} /></span>
                  <span className="bs-n">{count}</span>
                </div>
                <p className="site-p">{t.text}</p>
              </li>
            );
          })}
        </ol>

        <a className="bs-back" href="/bluejay">
          <span className="wk-label">the short version</span>
          <span className="bs-back-title">what i worked on at bluejay</span>
        </a>
      </div>

      <style>{`
        ${WORK_CSS}
        .bs-intro { margin-top: 32px; }
        .bs-months { list-style: none; margin: 48px 0 0; padding: 0; display: flex; flex-direction: column; gap: 40px; }
        .bs-head { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--rule); }
        .bs-m { font-size: 20px; line-height: 28px; font-weight: 400; letter-spacing: -0.015em; color: var(--ink); }
        .bs-track { position: relative; height: 3px; }
        .bs-bar { position: absolute; left: 0; top: 0; height: 3px; background: var(--ink); opacity: 0.85; transform-origin: left; animation: wkDraw 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both; animation-delay: calc(var(--i) * 60ms + 200ms); }
        .bs-n { font-size: 13px; line-height: 20px; color: var(--half); white-space: nowrap; }
        .bs-back { display: flex; flex-direction: column; gap: 4px; margin-top: 56px; padding: 20px 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); color: var(--ink); text-decoration: none; }
        .bs-back-title { font-size: 18px; line-height: 26px; font-weight: 300; letter-spacing: -0.015em; }
        .bs-back:hover .bs-back-title { opacity: 0.7; }
        @media (prefers-reduced-motion: reduce) { .bs-bar { animation: none; } }
      `}</style>
    </PageShell>
  );
}
