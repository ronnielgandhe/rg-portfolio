export const usd = (x: number, cents = false) => {
  if (!Number.isFinite(x)) return '-';
  const sign = x < 0 ? '-' : '';
  const a = Math.abs(x);
  if (!cents && a >= 1e6) return `${sign}$${(a / 1e6).toFixed(a >= 1e7 ? 1 : 2)}m`;
  return `${sign}$${a.toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;
};

export const pct = (x: number, digits = 1, signed = false) => {
  if (!Number.isFinite(x)) return '-';
  const s = (x * 100).toFixed(digits);
  return `${signed && x > 0 ? '+' : ''}${s}%`;
};

export const num = (x: number, digits = 2) => (Number.isFinite(x) ? x.toFixed(digits) : '-');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function niceDate(d: string, withYear = true): string {
  const [y, m, day] = d.slice(0, 10).split('-');
  return `${MONTHS[Number(m) - 1]} ${Number(day)}${withYear ? `, ${y}` : ''}`;
}

export function niceDateTime(iso: string, tz = 'America/Chicago'): string {
  const dt = new Date(iso);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: false });
  return f.format(dt).toLowerCase();
}

export function ago(ms: number): string {
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}

export function years(days: number): string {
  if (days < 60) return `${days} days`;
  if (days < 730) return `${Math.round(days / 30.4)} months`;
  return `${(days / 365.25).toFixed(1)} years`;
}
