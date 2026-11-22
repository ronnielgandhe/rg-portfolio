import PageShell from './PageShell';

interface Story {
  crumb: string;
  kicker: string;
  title: string;
  lede?: string;
  image?: string;
  actions?: { label: string; href: string; primary?: boolean }[];
  meta: { label: string; value: string }[];
  intro?: string[];
  timeline?: { when: string; text: string }[];
  sections?: { heading: string; body?: string[]; list?: string[] }[];
  outro?: { text: string; href: string; label: string };
}

export const STORIES: Record<string, Story> = {
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
      'bluejay (yc x25) tests and monitors voice agents: simulated customers call your ai, and we tell you what broke. i joined in may 2026. 657 merged prs later, this is roughly how each month went.',
    ],
    timeline: [
      { when: 'may · 73 prs', text: 'month one. my first project was a command palette, because the fastest way to learn a codebase is to build the thing that searches all of it. then background noise for simulated callers (so the fake customer can call from a fake coffee shop), a word error rate metric judged by an llm, and customer journeys: simulated customers who call back across several calls, built end to end in about four days. i also shipped a feature, rolled it back the same day, and shipped it again the next morning as v2. this would become a theme.' },
      { when: 'june · 96 prs', text: 'went full stack. a red teaming tab, voice clones for simulated callers, sms simulations, live call listen-in, real-time failure alerts, cross-agent run comparison. fixed a bug where simulated callers read zip codes as gibberish. fixed pie charts five times in two days. built a bot that posts what everyone shipped every friday, mostly so i could see my own name in it. side quest: a multiplayer 3d game in three.js, in two days, that nobody asked for.' },
      { when: 'july · 146 prs', text: 'launch month. shipped the voice agent audit: you type in your business phone number, about 20 simulated customers call it, and you get a pdf of how it went. the report went from v1 to v5 in three days. rebuilt onboarding so signing up drops you straight into the ai assistant. shipped deep reports, reverted it the same day, shipped it again. my most typed sentence this month was "i keep making changes to the pricing page and they get lost in the sauce." also designed a petition to give myself production access. i made it cute.' },
      { when: 'august · 157 prs', text: 'the big one. i got handed workspaces mid-flight with the words "i have no context on this, but this has been handed off to me." the job: make every resource in the product live in exactly one workspace, across 8 services and a 34 table migration. it landed on dev three times and got reverted twice. i wrote a test harness that hit 271 write endpoints before it was allowed anywhere near production. the final pr list went out at 5:54 am with the message "may god be with us." it shipped. i also asked who shipped the most code that month, fully expecting it to be me. i came third.' },
      { when: 'september · 60 prs', text: 'fewer prs, more real customers. load tests with thousands of simulated calls, on-call, and the things people actually asked for: a 30 day recently deleted, shareable run pages, cost per user. rebuilt my own command palette from may, because may me was not that good. my ai read a month of my own sessions and wrote a blunt report on how i work, so i wrote hooks that stop my own agents from pushing to main. i also tried to have an ai cover my overnight pages so i could sleep. it handled 0 of 4.' },
      { when: 'october · 55 prs', text: 'new products. bluejay twins: a voice twin that phones a business for you, scaffolded by agents overnight and live two days later. an oauth flow so the product plugs into claude as an mcp server. ci integrations that run simulations from a pull request. a founder read one of my design docs and called it ai slop. he was right. new rule: nothing goes to a founder until i can defend every line of it myself.' },
      { when: 'november · 70 prs so far', text: 'mostly agents that do the boring part of an incident for you, and making load testing something you can set up by chatting. also added a hook so production writes are off unless i personally type the magic words. character development.' },
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
  harvey: {
    crumb: 'harvey',
    kicker: 'project',
    title: 'harvey',
    lede: 'a lawyer that picks up. no, not that harvey.',
    image: '/harvey-live.png',
    actions: [
      { label: 'call him', href: 'https://harvey-two.vercel.app/', primary: true },
      { label: 'watch the demo', href: 'https://www.loom.com/share/2f671a72a279425d84bf5baa298d1efd' },
      { label: 'read the code', href: 'https://github.com/ronnielgandhe/harvey' },
    ],
    meta: [
      { label: 'built in', value: '3 days, april 2026' },
      { label: 'team', value: 'just me' },
      { label: 'status', value: 'live, go call him' },
    ],
    intro: [
      'there is a legal ai company called harvey. they raised a lot of money to sell software to law firms.',
      'mine does the part i actually wanted: you hit call, ask your question out loud like you are talking to a guy, and he answers by voice while the real statute lands on screen. no login, no form, no chat box.',
      'i built the whole thing by myself in three days. voice, retrieval, tools, the ui, the deploy. it is still up.',
    ],
    sections: [
      {
        heading: 'the receipts',
        list: [
          'first commit april 16, 2026. shipped april 19.',
          'six tools that each draw their own pane on screen while he talks.',
          '2,806 chunks of ontario and federal law, and he cites the actual section.',
          'first audio lands before the llm is even warm, because the greeting fires the moment you connect.',
        ],
      },
      {
        heading: 'how it works',
        body: [
          'the browser joins a livekit room. a python agent picks up: deepgram hears you, gpt-4o-mini decides whether to answer or call a tool, elevenlabs talks back.',
          'legal questions go through two stage retrieval. a small model call figures out which statute you mean and rewrites the question, then chroma searches inside that source. plain similarity search kept failing on things like "n12", which means nothing to an embedding and everything to a tenant.',
        ],
      },
      {
        heading: 'what i took from it',
        body: [
          'in voice, latency is the product. people forgive a wrong answer faster than a slow one.',
          'and a voice agent that shows its work on screen feels about ten times smarter than one that just talks.',
        ],
      },
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
    <PageShell activePage={slug} crumb={story.crumb} back={story.kicker === 'project' ? { href: '/projects', label: 'projects' } : { href: '/', label: 'home' }}>
      <div className="st-kicker">{story.kicker}</div>
      <h1 className="st-title">{story.title}</h1>
      {story.lede && <p className="st-lede">{story.lede}</p>}
      {story.actions && (
        <div className="st-actions">
          {story.actions.map((a) => (
            <a key={a.href} href={a.href} target="_blank" rel="noopener noreferrer" className={a.primary ? 'st-btn st-btn-primary' : 'st-btn'}>{a.label}</a>
          ))}
        </div>
      )}
      <div className="st-meta">
        {story.meta.map((m) => (
          <div key={m.label}>
            <div className="st-meta-label">{m.label}</div>
            <div className="st-meta-value">{m.value}</div>
          </div>
        ))}
      </div>

      {story.image && (
        <div className="st-image"><img src={story.image} alt={story.title} /></div>
      )}

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

      {story.sections?.map((sec) => (
        <section key={sec.heading} className="st-section">
          <h2>{sec.heading}</h2>
          {sec.body?.map((p, i) => <p key={i} className="site-p">{p}</p>)}
          {sec.list && (
            <ul>
              {sec.list.map((item, i) => <li key={i} className="site-p">{item}</li>)}
            </ul>
          )}
        </section>
      ))}

      {story.outro && (
        <p className="site-p" style={{ marginTop: 24 }}>
          {story.outro.text}{' '}
          <a className="site-link" href={story.outro.href}>{story.outro.label}</a>.
        </p>
      )}

      <style>{`
        .st-kicker { font-size: 14px; line-height: 20px; color: var(--half); margin-bottom: 12px; }
        .st-title { margin: 0; font-size: 36px; line-height: 1.15; font-weight: 300; letter-spacing: -0.03em; color: var(--ink); }
        .st-lede { margin: 12px 0 0; font-size: 18px; line-height: 28px; color: var(--text); }
        .st-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .st-btn { display: inline-flex; align-items: center; height: 38px; padding: 0 20px; border-radius: 0; border: 1px solid rgba(0, 0, 0, 0.1); font-size: 13px; font-weight: 500; color: var(--ink); text-decoration: none; transition: background 0.2s, border-color 0.2s, color 0.2s; }
        .st-btn:hover { background: var(--hover); }
        .st-btn-primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
        .st-btn-primary:hover { background: #333333; border-color: #333333; }
        .st-image { margin-top: 40px; border-radius: 0; overflow: hidden; border: 1px solid var(--rule); aspect-ratio: 16 / 10; background: var(--hover); }
        .st-image img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .st-section { margin-top: 48px; display: flex; flex-direction: column; gap: 16px; }
        .st-section h2 { margin: 0; font-size: 16px; line-height: 24px; font-weight: 500; color: var(--ink); }
        .st-section ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; border-left: 1px solid var(--rule); }
        .st-section li { padding-left: 20px; }
        .st-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--rule); }
        .st-meta-label { font-size: 12px; line-height: 16px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: var(--half); }
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
