import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { PillButton } from '@/components/buttons';
import { MoodCheckIn } from '@/components/cards';
import { Icon } from '@/components/icon';
import { useTodayCheckIn } from '@/data/check-ins';
import { PostDeliveryHome } from '@/home/postdelivery';
import { PregnancyHome } from '@/home/pregnancy';
import { TtcHome } from '@/home/ttc';
import { formatLong, todayISO } from '@/onboarding/dates';
import { useProfile } from '@/onboarding/profile';
import { colors, themeFor, type } from '@/theme';

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
}

/** The daily screen. Its main content depends on the user's stage. */
export default function Home() {
  const { answers, onboarded } = useProfile();
  const { session } = useSession();
  const checkIn = useTodayCheckIn();
  const theme = themeFor(String(answers.stage ?? ''));

  if (!session) return <Redirect href="/" />;
  if (!onboarded) return <Redirect href="/meet-momo" />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={type.label}>{formatLong(todayISO())}</Text>
            <Text style={type.title}>
              {greeting()}
              {answers.name ? `, ${answers.name}` : ''}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            hitSlop={8}
            onPress={() => router.push('/account')}
            style={styles.account}>
            <Icon name="user" size={22} />
          </Pressable>
        </View>

        {answers.stage === 'ttc' && <TtcHome theme={theme} />}
        {answers.stage === 'pregnancy' && <PregnancyHome theme={theme} />}
        {answers.stage === 'postdelivery' && <PostDeliveryHome theme={theme} />}

        <PillButton wide label="Ask Momo anything" color={theme.accent} onPress={() => router.push('/momo')} />

        <MoodCheckIn mood={checkIn.mood} onPick={checkIn.save} error={checkIn.error} theme={theme} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  account: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
