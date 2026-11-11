import { StyleSheet, Text, View } from 'react-native';

import { Card, CardLabel, MomoNote, ProgressBar, Stat } from '@/components/cards';
import { daysBetween, formatLong, todayISO } from '@/onboarding/dates';
import { labelFor } from '@/onboarding/flow';
import { babySize, pregnancyProgress, resolveDueDate } from '@/onboarding/insights';
import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type StageTheme } from '@/theme';

const TRIMESTERS = ['First trimester', 'Second trimester', 'Third trimester'];

export function PregnancyHome({ theme }: { theme: StageTheme }) {
  const { answers, onboardedAt } = useProfile();
  const today = todayISO();
  const dueDate = resolveDueDate(answers, onboardedAt?.slice(0, 10));
  const progress = dueDate ? pregnancyProgress({ dueDate }, today) : null;

  const appointment = typeof answers.appointmentDate === 'string' ? answers.appointmentDate : null;
  const daysToAppointment = appointment ? daysBetween(today, appointment) : null;
  const size = progress ? babySize(progress.week) : null;

  return (
    <>
      {progress ? (
        <Card tinted theme={theme}>
          <CardLabel>Your pregnancy</CardLabel>
          <Stat value={`Week ${progress.week}`} caption={`Day ${progress.day + 1} of this week`} />
          <ProgressBar fraction={(progress.week * 7 + progress.day) / 280} theme={theme} />
          <View style={styles.rowBetween}>
            <Text style={styles.meta}>{TRIMESTERS[progress.trimester - 1]}</Text>
            <Text style={styles.meta}>
              {progress.daysToGo > 0
                ? `${progress.daysToGo} days to go`
                : progress.daysToGo === 0
                  ? 'Due today'
                  : 'Past your due date'}
            </Text>
          </View>
          {size && <Text style={styles.headline}>Your baby is about the size of {size}.</Text>}
          <Text style={styles.detail}>Due {formatLong(progress.dueDate)}</Text>
        </Card>
      ) : (
        <Card>
          <CardLabel>Your pregnancy</CardLabel>
          <Text style={styles.detail}>Tell me your due date and I’ll track your weeks from here.</Text>
        </Card>
      )}

      <Card>
        <CardLabel>Next appointment</CardLabel>
        {appointment && daysToAppointment !== null && daysToAppointment >= 0 ? (
          <>
            <Text style={styles.headline}>{formatLong(appointment)}</Text>
            <Text style={styles.detail}>
              {daysToAppointment === 0 ? 'Today' : daysToAppointment === 1 ? 'Tomorrow' : `In ${daysToAppointment} days`}
              {answers.careTeam ? ` · ${labelFor('careTeam', answers.careTeam)}` : ''}
            </Text>
          </>
        ) : (
          <Text style={styles.detail}>Nothing booked yet.</Text>
        )}
      </Card>

      <MomoNote>
        {progress && progress.trimester === 1
          ? 'The first weeks ask a lot of you. Tiredness is normal, and rest is allowed.'
          : progress && progress.trimester === 2
            ? 'You’re in the middle stretch. Many people find their energy returns around now.'
            : 'You’re in the home stretch. Take things one day at a time.'}
      </MomoNote>
    </>
  );
}

const styles = StyleSheet.create({
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontFamily: fonts.medium, fontSize: 14, color: colors.textMuted },
  headline: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26, color: colors.text },
  detail: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.textMuted },
});
