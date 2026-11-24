export interface Project { id: string; name: string; line: string; href: string; lead?: boolean }

export const PROJECTS: Project[] = [
  { id: 'how-many-clicks', name: 'How Many Clicks', line: 'the wikipedia game, except i trained a model to play it', href: '/how-many-clicks', lead: true },
  { id: 'harvey', name: 'Harvey', line: 'my friends kept having dumb legal problems, so i built a lawyer you can call', href: '/harvey', lead: true },
  { id: 'leanfetch', name: 'LeanFetch', line: 'the first time i cared what a model call costs', href: '/leanfetch', lead: true },
  { id: 'game-solver-suite', name: 'Game Solver Suite', line: 'solves the daily puzzles faster than you can read them', href: '/game-solver-suite' },
  { id: 'wallstreetbets', name: 'r/wallstreetbets', line: 'where i think out loud about markets', href: '/wallstreetbets' },
  { id: 'ronnielos', name: 'RonnielOS', line: 'my old portfolio as a mac desktop. pure flex', href: '/desktop' },
];
