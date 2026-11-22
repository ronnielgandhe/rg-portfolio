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
    stats: [
      { value: 9, suffix: 'M', label: 'production calls on the platform' },
      { value: 13, label: 'voice platforms benchmarked' },
      { value: 600, label: 'benchmark tasks through my pipeline' },
      { value: 27, label: 'repos and services shipped to' },
    ],
    longVersion: { href: '/writing/my-time-at-bluejay', label: 'my time at bluejay' },
    positions: [
      {
        title: 'software engineer',
        when: 'may 2026 to now',
        where: 'san francisco',
        summary: 'full stack across the frontend, backend, voice runtime and evals. i take things from a blank page to production, and run a set of ai coding agents in parallel to build them, with checks that make each one prove its work before it can push.',
        areas: [
          {
            label: 'benchmarks + evals',
            items: [
              { top: true, text: 'mivas: ran the task pipeline behind 600 tasks for the company’s open multi-industry voice agent benchmark. each industry is a graph of specialist agents with real tool servers and seeded databases, called by digital-human customers. every task passes an oracle at 1.0, is deduped twice and runs 10 times live, and each failure is pinned on the task, the caller, the harness or the model.', links: [{ href: `${MIVAS}/leaderboard`, label: 'leaderboard' }, { href: `${MIVAS}/methodology`, label: 'methodology' }] },
              { top: true, text: 'mivas task factory: a pipeline runtime that writes, checks and certifies benchmark tasks with no human in the loop. a stage graph with durable state, sandboxed cloud compute, a hard spend ceiling and a receipt for every stage. its second run certified 3 of 3 tasks in 27 minutes with zero interventions. i also designed its fairness gate: 10 code checks plus a run where a strong model gets the answer key, so any miss is the task’s fault, not the model’s.' },
              { top: true, text: 'voice platform benchmark: mivas tasks run against 13 voice agent platforms over direct internet audio, so the score isolates the platform, not the model. nine fairness rules (same tasks, callers, tool server, prompt, settings and region, fixed thresholds, our own faults re-run) and a seeded audit of graded calls before anything goes out.' },
            ],
          },
          {
            label: 'simulation',
            items: [
              { top: true, text: 'bluejay twins: a voice twin of you that phones a business on your behalf. clone consent, a pre-dial safety screen and bot checks, plus an mcp server so any ai agent can run your twin. scaffolded by overnight agent runs, live two days later on its own site.', links: [{ href: 'https://twins.getbluejay.ai', label: 'twins.getbluejay.ai' }] },
              { text: 'multi-modal customer journeys: one simulated customer who calls, texts, then calls back, keeping context across every step and channel. the chaining core was already channel-agnostic, so it shipped as routing changes with zero changes to the voice runtime.', links: [{ href: 'https://docs.getbluejay.ai/test/simulation-types/customer-journeys', label: 'docs' }] },
              { top: true, text: 'load testing at scale: describe a test in plain language or by chat, get a credit estimate, and an orchestrator fans out hundreds of concurrent calls. the hard part was the database: every call worker pooled its own connections, so load machines moved to a transaction pooler with no per-worker pool.' },
            ],
          },
          {
            label: 'platform + infra',
            items: [
              { top: true, text: 'workspaces: multi-tenant isolation where every resource lives in exactly one workspace with its own budget. 8 services, a 34-table migration, and a harness that hit 271 write endpoints before it reached production. later an org owner role and scoped org-wide api keys.' },
              { text: 'observability pipeline: dashboards on a change-data-capture stream into an analytics store, taking p95 loads from timing out to sub-second, and real-time failure alerts that run from the eval workers through a threshold service to slack and email.' },
              { top: true, text: 'ai incident teammate in slack: watches channels, opens an incident room, counts calls by hour and version, diffs prompt versions to find the one that broke, proposes a fix and proves it with a rerun. built in 3 days, with guards against link spoofing and bot-to-bot loops.' },
              { text: 'mcp + oauth for claude: claude can drive the whole product. an oauth consent flow that picks org, then workspace, and read-only or destructive hints on all 155 tools so it qualifies for the connector directory.', links: [{ href: 'https://docs.getbluejay.ai/mcp/overview', label: 'docs' }] },
            ],
          },
          {
            label: 'product + design',
            items: [
              { text: 'website redesign: working on the redesign of the company’s new website.', links: [{ href: 'https://getbluejay.ai', label: 'getbluejay.ai' }] },
              { text: 'run page + dashboard redesigns: simulation runs rebuilt around a success-rate trend, a latency histogram with p50 to p99, and an outcome donut. rebuilt the internal observability dashboard on a goal-aware judge that reads real tool input and output, because the old one scored confident wrong answers 5 out of 5.' },
            ],
          },
          {
            label: 'also shipped',
            items: [
              { text: 'voice agent audit: a free public audit where about 20 simulated customers call your agent and a pdf report lands in your inbox. report v1 to v5 in 3 days.', links: [{ href: 'https://app.getbluejay.ai/audit', label: 'voice agent audit' }] },
              { text: 'provider sync: paste a key and your agents import. keys are probed before they are accepted, empty results explain themselves, and platforms with no agent list are discovered from live rooms.' },
              { text: 'digital-human callers: voice clones, background noise, phonetic-alphabet spelling, per-language speech model routing, and text-to-speech fixes so digits and zip codes come out right.' },
              { text: 'eval metrics: an llm-as-judge word error rate, deterministic checks (right tool called, transfer landed, trace spans) and an audio clarity score recalibrated against a gold set.' },
              { text: 'onboarding + ai assistant: sign-up drops you into the in-app assistant (22 runnable skills, artifacts, deep research), with your credit balance and a pay prompt in chat when credits run out.' },
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
    page: false,
    line: 'a major canadian bank.',
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
