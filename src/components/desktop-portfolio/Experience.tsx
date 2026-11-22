import Finder from './Finder';
import type { DetailContent } from './DetailPanel';

interface ExperienceProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

const Experience = (_props: ExperienceProps) => <Finder initialSection="experience" />;

export default Experience;
