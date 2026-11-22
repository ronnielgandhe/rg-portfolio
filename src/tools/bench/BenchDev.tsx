import PageShell from '../../components/portfolio/PageShell';
import BenchHub from './BenchHub';

export default function BenchDev() {
  return (
    <PageShell activePage="projects" crumb="leanfetch benchmarks" back={{ href: '/leanfetch', label: 'leanfetch' }} wide>
      <BenchHub />
    </PageShell>
  );
}
