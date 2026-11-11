import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fromISO, monthName, todayISO, toISO } from '@/onboarding/dates';
import { colors, fonts, type StageTheme } from '@/theme';

import { Icon } from './icon';

type Props = {
  value?: string;
  onChange: (iso: string) => void;
  /** `past` allows today and earlier; `future` allows today and later. */
  range: 'past' | 'future';
  theme: StageTheme;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarPicker({ value, onChange, range, theme }: Props) {
  const today = todayISO();
  const start = fromISO(value ?? today);
  const [month, setMonth] = useState({ year: start.getFullYear(), index: start.getMonth() });

  const firstWeekday = new Date(month.year, month.index, 1).getDay();
  const dayCount = new Date(month.year, month.index + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: dayCount }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);

  const step = (delta: number) => {
    const next = new Date(month.year, month.index + delta, 1);
    setMonth({ year: next.getFullYear(), index: next.getMonth() });
  };

  const todayDate = fromISO(today);
  const monthOrder = month.year * 12 + month.index;
  const todayOrder = todayDate.getFullYear() * 12 + todayDate.getMonth();
  const canGoBack = range === 'past' || monthOrder > todayOrder;
  const canGoForward = range === 'future' || monthOrder < todayOrder;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.month, { color: theme.accent }]}>
          {monthName(month.index)} {month.year}
        </Text>
        <View style={styles.arrows}>
          <Pressable accessibilityLabel="Previous month" disabled={!canGoBack} hitSlop={10} onPress={() => step(-1)}>
            <Icon name="chevronLeft" size={22} color={canGoBack ? theme.accent : colors.border} strokeWidth={2.4} />
          </Pressable>
          <Pressable accessibilityLabel="Next month" disabled={!canGoForward} hitSlop={10} onPress={() => step(1)}>
            <Icon name="chevronRight" size={22} color={canGoForward ? theme.accent : colors.border} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((day, i) => (
          <Text key={i} style={[styles.cell, styles.weekday]}>
            {day}
          </Text>
        ))}
      </View>

      {Array.from({ length: cells.length / 7 }, (_, week) => (
        <View key={week} style={styles.row}>
          {cells.slice(week * 7, week * 7 + 7).map((day, i) => {
            if (day === null) return <View key={i} style={styles.cell} />;
            const iso = toISO(new Date(month.year, month.index, day));
            const disabled = range === 'past' ? iso > today : iso < today;
            const selected = iso === value;
            const isToday = iso === today;
            return (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={`${monthName(month.index)} ${day}`}
                accessibilityState={{ selected, disabled }}
                disabled={disabled}
                onPress={() => onChange(iso)}
                style={styles.cell}>
                <View
                  style={[
                    styles.day,
                    isToday && { borderColor: theme.selectedBorder, borderWidth: 2 },
                    selected && { backgroundColor: theme.accent, borderWidth: 0 },
                  ]}>
                  <Text style={[styles.dayText, disabled && styles.dayDisabled, selected && styles.daySelected]}>
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 10,
    paddingTop: 16,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  month: { fontFamily: fonts.medium, fontSize: 18 },
  arrows: { flexDirection: 'row', gap: 22 },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 46, textAlign: 'center' },
  weekday: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted, height: 28, lineHeight: 28 },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontFamily: fonts.regular, fontSize: 19, color: colors.text },
  dayDisabled: { color: colors.textFaint },
  daySelected: { color: '#FFFFFF', fontFamily: fonts.semibold },
});
