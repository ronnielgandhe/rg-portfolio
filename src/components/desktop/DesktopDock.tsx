import { useState, useRef, useCallback } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowId } from './types';
import { BsGithub } from 'react-icons/bs';
import { SYSTEM_FONT, VIBRANCY, chromeTokens } from './chrome';

interface DockItem {
  id: WindowId | 'github' | 'email' | 'spotify';
  label: string;
  icon: React.ReactNode;
  isExternal?: boolean;
  href?: string;
}

const BASE_SIZE = 50;
const ICON_SIZE = BASE_SIZE - 6;
const MAX_SCALE = 1.5;
const MAGNIFY_RANGE = 150;
const SLOT_GAP = 3;
const DIVIDER_SLOT = 17;

export default function DesktopDock() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { state, dispatch } = useDesktop();
  const chrome = chromeTokens(state.dark);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const [bouncing, setBouncing] = useState<string | null>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  const windowItems: DockItem[] = [
    { id: 'experience', label: 'Finder', icon: <DockImage src="/icons/folder.png" alt="Finder" cropScale={1} /> },
    { id: 'terminal', label: 'Terminal', icon: <DockImage src="/usethisTERMIANL.png" alt="Terminal" cropScale={1.15} /> },
    { id: 'projects', label: 'Projects', icon: <DockImage src="/vscode.png" alt="VS Code" /> },
    { id: 'blog', label: 'My Thoughts', icon: <DockImage src="/notes.png" alt="Notes" /> },
    { id: 'stocks', label: 'Stocks', icon: <DockImage src="/usethisonestocks1111.png" alt="Stocks" /> },
    { id: 'photos', label: 'Photos', icon: <DockImage src="/icons/photos.png" alt="Photos" /> },
    { id: 'calendar', label: 'Book a Meeting', icon: <CalendarIcon /> },
  ];

  const externalItems: DockItem[] = [
    { id: 'github', label: 'GitHub', icon: <AppIcon gradient="linear-gradient(180deg, #3a3a3c 0%, #1c1c1e 100%)" iconEl={<BsGithub size={26} color="white" />} />, isExternal: true, href: 'https://github.com/ronnielgandhe' },
    { id: 'email' as any, label: 'Email Me', icon: <DockImage src="/usethismailicon.png" alt="Mail" cropScale={1.2} /> },
    { id: 'spotify', label: 'Dev Playlist', icon: <DockImage src="/spotify_logo_icon_189218.png" alt="Spotify" cropScale={1.45} />, isExternal: true, href: 'https://open.spotify.com/playlist/2uud5zGJZf3U98FlTnQip8' },
  ];

  const allItems = [...windowItems, { id: 'divider' as any, label: '', icon: null }, ...externalItems];

  const handleClick = (item: DockItem) => {
    if (state.windows.terminal?.isFullscreen) {
      dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
    }

    if (item.isExternal && item.href) {
      if (item.href.startsWith('mailto:')) {
        window.location.href = item.href;
      } else {
        window.open(item.href, '_blank');
      }
      return;
    }
    const id = item.id as WindowId;

    const win = state.windows[id];
    if (win?.isMinimized) {
      dispatch({ type: 'RESTORE_WINDOW', id });
    } else if (win?.isOpen) {
      dispatch({ type: 'FOCUS_WINDOW', id });
    } else {
      setBouncing(id);
      window.setTimeout(() => setBouncing(b => (b === id ? null : b)), 1250);
      dispatch({ type: 'OPEN_WINDOW', id });
    }
  };

  const isRunning = (id: string) => !!state.windows[id as WindowId]?.isOpen;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX(e.clientX - window.innerWidth / 2);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseX(null);
  }, []);

  const restCenters: number[] = [];
  {
    let x = 0;
    for (const item of allItems) {
      if (item.id === 'divider') {
        x += DIVIDER_SLOT + SLOT_GAP;
      } else {
        restCenters.push(x + BASE_SIZE / 2);
        x += BASE_SIZE + SLOT_GAP;
      }
    }
    const total = x - SLOT_GAP;
    for (let i = 0; i < restCenters.length; i++) restCenters[i] -= total / 2;
  }

  const getScale = (index: number): number => {
    if (mouseX === null || isMobile) return 1;
    const dist = Math.abs(mouseX - restCenters[index]);
    if (dist > MAGNIFY_RANGE) return 1;
    return 1 + (MAX_SCALE - 1) * Math.cos((dist / MAGNIFY_RANGE) * (Math.PI / 2)) ** 2;
  };

  let shift = 0;
  if (mouseX !== null && !isMobile) {
    const widths = allItems.map((item) => (item.id === 'divider' ? DIVIDER_SLOT : BASE_SIZE));
    let icon = 0;
    const magnified = allItems.map((item, i) => (item.id === 'divider' ? widths[i] : widths[i] * getScale(icon++)));
    const sum = (list: number[]) => list.reduce((a, b) => a + b, 0) + SLOT_GAP * (list.length - 1);
    let rest = -sum(widths) / 2;
    let mag = -sum(magnified) / 2;
    for (let i = 0; i < widths.length; i++) {
      if (mouseX <= rest + widths[i] + SLOT_GAP || i === widths.length - 1) {
        const frac = Math.min(1, Math.max(0, (mouseX - rest) / widths[i]));
        shift = mouseX - (mag + frac * magnified[i]);
        break;
      }
      rest += widths[i] + SLOT_GAP;
      mag += magnified[i] + SLOT_GAP;
    }
  }

  let iconIndex = 0;

  return (
    <div style={{
      position: 'fixed',
      bottom: '5px',
      left: '50%',
      transform: isMobile ? 'translateX(-50%) scale(0.72)' : `translateX(calc(-50% + ${shift.toFixed(1)}px))`,
      transition: mouseX === null ? 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
      transformOrigin: 'bottom center',
      zIndex: 9998,
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      <div
        ref={dockRef}
        data-dock-bar
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: `${SLOT_GAP}px`,
          height: `${BASE_SIZE + 12}px`,
          padding: '4px 7px 8px',
          borderRadius: '20px',
          background: chrome.dockBg,
          backdropFilter: VIBRANCY,
          WebkitBackdropFilter: VIBRANCY,
          border: chrome.dockBorder,
          boxShadow: chrome.dockShadow,
          boxSizing: 'border-box',
        }}
      >
        {allItems.map((item) => {
          if (item.id === 'divider') {
            return (
              <div key="divider" style={{
                width: `${DIVIDER_SLOT}px`,
                height: `${BASE_SIZE}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ width: '1px', height: '42px', background: chrome.dockDivider }} />
              </div>
            );
          }
          const currentIndex = iconIndex++;
          const scale = getScale(currentIndex);
          return (
            <DockButton
              key={item.id}
              item={item}
              scale={scale}
              magnifying={mouseX !== null}
              bouncing={bouncing === item.id}
              running={!('isExternal' in item && item.isExternal) && isRunning(item.id)}
              onClick={() => handleClick(item)}
            />
          );
        })}
      </div>
      <style>{`
        @keyframes dockBounce {
          0% { transform: none; animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94); }
          50% { transform: translateY(-22px); animation-timing-function: cubic-bezier(0.55, 0.06, 0.68, 0.19); }
          100% { transform: none; }
        }
      `}</style>
    </div>
  );
}

function DockButton({ item, scale, magnifying, bouncing, running, onClick }: {
  item: DockItem;
  scale: number;
  magnifying: boolean;
  bouncing: boolean;
  running: boolean;
  onClick: () => void;
}) {
  const { state } = useDesktop();
  const chrome = chromeTokens(state.dark);
  const [hovered, setHovered] = useState(false);
  const ease = magnifying
    ? 'none'
    : 'width 0.24s cubic-bezier(0.22, 1, 0.36, 1), transform 0.24s cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      data-dock-id={item.id}
      style={{
        position: 'relative',
        width: `${BASE_SIZE * scale}px`,
        height: `${BASE_SIZE}px`,
        flexShrink: 0,
        transition: ease,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: `${BASE_SIZE * scale + 16}px`,
          transform: 'translateX(-50%)',
          padding: '3px 10px',
          borderRadius: '6px',
          background: chrome.tooltipBg,
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          border: chrome.panelBorder,
          color: chrome.tooltipText,
          fontSize: '13px',
          fontWeight: 400,
          fontFamily: SYSTEM_FONT,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
          boxShadow: '0 0 0 0.5px rgba(0,0,0,0.18), 0 4px 14px rgba(0,0,0,0.18)',
          lineHeight: '18px',
        }}>
          {item.label}
          <div style={{
            position: 'absolute',
            bottom: '-5px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${chrome.tooltipBg}`,
          }} />
        </div>
      )}

      <button
        onClick={onClick}
        aria-label={item.label}
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '3px',
          width: `${ICON_SIZE}px`,
          height: `${ICON_SIZE}px`,
          marginLeft: `${-ICON_SIZE / 2}px`,
          border: 'none',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          background: 'transparent',
          cursor: 'default',
          padding: 0,
          transform: `scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: ease,
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          animation: bouncing ? 'dockBounce 0.6s 2' : undefined,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.22))',
        }}>
          {item.icon}
        </div>
      </button>

      {running && (
        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: '-5px',
          width: '4px',
          height: '4px',
          marginLeft: '-2px',
          borderRadius: '50%',
          background: chrome.dockDot,
        }} />
      )}
    </div>
  );
}

// ── Icon Components ────────────────────────────────────────────

function DockImage({ src, alt, cropScale = 1.12 }: { src: string; alt: string; contain?: boolean; cropScale?: number }) {
  const s = ICON_SIZE;
  return (
    <div style={{
      width: `${s}px`,
      height: `${s}px`,
      borderRadius: '10px',
      overflow: 'hidden',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: `${s * cropScale}px`,
          height: `${s * cropScale}px`,
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

function AppIcon({ gradient, iconEl }: { gradient: string; iconEl: React.ReactNode }) {
  return (
    <div style={{
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      borderRadius: '10px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {iconEl}
    </div>
  );
}

function CalendarIcon() {
  const now = new Date();
  const monthStr = now.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayNum = now.getDate();
  return (
    <div style={{
      width: `${ICON_SIZE}px`,
      height: `${ICON_SIZE}px`,
      borderRadius: '10px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #ffffff 0%, #f2f2f2 100%)',
      boxShadow: 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
      pointerEvents: 'none',
    }}>
      <span style={{
        marginTop: '5px',
        fontSize: '9px',
        fontWeight: 600,
        color: '#ff3b30',
        fontFamily: SYSTEM_FONT,
        letterSpacing: '0.04em',
        lineHeight: 1,
      }}>
        {monthStr}
      </span>
      <span style={{
        fontSize: '25px',
        fontWeight: 300,
        color: '#1d1d1f',
        fontFamily: SYSTEM_FONT,
        lineHeight: 1,
        marginTop: '1px',
        letterSpacing: '-0.02em',
      }}>
        {dayNum}
      </span>
    </div>
  );
}
