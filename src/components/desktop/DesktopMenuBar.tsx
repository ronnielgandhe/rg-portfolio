import { useDesktop } from './DesktopContext';
import { useState, useEffect, useRef, createContext, useContext } from 'react';
import GitHubHeatmap from './GitHubHeatmap';
import { SYSTEM_FONT, MENU_BAR_HEIGHT, VIBRANCY, ACCENT, chromeTokens, type ChromeTokens } from './chrome';

const ChromeCtx = createContext<{ dark: boolean; c: ChromeTokens }>({ dark: false, c: chromeTokens(false) });
const useChrome = () => useContext(ChromeCtx);
const useInk = () => {
  const { dark } = useChrome();
  return (a: number) => (dark ? `rgba(255,255,255,${Math.min(1, a + 0.08)})` : `rgba(0,0,0,${a})`);
};


/* ── Types ─────────────────────────────────────────── */

interface SpotifyData {
  isPlaying: boolean;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  progressMs: number;
  durationMs: number;
  trackUrl: string;
  fetchedAt: number;
}

interface LocationData {
  city: string;
  region: string;
  country: string;
  lat?: number;
  lon?: number;
}

/* ── Main Component ────────────────────────────────── */

export default function DesktopMenuBar() {
  const { state, dispatch } = useDesktop();
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [spotify, setSpotify] = useState<SpotifyData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
      const parts = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).formatToParts(now);
      const pick = (t: string) => parts.find(x => x.type === t)?.value ?? '';
      setDate(`${pick('weekday')} ${pick('month')} ${pick('day')}`);
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  // Geolocation via IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => setLocation({ city: d.city, region: d.region_code || d.region, country: d.country_name, lat: d.latitude, lon: d.longitude }))
      .catch(() => setLocation({ city: 'Toronto', region: 'ON', country: 'Canada', lat: 43.65, lon: -79.38 }));
  }, []);

  // Spotify polling
  useEffect(() => {
    const poll = () => {
      fetch('/api/spotify')
        .then(r => r.json())
        .then(d => {
          if (d.title) {
            setSpotify({ ...d, fetchedAt: Date.now() });
          } else {
            setSpotify(null);
          }
        })
        .catch(() => {});
    };
    poll();
    const id = setInterval(poll, 15_000);
    return () => clearInterval(id);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const toggle = (id: string) => { setActiveMenu(p => p === id ? null : id); };
  const hover = (id: string) => { if (activeMenu !== null) setActiveMenu(id); };
  const close = () => setActiveMenu(null);

  const hasFocused = !!state.focusedWindowId;
  const chrome = chromeTokens(state.dark);
  const panelStyle = makePanelStyle(chrome);

  return (
    <ChromeCtx.Provider value={{ dark: state.dark, c: chrome }}>
    <div ref={barRef} className="desktop-menu-bar" style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: `${MENU_BAR_HEIGHT}px`, zIndex: 10010,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px 0 12px',
      background: state.dark ? 'rgba(18, 18, 22, 0.46)' : 'rgba(22, 22, 28, 0.26)',
      backdropFilter: 'saturate(180%) blur(30px)', WebkitBackdropFilter: 'saturate(180%) blur(30px)',
      boxShadow: '0 0.5px 0 rgba(0,0,0,0.18)',
      fontFamily: SYSTEM_FONT,
      fontSize: '13px', color: '#FFFFFF', userSelect: 'none',
      textShadow: '0 0 1px rgba(0,0,0,0.25)',
    }}>
      {/* ── Left: Logo + Menus ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {/* Apple-menu-style RG logo dropdown */}
        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <div
            onMouseDown={() => toggle('apple')}
            onMouseEnter={() => hover('apple')}
            style={{
              ...barItem, padding: '0 9px 0 7px', borderRadius: '5px', height: '22px',
              background: activeMenu === 'apple' ? 'rgba(255,255,255,0.22)' : 'transparent',
            }}
          >
            <img src="/icons/rglogo.png" alt="RG" style={{ height: '17px', opacity: 1, filter: 'brightness(0) saturate(0) invert(1)' }} />
          </div>
          {activeMenu === 'apple' && (
            <div style={{ ...panelStyle, left: 0, minWidth: '250px' }}>
              <DropItem label="About Ronniel Gandhe" onClick={() => { dispatch({ type: 'OPEN_WINDOW', id: 'terminal' }); close(); }} />
              <DropDivider />
              <DropItem label={state.dark ? 'Use Light Appearance' : 'Use Dark Appearance'} onClick={() => { dispatch({ type: 'TOGGLE_APPEARANCE' }); close(); }} />
              <DropItem label="Spotlight Search" shortcut="⌘K" onClick={() => { dispatch({ type: 'SET_SPOTLIGHT', open: true }); close(); }} />
              <DropDivider />
              <DropItem label="Force Quit…" shortcut="⌥⌘⎋" onClick={() => {
                Object.keys(state.windows).forEach(id => dispatch({ type: 'CLOSE_WINDOW', id: id as any }));
                close();
              }} />
              <DropDivider />
              <DropItem label="Sleep" disabled />
              <DropItem label="Restart…" disabled />
              <DropItem label="Shut Down…" disabled />
              <DropDivider />
              <DropItem label="Lock Screen" shortcut="⌃⌘Q" onClick={() => { dispatch({ type: 'LOCK_SCREEN' }); close(); }} />
              <DropItem label="Log Out Ronniel Gandhe…" shortcut="⇧⌘Q" onClick={() => { window.location.reload(); }} />
            </div>
          )}
        </div>

        {!isMobile && <div style={{ ...barItem, fontWeight: 700, padding: '0 10px 0 4px' }}>Ronniel Gandhe</div>}

        <div
          onMouseDown={() => {
            const termWin = state.windows.terminal;
            if (termWin?.isFullscreen) {
              dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
              setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'education' }), 150);
            } else {
              dispatch({ type: 'OPEN_WINDOW', id: 'education' });
            }
            close();
          }}
          onMouseEnter={() => hover('_edu')}
          style={{ ...barItem, padding: '0 10px' }}
        >Education</div>

        <div
          onMouseDown={() => {
            const termWin = state.windows.terminal;
            if (termWin?.isFullscreen) {
              dispatch({ type: 'TOGGLE_FULLSCREEN', id: 'terminal' });
              setTimeout(() => dispatch({ type: 'OPEN_WINDOW', id: 'experience' }), 150);
            } else {
              dispatch({ type: 'OPEN_WINDOW', id: 'experience' });
            }
            close();
          }}
          onMouseEnter={() => hover('_exp')}
          style={{ ...barItem, padding: '0 10px' }}
        >Experience</div>

        <div
          onMouseDown={() => window.open('/Ronniel_Gandhe_Resume.pdf', '_blank')}
          onMouseEnter={() => hover('_resume')}
          style={{ ...barItem, padding: '0 10px' }}
        >Resume</div>

        {!isMobile && (
          <BarDropdown label="Window" id="window" active={activeMenu} toggle={toggle} hover={hover}>
            <DropItem label="Minimize" shortcut="⌘M" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'MINIMIZE_WINDOW', id: state.focusedWindowId }); close(); }} />
            <DropItem label="Zoom" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'TOGGLE_FULLSCREEN', id: state.focusedWindowId }); close(); }} />
            <DropDivider />
            <DropItem label="Close Window" shortcut="⌘W" disabled={!hasFocused}
              onClick={() => { if (state.focusedWindowId) dispatch({ type: 'REQUEST_CLOSE', id: state.focusedWindowId }); close(); }} />
            <DropDivider />
            <DropItem label="Bring All to Front" onClick={close} />
          </BarDropdown>
        )}
      </div>

      {/* ── Right: System Tray ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1px', height: '100%' }}>
        <TrayDropdown id="sound" active={activeMenu} toggle={toggle} icon={<SpeakerIcon />} align="right" panelStyle={panelStyle}>
          <SoundPanel spotify={spotify} />
        </TrayDropdown>

        <div style={{ padding: '0 7px', display: 'flex', alignItems: 'center' }}><BatteryIcon /></div>

        <TrayDropdown id="wifi" active={activeMenu} toggle={toggle} icon={<WifiIcon />} align="right" panelStyle={panelStyle}>
          <WifiPanel location={location} onOpenSettings={() => { dispatch({ type: 'OPEN_WINDOW', id: 'wifi-settings' }); close(); }} />
        </TrayDropdown>

        {!isMobile && (
          <div
            onClick={() => { close(); dispatch({ type: 'SET_SPOTLIGHT', open: !state.spotlightOpen }); }}
            aria-label="Spotlight Search"
            style={{
              height: '22px', padding: '0 7px', borderRadius: '5px', display: 'flex', alignItems: 'center',
              background: state.spotlightOpen ? 'rgba(255,255,255,0.22)' : 'transparent',
            }}
          ><SpotlightIcon /></div>
        )}

        {!isMobile && (
          <TrayDropdown id="control" active={activeMenu} toggle={toggle} icon={<ControlCenterIcon />} align="right" panelStyle={panelStyle}>
            <ControlCenterPanel
              dark={state.dark}
              onToggleDark={() => dispatch({ type: 'TOGGLE_APPEARANCE' })}
              location={location}
              spotify={spotify}
            />
          </TrayDropdown>
        )}

        <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
          <span
            onMouseDown={(e) => { e.stopPropagation(); toggle('notif'); }}
            style={{
              fontSize: '13px',
              color: '#FFFFFF',
              fontWeight: 400,
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 8px',
              borderRadius: '5px',
              cursor: 'default',
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'pre',
              background: activeMenu === 'notif' ? 'rgba(255,255,255,0.22)' : 'transparent',
            }}
          >
            {isMobile ? time : `${date}  ${time}`}
          </span>
          {activeMenu === 'notif' && (
            <div style={{ ...panelStyle, right: 0, borderRadius: '14px', padding: 0 }}>
              <div style={{ padding: '12px 14px', minWidth: '330px' }}>
                <GitHubHeatmap tone={state.dark ? 'dark' : 'light'} placeholder />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </ChromeCtx.Provider>
  );
}

/* ── Shared styles ─────────────────────────────────── */

const barItem: React.CSSProperties = {
  display: 'flex', alignItems: 'center', height: '100%',
  padding: '0 10px', cursor: 'default', fontSize: '13px',
};

function makePanelStyle(c: ChromeTokens): React.CSSProperties {
  return {
    position: 'absolute', top: `${MENU_BAR_HEIGHT - 1}px`, minWidth: '220px', padding: '5px 0',
    background: c.panelBg,
    backdropFilter: VIBRANCY, WebkitBackdropFilter: VIBRANCY,
    borderRadius: '8px', border: c.panelBorder,
    boxShadow: c.panelShadow,
    zIndex: 10011,
    color: c.text,
    textShadow: 'none',
    fontFamily: SYSTEM_FONT,
  };
}

/* ── Menu bar dropdown wrapper ─────────────────────── */

function BarDropdown({ label, id, active, toggle, hover, children }: {
  label: string; id: string; active: string | null;
  toggle: (id: string) => void; hover: (id: string) => void;
  children: React.ReactNode;
}) {
  const { c } = useChrome();
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onMouseDown={() => toggle(id)}
        onMouseEnter={() => hover(id)}
        style={{
          ...barItem, borderRadius: '5px', height: '22px',
          background: open ? 'rgba(255,255,255,0.22)' : 'transparent',
        }}
      >{label}</div>
      {open && <div style={{ ...makePanelStyle(c), left: 0 }}>{children}</div>}
    </div>
  );
}

/* ── System tray icon dropdown ─────────────────────── */

function TrayDropdown({ id, active, toggle, icon, children, align, panelStyle }: {
  id: string; active: string | null;
  toggle: (id: string) => void;
  icon: React.ReactNode; children: React.ReactNode; align?: 'left' | 'right'; panelStyle: React.CSSProperties;
}) {
  const open = active === id;
  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
      <div
        onClick={() => toggle(id)}
        style={{
          height: '22px', padding: '0 7px', borderRadius: '5px', cursor: 'default',
          background: open ? 'rgba(255,255,255,0.22)' : 'transparent',
          display: 'flex', alignItems: 'center',
        }}
      >{icon}</div>
      {open && <div style={{ ...panelStyle, ...(align === 'right' ? { right: 0 } : { left: 0 }), borderRadius: '12px' }}>{children}</div>}
    </div>
  );
}

/* ── Dropdown menu items ───────────────────────────── */

function DropItem({ label, shortcut, onClick, disabled }: {
  label: string; shortcut?: string; onClick?: () => void; disabled?: boolean;
}) {
  const { c } = useChrome();
  const [hovered, setHovered] = useState(false);
  const active = hovered && !disabled;
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        height: '22px', padding: '0 9px', margin: '0 5px', borderRadius: '4px',
        fontSize: '13px', cursor: 'default', whiteSpace: 'nowrap',
        color: disabled ? c.textDisabled : active ? '#fff' : c.text,
        background: active ? ACCENT : 'transparent',
      }}
    >
      <span>{label}</span>
      {shortcut && (
        <span style={{
          color: disabled ? c.textDisabled : active ? 'rgba(255,255,255,0.9)' : c.textTertiary,
          fontSize: '13px', marginLeft: '28px', letterSpacing: '0.04em',
        }}>{shortcut}</span>
      )}
    </div>
  );
}

function DropDivider() {
  const { c } = useChrome();
  return <div style={{ height: '1px', background: c.separator, margin: '5px 14px' }} />;
}

/* ── WiFi Panel ────────────────────────────────────── */

function WifiPanel({ location, onOpenSettings }: { location: LocationData | null; onOpenSettings: () => void }) {
  const ink = useInk();
  return (
    <div style={{ padding: '4px 0', minWidth: '280px' }}>
      {/* Wi-Fi header with blue toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 10px' }}>
        <span style={{ fontWeight: 700, fontSize: '13px', color: ink(0.85) }}>Wi-Fi</span>
        <div style={{ width: '38px', height: '22px', borderRadius: '11px', background: '#007aff', position: 'relative', cursor: 'default' }}>
          <div style={{
            width: '18px', height: '18px', borderRadius: '50%', background: 'white',
            position: 'absolute', top: '2px', right: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      <DropDivider />

      {/* Known Network - Connected */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: ink(0.4), letterSpacing: '0.02em' }}>Known Network</span>
      </div>

      <div style={{ padding: '4px 14px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Blue wifi icon */}
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: '#007aff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
              <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
              <path d="M5.17 7.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: ink(0.85), flex: 1 }}>Ronniel's Network</span>
          {/* Lock icon */}
          <svg width="12" height="14" viewBox="0 0 12 16" fill="none" style={{ opacity: 0.35, flexShrink: 0 }}>
            <rect x="1" y="7" width="10" height="8" rx="2" fill={ink(0.65)} />
            <path d="M3 7V5a3 3 0 016 0v2" stroke={ink(0.65)} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      </div>

      {location && (
        <div style={{ padding: '2px 14px 6px', paddingLeft: '52px' }}>
          <span style={{ fontSize: '11px', color: ink(0.35) }}>
            Connected from {location.city}, {location.region}
          </span>
        </div>
      )}

      <DropDivider />

      {/* Known Networks - Places visited */}
      <div style={{ padding: '8px 14px 4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: ink(0.4), letterSpacing: '0.02em' }}>Known Networks</span>
      </div>

      {[
        { name: 'New York City', flag: '🗽' },
        { name: 'Palo Alto', flag: '🌉' },
        { name: 'Dubai', flag: '🇦🇪' },
        { name: 'Mumbai, India', flag: '🇮🇳' },
        { name: 'United Kingdom', flag: '🇬🇧' },
      ].map((place) => (
        <div key={place.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '3px 14px' }}>
          <span style={{ fontSize: '14px', width: '20px', textAlign: 'center' }}>{place.flag}</span>
          <span style={{ fontSize: '12.5px', color: ink(0.55), flex: 1 }}>{place.name}</span>
          <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.25, flexShrink: 0 }}>
            <path d="M8 12.5a1 1 0 100-2 1 1 0 000 2z" fill={ink(0.5)} />
            <path d="M5.17 9.17a4 4 0 015.66 0" stroke={ink(0.4)} strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M2.93 6.93a7 7 0 0110.14 0" stroke={ink(0.3)} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      ))}

      <div style={{ padding: '4px 0' }} />

      <DropDivider />

      {/* Other Networks */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 14px', cursor: 'default',
      }}>
        <span style={{ fontSize: '13px', color: ink(0.85) }}>Other Networks</span>
        <svg width="8" height="12" viewBox="0 0 8 14" fill="none" style={{ opacity: 0.3 }}>
          <path d="M1 1l6 6-6 6" stroke={ink(0.65)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <DropDivider />

      {/* Wi-Fi Settings */}
      <DropItem label="Wi-Fi Settings..." onClick={onOpenSettings} />
    </div>
  );
}

/* ── Sound / Spotify Panel ─────────────────────────── */

function SoundPanel({ spotify }: { spotify: SpotifyData | null }) {
  const ink = useInk();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!spotify?.isPlaying) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [spotify?.isPlaying, spotify?.fetchedAt]);

  const fmt = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const elapsed = spotify?.isPlaying ? Math.max(0, now - (spotify.fetchedAt || now)) : 0;
  const displayProgress = spotify ? Math.min(spotify.progressMs + elapsed, spotify.durationMs) : 0;
  const pct = spotify ? (displayProgress / spotify.durationMs) * 100 : 0;

  return (
    <div style={{ padding: '8px 0', minWidth: '290px' }}>
      <div style={{ padding: '0 14px 6px', fontSize: '11px', color: ink(0.4), fontWeight: 600, letterSpacing: '0.05em' }}>
        NOW PLAYING
      </div>

      {spotify ? (
        <>
          <a
            href={spotify.trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', gap: '12px', padding: '6px 14px 12px', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
          >
            <img src={spotify.albumArt} alt="" style={{
              width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0,
            }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '13px', fontWeight: 600, color: ink(0.85),
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spotify.title}
              </div>
              <div style={{
                fontSize: '12px', color: ink(0.5), marginTop: '2px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {spotify.artist}
              </div>
              <div style={{ fontSize: '11px', color: ink(0.35), marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#1DB954">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Spotify</span>
              </div>
            </div>
          </a>

          <div style={{ padding: '0 14px 6px' }}>
            <div style={{ height: '3px', borderRadius: '2px', background: ink(0.1), overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: ink(0.45), borderRadius: '2px', transition: 'width 1s linear' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: ink(0.35), marginTop: '4px' }}>
              <span>{fmt(displayProgress)}</span>
              <span>{fmt(spotify.durationMs)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '4px 14px 4px', alignItems: 'center' }}>
            <CtrlBtn>
              <svg width="14" height="14" viewBox="0 0 16 16" fill={ink(0.55)}>
                <path d="M3.5 3h1.5v10H3.5V3zM13 8L6.5 13V3L13 8z" />
              </svg>
            </CtrlBtn>
            <CtrlBtn size={34}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill={ink(0.75)}>
                {spotify.isPlaying
                  ? <path d="M4.5 2.5h2.5v11H4.5v-11zm4.5 0h2.5v11H9v-11z" />
                  : <path d="M4.5 2L13 8l-8.5 6V2z" />
                }
              </svg>
            </CtrlBtn>
            <CtrlBtn>
              <svg width="14" height="14" viewBox="0 0 16 16" fill={ink(0.55)}>
                <path d="M11 3h1.5v10H11V3zM3 8l6.5-5v10L3 8z" />
              </svg>
            </CtrlBtn>
          </div>
        </>
      ) : (
        <div style={{ padding: '16px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '6px', opacity: 0.4 }}>♪</div>
          <div style={{ fontSize: '13px', color: ink(0.35) }}>Not Playing</div>
        </div>
      )}

      <DropDivider />

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px' }}>
        <svg width="12" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill={ink(0.55)} />
        </svg>
        <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: ink(0.1), position: 'relative' }}>
          <div style={{ height: '100%', width: '70%', background: ink(0.35), borderRadius: '2px' }} />
          <div style={{
            position: 'absolute', top: '-4px', left: '70%', transform: 'translateX(-50%)',
            width: '10px', height: '10px', borderRadius: '50%', background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </div>
        <svg width="14" height="10" viewBox="0 0 16 14" fill="none" style={{ opacity: 0.45, flexShrink: 0 }}>
          <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill={ink(0.55)} />
          <path d="M11 4.5a3.5 3.5 0 010 5" stroke={ink(0.4)} strokeWidth="1.1" strokeLinecap="round" fill="none" />
          <path d="M13 2.5a6.5 6.5 0 010 9" stroke={ink(0.25)} strokeWidth="1.1" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    </div>
  );
}

function CtrlBtn({ children, size = 26 }: { children: React.ReactNode; size?: number }) {
  const [h, setH] = useState(false);
  const ink = useInk();
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: `${size}px`, height: `${size}px`, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: h ? ink(0.06) : 'transparent',
        cursor: 'default', transition: 'background 0.15s',
      }}
    >{children}</div>
  );
}

/* ── Control Center ────────────────────────────── */

function ControlCenterPanel({ dark, onToggleDark, location, spotify }: {
  dark: boolean; onToggleDark: () => void; location: LocationData | null; spotify: SpotifyData | null;
}) {
  const { c } = useChrome();
  const tile: React.CSSProperties = {
    background: c.tile, borderRadius: '12px', padding: '10px 12px',
    boxShadow: dark ? 'inset 0 0 0 0.5px rgba(255,255,255,0.1)' : '0 0 0 0.5px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.06)',
    display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0,
  };
  const badge = (on: boolean): React.CSSProperties => ({
    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
    background: on ? ACCENT : c.hover,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  const title: React.CSSProperties = { fontSize: '13px', fontWeight: 600, color: c.text, lineHeight: '16px' };
  const sub: React.CSSProperties = { fontSize: '11px', color: c.textSecondary, lineHeight: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  return (
    <div style={{ padding: '6px 10px', width: '310px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      <div style={tile}>
        <div style={badge(true)}>
          <svg width="14" height="10" viewBox="0 0 16 12" fill="none">
            <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="white" />
            <path d="M5.17 7.17a4 4 0 015.66 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={title}>Wi-Fi</div>
          <div style={sub}>{location?.city || "Ronniel's Network"}</div>
        </div>
      </div>
      <div style={{ ...tile, cursor: 'default' }} onClick={onToggleDark} role="button" aria-label="Toggle dark mode">
        <div style={badge(dark)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={dark ? 'white' : c.text}>
            <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 2v16a8 8 0 010-16z" />
          </svg>
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={title}>Dark Mode</div>
          <div style={sub}>{dark ? 'On' : 'Off'}</div>
        </div>
      </div>
      <div style={{ ...tile, gridColumn: '1 / -1' }}>
        {spotify?.albumArt
          ? <img src={spotify.albumArt} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ ...badge(false), borderRadius: '6px', width: '32px', height: '32px', color: c.textSecondary, fontSize: '15px' }}>♪</div>}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...title, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{spotify?.title || 'Not Playing'}</div>
          <div style={sub}>{spotify?.artist || 'Spotify'}</div>
        </div>
      </div>
    </div>
  );
}

/* ── System Tray Icons ─────────────────────────────── */

function BatteryIcon() {
  return (
    <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="3.2" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
      <rect x="2" y="2" width="18" height="8" rx="1.9" fill="#FFFFFF" />
      <path d="M23 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path d="M8 10.5a1 1 0 100-2 1 1 0 000 2z" fill="#FFFFFF" />
      <path d="M5.17 7.17a4 4 0 015.66 0" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M2.93 4.93a7 7 0 0110.14 0" stroke="#FFFFFF" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
      <path d="M2 5h2l4-3v10l-4-3H2a1 1 0 01-1-1V6a1 1 0 011-1z" fill="#FFFFFF" />
      <path d="M11 4.5a3.5 3.5 0 010 5" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" />
      <path d="M13 2.5a6.5 6.5 0 010 9" stroke="#FFFFFF" strokeWidth="1.1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function SpotlightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="5.8" cy="5.8" r="4.3" stroke="#FFFFFF" strokeWidth="1.4" />
      <path d="M9.1 9.1l3.4 3.4" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ControlCenterIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 15 13" fill="none">
      <rect x="0.7" y="0.7" width="13.6" height="4.9" rx="2.45" stroke="#FFFFFF" strokeWidth="1.2" />
      <circle cx="3.6" cy="3.15" r="1.35" fill="#FFFFFF" />
      <rect x="0.5" y="7.2" width="14" height="5.3" rx="2.65" fill="#FFFFFF" />
      <circle cx="11.4" cy="9.85" r="1.45" fill="rgba(0,0,0,0.55)" />
    </svg>
  );
}
