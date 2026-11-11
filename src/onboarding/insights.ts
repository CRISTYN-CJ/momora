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
  /** Days into the current week, 0–6. */
  day: number;
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
  const elapsed = Math.min(42 * 7, Math.max(0, FULL_TERM_DAYS - daysToGo));
  const week = Math.floor(elapsed / 7);
  const trimester = week < 14 ? 1 : week < 28 ? 2 : 3;
  return { week, day: elapsed % 7, trimester, dueDate, daysToGo };
}

/**
 * The due date to count from. Someone who answered in weeks gets a due date
 * fixed on the day they answered, so their week keeps advancing afterwards.
 */
export function resolveDueDate(
  answers: { dueDate?: unknown; weeksPregnant?: unknown },
  answeredOn = todayISO(),
): string | null {
  if (typeof answers.dueDate === 'string') return answers.dueDate;
  if (typeof answers.weeksPregnant === 'number') return addDays(answeredOn, FULL_TERM_DAYS - answers.weeksPregnant * 7);
  return null;
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

export type DayKind = 'period' | 'fertile' | 'peak' | 'none';

export type CycleStatus = {
  /** 1 on the first day of the last period. Keeps counting if the next period is late. */
  cycleDay: number;
  /** Days past the expected start of the next period; 0 when not late. */
  daysLate: number;
  today: DayKind;
  nextPeriod: string;
  daysToNextPeriod: number;
  /** What a given date is expected to be, projecting the cycle forward. */
  kindOf: (iso: string) => DayKind;
};

/**
 * Where the user is in their cycle, by the calendar method. Estimates only:
 * real cycles vary, which is why a late period is reported rather than hidden.
 */
export function cycleStatus(
  lastPeriod: string,
  cycleLength: number,
  periodLength: number,
  today = todayISO(),
): CycleStatus {
  const peakDay = cycleLength - 14 + 1;

  const kindOf = (iso: string): DayKind => {
    const offset = daysBetween(lastPeriod, iso);
    if (offset < 0) return 'none';
    const day = (offset % cycleLength) + 1;
    if (day <= periodLength) return 'period';
    if (day === peakDay) return 'peak';
    if (day >= peakDay - 3 && day <= peakDay + 2) return 'fertile';
    return 'none';
  };

  const elapsed = Math.max(0, daysBetween(lastPeriod, today));
  const nextPeriod = addDays(lastPeriod, cycleLength);
  const daysToNextPeriod = daysBetween(today, nextPeriod);
  const late = daysToNextPeriod < 0;

  return {
    cycleDay: elapsed + 1,
    daysLate: late ? -daysToNextPeriod : 0,
    // Once the period is late, stop projecting phases onto today.
    today: late ? 'none' : kindOf(today),
    nextPeriod,
    daysToNextPeriod,
    kindOf,
  };
}

/** Familiar size comparisons by completed week of pregnancy (weeks 4–41). */
const BABY_SIZES = [
  'a poppy seed', 'a sesame seed', 'a lentil', 'a blueberry', 'a raspberry', 'a grape', 'a strawberry', 'a fig',
  'a lime', 'a lemon', 'a peach', 'an apple', 'an avocado', 'a pear', 'a bell pepper', 'a mango',
  'a banana', 'a carrot', 'a papaya', 'a grapefruit', 'an ear of corn', 'a cauliflower', 'a lettuce', 'a rutabaga',
  'an eggplant', 'a butternut squash', 'a cabbage', 'a coconut', 'a jicama', 'a pineapple', 'a cantaloupe', 'a honeydew melon',
  'a romaine lettuce', 'a bunch of Swiss chard', 'a leek', 'a small watermelon', 'a pumpkin', 'a watermelon',
];

export function babySize(week: number): string | null {
  if (week < 4) return null;
  return BABY_SIZES[Math.min(week, 41) - 4];
}
