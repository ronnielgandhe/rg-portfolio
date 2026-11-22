import { useRef, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowState } from './types';
import { SYSTEM_FONT, MENU_BAR_HEIGHT, chromeTokens } from './chrome';

interface AppWindowProps {
  windowState: WindowState;
  children: React.ReactNode;
  darkMode?: boolean;
  material?: 'opaque' | 'terminal';
  unified?: boolean;
  titleBarBg?: string;
  titleBarDark?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function AppWindow({ windowState, children, darkMode, material = 'opaque', unified = false, titleBarBg, titleBarDark, onMouseEnter, onMouseLeave }: AppWindowProps) {
  const { state, dispatch } = useDesktop();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [trafficHover, setTrafficHover] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [minTransform, setMinTransform] = useState<string | null>(null);
  const [parked, setParked] = useState(false);
  const chrome = chromeTokens(state.dark);

  const isFocused = state.focusedWindowId === windowState.id && !state.spotlightOpen;

  useEffect(() => {
    if (!windowState.isClosing) return;
    const t = setTimeout(() => dispatch({ type: 'CLOSE_WINDOW', id: windowState.id }), 150);
    return () => clearTimeout(t);
  }, [windowState.isClosing, windowState.id, dispatch]);

  useLayoutEffect(() => {
    if (!windowState.isMinimized) {
      setParked(false);
      setMinTransform(null);
      return;
    }
    const target =
      document.querySelector(`[data-dock-id="${windowState.id}"]`) ||
      document.querySelector('[data-dock-bar]');
    const r = target?.getBoundingClientRect();
    const cx = r ? r.left + r.width / 2 : window.innerWidth / 2;
    const cy = r ? r.top + r.height / 2 : window.innerHeight - 30;
    const wx = windowState.position.x + windowState.size.width / 2;
    const wy = windowState.position.y + windowState.size.height / 2;
    setMinTransform(`translate(${Math.round(cx - wx)}px, ${Math.round(cy - wy)}px) scale(0.06)`);
    const t = setTimeout(() => setParked(true), 480);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowState.isMinimized]);

  // Drag handler
  const handleMouseDownTitleBar = useCallback((e: React.MouseEvent) => {
    if (windowState.isFullscreen) return;
    e.preventDefault();
    dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
    setInteracting(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      winX: windowState.position.x,
      winY: windowState.position.y,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.winX + dx;
      const newY = Math.max(MENU_BAR_HEIGHT, dragRef.current.winY + dy);
      dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: newX, y: newY } });
    };

    const handleMouseUp = () => {
      dragRef.current = null;
      setInteracting(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, windowState.id, windowState.position, windowState.isFullscreen]);

  // Resize handler
  const handleResizeStart = useCallback((edge: string, e: React.MouseEvent) => {
    if (windowState.isFullscreen) return;
    e.preventDefault();
    e.stopPropagation();
    dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
    setInteracting(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: windowState.size.width,
      startH: windowState.size.height,
      edge,
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const dx = e.clientX - resizeRef.current.startX;
      const dy = e.clientY - resizeRef.current.startY;
      let newW = resizeRef.current.startW;
      let newH = resizeRef.current.startH;

      if (edge.includes('e')) newW = Math.max(400, resizeRef.current.startW + dx);
      if (edge.includes('w')) newW = Math.max(400, resizeRef.current.startW - dx);
      if (edge.includes('s')) newH = Math.max(300, resizeRef.current.startH + dy);
      if (edge.includes('n')) newH = Math.max(300, resizeRef.current.startH - dy);

      dispatch({ type: 'RESIZE_WINDOW', id: windowState.id, size: { width: newW, height: newH } });

      // If dragging west or north edge, also move the position
      if (edge.includes('w')) {
        const actualDx = resizeRef.current.startW - newW;
        dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: windowState.position.x - actualDx, y: windowState.position.y } });
      }
      if (edge.includes('n')) {
        const actualDy = resizeRef.current.startH - newH;
        dispatch({ type: 'MOVE_WINDOW', id: windowState.id, position: { x: windowState.position.x, y: Math.max(MENU_BAR_HEIGHT, windowState.position.y - actualDy) } });
      }
    };

    const handleMouseUp = () => {
      resizeRef.current = null;
      setInteracting(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [dispatch, windowState]);

  const handleFocus = useCallback(() => {
    if (!isFocused) dispatch({ type: 'FOCUS_WINDOW', id: windowState.id });
  }, [dispatch, isFocused, windowState.id]);

  const handleDoubleClickTitleBar = useCallback(() => {
    dispatch({ type: 'TOGGLE_FULLSCREEN', id: windowState.id });
  }, [dispatch, windowState.id]);

  const minimized = windowState.isMinimized;
  const closing = !!windowState.isClosing;
  const geometry = interacting ? '' : ', left 0.25s ease-out, top 0.25s ease-out, width 0.25s ease-out, height 0.25s ease-out';
  const transform = minimized && minTransform ? minTransform : closing ? 'scale(0.97)' : 'none';
  const transition = minimized || minTransform !== null
    ? `transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)${geometry}`
    : closing
      ? 'opacity 0.14s ease-out, transform 0.14s ease-out'
      : `transform 0.3s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.15s ease-out${geometry}`;
  const darkChrome = material === 'terminal' || !!titleBarDark || (state.dark && !titleBarBg);
  const frame = material === 'terminal'
    ? { background: 'rgba(30, 30, 30, 0.55)', backdropFilter: 'blur(30px) saturate(1.4)', WebkitBackdropFilter: 'blur(30px) saturate(1.4)' }
    : { background: darkMode ? '#f6f6f6' : chrome.windowBg };
  const edge = darkChrome
    ? '0 0 0 0.5px rgba(0,0,0,0.6), inset 0 0 0 0.5px rgba(255,255,255,0.15)'
    : '0 0 0 0.5px rgba(0,0,0,0.22)';

  return (
    <div
      ref={windowRef}
      onMouseDown={handleFocus}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'absolute',
        left: windowState.position.x,
        top: windowState.position.y,
        width: windowState.size.width,
        height: windowState.size.height,
        zIndex: windowState.zIndex,
        borderRadius: '10px',
        ...frame,
        boxShadow: isFocused
          ? `${edge}, 0 22px 70px 4px rgba(0,0,0,0.45)`
          : `${edge}, 0 8px 30px rgba(0,0,0,0.25)`,
        opacity: closing ? 0 : 1,
        transform,
        transition,
        animation: 'winIn 0.2s cubic-bezier(0.2, 0.9, 0.3, 1) both',
        pointerEvents: minimized || closing ? 'none' : undefined,
        visibility: minimized && parked ? 'hidden' : 'visible',
        willChange: 'transform',
      }}
    >
      <style>{`@keyframes winIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: none; } }`}</style>
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '10px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {unified ? (
        <>
          {/* Traffic lights */}
          <div
            style={{ position: 'absolute', left: 20, top: 20, zIndex: 5, display: 'flex', gap: '8px', alignItems: 'center' }}
            onMouseEnter={() => setTrafficHover(true)}
            onMouseLeave={() => setTrafficHover(false)}
          >
            <TrafficButton
              kind="close"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REQUEST_CLOSE', id: windowState.id }); }}
              label="Close window"
            />
            <TrafficButton
              kind="minimize"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', id: windowState.id }); }}
              label="Minimize window"
            />
            <TrafficButton
              kind="zoom"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FULLSCREEN', id: windowState.id }); }}
              label="Zoom window"
            />
          </div>
        </>
      ) : (
        <>
        {/* Title bar — draggable */}
        <div
          onMouseDown={handleMouseDownTitleBar}
          onDoubleClick={handleDoubleClickTitleBar}
          style={{
            height: '28px',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            borderBottom: titleBarDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.04)',
            cursor: 'default',
            userSelect: 'none',
            background: titleBarBg || 'transparent',
          }}
        >
          {/* Traffic lights */}
          <div
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
            onMouseEnter={() => setTrafficHover(true)}
            onMouseLeave={() => setTrafficHover(false)}
          >
            <TrafficButton
              kind="close"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REQUEST_CLOSE', id: windowState.id }); }}
              label="Close window"
            />
            <TrafficButton
              kind="minimize"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', id: windowState.id }); }}
              label="Minimize window"
            />
            <TrafficButton
              kind="zoom"
              lit={isFocused || trafficHover}
              hovered={trafficHover}
              dark={darkChrome}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: 'TOGGLE_FULLSCREEN', id: windowState.id }); }}
              label="Zoom window"
            />
          </div>

          {/* Window title */}
          <span style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: SYSTEM_FONT,
            fontSize: '13px',
            fontWeight: 700,
            color: darkChrome
              ? (isFocused ? 'rgba(255, 255, 255, 0.86)' : 'rgba(255, 255, 255, 0.25)')
              : (isFocused ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.26)'),
            transition: 'color 0.15s ease',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {windowState.title}
          </span>

          {/* Spacer to balance traffic lights */}
          <div style={{ width: '52px' }} />
        </div>
        </>
      )}

      {/* Content area — scrollable */}
      <div
        className={darkMode ? 'dark-window' : 'light-window'}
        onMouseDown={unified ? (e) => {
          const top = windowRef.current?.getBoundingClientRect().top ?? 0;
          const el = e.target as HTMLElement;
          if (e.clientY - top > 52 || el.closest('button, a, input, textarea, select, [role="button"], [contenteditable="true"]')) return;
          handleMouseDownTitleBar(e);
        } : undefined}
        onDoubleClick={unified ? (e) => {
          const top = windowRef.current?.getBoundingClientRect().top ?? 0;
          const el = e.target as HTMLElement;
          if (e.clientY - top > 52 || el.closest('button, a, input, textarea, select, [role="button"]')) return;
          handleDoubleClickTitleBar();
        } : undefined}
        style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'transparent',
      }}>
        {children}
      </div>

      </div>

      {!windowState.isFullscreen && (
        <>
          <ResizeEdge edge="n" onStart={handleResizeStart} cursor="ns-resize" style={{ top: -5, left: 10, right: 10, height: 10 }} />
          <ResizeEdge edge="s" onStart={handleResizeStart} cursor="ns-resize" style={{ bottom: -5, left: 10, right: 10, height: 10 }} />
          <ResizeEdge edge="e" onStart={handleResizeStart} cursor="ew-resize" style={{ right: -5, top: 10, bottom: 10, width: 10 }} />
          <ResizeEdge edge="w" onStart={handleResizeStart} cursor="ew-resize" style={{ left: -5, top: 10, bottom: 10, width: 10 }} />
          <ResizeEdge edge="nw" onStart={handleResizeStart} cursor="nwse-resize" style={{ left: -6, top: -6, width: 16, height: 16 }} />
          <ResizeEdge edge="ne" onStart={handleResizeStart} cursor="nesw-resize" style={{ right: -6, top: -6, width: 16, height: 16 }} />
          <ResizeEdge edge="se" onStart={handleResizeStart} cursor="nwse-resize" style={{ right: -6, bottom: -6, width: 16, height: 16 }} />
          <ResizeEdge edge="sw" onStart={handleResizeStart} cursor="nesw-resize" style={{ left: -6, bottom: -6, width: 16, height: 16 }} />
        </>
      )}
    </div>
  );
}

// ── Traffic Light Button ──

const TRAFFIC = {
  close:    { fill: '#ff5f57', ring: '#e0443e', glyph: '#4d0000' },
  minimize: { fill: '#febc2e', ring: '#dea123', glyph: '#995700' },
  zoom:     { fill: '#28c840', ring: '#1aab29', glyph: '#006500' },
} as const;

function TrafficButton({ kind, lit, hovered, dark, onClick, label }: {
  kind: keyof typeof TRAFFIC;
  lit: boolean;
  hovered: boolean;
  dark: boolean;
  onClick: (e: React.MouseEvent) => void;
  label: string;
}) {
  const c = TRAFFIC[kind];
  const idleFill = dark ? '#4d4d4d' : '#dcdcdc';
  const idleRing = dark ? '#404040' : '#c8c8c8';
  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      aria-label={label}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: lit ? c.fill : idleFill,
        boxShadow: `inset 0 0 0 0.5px ${lit ? c.ring : idleRing}`,
        border: 'none',
        padding: 0,
        cursor: 'default',
        transition: 'background 0.12s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" style={{ opacity: hovered ? 1 : 0, display: 'block' }}>
        {kind === 'close' && (
          <path d="M4 4l4 4M8 4L4 8" stroke={c.glyph} strokeOpacity="0.75" strokeWidth="1" strokeLinecap="round" />
        )}
        {kind === 'minimize' && (
          <path d="M3.5 6h5" stroke={c.glyph} strokeOpacity="0.8" strokeWidth="1.1" strokeLinecap="round" />
        )}
        {kind === 'zoom' && (
          <path d="M3.5 7.2V3.5h3.7z M8.5 4.8v3.7H4.8z" fill={c.glyph} fillOpacity="0.75" />
        )}
      </svg>
    </button>
  );
}

// ── Resize Edge ──

function ResizeEdge({ edge, onStart, cursor, style }: {
  edge: string;
  onStart: (edge: string, e: React.MouseEvent) => void;
  cursor: string;
  style: React.CSSProperties;
}) {
  return (
    <div
      onMouseDown={(e) => onStart(edge, e)}
      style={{
        position: 'absolute',
        cursor,
        zIndex: 10,
        ...style,
      }}
    />
  );
}
