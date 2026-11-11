import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, CardLabel, MomoNote, Stat } from '@/components/cards';
import { daysBetween, formatShort, fromISO, addDays, todayISO } from '@/onboarding/dates';
import { cycleStatus, fertileWindow, type DayKind } from '@/onboarding/insights';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type StageTheme } from '@/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const PERIOD_COLOR = '#E5484D';

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

export function TtcHome({ theme }: { theme: StageTheme }) {
  const { answers, setAnswer } = useProfile();
  const [confirming, setConfirming] = useState(false);

  const today = todayISO();
  const lastPeriod = typeof answers.lastPeriod === 'string' ? answers.lastPeriod : today;
  const cycleLength = typeof answers.cycleLength === 'number' ? answers.cycleLength : 28;
  const periodLength = typeof answers.periodLength === 'number' ? answers.periodLength : 5;

  const status = cycleStatus(lastPeriod, cycleLength, periodLength, today);
  const window = fertileWindow(lastPeriod, cycleLength, today);
  const daysToWindow = daysBetween(today, window.start);

  let headline: string;
  let detail: string;
  let note: string;
  if (status.daysLate > 0) {
    headline = `Your period is ${plural(status.daysLate, 'day')} late`;
    detail = `It was expected ${formatShort(status.nextPeriod)}.`;
    note = 'Cycles shift for lots of reasons. If your period hasn’t come, a home pregnancy test can give you an answer.';
  } else if (status.today === 'period') {
    headline = `Period · day ${status.cycleDay}`;
    detail = `Fertile window starts ${formatShort(window.start)}.`;
    note = 'Be gentle with yourself today. Rest counts as progress too.';
  } else if (status.today === 'peak') {
    headline = 'Peak fertility today';
    detail = `Fertile window ends ${formatShort(window.end)}.`;
    note = 'Today is your estimated peak. Whatever happens this cycle, you’re doing this right.';
  } else if (status.today === 'fertile') {
    headline = 'You’re in your fertile window';
    detail = `Peak expected ${formatShort(window.peak)}.`;
    note = 'These are your most fertile days this cycle, by my estimate.';
  } else if (daysToWindow > 0 && daysToWindow < status.daysToNextPeriod) {
    headline = `Fertile window in ${plural(daysToWindow, 'day')}`;
    detail = `${formatShort(window.start)}–${formatShort(window.end)}, peak ${formatShort(window.peak)}.`;
    note = 'A quiet stretch of your cycle. A good time to look after sleep, food and stress.';
  } else {
    headline =
      status.daysToNextPeriod === 0 ? 'Period expected today' : `Next period in ${plural(status.daysToNextPeriod, 'day')}`;
    detail = `Expected ${formatShort(status.nextPeriod)}.`;
    note = 'The wait can be the hardest part. I’m here whenever you want to talk it through.';
  }

  const strip = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const logPeriod = () => {
    setAnswer('lastPeriod', today);
    setConfirming(false);
  };

  return (
    <>
      <Card tinted theme={theme}>
        <CardLabel>Your cycle</CardLabel>
        <View style={styles.rowBetween}>
          <Stat value={`Day ${status.cycleDay}`} caption={`of a ${cycleLength}-day cycle`} />
        </View>
        <View>
          <Text style={styles.headline}>{headline}</Text>
          <Text style={styles.detail}>{detail}</Text>
        </View>
      </Card>

      <Card>
        <CardLabel>Next two weeks</CardLabel>
        <View style={styles.strip}>
          {strip.map((iso, i) => {
            const kind: DayKind = status.daysLate > 0 ? 'none' : status.kindOf(iso);
            const date = fromISO(iso);
            return (
              <View key={iso} style={styles.stripDay} accessibilityLabel={`${formatShort(iso)}: ${kindLabel(kind)}`}>
                <Text style={styles.weekday}>{WEEKDAYS[date.getDay()]}</Text>
                <View
                  style={[
                    styles.dayDot,
                    kind === 'period' && { backgroundColor: PERIOD_COLOR },
                    kind === 'fertile' && { backgroundColor: theme.tint },
                    kind === 'peak' && { backgroundColor: theme.accent },
                    i === 0 && styles.todayRing,
                  ]}>
                  <Text style={[styles.dayNumber, (kind === 'period' || kind === 'peak') && styles.onDark]}>
                    {date.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <Legend color={PERIOD_COLOR} label="Period" />
          <Legend color={theme.tint} label="Fertile" />
          <Legend color={theme.accent} label="Peak" />
        </View>
        <Text style={styles.footnote}>Estimates from your cycle length, not a medical prediction.</Text>
      </Card>

      {status.cycleDay > 1 &&
        (confirming ? (
          <View style={styles.confirmRow}>
            <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={[styles.action, styles.cancel]}>
              <Text style={styles.actionLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={logPeriod}
              style={[styles.action, styles.flex, { backgroundColor: theme.accent }]}>
              <Text style={[styles.actionLabel, styles.onDark]}>Yes, it started today</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={styles.action}>
            <Text style={styles.actionLabel}>My period started today</Text>
          </Pressable>
        ))}

      <MomoNote>{note}</MomoNote>
    </>
  );
}

function kindLabel(kind: DayKind): string {
  return { period: 'period expected', fertile: 'fertile', peak: 'peak fertility', none: 'no prediction' }[kind];
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  headline: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.text },
  detail: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textMuted, marginTop: 2 },
  strip: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  stripDay: { width: `${100 / 7}%`, alignItems: 'center', gap: 4 },
  weekday: { fontFamily: fonts.medium, fontSize: 12, color: colors.textFaint },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  todayRing: { borderColor: colors.text },
  dayNumber: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  onDark: { color: '#FFFFFF' },
  legend: { flexDirection: 'row', gap: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted },
  footnote: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16, color: colors.textFaint },
  action: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  cancel: { backgroundColor: colors.surface },
  actionLabel: { fontFamily: fonts.medium, fontSize: 17, color: colors.text },
  confirmRow: { flexDirection: 'row', gap: 10 },
});
