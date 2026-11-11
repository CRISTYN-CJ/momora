import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MOODS, type Mood } from '@/data/check-ins';
import { colors, fonts, radius, type, type StageTheme } from '@/theme';

import { MomoAvatar } from './chat';

export function Card({ children, tinted, theme }: { children: ReactNode; tinted?: boolean; theme?: StageTheme }) {
  return <View style={[styles.card, tinted && theme && { backgroundColor: theme.selectedBg }]}>{children}</View>;
}

export function CardLabel({ children }: { children: string }) {
  return <Text style={styles.cardLabel}>{children}</Text>;
}

/** A big number with a caption under it, e.g. "12 / cycle day". */
export function Stat({ value, caption }: { value: string; caption: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={type.label}>{caption}</Text>
    </View>
  );
}

export function ProgressBar({ fraction, theme }: { fraction: number; theme: StageTheme }) {
  const clamped = Math.min(1, Math.max(0, fraction));
  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}>
      <View style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: theme.bubble }]} />
    </View>
  );
}

/** A short note in Momo's voice. */
export function MomoNote({ children }: { children: string }) {
  return (
    <View style={styles.note}>
      <MomoAvatar />
      <View style={styles.noteBubble}>
        <Text style={styles.noteText}>{children}</Text>
      </View>
    </View>
  );
}

type MoodProps = { mood: Mood | null; onPick: (mood: Mood) => void; error: string | null; theme: StageTheme };

export function MoodCheckIn({ mood, onPick, error, theme }: MoodProps) {
  const picked = MOODS.find((m) => m.value === mood);
  return (
    <Card>
      <View style={styles.rowBetween}>
        <CardLabel>How are you feeling today?</CardLabel>
        {picked && <Text style={styles.picked}>{picked.label}</Text>}
      </View>
      <View style={styles.moods}>
        {MOODS.map((m) => (
          <Pressable
            key={m.value}
            accessibilityRole="radio"
            accessibilityLabel={m.label}
            accessibilityState={{ selected: mood === m.value }}
            onPress={() => onPick(m.value)}
            style={[styles.mood, mood === m.value && { backgroundColor: theme.selectedBg, borderColor: theme.bubble }]}>
            <Text style={[styles.moodEmoji, mood !== null && mood !== m.value && styles.dim]}>{m.emoji}</Text>
          </Pressable>
        ))}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceAlt, borderRadius: radius.card, padding: 18, gap: 14 },
  cardLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textMuted },
  stat: { gap: 2 },
  statValue: { fontFamily: fonts.semibold, fontSize: 40, lineHeight: 46, color: colors.text },
  track: { height: 12, borderRadius: 6, backgroundColor: '#E2E2E2', overflow: 'hidden' },
  fill: { height: 12, borderRadius: 6 },
  note: { alignItems: 'flex-start', gap: 6 },
  noteBubble: { backgroundColor: colors.surface, borderRadius: radius.bubble, paddingHorizontal: 18, paddingVertical: 13 },
  noteText: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22, color: colors.text },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  picked: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: { fontSize: 24 },
  dim: { opacity: 0.35 },
  error: { fontFamily: fonts.medium, fontSize: 14, color: '#B3261E' },
});
