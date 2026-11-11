import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, CardLabel, MomoNote, Stat } from '@/components/cards';
import { Icon } from '@/components/icon';
import { useTodayBabyEvents, type BabyEventKind } from '@/data/baby-events';
import { formatLong } from '@/onboarding/dates';
import { babyAge } from '@/onboarding/insights';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type StageTheme } from '@/theme';

const KINDS: { kind: BabyEventKind; label: string; emoji: string }[] = [
  { kind: 'feed', label: 'Feed', emoji: '🍼' },
  { kind: 'sleep', label: 'Sleep', emoji: '😴' },
  { kind: 'diaper', label: 'Diaper', emoji: '🧷' },
];

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function ago(iso: string): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m ago`;
}

export function PostDeliveryHome({ theme }: { theme: StageTheme }) {
  const { answers } = useProfile();
  const { events, loading, error, add, remove } = useTodayBabyEvents();

  const name = typeof answers.babyName === 'string' && answers.babyName ? answers.babyName : 'Your baby';
  const born = typeof answers.babyBorn === 'string' ? answers.babyBorn : null;
  const lastFeed = events.find((event) => event.kind === 'feed');

  return (
    <>
      <Card tinted theme={theme}>
        <CardLabel>{name}</CardLabel>
        {born ? (
          <>
            <Stat value={babyAge(born)} caption={`Born ${formatLong(born)}`} />
          </>
        ) : (
          <Text style={styles.detail}>Add a birth date and I’ll keep track of their age.</Text>
        )}
        <Text style={styles.headline}>{lastFeed ? `Last feed ${ago(lastFeed.occurredAt)}` : 'No feeds logged today'}</Text>
      </Card>

      <Card>
        <CardLabel>Today</CardLabel>
        <View style={styles.kinds}>
          {KINDS.map(({ kind, label, emoji }) => (
            <Pressable
              key={kind}
              accessibilityRole="button"
              accessibilityLabel={`Log ${label.toLowerCase()}`}
              onPress={() => add(kind)}
              style={({ pressed }) => [styles.kind, pressed && { opacity: 0.7 }]}>
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.count}>{events.filter((event) => event.kind === kind).length}</Text>
              <View style={styles.kindLabel}>
                <Icon name="plus" size={14} color={theme.accent} strokeWidth={2.6} />
                <Text style={[styles.kindText, { color: theme.accent }]}>{label}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}

        {events.length > 0 && (
          <View style={styles.list}>
            {events.slice(0, 6).map((event) => (
              <View key={event.id} style={styles.event}>
                <Text style={styles.eventText}>
                  {KINDS.find((k) => k.kind === event.kind)?.label} · {clock(event.occurredAt)}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${event.kind} at ${clock(event.occurredAt)}`}
                  hitSlop={10}
                  onPress={() => remove(event.id)}>
                  <Icon name="close" size={16} color={colors.textFaint} strokeWidth={2.2} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
        {!loading && events.length === 0 && !error && (
          <Text style={styles.detail}>Tap a button whenever something happens. I’ll keep count.</Text>
        )}
      </Card>

      <MomoNote>
        {answers.focus === 'recovery'
          ? 'Your recovery matters as much as the baby’s routine. Have you eaten and had water today?'
          : 'You’re doing more than you think. One feed, one nap, one day at a time.'}
      </MomoNote>
    </>
  );
}

const styles = StyleSheet.create({
  headline: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.text },
  detail: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textMuted },
  kinds: { flexDirection: 'row', gap: 10 },
  kind: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 14, alignItems: 'center', gap: 2 },
  emoji: { fontSize: 24 },
  count: { fontFamily: fonts.semibold, fontSize: 30, lineHeight: 36, color: colors.text },
  kindLabel: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  kindText: { fontFamily: fonts.medium, fontSize: 15 },
  list: { gap: 2 },
  event: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  eventText: { fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  error: { fontFamily: fonts.medium, fontSize: 14, color: '#B3261E' },
});
