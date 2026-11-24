import { POSTS as WRITING_POSTS } from '../WritingPage';

export const EMAIL = 'ronnielgandhe@gmail.com';


export const POSTS = [...WRITING_POSTS].sort((a, b) => b.date.localeCompare(a.date));

const MON = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MON[m - 1]} ${d}, ${y}`;
}
