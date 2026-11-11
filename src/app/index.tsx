import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useProfile } from '@/onboarding/profile';
import { fonts, stageThemes, type Stage } from '@/theme';

const SLIDES: { stage: Stage; image: number; status: string }[] = [
  { stage: 'ttc', image: require('@/assets/images/hero-ttc.jpg'), status: 'Finding your fertile window…' },
  { stage: 'pregnancy', image: require('@/assets/images/hero-pregnancy.jpg'), status: 'Preparing your week ahead…' },
  {
    stage: 'postdelivery',
    image: require('@/assets/images/hero-postdelivery.jpg'),
    status: 'Finding answers from other parents…',
  },
];

const SLIDE_MS = 4500;
const FADE_MS = 700;

/** Welcome screen. The three stage variants cross-fade on a loop. */
export default function Welcome() {
  const { onboarded } = useProfile();
  const insets = useSafeAreaInsets();
  const [active, setActive] = useState(0);
  const [opacities] = useState(() => SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)));

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    opacities.forEach((value, i) =>
      Animated.timing(value, { toValue: i === active ? 1 : 0, duration: FADE_MS, useNativeDriver: true }).start(),
    );
  }, [active, opacities]);

  if (onboarded) return <Redirect href="/home" />;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      {SLIDES.map((slide, i) => (
        <Animated.View key={slide.stage} style={[StyleSheet.absoluteFill, { opacity: opacities[i] }]}>
          <View style={{ flex: 1, backgroundColor: stageThemes[slide.stage].welcome[2] }}>
            <Image source={slide.image} style={styles.hero} contentFit="cover" />
            <LinearGradient
              colors={stageThemes[slide.stage].welcome}
              locations={[0.3, 0.52, 0.74]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.status}>
              <Image source={require('@/assets/images/momo-avatar.png')} style={styles.statusAvatar} contentFit="contain" />
              <Text style={styles.statusText}>{slide.status}</Text>
            </View>
          </View>
        </Animated.View>
      ))}

      <View style={[styles.content, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.kicker}>Your sweet journey to</Text>
        <Text style={styles.headline}>Motherhood</Text>
        <Text style={styles.body}>Momora blends science, AI, and care{'\n'}to support you every step of the way.</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/meet-momo')}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}>
          <Text style={styles.ctaLabel}>Get started</Text>
          <Icon name="chevronRight" size={16} color="#8A8A8A" strokeWidth={2.4} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => Alert.alert('Sign in is coming soon', 'Accounts are the next thing being built.')}>
          <Text style={styles.signIn}>I already have an account</Text>
        </Pressable>

        <Text style={styles.legal}>
          By continuing you’re accepting our{'\n'}
          <Text style={styles.legalLink}>Terms of Use</Text> & <Text style={styles.legalLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#000' },
  hero: { width: '100%', height: '52%' },
  status: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 12,
    paddingRight: 20,
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statusAvatar: { width: 34, height: 30, borderRadius: 15, backgroundColor: '#FFFFFF' },
  statusText: { fontFamily: fonts.regular, fontSize: 15, color: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 24 },
  kicker: { fontFamily: fonts.medium, fontSize: 24, color: 'rgba(255,255,255,0.92)' },
  headline: { fontFamily: fonts.semibold, fontSize: 52, lineHeight: 60, color: '#FFFFFF', marginBottom: 22 },
  body: {
    fontFamily: fonts.regular,
    fontSize: 17,
    lineHeight: 23,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 72,
  },
  cta: {
    width: 260,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 32,
  },
  ctaLabel: { fontFamily: fonts.medium, fontSize: 19, color: '#0B0B0B' },
  signIn: { fontFamily: fonts.medium, fontSize: 19, color: '#FFFFFF', marginBottom: 44 },
  legal: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 17, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  legalLink: { textDecorationLine: 'underline' },
});
