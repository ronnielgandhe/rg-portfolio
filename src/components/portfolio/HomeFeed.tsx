import { useEffect, useState } from 'react';
import SiteNav, { useSiteTheme } from './SiteNav';

function useLocalTime() {
  const fmt = () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).format(new Date()).toLowerCase();
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 20_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export function Ico({ src, darkSrc, dark, invertOnLight }: { src: string; darkSrc?: string; dark: boolean; invertOnLight?: boolean }) {
  return (
    <img
      src={dark && darkSrc ? darkSrc : src}
      alt=""
      className="site-ico"
      style={{ filter: invertOnLight && !dark ? 'invert(1)' : undefined }}
    />
  );
}

export default function HomeFeed() {
  const { dark, toggle } = useSiteTheme();
  const time = useLocalTime();

  return (
    <div className={`site ${dark ? 'site-dark' : ''}`}>
      <SiteNav dark={dark} onToggleTheme={toggle} />

      <div className="site-col site-enter">
        <div className="site-meta"><span>san francisco</span><span>·</span><span>{time}</span></div>
        <section>
          <h1 className="site-h1">hey, i'm ronniel.</h1>
          <p className="site-p" style={{ lineHeight: '24px' }}>software engineer in san francisco.</p>
        </section>
        <section className="site-body">
          <p className="site-p">
            currently, i'm a software engineer at{' '}
            <a className="site-link" href="/bluejay">
              <Ico src="/bluejay-mark-black.svg" darkSrc="/bluejay-mark-white.svg" dark={dark} />Bluejay (YC X25)
            </a>
            , working on voice agent simulation, evals and observability.
          </p>
          <p className="site-p">
            before that, i did growth and software engineering at{' '}
            <a className="site-link" href="/augmentor-labs">
              <Ico src="/augmentor-dark.svg" dark={dark} invertOnLight />Augmentor Labs
            </a>
            {' '}and data science at{' '}
            <span style={{ whiteSpace: 'nowrap' }}><Ico src="/cibc-dark.svg" dark={dark} />CIBC</span>
            . i studied cs at{' '}
            <a className="site-link" href="/school">
              <Ico src="/waterloo-logo.png" dark={dark} />Waterloo
            </a>
            {' '}and business at{' '}
            <a className="site-link" href="/school">
              <Ico src="/laurier-seal.png" dark={dark} />Laurier
            </a>
            .
          </p>
          <p className="site-p">
            outside of work, you'll find me{' '}
            <a className="site-link" href="/projects">building small tools</a>
            {' '}and{' '}
            <a className="site-link" href="/writing">writing</a>
            .
          </p>
          <div className="site-socials">
            <a className="site-social" href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" /></svg>
              Linkedin
            </a>
            <span className="site-bar">|</span>
            <a className="site-social" href="https://github.com/ronnielgandhe" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.2 11.39.6.1.83-.26.83-.57 0-.29-.01-1.23-.02-2.24-3.01.56-3.79-.73-4.03-1.41-.14-.35-.72-1.41-1.23-1.7-.42-.22-1.02-.78-.02-.79.95-.02 1.62.87 1.85 1.23 1.08 1.81 2.8 1.3 3.49.99.1-.78.42-1.3.77-1.6-2.67-.3-5.46-1.34-5.46-5.93 0-1.3.47-2.38 1.23-3.22-.12-.3-.54-1.53.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.23 1.9 1.23 3.22 0 4.6-2.8 5.63-5.47 5.93.43.37.81 1.1.81 2.22 0 1.6-.02 2.9-.02 3.3 0 .31.23.69.83.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
              GitHub
            </a>
            <span className="site-bar">|</span>
            <a className="site-social" href="mailto:ronnielgandhe@gmail.com">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
              Email
            </a>
            <span className="site-bar">|</span>
            <a className="site-social" href="/Ronniel_Gandhe_Resume.pdf" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8M16 17H8" /></svg>
              Resume
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
