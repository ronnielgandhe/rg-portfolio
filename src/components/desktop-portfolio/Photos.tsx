import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { photos } from '../../data/photos';
import { SYS_FONT, LABEL, LABEL_2, Icon, MacStyles } from './mac';

interface PhotosProps {
  windowMode?: boolean;
}

const SELECT_BLUE = '#007AFF';
const MIN_COLS = 3;
const MAX_COLS = 9;

function LazyThumb({ thumb, alt, selected, onClick, onOpen }: {
  thumb: string; alt: string; selected: boolean; onClick: () => void; onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      onDoubleClick={onOpen}
      style={{ aspectRatio: '1', overflow: 'hidden', position: 'relative', background: '#e5e5e5', cursor: 'default' }}
    >
      {visible && (
        <img src={thumb} alt={alt} decoding="async" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      )}
      {selected && <div style={{ position: 'absolute', inset: 0, boxShadow: `inset 0 0 0 3px ${SELECT_BLUE}` }} />}
    </div>
  );
}

function ToolBtn({ children, onClick, disabled, tooltip, dark }: {
  children: ReactNode; onClick?: () => void; disabled?: boolean; tooltip?: string; dark?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      title={tooltip}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.6)',
        opacity: disabled ? 0.35 : 1,
        background: hover && !disabled ? (dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)') : 'transparent',
        cursor: 'default',
      }}
    >
      {children}
    </div>
  );
}

const Photos = (_props: PhotosProps) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [cols, setCols] = useState(6);

  useEffect(() => {
    if (openIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && openIdx < photos.length - 1) setOpenIdx(openIdx + 1);
      if (e.key === 'ArrowLeft' && openIdx > 0) setOpenIdx(openIdx - 1);
      if (e.key === 'Escape') { setSelectedIdx(openIdx); setOpenIdx(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [openIdx]);

  const open = openIdx !== null ? photos[openIdx] : null;
  const viewing = open !== null;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
      background: viewing ? '#000000' : '#ffffff', fontFamily: SYS_FONT, fontSize: '13px', color: LABEL,
    }}>
      <MacStyles />
      <div style={{
        height: '52px', flexShrink: 0, display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
        padding: '0 80px', boxSizing: 'border-box', background: viewing ? '#1e1e1e' : '#f6f6f6',
        borderBottom: viewing ? '0.5px solid rgba(255,255,255,0.1)' : '0.5px solid rgba(0,0,0,0.1)',
      }}>
        {viewing && openIdx !== null ? (
          <>
            <div style={{ display: 'flex' }}>
              <ToolBtn dark tooltip="Back" onClick={() => { setSelectedIdx(openIdx); setOpenIdx(null); }}>
                <Icon.ChevronLeft size={18} />
              </ToolBtn>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', fontVariantNumeric: 'tabular-nums' }}>
              {openIdx + 1} of {photos.length}
            </div>
            <div />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '2px' }}>
              <ToolBtn tooltip="Zoom Out" disabled={cols >= MAX_COLS} onClick={() => setCols(c => Math.min(MAX_COLS, c + 1))}>
                <Icon.Minus size={16} />
              </ToolBtn>
              <ToolBtn tooltip="Zoom In" disabled={cols <= MIN_COLS} onClick={() => setCols(c => Math.max(MIN_COLS, c - 1))}>
                <Icon.Plus size={16} />
              </ToolBtn>
            </div>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: '6px', padding: '2px', height: '24px', boxSizing: 'border-box' }}>
              {['Years', 'Months', 'All Photos'].map(label => {
                const active = label === 'All Photos';
                return (
                  <div key={label} style={{
                    padding: '0 12px', display: 'flex', alignItems: 'center', borderRadius: '5px', fontSize: '12px',
                    background: active ? '#ffffff' : 'transparent',
                    boxShadow: active ? '0 0.5px 1.5px rgba(0,0,0,0.2)' : undefined,
                    color: active ? LABEL : 'rgba(0,0,0,0.3)',
                    cursor: 'default',
                  }}>{label}</div>
                );
              })}
            </div>
            <div />
          </>
        )}
      </div>

      {viewing && open ? (
        <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
          <img src={open.src} alt={open.alt} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </div>
      ) : (
        <div className="mac-scroll" style={{ flex: 1 }} onClick={(e) => { if (e.target === e.currentTarget) setSelectedIdx(null); }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px' }}>
            {photos.map((photo, i) => (
              <LazyThumb
                key={photo.src}
                thumb={photo.thumb}
                alt={photo.alt}
                selected={selectedIdx === i}
                onClick={() => setSelectedIdx(i)}
                onOpen={() => setOpenIdx(i)}
              />
            ))}
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: LABEL_2, padding: '14px 0 18px' }}>
            {photos.length} Photos
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
