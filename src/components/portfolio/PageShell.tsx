import { createContext, useContext } from 'react';
import SiteNav, { useSiteTheme } from './SiteNav';


/* Theme context */
const ThemeCtx = createContext<{ dark: boolean; toggle: () => void }>({ dark: false, toggle: () => {} });
export { ThemeCtx };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { dark, toggle } = useSiteTheme();
  return <ThemeCtx.Provider value={{ dark, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

export function themeColors(dark: boolean) {
  return {
    bg: dark ? '#0a0a0a' : '#ffffff',
    text: dark ? 'rgb(150, 150, 150)' : 'rgb(112, 112, 112)',
    textStrong: dark ? 'rgb(237, 237, 237)' : 'rgb(38, 38, 38)',
    textMuted: dark ? 'rgba(150, 150, 150, 0.7)' : 'rgba(112, 112, 112, 0.7)',
    diamond: dark ? 'rgb(237, 237, 237)' : 'rgb(38, 38, 38)',
    border: dark ? 'rgba(150, 150, 150, 0.16)' : 'rgba(112, 112, 112, 0.14)',
    cardBg: dark ? '#141414' : '#fafafa',
    footerLine: dark ? 'rgba(150, 150, 150, 0.16)' : 'rgba(112, 112, 112, 0.14)',
    dotGrid: 'none',
  };
}

/* Styled link with sweep underline */
export function SLink({
  href, children, icon, external = true,
}: {
  href: string; children: React.ReactNode; icon?: string; external?: boolean;
}) {
  const { dark } = useTheme();
  const fg = dark ? 'rgb(237, 237, 237)' : 'rgb(38, 38, 38)';
  const ul = dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="rg-slink"
      style={{ color: fg, '--ul': ul, '--fg-hover': fg } as React.CSSProperties}
    >
      {icon && (
        <img src={icon} alt="" style={{
          width: 14, height: 14, objectFit: 'contain', display: 'inline-block',
          verticalAlign: 'middle', position: 'relative', top: -1, marginRight: 4, borderRadius: 2,
        }} />
      )}
      {children}
    </a>
  );
}

export default function PageShell({ activePage, crumb, back, wide, children }: { activePage: string; crumb?: string; back?: { href: string; label: string }; wide?: boolean; children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PageShellInner activePage={activePage} crumb={crumb} back={back} wide={wide}>{children}</PageShellInner>
    </ThemeProvider>
  );
}

function PageShellInner({ activePage, crumb, back, wide, children }: { activePage: string; crumb?: string; back?: { href: string; label: string }; wide?: boolean; children: React.ReactNode }) {
  const { dark, toggle } = useTheme();
  return (
    <div className={`site ${dark ? 'site-dark' : ''}`}>
      <SiteNav active={activePage} crumb={crumb} back={back ?? (activePage === 'about' || !activePage ? undefined : { href: '/', label: 'home' })} dark={dark} onToggleTheme={toggle} />
      {wide ? <div style={{ margin: '0 auto', width: '100%', maxWidth: 1152 }}>{children}</div> : <div className="site-col site-enter">{children}</div>}
      <style>{`
        .rg-slink { text-decoration: none; font-weight: 500; position: relative; transition: color 0.2s; }
        .rg-slink::after {
          content: ''; position: absolute; left: 0; bottom: -1px;
          width: 100%; height: 1px; background: var(--ul);
        }
        .rg-slink:hover { color: var(--fg-hover); }
      `}</style>
    </div>
  );
}
