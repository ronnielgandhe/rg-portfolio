import type { ReactNode } from 'react';
import WorkSlot from './WorkSlot';
import ProjectsSlot from './ProjectsSlot';
import Book from './Book';
import { EMAIL, POSTS, formatDate } from './data';

function Sec({ id, label, wide, extra, children }: { id: string; label: string; wide?: boolean; extra?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className={wide ? 'hm-sec hm-sec-wide' : 'hm-sec'}>
      {extra}
      <h2 className="hm-label">{label}</h2>
      <div className="hm-body">{children}</div>
    </section>
  );
}

export function Work() {
  return <Sec id="work" label="work"><WorkSlot /></Sec>;
}

export function Projects() {
  return (
    <Sec id="projects" label="projects" wide extra={<span id="desktop" className="hm-anchor" aria-hidden="true" />}>
      <div className="hm-wide"><ProjectsSlot /></div>
    </Sec>
  );
}

export function Writing() {
  return (
    <Sec id="writing" label="writing">
      <div className="hm-posts">
        {POSTS.map((p) => (
          <a key={p.slug} href={`/writing/${p.slug}`} className="hm-post">
            <span className="hm-post-t">{p.title}</span>
            <span className="hm-post-m">{formatDate(p.date)}</span>
          </a>
        ))}
      </div>
    </Sec>
  );
}

export function Contact() {
  return (
    <Sec id="contact" label="contact">
      <p className="site-p hm-line">if any of it was interesting, i'm easy to reach.</p>
      <div className="hm-slot"><Book /></div>
      <p className="hm-alt">
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </p>
      <footer className="hm-foot">
        <span>ronniel gandhe, san francisco</span>
        <a href="#top">back to top</a>
      </footer>
    </Sec>
  );
}
