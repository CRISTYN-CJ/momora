import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '@/components/buttons';
import { colors, fonts, type } from '@/theme';

const PROMISES = [
  {
    icon: require('@/assets/images/feature-know.png'),
    title: 'I’ll get to know you',
    body: 'Personalized guidance that evolves with your journey.',
  },
  {
    icon: require('@/assets/images/feature-understand.png'),
    title: 'I’ll help you understand',
    body: 'Clear insights about your cycle, pregnancy, and baby.',
  },
  {
    icon: require('@/assets/images/feature-here.png'),
    title: 'I’ll be here for the moments that matter',
    body: 'Answers, guidance & support whenever you need them.',
  },
];

export default function MeetMomo() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.top}>
        <Image source={require('@/assets/images/momo-3d.png')} style={styles.momo} contentFit="contain" />
        <Text style={[type.title, styles.title]}>Hey, I’m Momo, your{'\n'}personal companion.</Text>
      </View>

      <View style={styles.promises}>
        {PROMISES.map((promise) => (
          <View key={promise.title} style={styles.promise}>
            <Image source={promise.icon} style={styles.icon} contentFit="contain" />
            <View style={styles.promiseText}>
              <Text style={styles.promiseTitle}>{promise.title}</Text>
              <Text style={type.label}>{promise.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <PillButton wide label="I’m in, let’s go" color="#000000" onPress={() => router.push('/onboarding')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingBottom: 16 },
  top: { alignItems: 'center', paddingTop: 12 },
  momo: { width: 200, height: 205 },
  title: { textAlign: 'center', marginTop: 12 },
  promises: { flex: 1, justifyContent: 'center', gap: 22, paddingHorizontal: 12 },
  promise: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  icon: { width: 72, height: 72 },
  promiseText: { flex: 1, gap: 4 },
  promiseTitle: { fontFamily: fonts.medium, fontSize: 18, lineHeight: 23, color: colors.text },
});
