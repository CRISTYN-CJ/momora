import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useProfile } from '@/onboarding/profile';
import { colors, fonts, type } from '@/theme';

/**
 * Placeholder. The real home screen (one per stage) is the next piece of
 * work; this only confirms onboarding finished and lets a tester restart it.
 */
export default function Home() {
  const { answers, reset } = useProfile();

  const restart = () => {
    reset();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Image source={require('@/assets/images/momo-3d.png')} style={styles.momo} contentFit="contain" />
      <Text style={[type.title, styles.center]}>You’re all set{answers.name ? `, ${answers.name}` : ''}.</Text>
      <Text style={[type.label, styles.center]}>Your home screen is being built.</Text>
      <Pressable accessibilityRole="button" onPress={restart} hitSlop={12}>
        <Text style={styles.restart}>Restart onboarding</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  momo: { width: 180, height: 185 },
  center: { textAlign: 'center' },
  restart: { fontFamily: fonts.medium, fontSize: 16, color: colors.text, textDecorationLine: 'underline', marginTop: 24 },
});
