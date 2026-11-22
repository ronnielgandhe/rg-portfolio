import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SYS_FONT, ACCENT, LABEL, LABEL_2, LABEL_3, SEPARATOR, Icon, MacStyles } from './mac';
import { FINDER_ITEMS, SECTION_LABELS } from './finderData';
import type { FinderItem, FinderSection } from './finderData';

const SIDEBAR_W = 180;
const LIST_W = 330;
const SECTIONS: { id: FinderSection; icon: (p: { size?: number; color?: string }) => ReactNode }[] = [
  { id: 'experience', icon: Icon.Briefcase },
  { id: 'education', icon: Icon.GradCap },
  { id: 'certifications', icon: Icon.Seal },
];

const itemsFor = (section: FinderSection) =>
  FINDER_ITEMS.filter(i => i.section === section).sort((a, b) => b.sortKey.localeCompare(a.sortKey));

function Tile({ item, size }: { item: FinderItem; size: number }) {
  const radius = Math.round(size * 0.22);
  return (
    <div style={{
      width: size, height: size, flex: `0 0 ${size}px`, borderRadius: radius, background: '#ffffff',
      border: '1px solid rgba(0,0,0,0.08)', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <img src={item.icon} alt="" style={{
        width: '76%', height: '76%', objectFit: 'contain', display: 'block',
        filter: item.iconInvert ? 'invert(1)' : undefined,
      }} />
    </div>
  );
}

function NavBtn({ children, disabled, onClick, label }: { children: ReactNode; disabled: boolean; onClick: () => void; label: string }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      title={label}
      aria-label={label}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,0,0,0.6)', opacity: disabled ? 0.25 : 1,
        background: hover && !disabled ? 'rgba(0,0,0,0.06)' : 'transparent', cursor: 'default',
      }}
    >
      {children}
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <div style={{ fontSize: '13px', fontWeight: 600, color: LABEL_2, margin: '18px 0 6px' }}>{children}</div>;
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '18px' }}>
      {items.map((t, i) => <li key={i} style={{ marginBottom: '6px' }}>{t}</li>)}
    </ul>
  );
}

function InfoGrid({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '10px', rowGap: '3px', fontSize: '11px', marginTop: '12px' }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'contents' }}>
          <span style={{ color: LABEL_2, textAlign: 'right' }}>{k}</span>
          <span style={{ color: LABEL }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function DocRow({ title, url, note }: { title: string; url: string; note?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '6px',
      border: `0.5px solid ${SEPARATOR}`, textDecoration: 'none', color: LABEL, marginBottom: '6px',
    }}>
      <Icon.Doc size={20} color="rgba(0,0,0,0.5)" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block' }}>{title}</span>
        {note && <span style={{ display: 'block', fontSize: '11px', color: LABEL_2 }}>{note}</span>}
      </span>
      <span style={{ fontSize: '11px', color: LABEL_2 }}>PDF</span>
    </a>
  );
}

function Preview({ item }: { item: FinderItem }) {
  const info: [string, ReactNode][] = [];
  if (item.section === 'experience') info.push(['Company', item.subtitle]);
  if (item.section === 'certifications') info.push(['Issuer', item.subtitle]);
  info.push(['Dates', item.date]);
  if (item.location) info.push(['Location', item.location]);
  if (item.credentialId) info.push(['Credential ID', item.credentialId]);

  return (
    <div style={{ padding: '18px 20px 28px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Tile item={item} size={48} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: LABEL, lineHeight: 1.25 }}>{item.title}</div>
          {item.section === 'education' && <div style={{ fontSize: '11px', color: LABEL_2, marginTop: '2px' }}>{item.subtitle}</div>}
        </div>
      </div>
      <InfoGrid rows={info} />

      {item.summary && <p style={{ margin: '14px 0 0' }}>{item.summary}</p>}

      {item.certificateUrl && (
        <div style={{ marginTop: '16px' }}>
          <div style={{
            background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            aspectRatio: '1.29', overflow: 'hidden',
          }}>
            <iframe
              src={`${encodeURI(item.certificateUrl)}#toolbar=0&navpanes=0&view=FitH`}
              title={item.title}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
          <a href={encodeURI(item.certificateUrl)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: ACCENT, textDecoration: 'none' }}>
            Open certificate
          </a>
        </div>
      )}

      {item.highlights && item.highlights.length > 0 && (
        <>
          <Heading>Highlights</Heading>
          {item.highlights.some(h => h.label) ? (
            item.highlights.map((h, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600 }}>{h.label}</div>
                <div>{h.text}</div>
              </div>
            ))
          ) : (
            <Bullets items={item.highlights.map(h => h.text)} />
          )}
        </>
      )}

      {item.courses && item.courses.length > 0 && (
        <>
          <Heading>Courses</Heading>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: '12px', rowGap: '3px' }}>
            {item.courses.map(c => (
              <div key={c.code} style={{ display: 'contents' }}>
                <span style={{ color: LABEL_2, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{c.code}</span>
                <span>{c.name}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {item.activities && item.activities.length > 0 && (<><Heading>Activities</Heading><Bullets items={item.activities} /></>)}
      {item.achievements && item.achievements.length > 0 && (<><Heading>Achievements</Heading><Bullets items={item.achievements} /></>)}

      {item.documents && item.documents.length > 0 && (
        <>
          <Heading>Documents</Heading>
          {item.documents.map(d => <DocRow key={d.url} title={d.title} url={encodeURI(d.url)} />)}
        </>
      )}

      {item.skills && item.skills.length > 0 && (<><Heading>Skills</Heading><div>{item.skills.join(', ')}</div></>)}
      {item.tech && item.tech.length > 0 && (<><Heading>Tech</Heading><div>{item.tech.join(', ')}</div></>)}

      {item.reflection && (
        <>
          <Heading>Reflection</Heading>
          {item.reflection.split('\n\n').map((p, i) => <p key={i} style={{ margin: i ? '8px 0 0' : 0 }}>{p}</p>)}
        </>
      )}
    </div>
  );
}

const NARROW_W = 640;
const LIGHTS_W = 80;

function useWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1000);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function ListRow({ item, selected, tall, onClick }: { item: FinderItem; selected: boolean; tall?: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: tall ? '10px' : '8px', height: tall ? '44px' : '24px', padding: tall ? '0 12px' : '0 10px 0 6px',
      borderRadius: '6px', background: selected ? ACCENT : 'transparent', color: selected ? '#ffffff' : LABEL, cursor: 'default',
    }}>
      <img src={item.icon} alt="" style={{
        width: tall ? '24px' : '16px', height: tall ? '24px' : '16px', flex: `0 0 ${tall ? 24 : 16}px`, objectFit: 'contain',
        filter: item.iconInvert && !selected ? 'invert(1)' : undefined,
      }} />
      <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: tall ? '15px' : undefined }}>{item.name}</span>
      <span style={{ fontSize: tall ? '13px' : '11px', color: selected ? 'rgba(255,255,255,0.85)' : LABEL_2, whiteSpace: 'nowrap', textAlign: 'right' }}>{item.date}</span>
      {tall && <Icon.ChevronRight size={14} color={selected ? '#ffffff' : LABEL_3} />}
    </div>
  );
}

export default function Finder({ initialSection }: { initialSection: FinderSection }) {
  const [rootRef, width] = useWidth();
  return (
    <div ref={rootRef} style={{ height: '100%', width: '100%' }}>
      <FinderBody initialSection={initialSection} narrow={width < NARROW_W} />
    </div>
  );
}

function FinderBody({ initialSection, narrow }: { initialSection: FinderSection; narrow: boolean }) {
  const reserveLights = typeof window !== 'undefined' && window.innerWidth >= 768;
  const [history, setHistory] = useState<FinderSection[]>([initialSection]);
  const [pos, setPos] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const section = history[pos];
  const items = itemsFor(section);
  const [selected, setSelected] = useState<Record<FinderSection, string>>(() => ({
    experience: itemsFor('experience')[0].id,
    education: itemsFor('education')[0].id,
    certifications: itemsFor('certifications')[0].id,
  }));
  const current = items.find(i => i.id === selected[section]) ?? items[0];
  const select = (id: string) => setSelected(prev => ({ ...prev, [section]: id }));

  const go = (s: FinderSection) => {
    setShowDetail(false);
    if (s === section) return;
    const next = [...history.slice(0, pos + 1), s];
    setHistory(next);
    setPos(next.length - 1);
  };

  const shell = {
    display: 'flex', flexDirection: 'column' as const, height: '100%', background: '#ffffff', overflow: 'hidden',
    fontFamily: SYS_FONT, fontSize: '13px', lineHeight: 1.35, color: LABEL, userSelect: 'none' as const,
  };

  if (narrow) {
    return (
      <div style={shell}>
        <MacStyles />
        <div style={{
          minHeight: '52px', display: 'flex', alignItems: 'center', padding: `8px 12px 8px ${reserveLights ? LIGHTS_W : 12}px`,
          background: '#f6f6f6', borderBottom: `0.5px solid ${SEPARATOR}`, boxSizing: 'border-box',
        }}>
          <div role="tablist" style={{ flex: 1, display: 'flex', background: 'rgba(0,0,0,0.06)', borderRadius: '8px', padding: '2px' }}>
            {SECTIONS.map(s => {
              const active = s.id === section;
              return (
                <button key={s.id} role="tab" aria-selected={active} onClick={() => go(s.id)} style={{
                  flex: 1, height: '30px', border: 'none', borderRadius: '6px', fontFamily: SYS_FONT, fontSize: '13px',
                  background: active ? '#ffffff' : 'transparent', color: LABEL, fontWeight: active ? 600 : 400,
                  boxShadow: active ? '0 0.5px 1.5px rgba(0,0,0,0.2)' : 'none', cursor: 'default', padding: 0,
                }}>{SECTION_LABELS[s.id]}</button>
              );
            })}
          </div>
        </div>
        {showDetail ? (
          <>
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 8px', borderBottom: `0.5px solid ${SEPARATOR}` }}>
              <button onClick={() => setShowDetail(false)} style={{
                display: 'flex', alignItems: 'center', gap: '2px', border: 'none', background: 'none', color: ACCENT,
                fontFamily: SYS_FONT, fontSize: '15px', padding: '6px 4px', cursor: 'default',
              }}>
                <Icon.ChevronLeft size={20} color={ACCENT} />{SECTION_LABELS[section]}
              </button>
            </div>
            <div className="mac-scroll" style={{ flex: 1, userSelect: 'text' }}>
              <Preview key={current.id} item={current} />
            </div>
          </>
        ) : (
          <div className="mac-scroll" style={{ flex: 1, padding: '6px 8px' }}>
            {items.map(item => (
              <ListRow key={item.id} item={item} selected={false} tall onClick={() => { select(item.id); setShowDetail(true); }} />
            ))}
            <div style={{ textAlign: 'center', fontSize: '12px', color: LABEL_2, padding: '12px 0' }}>{items.length} items</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={shell}>
      <MacStyles />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div className="mac-scroll" style={{
          flex: `0 1 ${SIDEBAR_W}px`, minWidth: '140px', background: '#f0f0f0', borderRight: `0.5px solid ${SEPARATOR}`,
          padding: '52px 0 10px', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: LABEL_2, padding: '4px 18px' }}>Ronniel</div>
          {SECTIONS.map(s => {
            const active = s.id === section;
            const SIcon = s.icon;
            return (
              <div key={s.id} onClick={() => go(s.id)} style={{
                display: 'flex', alignItems: 'center', gap: '7px', height: '28px', padding: '0 10px', margin: '0 8px',
                borderRadius: '6px', background: active ? 'rgba(0,0,0,0.08)' : 'transparent', cursor: 'default',
              }}>
                <SIcon size={16} color={ACCENT} />
                <span>{SECTION_LABELS[s.id]}</span>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{
            height: '52px', minHeight: '52px', display: 'flex', alignItems: 'center', gap: '2px', padding: '0 12px',
            background: '#f6f6f6', borderBottom: `0.5px solid ${SEPARATOR}`, boxSizing: 'border-box',
          }}>
            <NavBtn label="Back" disabled={pos === 0} onClick={() => setPos(p => p - 1)}><Icon.ChevronLeft size={18} /></NavBtn>
            <NavBtn label="Forward" disabled={pos >= history.length - 1} onClick={() => setPos(p => p + 1)}><Icon.ChevronRight size={18} /></NavBtn>
            <div style={{ fontSize: '15px', fontWeight: 700, marginLeft: '8px' }}>{SECTION_LABELS[section]}</div>
          </div>

          <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
            <div style={{ flex: `0 1 ${LIST_W}px`, minWidth: '180px', display: 'flex', flexDirection: 'column', borderRight: `0.5px solid ${SEPARATOR}` }}>
              <div style={{
                display: 'flex', height: '24px', alignItems: 'center', padding: '0 18px 0 12px', fontSize: '11px', color: LABEL_2,
                borderBottom: `0.5px solid ${SEPARATOR}`,
              }}>
                <span style={{ flex: 1, paddingLeft: '30px' }}>Name</span>
                <span>Date</span>
              </div>
              <div className="mac-scroll" style={{ flex: 1, padding: '4px 8px' }}>
                {items.map(item => (
                  <ListRow key={item.id} item={item} selected={item.id === current.id} onClick={() => select(item.id)} />
                ))}
              </div>
              <div style={{ height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: LABEL_2, borderTop: `0.5px solid ${SEPARATOR}` }}>
                {items.length} items
              </div>
            </div>

            <div className="mac-scroll" style={{ flex: '1 1 300px', minWidth: 0, userSelect: 'text', hyphens: 'manual' }}>
              <Preview key={current.id} item={current} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
