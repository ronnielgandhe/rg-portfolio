import { STORIES } from '../portfolio/StoryPage';

export type FinderSection = 'experience' | 'education' | 'certifications';

export interface FinderDoc {
  title: string;
  url: string;
  note?: string;
}

export interface FinderItem {
  id: string;
  section: FinderSection;
  name: string;
  title: string;
  subtitle: string;
  date: string;
  sortKey: string;
  location?: string;
  icon: string;
  iconInvert?: boolean;
  summary?: string;
  highlights?: { label?: string; text: string }[];
  courses?: { code: string; name: string }[];
  activities?: string[];
  achievements?: string[];
  skills?: string[];
  tech?: string[];
  documents?: FinderDoc[];
  credentialId?: string;
  certificateUrl?: string;
  reflection?: string;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const bluejayMonths = (STORIES.bluejay.timeline ?? []).map(t => ({
  label: capitalize(t.when.split(' · ')[0]),
  text: t.text,
}));

export const FINDER_ITEMS: FinderItem[] = [
  {
    id: 'bluejay',
    section: 'experience',
    name: 'Bluejay',
    title: 'Software Engineer',
    subtitle: 'Bluejay (YC X25)',
    date: 'May 2026 – Present',
    sortKey: '2026-05',
    location: 'San Francisco, CA',
    icon: '/bluejay-mark-black.svg',
    summary: "Building AI-agent development systems on Bluejay's voice-AI simulation, evals, and observability platform. 180+ merged PRs across 11 production repos in the first 10 weeks.",
    highlights: bluejayMonths,
    skills: ['Voice-AI Infrastructure', 'LLM Evaluation', 'AI-Agent Orchestration', 'Incident Response'],
    tech: ['TypeScript', 'Next.js', 'Python', 'FastAPI', 'LiveKit', 'Postgres', 'ClickHouse', 'AWS'],
  },
  {
    id: 'augmentor-growth',
    section: 'experience',
    name: 'Augmentor Labs, Growth',
    title: 'Software Engineer, Growth Team',
    subtitle: 'Augmentor Labs',
    date: 'Jan – Apr 2026',
    sortKey: '2026-01',
    location: 'New York / Remote',
    icon: '/augmentor-dark.svg',
    iconInvert: true,
    summary: 'Built user acquisition and engagement features, ran growth experiments, and drove platform adoption and retention metrics.',
    highlights: [
      { text: 'Joined the growth team. Ramping up on the product, growth metrics, and experimentation framework. Contributing to user acquisition features.' },
      { text: 'Building engagement features and running experiments to drive platform adoption and retention.' },
    ],
    skills: ['Growth Engineering', 'Experimentation', 'Product Analytics'],
    tech: ['TypeScript', 'React', 'Python', 'FastAPI'],
    reflection: 'More recently, Augmentor has been exploring investment opportunities and focusing more heavily on growth engineering. That shift has pushed me to spend more time building internal tools, experimenting with lead generation systems, and understanding how startups actually expand in competitive spaces. It has been a good introduction to the operational side of building a company. Instead of just writing code, you start thinking about distribution, product positioning, and what actually moves the needle when you are trying to grow a young technology company.',
  },
  {
    id: 'augmentor-cloud',
    section: 'experience',
    name: 'Augmentor Labs, Cloud',
    title: 'Software Engineering Intern, Cloud Infrastructure',
    subtitle: 'Augmentor Labs',
    date: 'Jan – Apr 2025',
    sortKey: '2025-01',
    location: 'Palo Alto, CA',
    icon: '/augmentor-dark.svg',
    iconInvert: true,
    summary: 'Built webhook integrations, designed event schemas for the ingestion pipeline, and reduced p95 ingestion latency by 35% through observability and optimization work.',
    highlights: [
      { text: 'Onboarded to the cloud infrastructure team. Learned internal tooling, AWS architecture patterns, and the event-driven ingestion pipeline. Set up local development environment and completed first small PRs.' },
      { text: 'Built webhook integrations for GitHub, Jira, and Salesforce. Designed event schema and implemented validation layer. Integrated with the S3/DynamoDB ingestion pipeline.' },
      { text: 'Developed observability dashboards and alerting system. Worked on reducing p95 ingestion latency. Identified bottlenecks in serialization and batch processing. Achieved 35% reduction.' },
      { text: 'Focused on reliability improvements and documentation. Reduced mean-time-to-detect by 42% through better alert routing. Presented final project to engineering leadership.' },
    ],
    skills: ['System Design', 'Observability', 'Event-Driven Architecture', 'Technical Writing', 'On-Call Practices'],
    tech: ['AWS (S3, DynamoDB, Lambda, CloudWatch)', 'Python', 'Terraform', 'GitHub Actions', 'Datadog'],
    reflection: 'Augmentor Labs was my first real exposure to startup culture. The core idea behind the company was trying to bring a set of professional tools that usually live in separate platforms into one unified application. Instead of juggling multiple workflows across different software, the goal was to create a system where teams could manage and operate from a single place. Being part of that environment showed me how messy and iterative early stage products actually are. Features change quickly, priorities shift often, and a lot of the work is figuring out what the product should be before worrying about perfect implementation.',
  },
  {
    id: 'cibc',
    section: 'experience',
    name: 'CIBC',
    title: 'Data Scientist Intern, Technology Operations',
    subtitle: 'CIBC',
    date: 'Jan – Apr 2024',
    sortKey: '2024-01',
    location: 'Toronto, ON',
    icon: '/cibc-dark.svg',
    summary: 'Owned data contracts and CI/CD pipelines with GitHub Actions. Implemented feature flags, blue/green and canary rollouts. Created release/SLO dashboards for latency, error rate, and CTR impact.',
    highlights: [
      { text: 'Onboarded to Technology Operations. Learned internal data platform, CI/CD workflows, and deployment strategies. Began owning data contracts for cross-team pipelines.' },
      { text: 'Implemented feature flags and blue/green deployment patterns. Built automated rollback triggers based on error rate thresholds.' },
      { text: 'Created release and SLO dashboards tracking latency, error rate, and CTR impact. Implemented canary rollout workflows with progressive traffic shifting.' },
      { text: 'Optimized CI/CD pipeline performance. Documented deployment playbooks and trained team members on the new feature flag system.' },
    ],
    skills: ['CI/CD Design', 'Feature Flags', 'Release Engineering', 'Data Contracts', 'Enterprise Workflows'],
    tech: ['GitHub Actions', 'Python', 'SQL', 'Grafana', 'Docker', 'LaunchDarkly'],
    reflection: 'CIBC was my first experience working inside a massive corporate environment, and it gave me a clear look at how large institutions actually operate. Banks move very differently from startups or smaller tech companies. Every change touches multiple teams, every system has layers of oversight, and decisions pass through a lot of structure before anything moves forward. It was the first time I really saw how scale, risk management, and bureaucracy shape the way technology gets built inside major organizations.\n\nIt was also where I started to understand the intersection between technology and compliance. In banking, reliability, auditability, and regulatory requirements are just as important as the technical solution itself. That environment showed me why banks rarely jump quickly onto new technology trends. There are too many systems, too many rules, and too much risk involved. Learning how engineers operate within those constraints gave me a much better understanding of how real world systems are built and maintained in highly regulated industries.',
  },
  {
    id: 'laurier',
    section: 'education',
    name: 'Wilfrid Laurier University',
    title: 'Wilfrid Laurier University',
    subtitle: 'Bachelor of Science in Computer Science (Management Option)',
    date: 'Current',
    sortKey: '9999',
    location: 'Waterloo, ON',
    icon: '/laurier-seal.png',
    summary: 'Bachelor of Science in Computer Science (Management Option). Currently enrolled.',
    courses: [
      { code: 'CP213', name: 'Introduction to Object-Oriented Programming' },
      { code: 'CP214', name: 'Discrete Structures for Computer Science' },
      { code: 'CP216', name: 'Introduction to Microprocessors' },
      { code: 'CP220', name: 'Digital Electronics' },
      { code: 'CP264', name: 'Data Structures II' },
      { code: 'CP312', name: 'Algorithm Design and Analysis I' },
      { code: 'CP317', name: 'Software Engineering' },
      { code: 'CP363', name: 'Database I' },
      { code: 'CP372', name: 'Computer Networks' },
      { code: 'CP373', name: 'Ethics and Professional Practice in CS' },
      { code: 'CP386', name: 'Operating Systems' },
      { code: 'ST230', name: 'Probability and Statistics for Science' },
    ],
    activities: ['Laurier Computing Society', 'Laurier Entrepreneurship Club'],
    achievements: ['3rd Place, Real Estate Laurier Proposal Competition 2026'],
    documents: [
      { title: 'REL Case Competition Proposal', url: '/REL-Case-Comp.pdf', note: '3rd Place, Real Estate Laurier Proposal Competition 2026' },
    ],
    reflection: "Moving into Laurier's standalone CS program gave me the space to slow down and actually understand what I was learning. Instead of just trying to survive the pace of a massive program, I've been able to spend more time digging into how systems actually work. Most of my time lately has gone into operating systems, networking, algorithms, and low level architecture. The smaller environment has made it easier to ask questions, build things, and focus on understanding the fundamentals instead of just getting through the next assignment.",
  },
  {
    id: 'waterloo-laurier',
    section: 'education',
    name: 'University of Waterloo + Laurier',
    title: 'University of Waterloo and Wilfrid Laurier University',
    subtitle: 'Computer Science (Waterloo) and BBA (Laurier) double degree',
    date: 'Sep 2023 – 2025',
    sortKey: '2023-09',
    location: 'Waterloo, ON',
    icon: '/waterloo-logo.png',
    summary: 'Enrolled in University of Waterloo Computer Science and Wilfrid Laurier BBA double degree program.',
    courses: [
      { code: 'CS 135', name: 'Designing Functional Programs' },
      { code: 'CS 136', name: 'Elementary Algorithm Design and Data Abstraction' },
      { code: 'MATH 135', name: 'Algebra for Honours Mathematics' },
      { code: 'MATH 136', name: 'Linear Algebra 1 for Honours Mathematics' },
      { code: 'MATH 137', name: 'Calculus 1 for Honours Mathematics' },
      { code: 'MATH 138', name: 'Calculus 2 for Honours Mathematics' },
      { code: 'BU 111', name: 'Understanding the Business Environment' },
      { code: 'BU 121', name: 'Functional Areas of the Organization' },
      { code: 'EC 120', name: 'Introduction to Microeconomics' },
      { code: 'EC 140', name: 'Introduction to Macroeconomics' },
      { code: 'STAT 230', name: 'Probability' },
      { code: 'STAT 231', name: 'Statistics' },
      { code: 'MATH 239', name: 'Introduction to Combinatorics' },
      { code: 'CO 250', name: 'Introduction to Optimization' },
      { code: 'BU 127', name: 'Introduction to Financial Accounting' },
      { code: 'BU 283', name: 'Financial Management I' },
      { code: 'BU 288', name: 'Organizational Behaviour I' },
      { code: 'BU 231', name: 'Business Law' },
      { code: 'BU 247', name: 'Managerial Accounting' },
    ],
    activities: ['University of Waterloo Computer Science Club', 'Waterloo FinTech Club', 'Laurier Entrepreneurs'],
    achievements: ['1st Place, New Venture BDO Pitch Competition 2024'],
    documents: [
      { title: 'PartyFlow New Venture Pitch Deck', url: '/PartyFlow-New-Venture.pdf', note: '1st Place, New Venture BDO Pitch Competition 2024' },
    ],
    reflection: 'Those two years were intense. The workload was heavy and the expectations were high, but it forced me to grow quickly. Being around people who were extremely capable pushed me to think harder about how I approach problems and how I learn new systems. It also exposed me to both sides of the equation. Deep technical thinking from Waterloo and practical business framing from Laurier. That combination changed how I look at problems and how I try to solve them.',
  },
  {
    id: 'google-ml-trading',
    section: 'certifications',
    name: 'Machine Learning for Trading',
    title: 'Machine Learning for Trading Specialization',
    subtitle: 'Google Cloud Skills Boost',
    date: 'Dec 2024',
    sortKey: '2024-12-b',
    icon: '/google_cloud_logo_icon_171058-1.png',
    credentialId: 'ERAU8H0QLX7N',
    certificateUrl: '/google trading cloud .pdf',
  },
  {
    id: 'wharton-quant',
    section: 'certifications',
    name: 'Finance & Quantitative Modeling',
    title: 'Finance & Quantitative Modeling for Analysts',
    subtitle: 'Wharton Online',
    date: 'Dec 2024',
    sortKey: '2024-12-a',
    icon: '/wharton-shield.png',
    credentialId: 'S2XHA24WPFWY',
    certificateUrl: '/wharton certicate.pdf',
  },
];

export const SECTION_LABELS: Record<FinderSection, string> = {
  experience: 'Experience',
  education: 'Education',
  certifications: 'Certifications',
};
