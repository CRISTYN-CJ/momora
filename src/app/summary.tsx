import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton, PillButton } from '@/components/buttons';
import { daysBetween, formatLong, formatShort, fromISO, todayISO } from '@/onboarding/dates';
import { labelFor } from '@/onboarding/flow';
import { babyAge, fertileWindow, pregnancyProgress } from '@/onboarding/insights';
import { useProfile } from '@/onboarding/profile';
import type { Answers } from '@/onboarding/types';
import { colors, fonts, themeFor, type, type StageTheme } from '@/theme';

/** "Alright, I've got it." — Momo plays back what it learned. */
export default function Summary() {
  const { answers, completeOnboarding } = useProfile();
  const theme = themeFor(String(answers.stage ?? ''));

  const finish = () => {
    completeOnboarding();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[type.heading, styles.center]}>Alright, I’ve got it{answers.name ? `, ${answers.name}` : ''}.</Text>
        <Text style={[type.body, styles.center, styles.sub]}>Here’s what I learned about you.</Text>
        <Image source={require('@/assets/images/momo-summary.png')} style={styles.momo} contentFit="contain" />

        <View style={styles.rows}>
          {answers.stage === 'ttc' && <TtcSummary answers={answers} theme={theme} />}
          {answers.stage === 'pregnancy' && <PregnancySummary answers={answers} theme={theme} />}
          {answers.stage === 'postdelivery' && <PostDeliverySummary answers={answers} theme={theme} />}
        </View>
      </ScrollView>

      <View style={styles.bar}>
        <BackButton onPress={() => router.replace('/onboarding')} />
        <PillButton label="Yes, let’s continue" icon="arrowRight" color={theme.accent} onPress={finish} />
      </View>
    </SafeAreaView>
  );
}

type SectionProps = { answers: Answers; theme: StageTheme };

function TtcSummary({ answers, theme }: SectionProps) {
  const tenureSteps = { starting: 1, '1-6': 1, '6-12': 2, '12+': 3 }[String(answers.ttcTenure)] ?? 1;
  const lastPeriod = typeof answers.lastPeriod === 'string' ? answers.lastPeriod : undefined;
  const cycle = typeof answers.cycleLength === 'number' ? answers.cycleLength : 28;
  const window = lastPeriod ? fertileWindow(lastPeriod, cycle) : undefined;
  const moods = [
    ['overwhelmed', '😣'],
    ['anxious', '😟'],
    ['unsure', '😐'],
    ['excited', '🤩'],
    ['hopeful', '😊'],
  ];

  return (
    <>
      <Row label="Your TTC journey" value={labelFor('ttcTenure', answers.ttcTenure)}>
        <Steps filled={tenureSteps} theme={theme} />
      </Row>

      {lastPeriod && (
        <Row label="Your cycle" value={`${cycle} days`}>
          <Bar theme={theme}>
            <View style={styles.barDot} />
            <Text style={styles.barText}>Last period: {formatShort(lastPeriod)}</Text>
            <Text style={styles.barMeta}>{daysBetween(lastPeriod, todayISO())}d ago</Text>
          </Bar>
        </Row>
      )}

      <Row label="Your wellbeing" value={moodLine(answers)}>
        <View style={styles.moods}>
          {moods.map(([key, emoji]) => (
            <View
              key={key}
              style={[styles.mood, answers.mood === key && { backgroundColor: theme.selectedBg, borderColor: theme.bubble }]}>
              <Text style={[styles.moodEmoji, answers.mood !== key && styles.moodOff]}>{emoji}</Text>
            </View>
          ))}
        </View>
      </Row>

      {window && (
        <Row
          label={`Fertile window (${formatShort(window.start)}–${fromISO(window.end).getDate()})`}
          value={`Peak · ${formatShort(window.peak)}`}>
          <View style={styles.window}>
            {window.days.map((day) => (
              <View key={day} style={[styles.windowDay, day === window.peak && { backgroundColor: theme.bubble }]}>
                <Text style={[styles.windowText, day === window.peak && styles.windowPeak]}>
                  {fromISO(day).getDate()}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.note}>An estimate from your cycle length. It gets sharper as you log.</Text>
        </Row>
      )}
    </>
  );
}

function PregnancySummary({ answers, theme }: SectionProps) {
  const progress = pregnancyProgress({
    dueDate: typeof answers.dueDate === 'string' ? answers.dueDate : undefined,
    weeks: typeof answers.weeksPregnant === 'number' ? answers.weeksPregnant : undefined,
  });
  const ordinal = ['First', 'Second', 'Third'];

  return (
    <>
      {progress && (
        <>
          <Row label="Your pregnancy" value={`Week ${progress.week}`}>
            <Steps filled={progress.trimester} theme={theme} />
            <Text style={styles.note}>{ordinal[progress.trimester - 1]} trimester</Text>
          </Row>
          <Row label="Due date" value={formatLong(progress.dueDate)}>
            <Bar theme={theme}>
              <View style={styles.barDot} />
              <Text style={styles.barText}>
                {progress.daysToGo >= 0 ? `${progress.daysToGo} days to go` : 'Past your due date'}
              </Text>
            </Bar>
          </Row>
        </>
      )}
      <Row label="Your care team" value={labelFor('careTeam', answers.careTeam)} />
      <Row
        label="Next appointment"
        value={answers.appointmentDate ? labelFor('appointmentDate', answers.appointmentDate) : 'Not booked yet'}
      />
      <Row label="Being monitored" value={labelFor('monitoring', answers.monitoring)} />
      <Row label="I’ll help most with" value={labelFor('helpWith', answers.helpWith)} />
    </>
  );
}

function PostDeliverySummary({ answers, theme }: SectionProps) {
  const born = typeof answers.babyBorn === 'string' ? answers.babyBorn : undefined;
  const birthNote = [
    answers.preterm === 'yes' && answers.weeksAtBirth ? `Born at ${answers.weeksAtBirth} weeks` : '',
    answers.nicu === 'yes' ? 'NICU stay' : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Row label="Your baby" value={String(answers.babyName ?? '')}>
        {born && (
          <Bar theme={theme}>
            <View style={styles.barDot} />
            <Text style={styles.barText}>{babyAge(born)}</Text>
            <Text style={styles.barMeta}>Born {formatShort(born)}</Text>
          </Bar>
        )}
        {birthNote !== '' && <Text style={styles.note}>{birthNote}</Text>}
      </Row>
      <Row label="Feeding" value={labelFor('feeding', answers.feeding)} />
      <Row label="Parenting with" value={labelFor('parentingWith', answers.parentingWith)} />
      <Row label="What matters most" value={labelFor('focus', answers.focus)} />
    </>
  );
}

function moodLine(answers: Answers): string {
  const label = labelFor('mood', answers.mood);
  return label ? `Feeling ${label.toLowerCase()}` : '';
}

function Row({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <Text style={type.label}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
      {children}
    </View>
  );
}

/** Three-segment progress, as in the designer's "Your TTC journey" row. */
function Steps({ filled, theme }: { filled: number; theme: StageTheme }) {
  return (
    <View style={styles.steps}>
      {[1, 2, 3].map((step) =>
        step <= filled ? (
          <LinearGradient
            key={step}
            colors={[theme.bubble, theme.tint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.step}
          />
        ) : (
          <View key={step} style={styles.step} />
        ),
      )}
    </View>
  );
}

function Bar({ theme, children }: { theme: StageTheme; children: ReactNode }) {
  return (
    <LinearGradient
      colors={[theme.bubble, colors.surface]}
      locations={[0, 0.3]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.pillBar}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 32, paddingTop: 16, paddingBottom: 24 },
  center: { textAlign: 'center' },
  sub: { fontFamily: fonts.regular, marginTop: 6 },
  momo: { width: 150, height: 190, alignSelf: 'center', marginVertical: 18 },
  rows: { gap: 22 },
  row: { gap: 10 },
  rowHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 },
  rowValue: { flexShrink: 1, textAlign: 'right', fontFamily: fonts.medium, fontSize: 15, color: colors.text },
  steps: { flexDirection: 'row', gap: 12 },
  step: { flex: 1, height: 22, borderRadius: 11, backgroundColor: colors.surface },
  pillBar: { height: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8 },
  barDot: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#0B0B0B' },
  barText: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  barMeta: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted, marginRight: 4 },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodEmoji: { fontSize: 22 },
  moodOff: { opacity: 0.35 },
  window: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 4 },
  windowDay: { flex: 1, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  windowText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text },
  windowPeak: { color: '#FFFFFF', fontFamily: fonts.semibold },
  note: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.textMuted },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
});
