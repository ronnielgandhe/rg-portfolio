import type { HistoryData, Snapshot } from '../types.ts';

const files = import.meta.glob<Snapshot>('/src/data/quantzoo/snapshots/*.json', { eager: true, import: 'default' });

export function buildHistory(): HistoryData {
  const snapshots = Object.values(files)
    .filter((s) => s && typeof s.date === 'string')
    .sort((a, b) => a.date.localeCompare(b.date));
  return { snapshots };
}
