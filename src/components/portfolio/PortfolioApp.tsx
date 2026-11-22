import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';

import HomeFeed from './HomeFeed';
import Blackbook from './Blackbook';

const LazyDesktopShell = lazy(() => import('../desktop/DesktopShell'));

type AppPhase = 'site' | 'desktop';

/** ryo.lu-style page peel — CSS clip-path + layered gradients + spring transition */

function OSCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      className="os-close-btn"
      aria-label="Close RonnielOS"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
      </svg>
      <style>{`
        .os-close-btn {
          position: fixed;
          top: 36px;
          right: 16px;
          z-index: 10002;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 0.5px solid rgba(0,0,0,0.08);
          background: rgba(255,255,255,0.55);
          color: rgba(0,0,0,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .os-close-btn:hover {
          background: rgba(255,255,255,0.75);
          color: rgba(0,0,0,0.8);
          transform: scale(1.1);
        }
      `}</style>
    </button>
  );
}

export default function PortfolioApp() {
  const [phase, setPhase] = useState<AppPhase>('site');
  const [expanded, setExpanded] = useState(false);

  const handleClose = useCallback(() => {
    setExpanded(false);
    setPhase('site');
  }, []);

  // Toggle peek open/close
  const peelTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const togglePeek = useCallback(() => {
    if (!expanded) {
      setExpanded(true);
      // After the clip-path transition finishes, switch to full desktop mode
      peelTimer.current = setTimeout(() => setPhase('desktop'), 700);
    }
  }, [expanded]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (expanded || phase === 'desktop')) {
        clearTimeout(peelTimer.current);
        setExpanded(false);
        setPhase('site');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, phase]);

  return (
    <>
      {/* Portfolio page — the main content (hidden but not unmounted during desktop phase to avoid remount flash) */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: phase === 'site' ? undefined : 'none' }}>
        <HomeFeed />
        <Blackbook />
      </div>

      {/* Corner fold — static, click to expand into RonnielOS */}
      <div className={`peek-container ${expanded ? 'peek-expanded' : ''}`}>
        <div className="peek-desktop">
          <Suspense fallback={<div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/backgroundappleuse.png)', backgroundSize: 'cover', backgroundPosition: 'center' }} />}>
            <LazyDesktopShell skipBoot />
          </Suspense>
          {phase === 'desktop' && <OSCloseButton onClose={handleClose} />}
        </div>
        <div
          className={`page-curl ${expanded ? 'curl-hidden' : ''}`}
          onClick={togglePeek}
          role="button"
          aria-label="Open RonnielOS"
        />
      </div>

      <style>{`
        .peek-container {
          position: fixed;
          top: 0;
          right: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 999;
          overflow: visible;
        }
        .peek-desktop {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: auto;
          clip-path: polygon(
            calc(100% - 200px) 0%,
            100% 0%,
            100% 200px,
            calc(100% - 200px) 0%
          );
          transition: clip-path 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .peek-expanded .peek-desktop {
          clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
        }
        .page-curl {
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          pointer-events: auto;
          cursor: pointer;
          z-index: 1001;
          background:
            linear-gradient(225deg, transparent 48%, rgba(0,0,0,0.08) 49.5%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.05) 51%, transparent 53%);
          transition: opacity 0.3s linear;
        }
        .curl-hidden {
          opacity: 0 !important;
          pointer-events: none;
        }
        body.blackbook-active .peek-container {
          display: none !important;
        }
        @media (max-width: 768px) {
          .peek-container {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
