import { PROJECTS } from '../covers/projects';
import { POSTS as WRITING_POSTS } from '../WritingPage';

export const CALENDLY = 'https://calendly.com/ronnielgandhe?hide_gdpr_banner=1';
export const CALENDLY_EMBED = 'https://calendly.com/ronnielgandhe/30min?hide_gdpr_banner=1&hide_event_type_details=1&primary_color=1a1a1a&embed_type=Inline&embed_domain=ronnielgandhe.com';
export const EMAIL = 'ronnielgandhe@gmail.com';

export const DESKTOP_LINE = PROJECTS.find((p) => p.id === 'ronnielos')?.line ?? 'my old portfolio as a mac desktop';

export const POSTS = [...WRITING_POSTS].sort((a, b) => b.date.localeCompare(a.date));

const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MON[m - 1]} ${d}, ${y}`;
}
