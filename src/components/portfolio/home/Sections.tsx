import type { CSSProperties, ReactNode } from 'react';
import WorkSlot from './WorkSlot';
import ProjectsSlot from './ProjectsSlot';
import DesktopFrame from './DesktopFrame';
import Book from './Book';
import { CALENDLY, DESKTOP_LINE, EMAIL, POSTS, formatDate } from './data';

const d = (i: number) => ({ '--i': i }) as CSSProperties;

function Sec({ id, label, wide, children }: { id: string; label: string; wide?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={wide ? 'hm-sec hm-sec-wide' : 'hm-sec'}>
      <h2 className="hm-label" data-reveal>{label}</h2>
      {children}
    </section>
  );
}

export function Work() {
  return <Sec id="work" label="work"><WorkSlot /></Sec>;
}

export function Projects() {
  return (
    <Sec id="projects" label="projects" wide>
      <div className="hm-wide"><ProjectsSlot /></div>
    </Sec>
  );
}

export function Writing() {
  return (
    <Sec id="writing" label="writing">
      <div className="hm-posts">
        {POSTS.map((p, i) => (
          <a key={p.slug} href={`/writing/${p.slug}`} className="hm-post" data-reveal style={d(i)}>
            <span className="hm-post-t">{p.title}</span>
            <span className="hm-post-m">{formatDate(p.date)}</span>
          </a>
        ))}
      </div>
    </Sec>
  );
}

export function Desktop() {
  return (
    <Sec id="desktop" label="desktop">
      <p className="site-p hm-line" data-reveal>{DESKTOP_LINE}.</p>
      <DesktopFrame />
    </Sec>
  );
}

export function Contact() {
  return (
    <Sec id="contact" label="contact">
      <p className="site-p hm-line" data-reveal>if any of it was interesting, i'm easy to reach.</p>
      <Book />
      <p className="hm-alt" data-reveal>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer">or open calendly</a>
        <span aria-hidden="true">·</span>
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
    </Sec>
  );
}

export function Footer() {
  return (
    <footer className="hm-foot">
      <span>ronniel gandhe, san francisco</span>
      <a href="#top">back to top</a>
    </footer>
  );
}
