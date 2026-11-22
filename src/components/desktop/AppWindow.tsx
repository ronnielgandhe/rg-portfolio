import { useRef, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useDesktop } from './DesktopContext';
import type { WindowState } from './types';
import { SYSTEM_FONT, MENU_BAR_HEIGHT, VIBRANCY, chromeTokens } from './chrome';

interface AppWindowProps {
  windowState: WindowState;
  children: React.ReactNode;
  darkMode?: boolean;
  titleBarBg?: string;
  titleBarDark?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function AppWindow({ windowState, children, darkMode, titleBarBg, titleBarDark, onMouseEnter, onMouseLeave }: AppWindowProps) {
  const { state, dispatch } = useDesktop();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number; edge: string } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const [entering, setEntering] = useState(true);
  const [trafficHover, setTrafficHover] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [minTransform, setMinTransform] = useState<string | null>(null);
  const [parked, setParked] = useState(false);
  const chrome = chromeTokens(state.dark);

  const isFocused = state.focusedWindowId === windowState.id;

  useEffect(() => {
    const t = setTimeout(() => setEntering(false), 20);
    return () => clearTimeout(t);
  }, []);

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
    const t = setTimeout(() => setParked(true), 420);
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
  const borderRadius = '10px';
  const geometry = interacting ? '' : ', left 0.25s ease, top 0.25s ease, width 0.25s ease, height 0.25s ease';
  const transform = minimized && minTransform
    ? minTransform
    : entering ? 'scale(0.94)' : closing ? 'scale(0.97)' : 'scale(1)';
  const transition = minimized || minTransform !== null
    ? `transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.6, 1)${geometry}`
    : closing
      ? 'opacity 0.14s ease-out, transform 0.14s ease-out'
      : `opacity 0.18s ease-out, transform 0.22s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease${geometry}`;

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
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: darkMode ? 'rgba(244, 244, 245, 0.72)' : chrome.glass,
        backdropFilter: VIBRANCY,
        WebkitBackdropFilter: VIBRANCY,
        boxShadow: windowState.isFullscreen
          ? '0 0 0 0.5px rgba(0,0,0,0.3)'
          : isFocused
            ? '0 0 0 0.5px rgba(0,0,0,0.28), 0 36px 100px rgba(0,0,0,0.36), 0 14px 30px rgba(0,0,0,0.18), inset 0 0.5px 0 rgba(255,255,255,0.45)'
            : '0 0 0 0.5px rgba(0,0,0,0.2), 0 16px 44px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.1), inset 0 0.5px 0 rgba(255,255,255,0.3)',
        opacity: entering || closing || minimized ? 0 : 1,
        transform,
        transition,
        pointerEvents: minimized || closing ? 'none' : undefined,
        visibility: minimized && parked ? 'hidden' : 'visible',
        willChange: 'transform',
      }}
    >
      {/* Title bar — draggable */}
      <div
        onMouseDown={handleMouseDownTitleBar}
        onDoubleClick={handleDoubleClickTitleBar}
        style={{
          height: '38px',
          minHeight: '38px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 13px',
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
            dark={!!titleBarDark || state.dark}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'REQUEST_CLOSE', id: windowState.id }); }}
            label="Close window"
          />
          <TrafficButton
            kind="minimize"
            lit={isFocused || trafficHover}
            hovered={trafficHover}
            dark={!!titleBarDark || state.dark}
            onClick={(e) => { e.stopPropagation(); dispatch({ type: 'MINIMIZE_WINDOW', id: windowState.id }); }}
            label="Minimize window"
          />
          <TrafficButton
            kind="zoom"
            lit={isFocused || trafficHover}
            hovered={trafficHover}
            dark={!!titleBarDark || state.dark}
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
          fontWeight: 600,
          letterSpacing: '-0.005em',
          color: (titleBarDark || (state.dark && !titleBarBg))
            ? (isFocused ? 'rgba(255, 255, 255, 0.86)' : 'rgba(255, 255, 255, 0.4)')
            : (isFocused ? 'rgba(0, 0, 0, 0.82)' : 'rgba(0, 0, 0, 0.36)'),
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

      {/* Content area — scrollable */}
      <div className={darkMode ? 'dark-window' : 'light-window'} style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        background: 'transparent',
      }}>
        {children}
      </div>

      {/* Resize handles (hidden in fullscreen) */}
      {!windowState.isFullscreen && (
        <>
          <ResizeEdge edge="e" onStart={handleResizeStart} cursor="ew-resize" style={{ right: 0, top: 0, width: '4px', height: '100%' }} />
          <ResizeEdge edge="w" onStart={handleResizeStart} cursor="ew-resize" style={{ left: 0, top: 0, width: '4px', height: '100%' }} />
          <ResizeEdge edge="s" onStart={handleResizeStart} cursor="ns-resize" style={{ bottom: 0, left: 0, width: '100%', height: '4px' }} />
          <ResizeEdge edge="se" onStart={handleResizeStart} cursor="nwse-resize" style={{ right: 0, bottom: 0, width: '12px', height: '12px' }} />
          <ResizeEdge edge="sw" onStart={handleResizeStart} cursor="nesw-resize" style={{ left: 0, bottom: 0, width: '12px', height: '12px' }} />
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
  const idleFill = dark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.14)';
  const idleRing = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
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
          <path d="M3.6 3.6l4.8 4.8M8.4 3.6L3.6 8.4" stroke={c.glyph} strokeWidth="1.15" strokeLinecap="round" />
        )}
        {kind === 'minimize' && (
          <path d="M2.8 6h6.4" stroke={c.glyph} strokeWidth="1.3" strokeLinecap="round" />
        )}
        {kind === 'zoom' && (
          <path d="M3.3 6.9V3.3h3.6zM8.7 5.1v3.6H5.1z" fill={c.glyph} />
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
