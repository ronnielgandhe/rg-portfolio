export interface Link {
  href: string;
  label: string;
}

export interface Highlight {
  text: string;
  links?: Link[];
  top?: boolean;
  draft?: boolean;
}

export interface Area {
  label: string;
  items: Highlight[];
}

export interface Position {
  title: string;
  when: string;
  where: string;
  summary?: string;
  areas: Area[];
}

export interface Stat {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
}

export interface Role {
  slug: string;
  company: string;
  page: boolean;
  line: string;
  brief?: string;
  stats?: Stat[];
  positions: Position[];
  longVersion?: { href: string; label: string };
}

export const BLUEJAY_MONTHS = [
  { month: 'may', prs: 73 },
  { month: 'jun', prs: 96 },
  { month: 'jul', prs: 146 },
  { month: 'aug', prs: 157 },
  { month: 'sep', prs: 60 },
  { month: 'oct', prs: 55 },
  { month: 'nov', prs: 70, soFar: true },
];

export const ELSEWHERE: Link[] = [
  { href: 'https://github.com/ronnielgandhe', label: 'github' },
  { href: '/leanfetch', label: 'leanfetch' },
  { href: '/harvey', label: 'harvey' },
];

const MIVAS = 'https://research.getbluejay.ai/benchmarks/mivas';

export const ROLES: Role[] = [
  {
    slug: 'bluejay',
    company: 'bluejay (yc x25)',
    page: true,
    line: 'bluejay tests and monitors voice and chat ai agents. simulated customers call your agent, and the platform grades what happened.',
    longVersion: { href: '/writing/my-time-at-bluejay', label: 'my time at bluejay' },
    positions: [
      {
        title: 'software engineer',
        when: 'may 2026 to now',
        where: 'san francisco',
        summary: 'full stack across the frontend, backend, voice runtime and evals. i take things from a blank page to a public launch, and run a set of ai coding agents in parallel to build them, with checks that make each one prove its work before it can push.',
        areas: [
          {
            label: 'public benchmarks',
            items: [
              { top: true, text: 'mivas: the company’s open multi-industry voice agent benchmark. each industry is a graph of specialist agents with real tool servers and seeded databases, called by simulated customers. i built and certified tasks for it: every task passes an oracle, is checked for duplicates and runs 10 times live, and each failure is pinned on the task, the caller, the harness or the model.', links: [{ href: `${MIVAS}/leaderboard`, label: 'leaderboard' }, { href: `${MIVAS}/methodology`, label: 'methodology' }] },
              { top: true, text: 'g2 voice agent leaderboard: built and ran the benchmark behind g2’s public evaluation of voice ai agent platforms. the same agent is deployed on every platform and gets the same 90 simulated calls, five times each, across healthcare, legal and customer support. every call is graded on the tool calls it made and the database state it left behind, then scored on task success, word error rate on clean and degraded audio, and latency. fairness rules and seeded audits of graded calls come before anything is published.', links: [{ href: 'https://ai.g2.com/evaluations/categories/voice', label: 'ai.g2.com' }] },
            ],
          },
          {
            label: 'launches',
            items: [
              { top: true, text: 'bluejay twins: a voice twin of you that phones a business on your behalf. clone consent, a pre-dial safety screen and bot checks, plus an mcp server so any ai agent can run your twin. scaffolded by overnight agent runs, live two days later on its own site.', links: [{ href: 'https://twins.getbluejay.ai', label: 'twins.getbluejay.ai' }] },
              { top: true, text: 'free voice agent audit: enter your agent’s phone number, about 20 simulated customers call it, and a pdf report lands in your inbox. the report went from v1 to v5 in 3 days.', links: [{ href: 'https://app.getbluejay.ai/audit', label: 'try the audit' }] },
              { text: 'load testing: describe a test in plain language or by chat, get a credit estimate, and an orchestrator fans out hundreds of concurrent calls at your agent.', links: [{ href: 'https://docs.getbluejay.ai/test/load-testing/overview', label: 'docs' }] },
              { text: 'mcp for claude: claude can drive the whole product. an oauth consent flow that picks org, then workspace, and read-only or destructive hints on all 155 tools.', links: [{ href: 'https://docs.getbluejay.ai/mcp/overview', label: 'docs' }] },
              { text: 'bluejay ai in slack: the launch film, made with my own scripted and animated video pipeline.', links: [{ href: 'https://www.linkedin.com/feed/update/urn:li:activity:7494099807834345472/', label: 'launch post' }] },
              { text: 'website redesign: working on the redesign of the company’s new website.', links: [{ href: 'https://getbluejay.ai', label: 'getbluejay.ai' }] },
            ],
          },
          {
            label: 'on linkedin',
            items: [
              { text: 'the audit launch: \u201ci recently built out a free voice agent audit for everyone who wants to find out where their agents are breaking in production.\u201d', links: [{ href: 'https://www.linkedin.com/posts/ronniel-gandhe_i-recently-built-out-a-free-voice-agent-audit-ugcPost-7481447814237999104-vmBk/', label: 'read the post' }] },
              { draft: true, text: 'draft, june post: \u201cthe most recent thing i built at bluejay\u201d (2026-06-11). confirm it is public and add a one-line summary.', links: [{ href: 'https://www.linkedin.com/posts/ronniel-gandhe_the-most-recent-thing-i-built-at-bluejay-ugcPost-7470908585766494208-7Cdo/', label: 'post' }] },
              { draft: true, text: 'draft, august post: \u201cfor when you get the 3:00 am why is this\u2026\u201d (2026-08-11). confirm it is public and add a one-line summary.', links: [{ href: 'https://www.linkedin.com/posts/ronniel-gandhe_for-when-you-get-the-300-am-why-is-this-ugcPost-7493018171960958977-PUKr/', label: 'post' }] },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'augmentor-labs',
    company: 'augmentor labs',
    page: true,
    line: 'augmentor labs brings professional tools that usually live in separate platforms into one application.',
    brief: 'growth engineering in 2026, shipping acquisition and engagement features and running experiments. before that, a 2025 cloud infrastructure internship where i cut p95 pipeline latency by about 35%.',
    positions: [
      {
        title: 'software engineer, growth',
        when: 'jan to apr 2026',
        where: 'new york / remote',
        areas: [
          {
            label: 'what i worked on',
            items: [
              { top: true, text: 'user acquisition: shipped acquisition features on the growth team.' },
              { text: 'engagement: built engagement features and ran experiments to drive platform adoption and retention.' },
              { draft: true, text: 'draft, experiment: name one experiment, what changed, and the result (for example, +n% activation).' },
              { draft: true, text: 'draft, feature: name one acquisition feature you shipped and the metric it moved.' },
              { draft: true, text: 'draft, internal tool: an internal tool or lead generation system you built, and who used it.' },
            ],
          },
        ],
      },
      {
        title: 'software engineering intern, cloud infrastructure',
        when: 'jan to apr 2025',
        where: 'remote',
        areas: [
          {
            label: 'what i worked on',
            items: [
              { top: true, text: 'pipeline latency: cut p95 latency by about 35% by finding the bottlenecks in serialization and batch processing.' },
              { top: true, text: 'webhook ingestion: built ingestion pipelines and event schemas, with a validation layer.' },
              { draft: true, text: 'draft, observability: dashboards and alert routing (old site copy says mean time to detect fell 42%; confirm before publishing).' },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'cibc',
    company: 'cibc',
    page: true,
    line: 'a major canadian bank.',
    brief: 'data scientist intern in technology operations: ci/cd pipelines, feature flags with blue/green and canary rollouts, and release dashboards.',
    positions: [
      {
        title: 'data scientist intern, technology operations',
        when: 'jan to apr 2024',
        where: 'toronto',
        areas: [
          {
            label: 'what i worked on',
            items: [
              { top: true, text: 'ci/cd: owned data contracts and ci/cd pipelines on github actions.' },
              { top: true, text: 'safe releases: feature flags with blue/green and canary rollouts, and automated rollback on error rate.' },
              { text: 'dashboards: release and slo dashboards for latency and error rate.' },
            ],
          },
        ],
      },
    ],
  },
];

export const roleBySlug = (slug: string) => ROLES.find((r) => r.slug === slug);
