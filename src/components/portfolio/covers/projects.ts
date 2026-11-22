export interface Project { id: string; name: string; line: string; href: string }

export const PROJECTS: Project[] = [
  { id: 'leanfetch', name: 'LeanFetch', line: 'what models cost, and where your repo wastes them', href: '/leanfetch' },
  { id: 'harvey', name: 'Harvey', line: 'a voice agent lawyer you can actually call', href: '/harvey' },
  { id: 'game-solver-suite', name: 'Game Solver Suite', line: 'algorithms that solve the daily linkedin and nyt puzzles, live', href: '/game-solver-suite' },
  { id: 'how-many-clicks', name: 'How Many Clicks', line: 'search strategies racing across wikipedia, measured click by click', href: '/how-many-clicks' },
  { id: 'wallstreetbets', name: 'r/wallstreetbets', line: "what's going on in the market, and my macro picks in plain words", href: '/wallstreetbets' },
  { id: 'ronnielos', name: 'RonnielOS', line: 'the one just for fun: my old portfolio as a mac desktop', href: '/desktop' },
];
