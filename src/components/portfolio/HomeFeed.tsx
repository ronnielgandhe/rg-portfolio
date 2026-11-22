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
            <a className="site-social" href="https://www.linkedin.com/in/ronniel-gandhe/" target="_blank" rel="noopener noreferrer">Linkedin</a>
            <span className="site-bar">|</span>
            <a className="site-social" href="https://github.com/ronnielgandhe" target="_blank" rel="noopener noreferrer">GitHub</a>
            <span className="site-bar">|</span>
            <a className="site-social" href="mailto:ronnielgandhe@gmail.com">Email</a>
            <span className="site-bar">|</span>
            <a className="site-social" href="/Ronniel_Gandhe_Resume.pdf" target="_blank" rel="noopener noreferrer">Resume</a>
          </div>
        </section>
      </div>
    </div>
  );
}
