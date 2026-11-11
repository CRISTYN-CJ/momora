import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, type } from '@/theme';

/** Momo's avatar followed by one grey bubble per line. */
export function MomoMessage({ lines }: { lines: string[] }) {
  return (
    <View style={styles.momo}>
      <MomoAvatar />
      {lines.map((line) => (
        <View key={line} style={styles.momoBubble}>
          <Text style={type.body}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function MomoAvatar() {
  return (
    <Image
      source={require('@/assets/images/momo-avatar.png')}
      style={styles.avatar}
      contentFit="contain"
      accessibilityLabel="Momo"
    />
  );
}

/** The user's answer. `faded` is the previous answer scrolling out of view at the top. */
export function UserMessage({ text, color, faded }: { text: string; color: string; faded?: boolean }) {
  return (
    <View style={[styles.user, faded && styles.faded]}>
      <View style={[styles.userBubble, { backgroundColor: color }]}>
        <Text style={[type.body, styles.userText]}>{text}</Text>
      </View>
      <View style={styles.read}>
        <View style={styles.readDot} />
        <Text style={type.caption}>Read</Text>
      </View>
    </View>
  );
}

/** Three pulsing dots while Momo "thinks". */
export function TypingIndicator() {
  const [dots] = useState(() => [0, 1, 2].map(() => new Animated.Value(0.35)));

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.35, duration: 320, easing: Easing.in(Easing.quad), useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [dots]);

  return (
    <View style={styles.momo} accessibilityLabel="Momo is typing">
      <MomoAvatar />
      <View style={styles.typing}>
        {dots.map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  momo: { alignItems: 'flex-start', gap: 8 },
  avatar: { width: 46, height: 38 },
  momoBubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.bubble,
    paddingHorizontal: 20,
    paddingVertical: 15,
    maxWidth: '94%',
  },
  user: { alignItems: 'flex-end', gap: 6 },
  faded: { opacity: 0.3 },
  userBubble: { borderRadius: radius.bubble, paddingHorizontal: 20, paddingVertical: 15, maxWidth: '88%' },
  userText: { color: '#FFFFFF', fontFamily: fonts.medium },
  read: { flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 22 },
  readDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#D4D4D4' },
  typing: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginLeft: 20,
  },
  typingDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#9E9E9E' },
});
