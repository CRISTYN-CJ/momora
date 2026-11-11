/** Dates are stored as local-time `YYYY-MM-DD` strings so they never shift across time zones. */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_MS = 86_400_000;

export function toISO(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

export function fromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDays(iso: string, days: number): string {
  const date = fromISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function daysBetween(from: string, to: string): number {
  return Math.round((fromISO(to).getTime() - fromISO(from).getTime()) / DAY_MS);
}

export function monthName(monthIndex: number): string {
  return MONTHS[monthIndex];
}

/** "Sep 3" */
export function formatShort(iso: string): string {
  const date = fromISO(iso);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** "Sep 3, 2026" */
export function formatLong(iso: string): string {
  return `${formatShort(iso)}, ${fromISO(iso).getFullYear()}`;
}
