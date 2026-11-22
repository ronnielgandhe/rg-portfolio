import { Component, Suspense, lazy, type ComponentType, type ReactNode } from 'react';

const mods = import.meta.glob<{ default: ComponentType }>('../board/MarketBoard.tsx');
const loader = mods['../board/MarketBoard.tsx'];
const MarketBoard = loader ? lazy(loader) : null;

class Guard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Placeholder text="the market board is down right now." /> : this.props.children;
  }
}

function Placeholder({ text }: { text: string }) {
  return (
    <div style={{ borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)', padding: '28px 0', fontSize: 13, lineHeight: '20px', color: 'var(--faint)' }}>{text}</div>
  );
}

export default function BoardSlot() {
  if (!MarketBoard) return <Placeholder text="the market board is being built. prices, prediction market odds and headline mood land here." />;
  return (
    <Guard>
      <Suspense fallback={<Placeholder text="loading the market board" />}>
        <MarketBoard />
      </Suspense>
    </Guard>
  );
}
