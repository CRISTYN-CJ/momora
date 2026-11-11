import { addDays, daysBetween, todayISO } from './dates';

/**
 * Calendar-method estimate: ovulation falls about 14 days before the next
 * period, and the fertile window runs from 3 days before to 2 days after.
 * This is an estimate for planning, not a medical prediction.
 */
export function fertileWindow(lastPeriod: string, cycleLength: number, today = todayISO()) {
  let peak = addDays(lastPeriod, cycleLength - 14);
  // If this cycle's window has already passed, show the next one.
  while (daysBetween(today, addDays(peak, 2)) < 0) peak = addDays(peak, cycleLength);
  const start = addDays(peak, -3);
  return {
    start,
    end: addDays(peak, 2),
    peak,
    days: Array.from({ length: 6 }, (_, i) => addDays(start, i)),
  };
}

export type PregnancyProgress = {
  week: number;
  trimester: 1 | 2 | 3;
  dueDate: string;
  daysToGo: number;
};

const FULL_TERM_DAYS = 280;

/** Works from either a due date or a number of completed weeks. */
export function pregnancyProgress(
  input: { dueDate?: string; weeks?: number },
  today = todayISO(),
): PregnancyProgress | null {
  let dueDate: string;
  if (input.dueDate) dueDate = input.dueDate;
  else if (input.weeks !== undefined) dueDate = addDays(today, FULL_TERM_DAYS - input.weeks * 7);
  else return null;

  const daysToGo = daysBetween(today, dueDate);
  const week = Math.min(42, Math.max(0, Math.floor((FULL_TERM_DAYS - daysToGo) / 7)));
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  return { week, trimester, dueDate, daysToGo };
}

/** "5 days old", "3 weeks old", "4 months old" */
export function babyAge(born: string, today = todayISO()): string {
  const days = Math.max(0, daysBetween(born, today));
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'} old`;
  if (days < 14) return plural(days, 'day');
  if (days < 84) return plural(Math.floor(days / 7), 'week');
  if (days < 730) return plural(Math.floor(days / 30.44), 'month');
  return plural(Math.floor(days / 365.25), 'year');
}
