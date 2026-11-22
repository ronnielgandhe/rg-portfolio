export interface Brand { name: string; color: string; colorDark: string; ink: string }

export const PROJECT_BRAND: Record<string, Brand> = {
  leanfetch: { name: 'LeanFetch', color: '#2F5BFF', colorDark: '#2A4FD6', ink: '#FFFFFF' },
  harvey: { name: 'Harvey', color: '#FF6B2C', colorDark: '#E25A1F', ink: '#1A1A1A' },
  'game-solver-suite': { name: 'Game Solver Suite', color: '#F6C417', colorDark: '#D9AC10', ink: '#1A1A1A' },
  'how-many-clicks': { name: 'How Many Clicks', color: '#7C5CF6', colorDark: '#6A4CDD', ink: '#FFFFFF' },
  wallstreetbets: { name: 'r/wallstreetbets', color: '#0E8F5C', colorDark: '#0C7A4F', ink: '#FFFFFF' },
  ronnielos: { name: 'RonnielOS', color: '#FF9EBB', colorDark: '#E5839F', ink: '#1A1A1A' },
};

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const MARKS: Record<string, React.ReactNode> = {
  leanfetch: (
    <>
      <path className="pl-a" pathLength={1} d="M7 13h16c4 0 6 3 6 6s-2 6-6 6H13" />
      <polyline className="pl-b" points="17 21 13 25 17 29" />
    </>
  ),
  harvey: (
    <>
      <path d="M8 7v22M28 7v22" />
      <path className="pl-w pl-w1" d="M13 15.5v5" />
      <path className="pl-w pl-w2" d="M18 11v14" />
      <path className="pl-w pl-w3" d="M23 14v8" />
    </>
  ),
  'game-solver-suite': (
    <>
      <path className="pl-crown" d="M8 25V12l5.5 5.5L18 8l4.5 9.5L28 12v13z" />
      <path className="pl-base" pathLength={1} d="M8 30h20" />
    </>
  ),
  'how-many-clicks': (
    <>
      <circle className="pl-n1" cx={8.5} cy={26} r={3.2} fill="currentColor" />
      <path className="pl-hop" pathLength={1} d="M10.5 22.5C12.5 12 20 8.5 25 9.5" />
      <circle className="pl-n2" cx={27.5} cy={10} r={3.2} />
    </>
  ),
  wallstreetbets: (
    <>
      <g className="pl-c pl-c1"><path d="M8 17v13" /><rect x={5.75} y={20} width={4.5} height={7} /></g>
      <g className="pl-c pl-c2"><path d="M18 10v15" /><rect x={15.75} y={13} width={4.5} height={9} /></g>
      <g className="pl-c pl-c3"><path d="M28 3v16" /><rect x={25.75} y={6} width={4.5} height={10} fill="currentColor" /></g>
    </>
  ),
  ronnielos: (
    <>
      <g className="pl-win">
        <rect x={4} y={5} width={21} height={17} />
        <path d="M4 10.5h21" />
        <path d="M7.75 7.75h0M11 7.75h0" strokeWidth={2} />
      </g>
      <path className="pl-cur" d="M23.5 23l8.5 3.6-3.7 1.4-1.4 3.7z" fill="currentColor" strokeWidth={2} />
    </>
  ),
};

export function ProjectLogo({ id, size = 36, className, title }: { id: string; size?: number | string; className?: string; title?: string }) {
  const mark = MARKS[id];
  if (!mark) return null;
  return (
    <svg
      className={`pl pl-${id}${className ? ` ${className}` : ''}`}
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...S}
    >
      {mark}
    </svg>
  );
}

export default ProjectLogo;
