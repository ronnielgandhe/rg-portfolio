import { useEffect, useRef, useState } from 'react';
import SiteNav, { useSiteTheme } from './SiteNav';
import Socials from './home/Socials';
import { Contact, Projects, Work, Writing } from './home/Sections';
import Peel, { PEEL_CSS } from './home/Peel';
import SideIndex from './home/SideIndex';
import { jumpTo, useReveal } from './home/motion';
import { HOME_CSS } from './home/styles';

function useLocalTime() {
  const fmt = () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' }).format(new Date()).toLowerCase();
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    setTime(fmt());
    const id = setInterval(() => setTime(fmt()), 20_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function Ico({ src, darkSrc, invertOnLight }: { src: string; darkSrc?: string; invertOnLight?: boolean }) {
  if (darkSrc) {
    return (
      <>
        <img src={src} alt="" className="site-ico site-ico-l" />
        <img src={darkSrc} alt="" className="site-ico site-ico-d" />
      </>
    );
  }
  return <img src={src} alt="" className={invertOnLight ? 'site-ico site-ico-inv' : 'site-ico'} />;
}

export default function HomeFeed() {
  const { dark, toggle } = useSiteTheme();
  const time = useLocalTime();
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);

  return (
    <div className={`site ${dark ? 'site-dark' : ''}`}>
      <SiteNav dark={dark} onToggleTheme={toggle} />

      <div ref={root} className="hm" onClick={jumpTo}>
        <style>{HOME_CSS + PEEL_CSS}</style>
        <SideIndex />
        <div className="site-col">
          <section id="intro" className="hm-sec hm-intro">
            <div className="site-meta"><span>san francisco</span><span>·</span><span suppressHydrationWarning>{time}</span></div>
            <section>
              <h1 className="site-h1">hey, i'm ronniel.</h1>
              <p className="site-p" style={{ lineHeight: '24px' }}>software engineer in san francisco.</p>
            </section>
            <section className="site-body">
              <p className="site-p">
                currently, i'm a software engineer at{' '}
                <a className="site-link" href="/bluejay">
                  <Ico src="/bluejay-mark-black.svg" darkSrc="/bluejay-mark-white.svg" />Bluejay (YC X25)
                </a>
                , working on voice agent simulation, evals and observability.
              </p>
              <p className="site-p">
                before that, i did growth and software engineering at{' '}
                <a className="site-link" href="/augmentor-labs">
                  <Ico src="/augmentor-dark.svg" invertOnLight />Augmentor Labs
                </a>
                {' '}and data science at{' '}
                <span style={{ whiteSpace: 'nowrap' }}><Ico src="/cibc-dark.svg" />CIBC</span>
                . i studied cs at{' '}
                <a className="site-link" href="/school">
                  <Ico src="/waterloo-logo.png" />Waterloo
                </a>
                {' '}and business at{' '}
                <a className="site-link" href="/school">
                  <Ico src="/laurier-seal.png" />Laurier
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
              <div className="hm-reach">
                <a className="hm-btn" href="#contact">book a call</a>
                <Socials />
              </div>
            </section>
          </section>
          <Work />
          <Projects />
          <Writing />
          <Contact />
        </div>
        <Peel />
      </div>
    </div>
  );
}
