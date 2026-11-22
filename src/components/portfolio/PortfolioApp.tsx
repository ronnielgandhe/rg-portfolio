import { lazy, Suspense, useEffect, useState } from 'react';
import HomeFeed from './HomeFeed';

const Blackbook = lazy(() => import('./Blackbook'));

export default function PortfolioApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <>
      <HomeFeed />
      {mounted && <Suspense fallback={null}><Blackbook /></Suspense>}
    </>
  );
}
