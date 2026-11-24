import PageShell from './PageShell';

export default function NotFound() {
  return (
    <PageShell activePage="home" crumb="404">
      <section style={{ paddingTop: 96 }}>
        <h1 className="site-h1">nothing here.</h1>
        <p className="site-p" style={{ marginTop: 8 }}>that page moved or never existed.</p>
        <p className="site-p" style={{ marginTop: 24 }}>
          <a className="site-link" href="/">home</a>{' '}·{' '}
          <a className="site-link" href="/#projects">projects</a>{' '}·{' '}
          <a className="site-link" href="/#writing">writing</a>{' '}·{' '}
          <a className="site-link" href="/#contact">contact</a>
        </p>
      </section>
    </PageShell>
  );
}
