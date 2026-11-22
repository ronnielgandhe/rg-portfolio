import Finder from './Finder';
import type { DetailContent } from './DetailPanel';

interface EducationProps {
  onCardClick?: (detail: DetailContent) => void;
  windowMode?: boolean;
}

const Education = (_props: EducationProps) => <Finder initialSection="education" />;

export default Education;
