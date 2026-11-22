import PageShell from './PageShell';
import ProjectsIndex from './covers/ProjectsIndex';

export default function ProjectsPage() {
  return (
    <PageShell activePage="projects" wide>
      <div className="pp site-enter">
        <h1 className="site-h1">projects</h1>
        <p className="site-p" style={{ lineHeight: '24px' }}>the stuff i actually finished.</p>
        <div className="pp-grid">
          <ProjectsIndex />
        </div>
      </div>
      <style>{`
        .pp { width: 100%; max-width: 1040px; margin: 0 auto; }
        .pp-grid { margin-top: 32px; }
      `}</style>
    </PageShell>
  );
}
