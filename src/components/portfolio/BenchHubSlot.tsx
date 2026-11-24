import { lazy } from 'react';

const found = import.meta.glob<{ default: React.ComponentType }>('../../tools/bench/BenchHub.tsx');
const load = found['../../tools/bench/BenchHub.tsx'];

function Pending() {
  return <p style={{ margin: '48px 0', fontSize: 14, lineHeight: '20px', color: 'var(--half)' }}>benchmarks are being put together. check back soon.</p>;
}

const BenchHub = lazy(load ?? (async () => ({ default: Pending })));

export default BenchHub;
