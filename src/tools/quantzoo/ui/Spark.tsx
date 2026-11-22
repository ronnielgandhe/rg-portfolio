export function Spark({ values, className, base, width = 120, height = 28 }: { values: number[]; className?: string; base?: boolean; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const y = (v: number) => 2 + (1 - (v - lo) / (hi - lo || 1)) * (height - 4);
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${((i / (values.length - 1)) * width).toFixed(1)},${y(v).toFixed(1)}`).join('');
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      {base && <path d={`M0,${y(values[0])}H${width}`} vectorEffect="non-scaling-stroke" fill="none" stroke="var(--rule)" strokeDasharray="2 2" />}
      <path d={d} vectorEffect="non-scaling-stroke" fill="none" stroke="currentColor" strokeWidth={1} />
    </svg>
  );
}
