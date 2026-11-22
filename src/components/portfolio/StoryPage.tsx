import PageShell from './PageShell';

interface Story {
  crumb: string;
  kicker: string;
  title: string;
  meta: { label: string; value: string }[];
  intro?: string[];
  timeline?: { when: string; text: string }[];
  outro?: { text: string; href: string; label: string };
}

const STORIES: Record<string, Story> = {
  bluejay: {
    crumb: 'bluejay',
    kicker: 'work',
    title: 'my time at bluejay',
    meta: [
      { label: 'role', value: 'software engineer' },
      { label: 'when', value: 'may 2026 to now' },
      { label: 'where', value: 'san francisco' },
    ],
    intro: [
      'bluejay (yc x25) is a platform for testing and monitoring voice agents: simulation, evals and observability. this is roughly what each month looked like.',
    ],
    timeline: [
      { when: 'may 2026', text: 'joined and ramped across the whole stack: the typescript and next.js frontend, the python middleware, the real-time voice infrastructure on livekit, and the llm evaluation pipelines.' },
      { when: 'june 2026', text: 'built an ai-agent development system (supervised agent fleets with automated review and ship reports) that kept me at about 3 merged prs a day. owned production incidents end to end and shipped multi-repo features like multilingual voice agent support and cross-agent analytics.' },
      { when: 'july 2026', text: 'crossed 180+ merged prs across 11 production repos in the first 10 weeks. shipped clickhouse and cdc backed dashboards, real-time failure alerting, and customer-facing platform surfaces.' },
    ],
  },
  'augmentor-labs': {
    crumb: 'augmentor labs',
    kicker: 'work',
    title: 'my time at augmentor labs',
    meta: [
      { label: 'role', value: 'growth + software engineering' },
      { label: 'when', value: 'jan to apr 2026' },
      { label: 'where', value: 'new york / remote' },
    ],
    timeline: [
      { when: 'january 2026', text: 'joined the growth team. ramped up on the product, the growth metrics and the experimentation framework, and started shipping user acquisition features.' },
      { when: 'february 2026', text: 'built engagement features and ran experiments to drive platform adoption and retention.' },
    ],
  },
  school: {
    crumb: 'school',
    kicker: 'school',
    title: 'waterloo and laurier',
    meta: [
      { label: 'what', value: 'cs + business double degree' },
      { label: 'when', value: 'sept 2023 to 2025' },
      { label: 'where', value: 'waterloo, ontario' },
    ],
    intro: [
      'i started the double degree in 2023: computer science at waterloo, business at laurier. two campuses, two student cards.',
      'the honest version is i mainly just had fun. i built a lot of side projects, did co-ops, and figured out i learn fastest when i am shipping something.',
    ],
    outro: { text: 'i wrote about leaving the program in', href: '/writing/prestige-is-a-strong-drug', label: 'prestige is a strong drug' },
  },
};

export default function StoryPage({ slug }: { slug: string }) {
  const story = STORIES[slug];
  if (!story) return null;
  return (
    <PageShell activePage={slug} crumb={story.crumb}>
      <div className="st-kicker">{story.kicker}</div>
      <h1 className="st-title">{story.title}</h1>
      <div className="st-meta">
        {story.meta.map((m) => (
          <div key={m.label}>
            <div className="st-meta-label">{m.label}</div>
            <div className="st-meta-value">{m.value}</div>
          </div>
        ))}
      </div>

      {story.intro && (
        <div className="site-body" style={{ marginTop: 40 }}>
          {story.intro.map((p, i) => <p key={i} className="site-p">{p}</p>)}
        </div>
      )}

      {story.timeline && (
        <ol className="st-timeline">
          {story.timeline.map((t) => (
            <li key={t.when}>
              <div className="st-when">{t.when}</div>
              <p className="site-p">{t.text}</p>
            </li>
          ))}
        </ol>
      )}

      {story.outro && (
        <p className="site-p" style={{ marginTop: 24 }}>
          {story.outro.text}{' '}
          <a className="site-link" href={story.outro.href}>{story.outro.label}</a>.
        </p>
      )}

      <style>{`
        .st-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
        .st-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 400; letter-spacing: -0.025em; color: var(--ink); }
        .st-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px dashed var(--rule); }
        .st-meta-label { font-size: 12px; line-height: 16px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--half); }
        .st-meta-value { margin-top: 6px; font-size: 14px; line-height: 20px; color: var(--ink); }
        .st-timeline { list-style: none; margin: 40px 0 0; padding: 0; display: flex; flex-direction: column; gap: 28px; border-left: 1px solid var(--rule); }
        .st-timeline li { position: relative; padding-left: 20px; }
        .st-timeline li::before { content: ''; position: absolute; left: -1px; top: 5px; width: 1px; height: 14px; background: var(--ink); }
        .st-when { font-size: 13px; line-height: 24px; color: var(--ink); margin-bottom: 4px; }
        @media (max-width: 520px) { .st-meta { grid-template-columns: 1fr; } .st-title { font-size: 30px; } }
      `}</style>
    </PageShell>
  );
}
